import type { GarminMcpError } from './errors.js';

export const LOCAL_AUTH_LOCALES = ['en', 'zh', 'ja', 'es', 'de', 'fr', 'pt', 'ko'] as const;

export type LocalAuthLocale = (typeof LOCAL_AUTH_LOCALES)[number];

export type AuthCopy = {
  browserTitle: string;
  button: string;
  description: string;
  errorCredentials: string;
  errorGeneric: string;
  errorInProgress: string;
  errorInvalidForm: string;
  errorInvalidInput: string;
  errorInvalidLink: string;
  errorNetwork: string;
  errorRateLimited: string;
  errorRateLimitedAfter: string;
  errorRequired: string;
  errorTitle: string;
  errorUnauthorized: string;
  errorUnsupportedForm: string;
  eyebrow: string;
  finePrint: string;
  formDescription: string;
  formEyebrow: string;
  formTitle: string;
  heading: string;
  inputHint: string;
  inputLabel: string;
  inputPlaceholder: string;
  languageLabel: string;
  notFound: string;
  privacyItems: readonly string[];
  privacyTitle: string;
  retryButton: string;
  sourceDescription: string;
  sourceEyebrow: string;
  sourceLink: string;
  sourceTitle: string;
  successDescription: string;
  successBrowserTitle: string;
  successEyebrow: string;
  successHeading: string;
  successItems: readonly string[];
  successNext: string;
  successTitle: string;
  successWebsite: string;
};

export const LOCAL_AUTH_LOCALE_INFO: Record<LocalAuthLocale, {
  htmlLanguage: string;
  label: string;
  shortLabel: string;
}> = {
  en: { htmlLanguage: 'en', label: 'English', shortLabel: 'EN' },
  zh: { htmlLanguage: 'zh-CN', label: '简体中文', shortLabel: '简' },
  ja: { htmlLanguage: 'ja', label: '日本語', shortLabel: '日' },
  es: { htmlLanguage: 'es', label: 'Español', shortLabel: 'ES' },
  de: { htmlLanguage: 'de', label: 'Deutsch', shortLabel: 'DE' },
  fr: { htmlLanguage: 'fr', label: 'Français', shortLabel: 'FR' },
  pt: { htmlLanguage: 'pt', label: 'Português', shortLabel: 'PT' },
  ko: { htmlLanguage: 'ko', label: '한국어', shortLabel: '한' },
};

