# Garmin Personal API MCP 实施计划

> 状态：实施前基线
> 日期：2026-10-23
> 仓库：`trainingload-ai/garmin-personal-api-mcp`

## 1. 结论

本项目实现为 **Node.js 20+ / TypeScript 的纯本地、只读、stdio MCP Server**。

用户在自己的电脑上运行该进程，由 Claude Desktop、Cursor、Codex、VS Code、OpenCode 或其他支持本地 MCP 的 Host 启动它。进程只与 Garmin Personal API 通信，不连接 Trainingload.ai/Starshards 服务；MCP 服务不开放 HTTP 端口，只有 `auth` 会临时监听随机的 `127.0.0.1` 端口并在授权完成后关闭，不提供多人托管能力。

```text
Local MCP Host
  └─ stdio ──> garmin-personal-api-mcp
                 ├─ local API key / bearer-token cache
                 ├─ Garmin Personal API client
                 └─ FIT decoder
                          │
                          └─ HTTPS ──> Garmin Personal API
```

网站使用 **Next.js + Fumadocs**，部署到 `garminpersonalapi.com`。v0.1 只发布一个首页，将产品介绍、Quickstart、客户端配置、能力概览、隐私边界和常见问题收在同一页面；不建设独立文档页。网站不处理用户凭证或训练数据。

## 2. 为什么选择 Node.js / TypeScript

GitHub `mcp-server` topic 的语言快照（2026-10-23）显示，Python 与 TypeScript/JavaScript 都是主流：

- Python：约 14,521 个仓库；大于 10 stars 的约 1,688 个；
- TypeScript：约 11,131 个仓库；大于 10 stars 的约 1,485 个；
- JavaScript：约 4,036 个仓库。

数量上没有压倒性差异：Python 是最大的单一语言，TypeScript 与 JavaScript 合计略多。语言本身也不影响 MCP Host 兼容性，因为 Claude Desktop、Cursor、Codex、VS Code、OpenCode 启动的只是一个通过 stdin/stdout 通信的本地子进程。

本项目选择 Node.js / TypeScript 的原因是：

