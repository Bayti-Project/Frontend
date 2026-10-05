/* --------------------------------------------------------------------------
    Google Identity Services (GIS)

    بنجيب الـid_token من Google بـ"زرار Google الرسمي" — بدون ما نضيف أي
    مكتبة جديدة للمشروع، وبنحمّل سكربت Google عند أول استخدام.

    يحتاج Client ID من Google Cloud Console → مشروعك →Credentials →
    OAuth 2.0 Client ID (Web application)، وبتحطه في المتغير:
      VITE_GOOGLE_CLIENT_ID
    (ملف .env محلياً + Environment Variables على Vercel)
   -------------------------------------------------------------------------- */

const GIS_SRC = "https://accounts.google.com/gsi/client";
const SCRIPT_ATTR = "data-gsi-bayti";

export const GOOGLE_CLIENT_ID = import.meta.env?.VITE_GOOGLE_CLIENT_ID || "";

export const isGoogleLoginConfigured = () => Boolean(GOOGLE_CLIENT_ID);

/* المتغير بيتقفل بعد دقيقة: لو المستخدم سكر نافذة Google بدون ما يختار
   حساب، ما نخلي الـPromise معلّق للأبد (Google ما بيبعت أي حدث بهالحالة) */
const RESOLVER_TTL = 60_000;

let scriptPromise = null;
let initialized = false;
/* طابور بانتظار الـcredential — StrictMode بيرسم الزرار مرتين، وكل نداء
   بينتظر أول ما يجي الرد. أي واحد منهم ما عاد يقدر يستقبل الرد (المكوّن
   انفك) بيتجاهله لحاله. */
let waitingResolvers = [];
let pendingTimer = null;

function loadGisScript() {
    if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
    if (scriptPromise) return scriptPromise;

    scriptPromise = new Promise((resolve, reject) => {
        const finish = () => {
            const accountsId = window.google?.accounts?.id;
            if (accountsId) resolve(accountsId);
            else reject(new Error("gsi-unavailable"));
        };

        const existing = document.querySelector(`script[${SCRIPT_ATTR}]`);
        if (existing) {
            existing.addEventListener("load", finish, { once: true });
            existing.addEventListener(
                "error",
                () => reject(new Error("gsi-load-failed")),
                { once: true }
            );
            return;
        }

        const script = document.createElement("script");
        script.src = GIS_SRC;
        script.async = true;
        script.defer = true;
        script.setAttribute(SCRIPT_ATTR, "true");
        script.addEventListener("load", finish, { once: true });
        script.addEventListener(
            "error",
            () => reject(new Error("gsi-load-failed")),
            { once: true }
        );
        document.head.appendChild(script);
    });

    /* لو فشل التحميل، خلّينا نجرب مرة ثانية بالمحاولة الجاية */
    scriptPromise = scriptPromise.catch((err) => {
        scriptPromise = null;
        throw err;
    });

    return scriptPromise;
}

function ensureInitialized(accountsId) {
    if (initialized) return;
    accountsId.initialize({
        client_id: GOOGLE_CLIENT_ID,
        /* بنسلّم الـJWT للمستخدم، وهو اللي رح يتحقق منه الـbackend */
        callback: (response) => {
            const idToken = response?.credential || "";
            const resolvers = waitingResolvers;
            waitingResolvers = [];
            clearTimeout(pendingTimer);
            pendingTimer = null;
            resolvers.forEach((resolver) => {
                if (idToken) resolver.resolve(idToken);
                else resolver.reject(new Error("gsi-no-credential"));
            });
        },
    });
    initialized = true;
}

/**
 * بيرسم زرار Google الرسمي داخل العنصر المُمرّر، وبيحله بالـid_token أول
 * ما المستخدم يختار حسابه. Google بيلغي البوب-أب بنفسه.
 */
export function requestGoogleIdToken(container) {
    if (!isGoogleLoginConfigured()) {
        return Promise.reject(new Error("missing-client-id"));
    }

    return loadGisScript().then(
        (accountsId) =>
            new Promise((resolve, reject) => {
                clearTimeout(pendingTimer);
                pendingTimer = setTimeout(() => {
                    waitingResolvers = [];
                    pendingTimer = null;
                    reject(new Error("gsi-timeout"));
                }, RESOLVER_TTL);

                waitingResolvers.push({ resolve, reject });

                ensureInitialized(accountsId);
                /* StrictMode بينادي هالت effect مرتين، وrenderButton بيضيف
                   iframe جديد كل مرة — بدون التنضيف بيركد أكثر من زرار
                   جوّه flex بيتقص بـoverflow: hidden */
                container.innerHTML = "";
                const width = Math.max(200, Math.min(container.clientWidth || 320, 400));
                accountsId.renderButton(container, {
                    theme: "outline",
                    size: "large",
                    shape: "rectangular",
                    text: "continue_with",
                    width,
                    /* الواجهة بالعربي */
                    locale: "ar",
                });
            })
    );
}

/* إزالة الزرار لما الصفحة تفك — Google بيرسم iframe جواه */
export function clearGoogleButton(container) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
    waitingResolvers = [];
    if (container) container.innerHTML = "";
}