export const AUTH_COPY: Record<LocalAuthLocale, AuthCopy> = {
  en: {
    browserTitle: 'Connect Garmin Personal API',
    button: 'Verify and finish setup',
    description:
      'This page connects Garmin Personal API to the AI client you just used. Your key is handled on this computer, not in chat.',
    errorCredentials: 'The key could not be saved on this computer. Check the local configuration folder permissions and try again.',
    errorGeneric: 'Garmin Personal API could not verify the key right now. Try again in a moment.',
    errorInProgress: 'The key is already being verified. Wait a moment.',
    errorInvalidForm: 'This authorization form is invalid or has expired.',
    errorInvalidInput: 'The submitted value is invalid. Check it and try again.',
    errorInvalidLink: 'This authorization link is invalid or has expired.',
    errorNetwork: 'Garmin Personal API could not be reached. Check your internet connection and try again.',
    errorRateLimited: 'Garmin is temporarily limiting requests. Try again later.',
    errorRateLimitedAfter: 'Garmin is temporarily limiting requests. Try again in {seconds} seconds.',
    errorRequired: 'Paste your Garmin Personal API key to continue.',
    errorTitle: 'Key not verified',
    errorUnauthorized: 'Garmin did not accept this Personal API key. It may be invalid, expired, or deleted. Create a current key and try again.',
    errorUnsupportedForm: 'This form submission is not supported.',
    eyebrow: 'Private local setup',
    finePrint:
      'This local page sends the key directly to Garmin over HTTPS for verification, then saves it in your user-only configuration on this computer.',
    formDescription: 'We will check the key with Garmin. If it works, setup finishes automatically on this computer.',
    formEyebrow: 'Step 2 · on this computer',
    formTitle: 'Paste and verify your key',
    heading: 'Connect Garmin Personal API',
    inputHint: 'Use the key from Garmin Connect’s Personal API Token page.',
    inputLabel: 'Personal API key',
    inputPlaceholder: 'Paste the key here',
    languageLabel: 'Choose authorization language',
    notFound: 'Page not found',
    privacyItems: [
      'Enter the key only on this local page',
      'Your computer verifies it directly with Garmin',
      'It is never added to your AI conversation',
    ],
    privacyTitle: 'What happens to your key',
    retryButton: 'Verify another key',
    sourceDescription: 'Garmin shows a newly created key only once. Copy it before leaving that page.',
    sourceEyebrow: 'Step 1 · in Garmin Connect',
    sourceLink: 'Open Personal API Token settings',
    sourceTitle: 'Create or copy your key',
    successDescription: 'Garmin accepted the key. It is now saved in this user’s local configuration on this computer.',
    successBrowserTitle: 'Garmin Personal API connected',
    successEyebrow: 'Connection complete',
    successHeading: 'Garmin Personal API is connected.',
    successItems: ['Verified directly with Garmin', 'Saved only for this computer user', 'Ready for read-only requests'],
    successNext: 'Return to the AI client that opened this page. If the tools are not visible yet, reload or restart the client.',
    successTitle: 'Continue in your AI client',
    successWebsite: 'Visit project website',
  },
  zh: {
    browserTitle: '连接 Garmin Personal API',
    button: '验证并完成接入',
    description: '这个页面会把 Garmin Personal API 接入你刚才使用的 AI 客户端。Key 只在这台电脑上处理，不需要发进聊天。',
    errorCredentials: '无法在这台电脑上保存 Key。请检查本地配置目录的读写权限后重试。',
    errorGeneric: 'Garmin Personal API 暂时无法验证这个 Key，请稍后重试。',
    errorInProgress: '正在验证 Key，请稍候。',
    errorInvalidForm: '这个授权表单无效或已过期。',
    errorInvalidInput: '提交的内容无效，请检查后重试。',
    errorInvalidLink: '这个授权链接无效或已过期。',
    errorNetwork: '暂时无法连接 Garmin Personal API。请检查网络后重试。',
    errorRateLimited: 'Garmin 暂时限制了请求频率，请稍后重试。',
    errorRateLimitedAfter: 'Garmin 暂时限制了请求频率，请在 {seconds} 秒后重试。',
    errorRequired: '请粘贴 Garmin Personal API Key 后继续。',
    errorTitle: 'Key 验证未通过',
    errorUnauthorized: 'Garmin 没有接受这个 Personal API Key。它可能无效、已过期或已被删除，请创建当前有效的 Key 后重试。',
    errorUnsupportedForm: '无法处理此次表单提交。',
    eyebrow: '仅在本机完成接入',
    finePrint: '这个本地页面会通过 HTTPS 直接向 Garmin 验证 Key，通过后只保存在这台电脑的当前用户配置中。',
    formDescription: '我们会直接向 Garmin 验证。Key 有效时，这台电脑上的接入会自动完成。',
    formEyebrow: '第 2 步 · 回到这台电脑',
    formTitle: '粘贴并验证 Key',
    heading: '连接 Garmin Personal API',
    inputHint: '请使用 Garmin Connect 的 Personal API Token 页面提供的 Key。',
    inputLabel: 'Personal API Key',
    inputPlaceholder: '在这里粘贴 Key',
    languageLabel: '选择授权页面语言',
    notFound: '找不到这个页面',
    privacyItems: ['只在这个本地页面中输入 Key', '由你的电脑直接向 Garmin 验证', '不会添加到你与 AI 的对话中'],
    privacyTitle: 'Key 会如何处理',
    retryButton: '换一个 Key 重新验证',
    sourceDescription: 'Garmin 只展示一次新创建的 Key，请在离开页面前复制。',
    sourceEyebrow: '第 1 步 · 前往 Garmin Connect',
    sourceLink: '打开 Personal API Token 设置',
    sourceTitle: '创建或复制 Key',
    successDescription: 'Garmin 已接受这个 Key，并将它保存到这台电脑的当前用户配置中。',
    successBrowserTitle: 'Garmin Personal API 已连接',
    successEyebrow: '接入完成',
    successHeading: 'Garmin Personal API 已连接',
    successItems: ['已直接通过 Garmin 验证', '仅为这台电脑的当前用户保存', '已可用于只读查询'],
    successNext: '请返回刚才打开此页面的 AI 客户端。如果还没有看到工具，重新加载或重启客户端即可。',
    successTitle: '回到 AI 客户端继续',
    successWebsite: '返回项目官网',
  },
  ja: {
    browserTitle: 'Garmin Personal API に接続',
    button: '確認して設定を完了',
    description: 'このページで、Garmin Personal API を先ほど使用した AI クライアントに接続します。キーはチャットではなく、このコンピューター上で処理されます。',
    errorCredentials: 'このコンピューターにキーを保存できませんでした。ローカル設定フォルダーの権限を確認して、もう一度お試しください。',
    errorGeneric: '現在、Garmin Personal API でキーを確認できません。しばらくしてからもう一度お試しください。',
    errorInProgress: 'キーを確認しています。しばらくお待ちください。',
    errorInvalidForm: 'この認証フォームは無効か、有効期限が切れています。',
    errorInvalidInput: '入力内容が無効です。確認して、もう一度お試しください。',
    errorInvalidLink: 'この認証リンクは無効か、有効期限が切れています。',
    errorNetwork: 'Garmin Personal API に接続できません。ネットワークを確認して、もう一度お試しください。',
    errorRateLimited: 'Garmin が一時的にリクエストを制限しています。しばらくしてからお試しください。',
    errorRateLimitedAfter: 'Garmin が一時的にリクエストを制限しています。{seconds} 秒後にもう一度お試しください。',
    errorRequired: '続行するには Garmin Personal API キーを貼り付けてください。',
    errorTitle: 'キーを確認できませんでした',
    errorUnauthorized: 'Garmin がこの Personal API キーを受け付けませんでした。無効、期限切れ、または削除済みの可能性があります。新しいキーを作成してお試しください。',
    errorUnsupportedForm: 'このフォーム送信には対応していません。',
    eyebrow: 'この端末だけで接続',
    finePrint: 'このローカルページから HTTPS で Garmin に直接キーを送って確認し、このコンピューターのユーザー専用設定に保存します。',
    formDescription: 'Garmin に直接キーを確認します。有効であれば、このコンピューターでの設定は自動的に完了します。',
    formEyebrow: 'ステップ 2 · このコンピューターで',
    formTitle: 'キーを貼り付けて確認',
    heading: 'Garmin Personal API に接続',
    inputHint: 'Garmin Connect の Personal API Token ページに表示されたキーを使用してください。',
    inputLabel: 'Personal API キー',
    inputPlaceholder: 'ここにキーを貼り付け',
    languageLabel: '認証ページの言語を選択',
    notFound: 'ページが見つかりません',
    privacyItems: ['キーはこのローカルページにのみ入力', 'このコンピューターから Garmin に直接確認', 'AI との会話には追加されません'],
    privacyTitle: 'キーの取り扱い',
    retryButton: '別のキーを確認',
    sourceDescription: '新しく作成したキーは一度だけ表示されます。ページを離れる前にコピーしてください。',
    sourceEyebrow: 'ステップ 1 · Garmin Connect で',
    sourceLink: 'Personal API Token 設定を開く',
    sourceTitle: 'キーを作成またはコピー',
    successDescription: 'Garmin がキーを確認しました。このコンピューターの現在のユーザー設定に保存されています。',
    successBrowserTitle: 'Garmin Personal API に接続しました',
    successEyebrow: '接続完了',
    successHeading: 'Garmin Personal API に接続しました。',
    successItems: ['Garmin で直接確認済み', 'このコンピューターのユーザーだけに保存', '読み取り専用で利用可能'],
    successNext: 'このページを開いた AI クライアントに戻ってください。ツールが表示されない場合は、クライアントを再読み込みまたは再起動してください。',
    successTitle: 'AI クライアントで続行',
    successWebsite: 'プロジェクトサイトを見る',
  },
  es: {
    browserTitle: 'Conectar Garmin Personal API',
    button: 'Verificar y terminar la configuración',
    description: 'Esta página conecta Garmin Personal API con el cliente de IA que acabas de usar. La clave se procesa en este ordenador, no en el chat.',
    errorCredentials: 'No se pudo guardar la clave en este ordenador. Revisa los permisos de la carpeta de configuración local e inténtalo de nuevo.',
    errorGeneric: 'Garmin Personal API no puede verificar la clave en este momento. Inténtalo de nuevo en unos instantes.',
    errorInProgress: 'La clave ya se está verificando. Espera un momento.',
    errorInvalidForm: 'Este formulario de autorización no es válido o ha caducado.',
    errorInvalidInput: 'El valor enviado no es válido. Revísalo e inténtalo de nuevo.',
    errorInvalidLink: 'Este enlace de autorización no es válido o ha caducado.',
    errorNetwork: 'No se pudo conectar con Garmin Personal API. Revisa tu conexión a Internet e inténtalo de nuevo.',
    errorRateLimited: 'Garmin está limitando temporalmente las solicitudes. Inténtalo más tarde.',
    errorRateLimitedAfter: 'Garmin está limitando temporalmente las solicitudes. Inténtalo de nuevo en {seconds} segundos.',
    errorRequired: 'Pega tu clave de Garmin Personal API para continuar.',
    errorTitle: 'No se pudo verificar la clave',
    errorUnauthorized: 'Garmin no aceptó esta clave de Personal API. Puede que no sea válida, haya caducado o se haya eliminado. Crea una clave actual e inténtalo de nuevo.',
    errorUnsupportedForm: 'Este envío de formulario no es compatible.',
    eyebrow: 'Configuración local y privada',
    finePrint: 'Esta página local envía la clave directamente a Garmin por HTTPS para verificarla y después la guarda en la configuración privada de tu usuario en este ordenador.',
    formDescription: 'Comprobaremos la clave directamente con Garmin. Si es válida, la configuración terminará automáticamente en este ordenador.',
    formEyebrow: 'Paso 2 · en este ordenador',
    formTitle: 'Pega y verifica tu clave',
    heading: 'Conecta Garmin Personal API',
    inputHint: 'Usa la clave de la página Personal API Token de Garmin Connect.',
    inputLabel: 'Clave de Personal API',
    inputPlaceholder: 'Pega la clave aquí',
    languageLabel: 'Elegir idioma de autorización',
    notFound: 'Página no encontrada',
    privacyItems: ['Introduce la clave solo en esta página local', 'Tu ordenador la verifica directamente con Garmin', 'Nunca se añade a tu conversación con la IA'],
    privacyTitle: 'Cómo se utiliza tu clave',
    retryButton: 'Verificar otra clave',
    sourceDescription: 'Garmin solo muestra una clave nueva una vez. Cópiala antes de salir de la página.',
    sourceEyebrow: 'Paso 1 · en Garmin Connect',
    sourceLink: 'Abrir la configuración de Personal API Token',
    sourceTitle: 'Crea o copia tu clave',
    successDescription: 'Garmin aceptó la clave. Ya está guardada en la configuración local de este usuario en este ordenador.',
    successBrowserTitle: 'Garmin Personal API conectada',
    successEyebrow: 'Conexión completada',
    successHeading: 'Garmin Personal API está conectada.',
    successItems: ['Verificada directamente con Garmin', 'Guardada solo para este usuario', 'Lista para consultas de solo lectura'],
    successNext: 'Vuelve al cliente de IA que abrió esta página. Si aún no aparecen las herramientas, recarga o reinicia el cliente.',
    successTitle: 'Continúa en tu cliente de IA',
    successWebsite: 'Visitar el sitio del proyecto',
  },
  de: {
    browserTitle: 'Garmin Personal API verbinden',
    button: 'Prüfen und Einrichtung abschließen',
    description: 'Diese Seite verbindet die Garmin Personal API mit dem gerade verwendeten KI-Client. Der Schlüssel wird auf diesem Computer verarbeitet, nicht im Chat.',
    errorCredentials: 'Der Schlüssel konnte auf diesem Computer nicht gespeichert werden. Prüfe die Berechtigungen des lokalen Konfigurationsordners und versuche es erneut.',
    errorGeneric: 'Die Garmin Personal API kann den Schlüssel gerade nicht prüfen. Versuche es gleich noch einmal.',
    errorInProgress: 'Der Schlüssel wird bereits geprüft. Bitte warte einen Moment.',
    errorInvalidForm: 'Dieses Autorisierungsformular ist ungültig oder abgelaufen.',
    errorInvalidInput: 'Der übermittelte Wert ist ungültig. Prüfe ihn und versuche es erneut.',
    errorInvalidLink: 'Dieser Autorisierungslink ist ungültig oder abgelaufen.',
    errorNetwork: 'Die Garmin Personal API ist nicht erreichbar. Prüfe deine Internetverbindung und versuche es erneut.',
    errorRateLimited: 'Garmin begrenzt Anfragen vorübergehend. Versuche es später erneut.',
    errorRateLimitedAfter: 'Garmin begrenzt Anfragen vorübergehend. Versuche es in {seconds} Sekunden erneut.',
    errorRequired: 'Füge deinen Garmin Personal API-Schlüssel ein, um fortzufahren.',
    errorTitle: 'Schlüssel nicht bestätigt',
    errorUnauthorized: 'Garmin hat diesen Personal API-Schlüssel nicht akzeptiert. Er ist möglicherweise ungültig, abgelaufen oder gelöscht. Erstelle einen aktuellen Schlüssel und versuche es erneut.',
    errorUnsupportedForm: 'Diese Formularübermittlung wird nicht unterstützt.',
    eyebrow: 'Private lokale Einrichtung',
    finePrint: 'Diese lokale Seite sendet den Schlüssel zur Prüfung direkt per HTTPS an Garmin und speichert ihn anschließend in deiner benutzereigenen Konfiguration auf diesem Computer.',
    formDescription: 'Wir prüfen den Schlüssel direkt bei Garmin. Ist er gültig, wird die Einrichtung auf diesem Computer automatisch abgeschlossen.',
    formEyebrow: 'Schritt 2 · auf diesem Computer',
    formTitle: 'Schlüssel einfügen und prüfen',
    heading: 'Garmin Personal API verbinden',
    inputHint: 'Verwende den Schlüssel von der Personal API Token-Seite in Garmin Connect.',
    inputLabel: 'Personal API-Schlüssel',
    inputPlaceholder: 'Schlüssel hier einfügen',
    languageLabel: 'Sprache der Autorisierung wählen',
    notFound: 'Seite nicht gefunden',
    privacyItems: ['Schlüssel nur auf dieser lokalen Seite eingeben', 'Direkte Prüfung zwischen deinem Computer und Garmin', 'Wird nie zu deinem KI-Chat hinzugefügt'],
    privacyTitle: 'So wird dein Schlüssel verwendet',
    retryButton: 'Anderen Schlüssel prüfen',
    sourceDescription: 'Garmin zeigt einen neu erstellten Schlüssel nur einmal an. Kopiere ihn, bevor du die Seite verlässt.',
    sourceEyebrow: 'Schritt 1 · in Garmin Connect',
    sourceLink: 'Personal API Token-Einstellungen öffnen',
    sourceTitle: 'Schlüssel erstellen oder kopieren',
    successDescription: 'Garmin hat den Schlüssel akzeptiert. Er ist jetzt in der lokalen Konfiguration dieses Benutzers auf diesem Computer gespeichert.',
    successBrowserTitle: 'Garmin Personal API verbunden',
    successEyebrow: 'Verbindung abgeschlossen',
    successHeading: 'Garmin Personal API ist verbunden.',
    successItems: ['Direkt von Garmin bestätigt', 'Nur für diesen Computerbenutzer gespeichert', 'Bereit für schreibgeschützte Abfragen'],
    successNext: 'Kehre zu dem KI-Client zurück, der diese Seite geöffnet hat. Falls die Tools noch nicht sichtbar sind, lade oder starte den Client neu.',
    successTitle: 'Im KI-Client fortfahren',
    successWebsite: 'Projektwebsite besuchen',
  },
  fr: {
    browserTitle: 'Connecter Garmin Personal API',
    button: 'Vérifier et terminer la configuration',
    description: 'Cette page connecte Garmin Personal API au client d’IA que vous venez d’utiliser. La clé est traitée sur cet ordinateur, pas dans la conversation.',
    errorCredentials: 'Impossible d’enregistrer la clé sur cet ordinateur. Vérifiez les autorisations du dossier de configuration local, puis réessayez.',
    errorGeneric: 'Garmin Personal API ne peut pas vérifier la clé pour le moment. Réessayez dans quelques instants.',
    errorInProgress: 'La vérification de la clé est déjà en cours. Patientez un instant.',
    errorInvalidForm: 'Ce formulaire d’autorisation est incorrect ou a expiré.',
    errorInvalidInput: 'La valeur envoyée est incorrecte. Vérifiez-la, puis réessayez.',
    errorInvalidLink: 'Ce lien d’autorisation est incorrect ou a expiré.',
    errorNetwork: 'Impossible de joindre Garmin Personal API. Vérifiez votre connexion Internet, puis réessayez.',
    errorRateLimited: 'Garmin limite temporairement les requêtes. Réessayez plus tard.',
    errorRateLimitedAfter: 'Garmin limite temporairement les requêtes. Réessayez dans {seconds} secondes.',
    errorRequired: 'Collez votre clé Garmin Personal API pour continuer.',
    errorTitle: 'Clé non vérifiée',
    errorUnauthorized: 'Garmin n’a pas accepté cette clé Personal API. Elle est peut-être incorrecte, expirée ou supprimée. Créez une clé valide, puis réessayez.',
    errorUnsupportedForm: 'Cet envoi de formulaire n’est pas pris en charge.',
    eyebrow: 'Configuration locale et privée',
    finePrint: 'Cette page locale envoie directement la clé à Garmin via HTTPS pour la vérifier, puis l’enregistre dans la configuration privée de votre compte utilisateur sur cet ordinateur.',
    formDescription: 'Nous vérifions directement la clé auprès de Garmin. Si elle est valide, la configuration se termine automatiquement sur cet ordinateur.',
    formEyebrow: 'Étape 2 · sur cet ordinateur',
    formTitle: 'Collez et vérifiez votre clé',
    heading: 'Connectez Garmin Personal API',
    inputHint: 'Utilisez la clé fournie sur la page Personal API Token de Garmin Connect.',
    inputLabel: 'Clé Personal API',
    inputPlaceholder: 'Collez la clé ici',
    languageLabel: 'Choisir la langue de l’autorisation',
    notFound: 'Page introuvable',
    privacyItems: ['Saisissez la clé uniquement sur cette page locale', 'Votre ordinateur la vérifie directement auprès de Garmin', 'Elle n’est jamais ajoutée à votre conversation avec l’IA'],
    privacyTitle: 'Utilisation de votre clé',
    retryButton: 'Vérifier une autre clé',
    sourceDescription: 'Garmin n’affiche une nouvelle clé qu’une seule fois. Copiez-la avant de quitter la page.',
    sourceEyebrow: 'Étape 1 · dans Garmin Connect',
    sourceLink: 'Ouvrir les paramètres Personal API Token',
    sourceTitle: 'Créez ou copiez votre clé',
    successDescription: 'Garmin a accepté la clé. Elle est maintenant enregistrée dans la configuration locale de cet utilisateur sur cet ordinateur.',
    successBrowserTitle: 'Garmin Personal API connectée',
    successEyebrow: 'Connexion terminée',
    successHeading: 'Garmin Personal API est connectée.',
    successItems: ['Vérifiée directement auprès de Garmin', 'Enregistrée uniquement pour cet utilisateur', 'Prête pour les requêtes en lecture seule'],
    successNext: 'Revenez au client d’IA qui a ouvert cette page. Si les outils ne sont pas encore visibles, rechargez ou redémarrez le client.',
    successTitle: 'Continuez dans votre client d’IA',
    successWebsite: 'Visiter le site du projet',
  },
  pt: {
    browserTitle: 'Conectar a Garmin Personal API',
    button: 'Verificar e concluir a configuração',
    description: 'Esta página conecta a Garmin Personal API ao cliente de IA que você acabou de usar. A chave é processada neste computador, não na conversa.',
    errorCredentials: 'Não foi possível salvar a chave neste computador. Verifique as permissões da pasta de configuração local e tente novamente.',
    errorGeneric: 'A Garmin Personal API não conseguiu verificar a chave agora. Tente novamente em instantes.',
    errorInProgress: 'A chave já está sendo verificada. Aguarde um momento.',
    errorInvalidForm: 'Este formulário de autorização é inválido ou expirou.',
    errorInvalidInput: 'O valor enviado é inválido. Verifique e tente novamente.',
    errorInvalidLink: 'Este link de autorização é inválido ou expirou.',
    errorNetwork: 'Não foi possível acessar a Garmin Personal API. Verifique sua conexão com a internet e tente novamente.',
    errorRateLimited: 'A Garmin está limitando temporariamente as solicitações. Tente novamente mais tarde.',
    errorRateLimitedAfter: 'A Garmin está limitando temporariamente as solicitações. Tente novamente em {seconds} segundos.',
    errorRequired: 'Cole sua chave da Garmin Personal API para continuar.',
    errorTitle: 'Não foi possível verificar a chave',
    errorUnauthorized: 'A Garmin não aceitou esta chave da Personal API. Ela pode ser inválida, ter expirado ou ter sido excluída. Crie uma chave atual e tente novamente.',
    errorUnsupportedForm: 'Este envio de formulário não é compatível.',
    eyebrow: 'Configuração local e privada',
    finePrint: 'Esta página local envia a chave diretamente à Garmin por HTTPS para verificação e depois a salva na configuração exclusiva do seu usuário neste computador.',
    formDescription: 'Verificaremos a chave diretamente com a Garmin. Se ela for válida, a configuração será concluída automaticamente neste computador.',
    formEyebrow: 'Etapa 2 · neste computador',
    formTitle: 'Cole e verifique sua chave',
    heading: 'Conecte a Garmin Personal API',
    inputHint: 'Use a chave da página Personal API Token no Garmin Connect.',
    inputLabel: 'Chave da Personal API',
    inputPlaceholder: 'Cole a chave aqui',
    languageLabel: 'Escolher idioma da autorização',
    notFound: 'Página não encontrada',
    privacyItems: ['Digite a chave somente nesta página local', 'Seu computador faz a verificação diretamente com a Garmin', 'Ela nunca é adicionada à conversa com a IA'],
    privacyTitle: 'Como sua chave é usada',
    retryButton: 'Verificar outra chave',
    sourceDescription: 'A Garmin exibe uma chave recém-criada apenas uma vez. Copie-a antes de sair da página.',
    sourceEyebrow: 'Etapa 1 · no Garmin Connect',
    sourceLink: 'Abrir configurações de Personal API Token',
    sourceTitle: 'Crie ou copie sua chave',
    successDescription: 'A Garmin aceitou a chave. Ela foi salva na configuração local deste usuário neste computador.',
    successBrowserTitle: 'Garmin Personal API conectada',
    successEyebrow: 'Conexão concluída',
    successHeading: 'A Garmin Personal API está conectada.',
    successItems: ['Verificada diretamente com a Garmin', 'Salva apenas para este usuário', 'Pronta para consultas somente leitura'],
    successNext: 'Volte ao cliente de IA que abriu esta página. Se as ferramentas ainda não aparecerem, recarregue ou reinicie o cliente.',
    successTitle: 'Continue no seu cliente de IA',
    successWebsite: 'Visitar o site do projeto',
  },
  ko: {
    browserTitle: 'Garmin Personal API 연결',
    button: '확인하고 설정 완료',
    description: '이 페이지는 Garmin Personal API를 방금 사용한 AI 클라이언트에 연결합니다. 키는 채팅이 아닌 이 컴퓨터에서 처리됩니다.',
    errorCredentials: '이 컴퓨터에 키를 저장할 수 없습니다. 로컬 설정 폴더의 권한을 확인한 후 다시 시도하세요.',
    errorGeneric: '현재 Garmin Personal API에서 키를 확인할 수 없습니다. 잠시 후 다시 시도하세요.',
    errorInProgress: '키를 확인하고 있습니다. 잠시 기다려 주세요.',
    errorInvalidForm: '이 인증 양식이 유효하지 않거나 만료되었습니다.',
    errorInvalidInput: '제출한 값이 유효하지 않습니다. 확인한 후 다시 시도하세요.',
    errorInvalidLink: '이 인증 링크가 유효하지 않거나 만료되었습니다.',
    errorNetwork: 'Garmin Personal API에 연결할 수 없습니다. 인터넷 연결을 확인한 후 다시 시도하세요.',
    errorRateLimited: 'Garmin이 일시적으로 요청을 제한하고 있습니다. 나중에 다시 시도하세요.',
    errorRateLimitedAfter: 'Garmin이 일시적으로 요청을 제한하고 있습니다. {seconds}초 후 다시 시도하세요.',
    errorRequired: '계속하려면 Garmin Personal API 키를 붙여 넣으세요.',
    errorTitle: '키를 확인하지 못했습니다',
    errorUnauthorized: 'Garmin이 이 Personal API 키를 승인하지 않았습니다. 키가 유효하지 않거나 만료 또는 삭제되었을 수 있습니다. 새 키를 만든 후 다시 시도하세요.',
    errorUnsupportedForm: '지원되지 않는 양식 제출입니다.',
    eyebrow: '이 컴퓨터에서만 설정',
    finePrint: '이 로컬 페이지는 HTTPS를 통해 Garmin에 직접 키를 보내 확인한 다음, 이 컴퓨터의 사용자 전용 설정에 저장합니다.',
    formDescription: 'Garmin에서 키를 직접 확인합니다. 유효한 키라면 이 컴퓨터의 설정이 자동으로 완료됩니다.',
    formEyebrow: '2단계 · 이 컴퓨터에서',
    formTitle: '키 붙여 넣고 확인',
    heading: 'Garmin Personal API 연결',
    inputHint: 'Garmin Connect의 Personal API Token 페이지에서 받은 키를 사용하세요.',
    inputLabel: 'Personal API 키',
    inputPlaceholder: '여기에 키 붙여 넣기',
    languageLabel: '인증 페이지 언어 선택',
    notFound: '페이지를 찾을 수 없습니다',
    privacyItems: ['이 로컬 페이지에만 키 입력', '이 컴퓨터에서 Garmin으로 직접 확인', 'AI 대화에는 추가되지 않음'],
    privacyTitle: '키 처리 방식',
    retryButton: '다른 키 확인',
    sourceDescription: '새로 만든 키는 한 번만 표시됩니다. 페이지를 떠나기 전에 복사하세요.',
    sourceEyebrow: '1단계 · Garmin Connect에서',
    sourceLink: 'Personal API Token 설정 열기',
    sourceTitle: '키 만들기 또는 복사',
    successDescription: 'Garmin이 키를 승인했습니다. 이 컴퓨터의 현재 사용자 로컬 설정에 저장되었습니다.',
    successBrowserTitle: 'Garmin Personal API 연결 완료',
    successEyebrow: '연결 완료',
    successHeading: 'Garmin Personal API가 연결되었습니다.',
    successItems: ['Garmin에서 직접 확인됨', '이 컴퓨터 사용자에게만 저장됨', '읽기 전용 요청 준비 완료'],
    successNext: '이 페이지를 연 AI 클라이언트로 돌아가세요. 도구가 아직 보이지 않으면 클라이언트를 새로 고치거나 다시 시작하세요.',
    successTitle: 'AI 클라이언트에서 계속',
    successWebsite: '프로젝트 웹사이트 방문',
  },
};

