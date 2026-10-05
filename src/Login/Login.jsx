import { useEffect, useRef, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import heroImg from './hero.jpg';
import { API_HOST, mapApiError, normalizeUser, storeCredentials, clearCredentials, resolveRole, apiFetch, googleLogin } from '../services/api.js';
import {
    requestGoogleIdToken,
    clearGoogleButton,
    isGoogleLoginConfigured,
} from '../services/googleAuth.js';

function extractErrorMessage(data) {
    return mapApiError(data);
}

async function fetchProfile() {
    try {
        const res = await apiFetch('/api/auth/profile/');
        if (!res.ok) return null;
        const data = await res.json().catch(() => null);
        const raw = data?.user || data;
        return raw && typeof raw === 'object' ? raw : null;
    } catch {
        return null;
    }
}

/* الملف الشخصي أحياناً ما بيرجّع role — وقتها بنأكد الدور بأصوات واضحة:
   إن الحساب مالك: أي endpoint مالك بيرجّع 200 = مالك مؤكد.
   ما بنرجّع 'tenant' من 403/404 أبداً — التخمين كان بيحوّل المالك
   لصفحة المستأجر وبيكتب 'مستأجر' في localStorage */
async function probeOwnerRole() {
    for (const path of ['/api/owner/interest-requests', '/api/properties/mine/']) {
        try {
            const res = await apiFetch(path);
            console.info(`[role] ${path} ->`, res.status);
            if (res.ok) return 'owner';
        } catch {
            /* تجاهل — بنجرب الـendpoint اللي بعده */
        }
    }
    return '';
}

/* لازم الدور ينحدد بشكل مؤكد — وإلا "bayti_user" ما بينكتب
   والمستخدم بيطلع لصفحة الزائر بدل صفحته */
async function resolveLoggedInUser(email) {
    const profile = await fetchProfile();
    const role =
        resolveRole(profile?.role) ||
        resolveRole(profile?.account_type) ||
        resolveRole(profile?.user_type);

    if (role) return { ...profile, role };

    const probed = await probeOwnerRole();
    return { ...(profile || {}), email: profile?.email || email, role: probed };
}

function homePathFor(role) {
    const resolved = resolveRole(role);
    if (resolved === 'tenant') return '/home-tenant';
    if (resolved === 'owner') return '/home-owner';
    return '/';
}

const GOOGLE_ERROR_AR = {
    'missing-client-id': 'تسجيل الدخول عبر Google غير مُفعّل حالياً.',
    'gsi-load-failed': 'تعذر تحميل خدمة Google، تأكد من الاتصال بالإنترنت وحاول مرة أخرى.',
    'gsi-unavailable': 'خدمة Google لم ترد، حاول مرة أخرى.',
    'gsi-timeout': 'انتهت المهلة — غالباً سكرت نافذة Google بدون ما تختار حساب. جرّب مرة ثانية.',
    'gsi-no-credential': 'ما وصلنا حساب Google. حاول مرة أخرى.',
};

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const googleSlotRef = useRef(null);
    const [googleConfigured] = useState(isGoogleLoginConfigured);

    const navigate = useNavigate();

    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // تم التعديل إلى API_HOST لضمان الاتصال المباشر بسيرفر Render
            const res = await fetch(`${API_HOST}/api/auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), password }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(extractErrorMessage(data) || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
                setLoading(false);
                return;
            }

            if (data.access) {
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
            }

            if (storeCredentials) {
                storeCredentials(email.trim(), password);
            }

            /* الـresponse ما بيحتوي user دائماً — بنجيب الدور من /api/auth/profile/
               وإذا ما رجّع، بنستنتجه من endpoint عقارات المالك */
            const roleFromLogin = data.user ? resolveRole(data.user.role) : '';
            const source = roleFromLogin ? data.user : await resolveLoggedInUser(email.trim());

            const loggedUser = normalizeUser(source);
            localStorage.setItem('bayti_user', JSON.stringify(loggedUser));

            const redirectTo = location.state?.redirectTo;
            if (redirectTo) {
                navigate(redirectTo, location.state?.property ? { state: { property: location.state.property } } : undefined);
                return;
            }

            navigate(homePathFor(loggedUser.role));
        } catch (err) {
            console.error('Login error:', err);
            setError('تعذر الاتصال بالخادم، تأكد من الاتصال بالإنترنت وحاول مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    /* Google: نحوّل الـid_token لـJWT ونسجّل الدخول بنفس منطق تسجيل الدخول بالبريد */
    const handleGoogleIdToken = async (idToken) => {
        setError('');
        setLoading(true);
        try {
            const result = await googleLogin(idToken);
            /* الأهم للتشخيص: result.status + result.data (بتنطبع بالكونسول من api.js) */
            console.log('[google] نتيجة الدخول:', result.status, result.data, result.message);
            /* 400 / 401 / 403 — ما في login، بس رسالة واضحة للمستخدم */
            if (result.state !== 'success') {
                setError(result.message);
                return;
            }

            const data = result.data;
            localStorage.setItem('access_token', data.access);
            if (data.refresh) localStorage.setItem('refresh_token', data.refresh);

            /* دخول بدون كلمة مرور: بنمسح أي بيانات اعتماد محفوظة من جلسة سابقة،
               وإلا تجديد التوكن التلقائي بيرجّعنا لنفس المستخدم */
            clearCredentials();

            /* لو الـbackend ما رجّع role، بنستنتجه من profile/عقارات المالك */
            const roleFromResponse = resolveRole(data.user?.role);
            const source = roleFromResponse
                ? data.user
                : await resolveLoggedInUser(data.user?.email || '');

            const loggedUser = normalizeUser(source);
            localStorage.setItem('bayti_user', JSON.stringify(loggedUser));

            const redirectTo = location.state?.redirectTo;
            if (redirectTo) {
                navigate(
                    redirectTo,
                    location.state?.property ? { state: { property: location.state.property } } : undefined
                );
                return;
            }

            navigate(homePathFor(loggedUser.role));
        } catch (err) {
            console.error('Google login error:', err);
            setError('تعذر الاتصال بالخادم، تأكد من الاتصال بالإنترنت وحاول مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    /* أحدث نسخة من الدالة بالـref، حتى يبقى الـeffect تحت غير dependent عليها */
    const handleGoogleRef = useRef(handleGoogleIdToken);
    useEffect(() => {
        handleGoogleRef.current = handleGoogleIdToken;
    });

    /* زرار Google الرسمي بيرسم نفسه داخل الحاوية — لازم نجيب السكربت أول مرة */
    useEffect(() => {
        const slot = googleSlotRef.current;
        if (!slot || !googleConfigured) return undefined;

        let cancelled = false;
        requestGoogleIdToken(slot)
            .then((idToken) => {
                if (!cancelled) handleGoogleRef.current(idToken);
            })
            .catch((err) => {
                if (cancelled) return;
                console.error('Google Sign-In error:', err);
                setError(GOOGLE_ERROR_AR[err?.message] || 'تعذر تفعيل تسجيل الدخول عبر Google.');
            });

        return () => {
            cancelled = true;
            clearGoogleButton(slot);
        };
    }, [googleConfigured]);

    return (
        <div className="login-container">
            {/* 1. قسم الصورة (يمين) */}
            <div
                className="login-image-section"
                style={{
                    backgroundImage: `url(${heroImg})`
                }}
            >
                <div className="brand-logo">Bayti</div>
                <div className="image-content">
                    <h1>اكتشف فرصةً عقارية استثنائية</h1>
                    <p>
                        نحن نصلك بأفضل الملاك والمستأجرين في المنطقة عبر منصة ذكية وآمنة.
                    </p>
                </div>
            </div>

            {/* 2. قسم النموذج (يسار) */}
            <div className="login-form-section">
                <div className="form-box">
                    <div className="form-header">
                        <h2>أهلاً بك في بيتي</h2>
                        <p>أدخل بياناتك لتسجيل الدخول إلى حسابك.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && <div className="form-error" role="alert">{error}</div>}

                        <div className="input-group">
                            <label>البريد الإلكتروني</label>
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    placeholder="أدخل البريد الإلكتروني"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>كلمة المرور</label>
                            <div className="input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <span
                                    className="password-toggle-icon"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                </span>
                            </div>
                        </div>

                        <div className="options-row">
                            <label className="remember-me">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                تذكرني
                            </label>

                            <Link to="/forgot-password" className="forgot-password">
                                هل نسيت كلمة السر؟
                            </Link>
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
                        </button>
                    </form>

                    <div className="divider">أو</div>

                    <div className="social-btns">
{googleConfigured ? (
                            <>
                                {/* عند تفعيل التكوين يظهر زر Google المخصص ويُفعّل One Tap من GIS */}
                                <div
                                    className={`social-btn social-btn--google${loading ? ' is-loading' : ''}`}
                                >
                                    <span className="social-btn--google__icon">
                                        <FcGoogle size={19} />
                                    </span>
                                    <span>{loading ? 'جاري تسجيل الدخول عبر Google...' : 'متابعة باستخدام Google'}</span>
                                    <div ref={googleSlotRef} className="google-slot" aria-hidden="true" />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* في حال عدم وجود VITE_GOOGLE_CLIENT_ID يظهر زر غير مفعل مع تلميح */}
                                <button
                                    className="social-btn"
                                    type="button"
                                    disabled
                                    title="مفتاح Google غير مهيأ"
                                >
                                    <FcGoogle size={18} /> Google
                                </button>

                            </>
                        )}
                    </div>

                    <p className="signup-text">
                        ليس لديك حساب بعد؟ <Link to="/register">أنشئ حساباً جديداً</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;