1. 目标用户主要使用开发者型 MCP Host，`npx -y @trainingloadai/garmin-personal-api-mcp` 是更熟悉、配置更短的启动方式；
2. 官方 [MCP TypeScript SDK v2](https://github.com/modelcontextprotocol/typescript-sdk) 提供 `McpServer`、`serveStdio()`、结构化输出和当前协议版本协商；
3. Garmin 提供官方 [`@garmin/fitsdk`](https://github.com/garmin/fit-javascript-sdk)，可以直接解码 FIT；
4. MCP Server 和 Fumadocs 文档站统一使用 TypeScript，依赖更新、类型检查和贡献者环境更一致；
5. [Shape-Calendar/garmin-personal-mcp](https://github.com/Shape-Calendar/garmin-personal-mcp) 已验证 Node + stdio + Garmin Token Exchange 的可行性。

代价是 Garmin 没有官方 Personal API JavaScript Client。该 API 的客户端层很薄：API Key 换 Token、Bearer GET、一次 401 刷新和约 24 个只读 Endpoint Wrapper。我们自行实现这一层，并用 Garmin 官方 Python Client 的公开行为作为兼容性参考，不引入 Python Sidecar。

运行时声明 `engines.node = ">=20"`。文档站和开发环境统一推荐 Node.js 22 LTS。

## 3. 产品契约

### 3.1 必须做到

- 只使用 Garmin 官方 Personal API；
- 只支持用户自己的 Garmin 账户；
- 默认通过 stdio 运行；只有 `auth` 临时监听随机的 `127.0.0.1` 端口；
- 用户 API Key、Bearer Token 和所有缓存只保存在本机；
- Garmin 数据只返回给启动该进程的 MCP Host；
- 所有 Garmin 操作只读；
- 所有 Tool 提供清晰的输入 Schema、结构化结果、错误语义和只读标注；
- 支持 macOS、Windows、Linux；
- 支持通过 `npx` 直接运行；
- 没有真实 Garmin 凭证也能完成全部 CI 测试。

### 3.2 明确不做

- 不提供 HTTP、SSE 或 Streamable HTTP Transport；
- 不提供远程部署、Docker 服务或 Serverless 模板；
- 不提供 Trainingload.ai/Starshards 登录或 API 集成；
- 不提供账户系统、数据库、数据同步或长期存储；
- 不接收、代理或托管其他用户的 Garmin API Key；
- 不写入 Garmin 账户，不创建训练计划，不向设备推送 Workout；
- 不默认采集遥测、崩溃日志或使用分析；
- v0.1 不提供任意路径的 `get_raw` Tool；
- 不把营销文案注入 Tool 返回值。

## 4. 用户体验

### 4.1 推荐安装路径

用户只需要安装 Node.js 20+。推荐让 Codex、Claude Code、Cursor 或其他代码 Agent 处理客户端差异，用户只复制一行：

```text
Connect @trainingloadai/garmin-personal-api-mcp
```

Agent 按仓库根目录 `AGENTS.md` 的机器可读流程执行。手动路径为：

```bash
npx -y @trainingloadai/garmin-personal-api-mcp auth
```

`auth` 打开只绑定 `127.0.0.1` 的临时授权页，用户在页面粘贴 API Key；页面向 Garmin 验证后写入：

```text
~/.config/garmin/connect-personal-api-key
```

POSIX 系统中目录权限设为 `0700`，文件权限设为 `0600`。随后 MCP Host 使用：

```json
{
  "mcpServers": {
    "trainingloadai": {
      "command": "npx",
      "args": ["-y", "@trainingloadai/garmin-personal-api-mcp"]
    }
  }
}
```

文档同时提供从源码运行作为备选，但不把它放在首要路径。Windows 客户端若不能直接执行 `npx`，提供 `cmd /c npx -y @trainingloadai/garmin-personal-api-mcp` 配置。

### 4.2 CLI 契约

```text
garmin-personal-api-mcp              启动 stdio MCP Server
garmin-personal-api-mcp auth         打开本地授权页、验证并保存 API Key
garmin-personal-api-mcp auth --terminal
                                     使用隐藏终端输入作为无头环境回退
garmin-personal-api-mcp auth --check 检查本地凭证和 Garmin 连通性
garmin-personal-api-mcp doctor       检查运行环境、文件权限和配置
garmin-personal-api-mcp --version    输出版本
```

服务模式下 `stdout` 只能承载 MCP JSON-RPC。所有日志必须使用 `console.error` 或显式的 `stderr` Logger；导入模块和启动 stdio 前禁止 `console.log()`。

## 5. 技术架构

### 5.1 pnpm Workspace 与仓库结构

仓库使用 pnpm Workspace 管理。第一阶段只保留两个有真实职责的 Package：

- `packages/mcp-server`：唯一发布到 npm 的本地 MCP Server；
- `apps/docs`：私有 Fumadocs 文档应用。

Garmin Client、Token Provider、FIT Decoder 和 MCP Tools 先保留在 `mcp-server` 内部，通过源码模块边界隔离。只有出现第二个真实消费者时，才提取 `packages/garmin-client`，避免为了形式上的 Monorepo 提前制造版本和发布联动。

```text
.
├── apps/
│   └── docs/
│       ├── src/app/
│       ├── src/components/
│       ├── src/lib/
│       ├── package.json
│       └── next.config.mjs
├── packages/
│   └── mcp-server/
│       ├── src/
│       │   ├── index.ts
│       │   ├── cli.ts
│       │   ├── server.ts
│       │   ├── settings.ts
│       │   ├── auth.ts
│       │   ├── errors.ts
│       │   ├── garmin-client.ts
│       │   ├── date-ranges.ts
│       │   ├── response.ts
│       │   ├── privacy.ts
│       │   ├── fit.ts
│       │   └── tools/
│       │       ├── index.ts
│       │       ├── activities.ts
│       │       ├── daily.ts
│       │       ├── health.ts
│       │       ├── body.ts
│       │       └── profile.ts
│       ├── tests/
│       │   ├── fixtures/
│       │   ├── contract/
│       │   ├── integration/
│       │   └── unit/
│       ├── package.json
│       └── tsconfig.json
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md
├── CHANGELOG.md
└── LICENSE
```

### 5.2 运行时依赖

- `@modelcontextprotocol/server`：官方 MCP TypeScript SDK v2；
- `@garmin/fitsdk`：官方 FIT Decoder；
- `fflate`：解开 Garmin Activity ZIP；
- `zod`：Tool Input/Output Schema；
- Node.js 标准库：CLI、文件权限、日志、Crypto 和日期处理。

不安装 `@modelcontextprotocol/node` 或任何 HTTP Framework，因为项目只有 stdio。避免引入 ORM、数据库驱动和额外 CLI Framework；第一版 CLI 使用轻量参数解析函数即可。

### 5.3 开发依赖

- `typescript`、`tsx`；
- `vitest`、`@vitest/coverage-v8`；
- `eslint` 与 TypeScript ESLint；
- `@modelcontextprotocol/client`：仅用于 stdio 进程级集成测试；
- `@types/node`。

使用 pnpm 管理 Workspace 和唯一的根 Lockfile，发布包保持 npm/npx 兼容。`mcp-server` 使用 ESM、`src` layout 和 `tsc` 构建，Console Script 指向 `dist/index.js`。根 `package.json` 设置 `private: true`，只允许从 `packages/mcp-server` 发布。

### 5.4 依赖隔离

MCP Tool 不直接发 HTTP。定义内部 `GarminGateway` Interface，由生产 `GarminClient` 实现，由测试 Fake 实现同一接口：

```text
MCP Tool -> GarminGateway Interface -> GarminClient
                                └──> FakeGarminGateway in tests
```

这使上游 SDK 的字段变化、同步 I/O 和测试 Fixture 不会渗透到 MCP 层。

## 6. 凭证与 Token

### 6.1 API Key 优先级

1. `GARMIN_PERSONAL_API_KEY`；
2. `GARMIN_PERSONAL_API_KEY_FILE` 指定的文件；
3. `~/.config/garmin/connect-personal-api-key`。

不支持把 API Key 作为普通 CLI 参数，避免进入 Shell History 和进程列表。`auth` 默认只通过带随机 state 的 `127.0.0.1` 临时页面接收 Key，`auth --terminal` 才使用隐藏终端输入；两种方式都不得把 Key 写入 stdout、URL、客户端配置或日志。

### 6.2 Token 策略

- 实现与 Garmin 官方 Client 兼容的 Bearer Token Cache；
- Cache 与 `gc-personal` CLI 使用同一路径，避免重复登录和 Token 交换；
- 仅在 Token 剩余超过一小时时复用；
- 请求遇到一次 `401` 时强制换 Token 并重试一次；
- API Key 更新后无需重启 MCP Host；下一次 Tool Call 应检测并使用新 Key；
- 错误信息禁止包含 API Key、完整 Bearer Token 或 Authorization Header。

## 7. MCP Tool 设计

### 7.1 命名原则

所有 Tool 使用 `garmin_` 前缀，避免与其他 MCP Server 冲突。Tool 面向用户意图，不机械复制 HTTP 路径。

### 7.2 v0.1 Tool 清单

聚合入口：

- `garmin_get_day`：一次返回某日 Summary、Sleep、HRV、Body Battery、Stress 和 Activities；单个数据源失败时保留其他结果并在 `warnings` 中说明。

活动：

- `garmin_search_activities`
- `garmin_get_activity`
- `garmin_get_activity_workouts`
- `garmin_get_activity_recording`

健康与恢复：

- `garmin_get_daily_summaries`
- `garmin_get_sleep`
- `garmin_get_sleep_summaries`
- `garmin_get_hrv`
- `garmin_get_hrv_summaries`
- `garmin_get_body_battery`
- `garmin_get_stress`
- `garmin_get_steps`
- `garmin_get_hydration`
- `garmin_get_heart_rate`
- `garmin_get_spo2`
- `garmin_get_wellness_activities`

身体与档案：

- `garmin_get_weight`
- `garmin_get_weight_goals`
- `garmin_get_food_log`
- `garmin_get_profile`
- `garmin_get_heart_rate_zones`
- `garmin_get_fitness_age`
- `garmin_get_menstrual_cycle`
- `garmin_get_menstrual_day`

### 7.3 结果信封

Tool 返回结构化对象，不只返回序列化后的 Text：

```json
{
  "data": {},
  "meta": {
    "source": "garmin-personal-api",
    "timezone": "America/Los_Angeles",
    "startDate": "2026-10-01",
    "endDate": "2026-10-07",
    "partial": false,
    "truncated": false
  },
  "warnings": []
}
```

保留 Garmin 原始单位，同时在 Tool 描述和 `meta` 中明确单位。不要在 v0.1 内构建第二套训练数据领域模型。

### 7.4 大结果控制

- 活动列表最多返回 50 条，并提供明确分页游标/Offset；
- 日期范围超过 Endpoint 限制时，由服务拆分为连续窗口后合并，而不是把拆分工作交给模型；
- Heart Rate、SpO2、Body Battery 等高频样本默认省略，使用 `include_samples=true` 显式请求；
- FIT Record 默认均匀降采样，`max_samples` 默认 300、最大 5,000；
- 每个结果明确标注 `truncated`、`returned`、`total` 和采样策略；
- 不在返回中静默删除数据。

### 7.5 隐私默认值

- FIT 经度、纬度、Polyline 和精确位置默认不返回；
- 只有 `include_location=true` 时才返回位置；
- 活动名称、备注和其他用户输入字段视为不可信外部文本；
- Tool 描述和 Server Instructions 明确要求 Host 不把活动文本当作指令；
- 所有 Tool 标注 `readOnlyHint=true`；由于 Tool 会访问 Garmin 外部服务，标注 `openWorldHint=true`。

## 8. FIT 处理

`garmin_get_activity_recording` 在内存中完成：

1. 下载 Garmin 返回的 ZIP Bytes；
2. 使用标准库 `zipfile` 找到 `.fit` 文件；
3. 使用 Garmin 官方 JavaScript FIT SDK 解码；
4. 返回 Session、Laps、Message Counts 和降采样 Records；
5. 将 `datetime`、Enum 和 SDK 特有类型转换为 JSON-safe 值；
6. 默认删除坐标字段；
7. 设置解码错误数量和完整性告警。

v0.1 不把原始 FIT 文件写入磁盘，避免引入文件覆盖、路径授权和 MCP Host 工作目录差异。后续若增加下载功能，必须单独设计显式输出目录和覆盖策略。

## 9. 错误模型

错误按以下类别映射成稳定、可操作的 MCP Tool Error：

- `credentials_missing`
- `credentials_invalid_or_expired`
- `garmin_unauthorized`
- `garmin_rate_limited`
- `garmin_no_data`
- `garmin_range_rejected`
- `garmin_upstream_error`
- `network_error`
- `fit_decode_error`
- `invalid_input`

错误内容必须说明用户下一步动作。上游 Response Body 最多保留一小段经过脱敏的摘要，不直接回传 HTML、Header 或凭证。

## 10. Fumadocs 首页与 SEO

### 10.1 原则

借鉴 Starshards 文档站已经验证的 Fumadocs 技术骨架，但 v0.1 只实现单页首页，不复制其文档树、业务组件、国际化复杂度和大量依赖。

技术栈：

- Next.js 16；
- React 19；
- Fumadocs Core/MDX/UI；
- Tailwind CSS；
- Node.js 22+；
- pnpm。

### 10.2 v0.1 单页结构

```text
apps/docs/
├── src/app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── src/components/
│   ├── hero.tsx
│   ├── quickstart.tsx
│   ├── client-config.tsx
│   ├── capabilities.tsx
│   ├── privacy.tsx
│   └── faq.tsx
├── src/lib/
│   ├── site.ts
│   └── seo-schema.ts
└── package.json
```

首页先使用英文，不引入 locale 路由、内容集合、站内搜索或翻译系统。保留 Fumadocs 是为了后续增加文档页时不更换框架，而不是在 v0.1 提前搭建空文档中心。

### 10.3 首页信息架构

1. Hero：一句话定义产品，Primary CTA 复制 Quickstart，Secondary CTA 打开 GitHub；
2. Trust strip：Local-only、Read-only、Official Personal API、Open source；
3. How it works：MCP Host → 本地 stdio Server → Garmin Personal API；
4. Quickstart：Node.js 前置条件、`auth` 命令、MCP JSON 配置和验证 Prompt；
5. Works with：只展示完成过真实启动验证的客户端；
6. What you can ask：Activities、Sleep、HRV、Body Battery、Heart Rate 等能力示例；
7. Privacy & security：凭证位置、无遥测、无远程服务、Tool 结果进入所选 AI Host 的准确说明；
8. FAQ：API Key、只读范围、支持平台、是否官方、数据流向和常见启动问题；
9. Final CTA：复制命令、GitHub、npm；
10. Footer：MIT、Security、Trademark 和非官方声明。

首页中的配置必须经过真实启动验证，不能只复制第三方文档。首发可使用 Tabs/Accordion 容纳不同客户端配置，但不生成独立 URL。README 承载贡献者需要的完整开发说明；首页只保留新用户首次成功所需内容。

### 10.4 SEO 与品牌目标

v0.1 的 `garminpersonalapi.com` 是单页产品入口。SEO 的第一目标是让搜索 Garmin Personal API MCP 的用户理解产品并完成安装，不是靠泛 Garmin 流量制造访问量。知识库和多页面 SEO 在 MCP 稳定、首页上线并获得真实搜索数据后再做。

核心转化：

1. 复制 `Connect @trainingloadai/garmin-personal-api-mcp` 到任一支持本地操作的代码 Agent；
2. Agent 读取 `AGENTS.md`，打开本地授权页并配置当前 MCP Host；
3. 访问 GitHub 仓库；
4. 完成第一次 Garmin Tool Call。

品牌陈述在网站、GitHub、npm 和所有 Metadata 中保持一致：

> Garmin Personal API MCP is a local-only, read-only, open-source MCP server that connects your own Garmin data to compatible AI clients.

必须同时展示非官方声明：

> Not affiliated with or endorsed by Garmin. Garmin and Garmin Connect are trademarks of Garmin Ltd. or its subsidiaries.

Canonical Domain 保持 `garminpersonalapi.com`。不切换到 `garminpersonal.com`：后者虽然更短，但语义不完整，更容易被误认为 Garmin 官方个人用户门户，也没有额外的 SEO 优势。两个域名都包含 Garmin 商标；上线前应复核接受的 Personal API 条款，必要时向 Garmin 确认描述性域名和项目名称的使用方式。若未来收到品牌异议，应迁移到不含第三方商标的独立项目品牌，而不是在两个 Garmin 前缀域名之间切换。

发布前复核 Garmin Developer API Brand Guidelines。域名、页面标题和正文可以描述兼容对象，但不得使用 Garmin Logo 冒充官方产品，也不得让用户误以为项目由 Garmin 发布。

### 10.5 搜索竞争事实与内容机会

截至 2026-10-23，当前搜索结果已经出现以下页面类型：

- Garmin 官方页面拥有 `Garmin Connect Personal API` 与 API Key/Token 获取意图；
- Shape 使用 `How to Use the Garmin Personal API with Claude and ChatGPT` 抢占 Personal API + AI 教程意图；
- EnduranceTools 使用 `Connect Garmin to Claude Desktop – Garmin MCP` 抢占客户端配置意图；
- 多个旧 Garmin MCP 项目仍基于用户名/密码和非官方 Garmin Connect API。

本项目的差异化内容必须反复、准确地建立四个事实：

1. 使用 Garmin 官方 Personal API，而不是用户名/密码抓取；
2. 只读；
3. MCP Server 只在本机通过 stdio 运行；
4. API Key 和 Token 留在用户电脑上。

不要宣称“数据绝不离开电脑”：Tool 结果会进入用户选择的 MCP Host/模型。正确表述是“项目本身不托管或转发数据；Tool 结果由本地 MCP Host 按其自身隐私政策处理”。

### 10.6 关键词体系

下表是搜索意图假设，不是未经验证的搜索量结论。**v0.1 只让首页承担第一行的产品发现意图**；其余关键词仅作为后续内容 backlog，不在首发阶段创建对应页面，也不全部堆入首页。上线后使用 Google Search Console、Bing Webmaster Tools，以及可用的 Ahrefs/Semrush 数据决定是否值得扩页。

| 集群 | Primary keyword | Secondary / long-tail keywords | 意图 | 目标页面 |
| --- | --- | --- | --- | --- |
| 产品首页 | `Garmin Personal API MCP` | `Garmin MCP`, `Garmin MCP server`, `local Garmin MCP`, `open source Garmin MCP` | 找到可安装项目 | `/` |
| Personal API 指南 | `Garmin Personal API` | `Garmin Connect Personal API`, `Garmin personal data API`, `Garmin API for personal use` | 了解新 API | `/guides/garmin-personal-api` |
| API Key | `Garmin Personal API key` | `Garmin API key`, `Garmin Personal API token`, `create Garmin API key` | 创建凭证 | `/docs/getting-started/create-garmin-api-key` |
| 安装 | `Garmin MCP setup` | `install Garmin MCP`, `Garmin MCP npm`, `Garmin MCP npx` | 安装与验证 | `/docs/getting-started` |
| Claude Desktop | `connect Garmin to Claude Desktop` | `Garmin Claude MCP`, `Claude Garmin integration`, `Garmin MCP Claude Desktop` | 客户端配置 | `/docs/clients/claude-desktop` |
| Claude Code | `Garmin MCP Claude Code` | `connect Garmin to Claude Code` | 客户端配置 | `/docs/clients/claude-code` |
| Cursor | `Garmin MCP Cursor` | `connect Garmin to Cursor` | 客户端配置 | `/docs/clients/cursor` |
| Codex | `Garmin MCP Codex` | `connect Garmin to Codex` | 客户端配置 | `/docs/clients/codex` |
| VS Code | `Garmin MCP VS Code` | `Garmin MCP server VS Code` | 客户端配置 | `/docs/clients/vscode` |
| OpenCode | `Garmin MCP OpenCode` | `connect Garmin to OpenCode` | 客户端配置 | `/docs/clients/opencode` |
| AI 使用场景 | `analyze Garmin data with AI` | `ask AI about Garmin data`, `AI Garmin activity analysis`, `Garmin data Claude` | 理解价值并开始使用 | `/guides/analyze-garmin-data-with-ai` |
| 认证参考 | `Garmin Personal API authentication` | `Garmin Personal API bearer token`, `Garmin API token exchange` | 开发与故障排查 | `/docs/reference/authentication` |
| Endpoint 参考 | `Garmin Personal API endpoints` | `Garmin Personal API documentation`, `Garmin Personal API example`, `Garmin Personal API TypeScript` | 开发参考 | `/docs/reference/endpoints` |
| 隐私 | `local Garmin MCP` | `Garmin MCP privacy`, `read-only Garmin MCP`, `Garmin API without password` | 安全评估 | `/docs/reference/privacy` |
| Activity | `Garmin activity API` | `Garmin FIT activity API`, `Garmin activity data MCP` | 获取活动与 FIT | `/data/activities` |
| Sleep | `Garmin sleep API` | `Garmin sleep data MCP`, `Garmin sleep Claude` | 查询睡眠 | `/data/sleep` |
| HRV | `Garmin HRV API` | `Garmin HRV data MCP`, `analyze Garmin HRV with AI` | 查询 HRV | `/data/hrv` |
| Body Battery | `Garmin Body Battery API` | `Garmin Body Battery data`, `Body Battery MCP` | 查询恢复数据 | `/data/body-battery` |
| Heart rate | `Garmin heart rate API` | `Garmin resting heart rate API`, `Garmin heart rate MCP` | 查询心率 | `/data/heart-rate` |

关键词使用规则：

- 一个可索引 URL 只拥有一个 Primary Intent；
- Title、H1、首段和主要内部 Anchor 属于同一意图族，但不机械重复完全相同的词；
- `keywords` Frontmatter 是编辑标签和质量检查输入，不输出无价值的 `<meta name="keywords">`，也不视为 Google 排名信号；
- 不创建 `Garmin API` 这种边界过宽的独立页面与官方/商业 API 意图竞争；
- 不针对未验证的客户端编写“支持”页面；
- 本项目没有远程 Transport，在 ChatGPT 能否启动本地 stdio MCP 得到真实验证前，不创建 `Garmin MCP ChatGPT` 页面；
- DeepSeek 是模型而不是 MCP Host，除非有一个经验证的具体 Host，否则不创建 `Garmin DeepSeek MCP` 页面。

### 10.7 URL 与内容架构

v0.1 只有一个可索引页面：

```text
/
```

首屏必须直接说明：是什么、为谁服务、为什么使用官方 Personal API、如何用一条 `npx` 命令开始。Primary CTA 是复制 Quickstart，Secondary CTA 是 GitHub。

首页使用锚点导航，例如 `#quickstart`、`#clients`、`#capabilities`、`#privacy`、`#faq`；锚点不作为独立 Canonical URL，也不进入 Sitemap。不存在的 `/docs`、`/guides` 和 `/data` 路径必须返回真实 404，不能生成占位页或跳转首页。

以下多页面结构只作为 v0.1 之后的候选，不在本轮实现：Personal API Guide、独立 Quickstart、客户端配置页、Tool Reference、数据能力页和 Troubleshooting。

### 10.8 可规模化页面策略

本节是后续设计，**不属于 v0.1**。只有 MCP 行为稳定、首页已上线并出现足以支持扩页的搜索或用户需求后，才考虑以下两个可维护的 Programmatic SEO 模板：

#### 客户端页面 `/docs/clients/{client}`

数据源是仓库内的 Typed Client Catalog。每页必须包含：

- 真实验证日期和客户端版本；
- 该客户端准确的配置文件位置；
- macOS、Windows、Linux 差异；
- 可复制配置；
- 重启/Reload 步骤；
- 如何确认 Tools 已加载；
- 至少三个适合该客户端的 Prompt；
- 客户端特有故障排查；
- 数据会发送到哪个 MCP Host/模型的说明。

仅替换客户端名称的页面不得索引。没有完成真实验证时，页面不生成或设置 `noindex`。

#### 数据页面 `/data/{data-type}`

数据源是与 MCP Tool 共用的 Data Capability Catalog。每页必须包含：

- Garmin 数据集定义；
- 对应 Personal API Endpoint 和 MCP Tool；
- 日期范围、单位、空值和设备支持限制；
- 默认是否省略 Samples/位置；
- 可复制问题示例；
- 示例结构化结果；
- 隐私注意事项；
- 相关数据页面和 Tool Reference 链接。

第一批候选是 Activities、Sleep、HRV、Body Battery、Heart Rate，但不会随 v0.1 生成。新增页面必须同时满足真实 Tool 支持、独特内容和可验证搜索意图，不为凑页面数量批量生成薄内容。

未来的 Tool 参考先集中在 `/docs/reference/tools`。只有当单个 Tool 能提供完整 Schema、输入示例、输出示例、Endpoint 限制、错误和相关教程时，才允许拆为 `/docs/tools/{tool}` 并进入 Sitemap。

### 10.9 首页 Metadata 契约

首页使用代码配置而不是 MDX Frontmatter：

```ts
export const metadata = {
  title: "Garmin Personal API MCP — Local, Read-only & Open Source",
  description:
    "Connect your own Garmin data to compatible AI clients with a local, read-only, open-source MCP server. Run it with npx; no hosted connector.",
  alternates: { canonical: "https://garminpersonalapi.com" },
};
```

要求：

- 页面只有一个 `title`、`description`、Canonical 和 H1；
- Primary Keyword 是 `Garmin Personal API MCP`，`Garmin MCP` 与 `Garmin MCP server` 作为自然出现的 Secondary Keyword；
- H1 与 Title 不必逐字相同，但必须表达同一搜索意图；
- 首段在 40–80 个英文单词内直接定义产品；
- 所有事实性限制尽量链接 Garmin/MCP 官方来源；
- 代码和配置必须可复制，禁止用图片代替；
- 客户端配置显示 `Last verified`，相关客户端或 API 变化后重新验证；
- Open Graph 和 Twitter Card 与首页 Title/Description 一致。

### 10.10 Technical SEO 验收

- Canonical Origin 固定为 `https://garminpersonalapi.com`；
- 生成 `/robots.txt` 和 `/sitemap.xml`；
- Sitemap v0.1 只包含首页；
- 404 返回真实 404，不软跳转首页；
- 页面使用 SSR/静态生成，核心正文不依赖客户端 JavaScript 才能出现；
- 每个页面有一个 H1，Heading 层级连续；
- 代码块、表格、链接和移动端布局通过可访问性检查；
- 图片必须有描述实际信息的 Alt，不使用装饰截图填充页面；
- Production Build 中检查缺失 Description、无效 Canonical 和 Broken Links；
- 提交 Google Search Console 与 Bing Webmaster Tools；
- 对 Core Web Vitals 设置预算，不让文档搜索、语法高亮或 Analytics 阻塞首屏。

### 10.11 Structured Data

使用共享、经过转义的 JSON-LD 组件，不直接拼接不可信字符串：

- 首页：`WebSite`、`Organization`、`SoftwareApplication`；
- `SoftwareApplication` 包含 `applicationCategory: DeveloperApplication`、`operatingSystem`、`isAccessibleForFree`、`codeRepository`、`license`、`programmingLanguage`；
- 不伪造 Rating、Review、用户数量或 Garmin 官方背书；
- FAQ 使用可见问答结构；除非届时搜索引擎政策与页面资格明确匹配，否则不添加无实际收益的 `FAQPage` Schema。

### 10.12 AI Search / GEO

v0.1 不额外实现 `/llms.txt`、`/llms-full.txt`、`/tools.md`、`/security.md` 或 `/api-docs.md`。首页的 SSR HTML 与 GitHub README 已能提供可抓取的产品、Quickstart、安全边界和能力信息；等出现真实机器读取需求或独立文档页后再生成这些端点。

内容可引用性要求：

- 首页首段给出自包含定义；
- 每个主要 H2 先直接回答，再展开细节；
- 配置步骤使用有序列表；
- 比较内容使用表格；
- API 限制标注验证日期和来源；
- 对“官方 API”“只读”“本地运行”“数据流向”等核心事实使用完全一致的准确表述；
- 引用 Garmin、MCP、Node.js 等 Primary Source；
- 不制造搜索量、性能、用户量或安全统计。

`robots.txt` 对搜索爬虫、用户触发的 AI Retrieval Crawler 和训练 Crawler 分别制定策略。上线时核对各厂商最新 User-Agent 含义；若选择退出模型训练，不能误伤用于用户主动检索和来源引用的 Crawler。

### 10.13 首页链接

- Header 使用页内锚点导航，并始终提供 GitHub；
- Hero 链接 `#quickstart` 和 GitHub；
- Quickstart 链接 Garmin 官方 API Key 页面和 MCP 官方介绍；
- 安全段链接 GitHub `SECURITY.md`；
- Footer 链接 GitHub、npm、LICENSE 和 Garmin 官方 Personal API；
- 不为尚未存在的文档页面放置假链接。

### 10.14 SEO 发布优先级

#### P0：随 v0.1 发布

- 首页；
- 首页内嵌 Quickstart、经验证的客户端配置、能力概览、Privacy/Security 和 FAQ；
- Sitemap、Robots、Canonical、首页 JSON-LD、Open Graph；
- GitHub README、`SECURITY.md` 和 npm 包页面作为补充资料。

#### P1：有真实使用与 Search Console 数据后

- 根据 Support Issue 和 Search Console 数据决定是否创建 Personal API Guide、Quickstart、客户端页、Tool Reference、数据页与 Troubleshooting；
- Search Console 已出现 Impression 的长尾内容增强；
- 评估简体中文本地化。

#### P2：仅在需求得到验证后

- 单 Tool 详情页和更多数据类型页面；
- 新 MCP Host 页面；
- 视频与截图教程。

### 10.15 SEO/GEO 验收与监控

上线前：

- [x] 首页以 `Garmin Personal API MCP` 为唯一 Primary Keyword 与 Search Intent；
- [x] Title、Description、H1 和 Canonical 完整且一致；
- [ ] 首页中出现的所有客户端支持声明经过真实验证；
- [x] Sitemap、Robots 和 JSON-LD 通过测试；
- [x] Garmin 商标与非官方声明可见；
- [x] 没有将“本地 MCP”错误描述为“数据永不离开本机”；
- [x] 没有为不支持的 ChatGPT/DeepSeek 场景创建入口页。

上线后每月记录：

- 首页是否被正常抓取与索引；
- 目标 Query 的 Impression、Click、CTR 和平均位置；
- 自然搜索到 Quickstart、GitHub 和 Copy Command 的转化；
- 获得 Impression 但 CTR 低的 Query；
- ChatGPT、Perplexity、Claude、Google AI Overview 对 10–20 个核心问题的品牌提及和引用；
- 竞争页面新增的事实、客户端和内容格式。

首发没有可靠搜索量时，不设置虚假的流量承诺。前 90 天的成功标准是：首页被正常索引、目标查询产生持续 Impression，并能观察到从搜索到复制命令、npm 或 GitHub 的行为路径。

## 11. 测试策略

### 11.1 Unit Tests

- API Key 解析优先级、空值和文件权限；
- 日期解析、Inclusive Range 和自动分片；
- Garmin 错误到 MCP 错误的映射；
- Activity 摘要压缩；
- 高频 Samples 默认省略；
- GPS 默认脱敏；
- FIT 解码、降采样和 JSON 序列化；
- Token `401` 强制刷新只重试一次。

### 11.2 Contract Tests

- Tool 名称、数量、Input Schema 和 Annotation；
- 每个 Tool 返回统一结构化信封；
- `garmin_get_day` 的部分成功语义；
- 所有 Tool 都是 Garmin 只读操作；
- 没有注册 HTTP Transport 或任意路径 Tool。

### 11.3 Process Tests

- 从 `npm pack` 生成的 Tarball 安装并启动 Console Script；
- 通过 stdio 完成 MCP Initialize、List Tools 和至少一次 Tool Call；
- 启动前后 stdout 没有协议外文本；
- macOS、Linux、Windows 的配置路径和命令可运行；
- `auth` 不回显 Key，错误输出不包含 Key。

### 11.4 Fixtures

- 所有 Fixture 使用合成、脱敏数据；
- CI 不读取开发者本地 Garmin Key；
- FIT Fixture 不包含真实家庭坐标；
- 禁止录制包含 Authorization Header 的 HTTP Cassette。

## 12. CI 与发布

### 12.1 Pull Request CI

Node.js Matrix：20、22；操作系统至少覆盖 Ubuntu、macOS、Windows。

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test --coverage
pnpm build
pnpm pack
```

文档：

```bash
pnpm --filter docs build
```

### 12.2 发布

- npm 包名：`@trainingloadai/garmin-personal-api-mcp`；
- Console Script：`garmin-personal-api-mcp`；
- 使用 GitHub Actions + npm Trusted Publishing，并生成 Provenance；
- Tag 使用 `v0.x.y`；
- 发布前从 `npm pack` Tarball 在干净目录中执行 stdio Smoke Test；
- GitHub Release、npm Version 和 `CHANGELOG.md` 必须一致。

## 13. 分阶段实施

### Phase 0：仓库基线

- [x] 添加根 `package.json`、`pnpm-workspace.yaml`、`pnpm-lock.yaml` 和共享 `tsconfig.base.json`；
- [x] 建立 `packages/mcp-server` 发布包和 `apps/docs` 私有应用；
- [x] 添加 ESLint、TypeScript、Vitest 配置；
- [x] 添加最小 `README.md`、`CONTRIBUTING.md`、`SECURITY.md`；
- [x] 建立三平台 CI；
- [x] 确认 npm scope 为组织 `trainingloadai`，包名使用 `@trainingloadai/garmin-personal-api-mcp`（发布前再次确认可用性与组织写权限）；
- [x] 建立 Fumadocs 最小站点。

验收：空 Server 可以通过打包后的 `npx -y @trainingloadai/garmin-personal-api-mcp` 启动并完成 MCP Initialize/List Tools。

### Phase 1：凭证与垂直切片

- [x] 实现 `auth`、`auth --check`、`doctor`；
- [x] 封装官方 Garmin Client；
- [x] 实现 `garmin_get_profile`；
- [x] 完成 Token Cache 和一次性 401 Refresh；
- [x] 完成 stdout 污染测试；
- [x] 发布本地开发版配置文档。

验收：用户可以从创建 API Key 到让本地 MCP Host 成功读取 Profile，全程不克隆仓库、不手工安装依赖。

### Phase 2：活动与 FIT

- [x] 实现活动搜索、详情、Workout 和 Recording；
- [x] 实现活动摘要压缩、分页和输出上限；
- [x] 实现 FIT Session/Lap/Record 解码；
- [x] 默认移除精确位置；
- [x] 增加脱敏 FIT Fixture 和跨平台测试。

验收：模型能够查找一次活动并分析 Laps/HR/Power，不暴露默认坐标，也不会溢出合理 Context。

### Phase 3：健康数据与聚合

- [x] 实现官方 Personal API 的健康、身体和档案 Wrapper；
- [x] 实现日期范围自动分片；
- [x] 实现 Samples 默认裁剪与显式开启；
- [x] 实现 `garmin_get_day` 部分成功聚合；
- [x] 完成 Tool Contract Tests。

验收：所有计划内只读数据集可用，长日期范围无需模型手工拆分，一个数据源失败不会让整日聚合失败。

### Phase 4：首页与 v0.1 发布

- [x] 完成 Fumadocs 单页首页，在页面内提供 Quickstart、客户端配置、能力概览、安全边界和 FAQ；
- [ ] 在真实 Claude Desktop、Cursor、Codex、VS Code/OpenCode 中验证首页展示的配置；
- [x] 完成 Canonical、Sitemap、Robots、首页 JSON-LD 和 Open Graph；
- [x] 添加 Trademark/非官方声明；
- [ ] 完成 npm Trusted Publishing；
- [ ] 发布 `v0.1.0`。

验收：新用户只看首页，可以在 10 分钟内完成 Key 创建、认证、客户端配置并成功询问一次 Garmin 数据；站内没有空文档入口或未完成页面。

## 14. v0.1 发布门槛

- [x] MCP 只存在 stdio Transport（`auth` 的临时 loopback 页面不是 MCP Transport）；
- [x] 只调用 Garmin 官方 Personal API，并使用 Garmin 官方 FIT SDK；
- [x] 所有 Garmin Tool 只读；
- [x] API Key 和 Token 不离开本机；
- [x] 默认不返回精确 GPS；
- [x] 所有 Tool 有稳定 Schema 和结构化输出；
- [x] 日期范围、分页、采样和截断都有明确元数据；
- [ ] 三平台 CI 通过；
- [x] npm Tarball 可安装；
- [ ] `npx -y @trainingloadai/garmin-personal-api-mcp` 可启动；
- [x] Fumadocs Production Build 通过；
- [x] README 与官网没有远程托管或 Starshards 集成暗示；
- [x] 文档明确披露 Tool 结果会进入用户选择的 AI Host/模型；
- [x] LICENSE、Trademark 和非官方声明完整。

## 15. 实施时参考的开源项目

- [Garmin 官方 Personal API Python Client](https://github.com/garmin/connect-personal-api-python)：作为认证、Token Cache、Endpoint 和错误行为的兼容性参考，不作为运行时依赖；
- [Garmin 官方 FIT JavaScript SDK](https://github.com/garmin/fit-javascript-sdk)：FIT 解码；
- [MCP 官方 TypeScript SDK v2](https://github.com/modelcontextprotocol/typescript-sdk)：`McpServer`、`serveStdio()`、结构化输出和进程测试；
- [MCP Filesystem Reference Server](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)：npm/npx 分发、本地权限边界和 Tool Annotation；
- [Mason-Levyy/garmin-personal-mcp](https://github.com/Mason-Levyy/garmin-personal-mcp)：同类产品的 `auth`、`garmin_get_day`、自动分片和模型尺寸控制；
- [Shape-Calendar/garmin-personal-mcp](https://github.com/Shape-Calendar/garmin-personal-mcp)：活动摘要压缩、FIT 降采样和本地 Key 处理；
- Starshards `docs/`：Fumadocs 技术骨架和 SEO 元数据约定，不复制其多页面信息架构。

这些项目用于验证模式和边界，不直接复制其实现。优先依赖官方 SDK，并用本项目自己的 Adapter、Tool Contract、隐私默认值和测试定义行为。

## 16. 新会话实施交接

新会话开始时，先读取本文件并以以下已确认决策为约束，不重新讨论语言、Transport、Monorepo 或首发内容范围，除非出现新的官方证据：

- Node.js 20+ / TypeScript；开发环境推荐 Node.js 22 LTS；
- pnpm Workspace；
- `packages/mcp-server` 是唯一发布到 npm 的包；
- `apps/docs` 是私有 Next.js + Fumadocs 网站；
- MCP 只支持本地 stdio、只读、无 HTTP、无远程部署；
- v0.1 网站只发布首页，不做独立文档、Guide、Client、Data 或 Tool 页面；
- Canonical Domain 是 `https://garminpersonalapi.com`；
- npm 包名是 `@trainingloadai/garmin-personal-api-mcp`，Console Script 是 `garmin-personal-api-mcp`；
- 不依赖 Trainingload.ai/Starshards 运行时。

实施顺序：

1. 建立根 Workspace、共享 TypeScript/ESLint/Vitest 配置和 CI；
2. 建立可打包的 `packages/mcp-server`，先打通 `serveStdio()`、Initialize 和 List Tools；
3. 实现认证、Garmin Client 和 `garmin_get_profile` 垂直切片，并完成进程级 Smoke Test；
4. 按 Phase 2–3 实现 Tool、输出控制、隐私默认值和测试；
5. 建立 `apps/docs` 单页首页，直接复用已验证的命令和配置；
6. 从 `npm pack` Tarball 做干净安装测试，再发布 v0.1。

首轮实现完成标准：

- `pnpm install`、Lint、Typecheck、Test 和 Build 全部通过；
- 打包后的 CLI 能通过 `npx` 初始化 stdio MCP，并且 stdout 没有协议外文本；
- 至少完成认证与 Profile 垂直切片；
- 首页 Production Build 通过，只生成一个可索引页面；
- README、首页和真实 CLI 行为一致。