export function resolveLocalAuthLocale(value: string | null | undefined): LocalAuthLocale {
  const language = normalizeLocale(value)?.split('-')[0];
  return LOCAL_AUTH_LOCALES.includes(language as LocalAuthLocale)
    ? language as LocalAuthLocale
    : 'en';
}

export function isSupportedLocalAuthLocale(value: string | null | undefined): boolean {
  const language = normalizeLocale(value)?.split('-')[0];
  return LOCAL_AUTH_LOCALES.includes(language as LocalAuthLocale);
}

export function detectLocalAuthLocale(
  environment: NodeJS.ProcessEnv = process.env,
): LocalAuthLocale {
  const candidate = environment.GARMIN_PERSONAL_API_LOCALE
    ?? environment.LC_ALL
    ?? environment.LC_MESSAGES
    ?? environment.LANGUAGE?.split(':')[0]
    ?? environment.LANG;
  return resolveLocalAuthLocale(candidate);
}

export function localizedAuthError(locale: LocalAuthLocale, error: GarminMcpError): string {
  const copy = AUTH_COPY[locale];
  switch (error.code) {
    case 'credentials_missing':
      return copy.errorCredentials;
    case 'credentials_invalid_or_expired':
    case 'garmin_unauthorized':
      return copy.errorUnauthorized;
    case 'garmin_rate_limited':
      return error.retryAfterSeconds === undefined
        ? copy.errorRateLimited
        : copy.errorRateLimitedAfter.replace('{seconds}', String(error.retryAfterSeconds));
    case 'network_error':
      return copy.errorNetwork;
    case 'invalid_input':
      return copy.errorInvalidInput;
    default:
      return copy.errorGeneric;
  }
}

function normalizeLocale(value: string | null | undefined): string | undefined {
  return value?.trim().toLowerCase().replaceAll('_', '-').split('.')[0]?.split('@')[0];
}
