import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import heroImg from './hero.jpg';
import { API_HOST, mapApiError, normalizeUser, storeCredentials, resolveRole, apiFetch } from '../services/api.js';

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

/* الملف الشخصي أحياناً ما بيرجّع role — وقتها نستنتج الدور من endpoint
   عقارات المالك: لو ردّ 200 يعني الحساب مالك (حتى لو ما عنده عقارات)،
   وأي رد تاني (403/401/404) يعني مستأجر */
async function probeOwnerRole() {
    try {
        const res = await apiFetch('/api/properties/mine/');
        return res.ok ? 'owner' : 'tenant';
    } catch {
        return 'tenant';
    }
}

/* لازم الدور ينحدد بشكل مؤكد — وإلا "bayti_user" ما بينكتب
   والمستخدم بيطلع لصفحة الزائر بدل صفحته */
async function resolveLoggedInUser(email) {
    const profile = await fetchProfile();
    const role = resolveRole(profile?.role);

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

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
                        <button className="social-btn" type="button">
                            <FcGoogle size={18} /> Google
                        </button>

                        <button className="social-btn" type="button">
                            <FaApple size={18} /> Apple
                        </button>
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