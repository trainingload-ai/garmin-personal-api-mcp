# Garmin Personal API MCP

[English](README.md) · [简体中文](README.zh-CN.md)

Garmin Personal API MCP 是一个完全在本机运行、仅提供只读能力的开源 MCP 服务。它通过
Garmin 官方 Personal API，将你自己的活动、睡眠、HRV、Body Battery、心率与健康数据接入
支持 MCP 的 AI 客户端，不需要提供 Garmin 用户名或密码。

> 本项目与 Garmin 无隶属或背书关系。Garmin 和 Garmin Connect 是 Garmin Ltd. 或其子公司的商标。

项目网站：[garminpersonalapi.com/zh](https://garminpersonalapi.com/zh) · 英文网站：
[garminpersonalapi.com](https://garminpersonalapi.com/) · AI 可读的项目说明：
[llms.txt](https://garminpersonalapi.com/llms.txt) 和
[llms-full.txt](https://garminpersonalapi.com/llms-full.txt)

## 快速接入

需要 Node.js 22 或更高版本。

1. 打开 Garmin Connect 的
   [Personal API Token 设置页](https://connect.garmin.com/app/settings/personalApiToken)，创建
   Personal API Key。Garmin 只会展示一次新创建的 Key，请在离开页面前复制保存。
2. 把下面这一句话发给 Codex、Claude Code、Cursor 或其他具备本机操作能力的编程助手：

       Connect @trainingloadai/garmin-personal-api-mcp

3. 客户端会打开一个临时的本机授权页面。只在这个页面中粘贴 API Key；接入完成后，如果工具没有
   立即出现，请重新加载或重启 AI 客户端。供编程助手读取的完整接入约定见 [AGENTS.md](AGENTS.md)。
4. 现在可以直接提问，例如：“总结我昨天的睡眠、HRV、Body Battery、压力和训练情况。”

### 手动配置

如果希望自行配置，先打开中文本机授权页面：

    npx -y @trainingloadai/garmin-personal-api-mcp auth --locale zh

授权页支持 <code>en|zh|ja|es|de|fr|pt|ko</code> 八种语言。不指定 <code>--locale</code> 时，
CLI 会根据当前系统语言自动选择；不支持的语言会回退到英文。

在没有图形界面的系统上，可以改用终端输入：

    npx -y @trainingloadai/garmin-personal-api-mcp auth --terminal

然后在支持 MCP 的客户端中添加以下本机进程：

    {
      "mcpServers": {
        "trainingloadai": {
          "command": "npx",
          "args": ["-y", "@trainingloadai/garmin-personal-api-mcp"]
        }
      }
    }

如果 Windows 客户端无法直接调用 <code>npx</code>，请使用 <code>"command": "cmd"</code>，
并将参数设置为
<code>["/c", "npx", "-y", "@trainingloadai/garmin-personal-api-mcp"]</code>。

具体配置文件位置和重新加载方式由各个 AI 客户端决定。本项目只提供在本机运行的 MCP 进程，
没有远程 URL、HTTP MCP 服务、Docker 服务、中转服务器或托管账户。

## CLI 命令

    garmin-personal-api-mcp              启动本机 MCP 服务
    garmin-personal-api-mcp auth [--locale en|zh|ja|es|de|fr|pt|ko]
                                         打开本机授权页，验证并保存 API Key
    garmin-personal-api-mcp auth --terminal
                                         在终端中隐藏输入 API Key
    garmin-personal-api-mcp auth --check 检查已保存的凭据及 Garmin 连接
    garmin-personal-api-mcp doctor       检查运行环境、文件权限、凭据和网络连接
    garmin-personal-api-mcp --version    显示当前版本

API Key 的读取顺序如下：

1. 环境变量 <code>GARMIN_PERSONAL_API_KEY</code>
2. <code>GARMIN_PERSONAL_API_KEY_FILE</code> 指定的文件
3. <code>~/.config/garmin/connect-personal-api-key</code>

Bearer Token 缓存兼容 Garmin 官方 Python 客户端，默认保存在
<code>~/.config/garmin/connect-personal-api-bearer-token.json</code>。在 POSIX 系统上，
凭据目录和文件会分别使用 <code>0700</code> 与 <code>0600</code> 权限创建。

## 可用工具

服务共提供 25 个只读工具：

- 每日概览：<code>garmin_get_day</code>
- 活动：搜索活动、读取详情与训练内容，以及按需解析 FIT 记录
- 恢复：每日汇总、睡眠、HRV、Body Battery、压力和体能年龄
- 健康：步数、饮水、心率、血氧、健康活动、体重、目标、营养和生理周期数据
- 个人资料：个人设置和心率区间

每次成功调用都会返回统一的 <code>{ data, meta, warnings }</code> 结构。查询较长日期范围时，
服务会按照 Garmin 各接口的安全范围自动分段并合并结果：每日汇总每段最多 365 天，步数和压力
最多 28 天，睡眠汇总、饮水和 Body Battery 最多 31 天。各时间段会依次请求，避免短时间内集中
访问 Garmin。活动搜索最多返回 50 条结果；除非明确设置 <code>include_samples=true</code>，
否则不会返回高频采样数据。FIT 记录默认均匀抽取 300 个采样点，最多返回 5,000 个。

当 Garmin 返回 <code>401</code> 时，服务会刷新 Bearer Token 并重试一次。遇到限流或服务不可用时
不会反复重试；错误会包含稳定的错误代码、可用的 HTTP 状态、是否适合重试，以及 Garmin 在
<code>429</code> 响应中提供的 <code>Retry-After</code> 等待时间。某个非必要数据源不可用时，
<code>garmin_get_day</code> 可以返回仍然有效的部分数据，但不会把授权失败或 Garmin 整体不可用
伪装成部分成功。

除非明确设置 <code>include_location=true</code>，否则 FIT 中的精确坐标和轨迹不会返回。
活动名称、备注及其他用户输入内容只会被视为外部数据，不能作为指令执行。

## 隐私与安全边界

- API Key 和 Bearer Token 缓存只保存在运行 MCP 进程的电脑上。
- 本项目没有遥测、数据库、账户系统、对外 HTTP 监听或远程中转服务。
- 所有 Garmin 操作均为只读。
- 工具查询结果会返回给你选择的 MCP 客户端和 AI 模型，并受相应服务的隐私政策约束。因此，
  “MCP 在本机运行”并不表示查询结果一定不会离开你的电脑。

凭据处理方式和安全问题报告流程见 [SECURITY.md](SECURITY.md)。

## 开发

    pnpm install
    pnpm lint
    pnpm typecheck
    pnpm test:coverage
    pnpm build
    pnpm smoke:pack

使用 <code>pnpm dev:mcp</code> 从源码启动 MCP 服务，使用 <code>pnpm dev:docs</code> 启动单页
Fumadocs 网站。测试仅使用合成数据和 HTTP 模拟，不会读取开发者的 Garmin API Key。

如何在 <code>trainingloadai</code> npm 组织下发布、完成首次发布以及配置 Trusted Publishing，
详见 [RELEASING.md](RELEASING.md)。

工作区包含两个实际运行单元：

- <code>packages/mcp-server</code>：唯一公开发布的 npm 包
- <code>apps/docs</code>：不单独发布的 Next.js + Fumadocs 单页网站

运行时不依赖 Trainingload.ai 或 Starshards。

## 许可证

[MIT](LICENSE)
