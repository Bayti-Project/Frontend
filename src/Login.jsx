import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import heroImg from './assets/hero.jpg';
import { API_BASE, mapApiError, normalizeUser, storeCredentials } from './api.js';

function extractErrorMessage(data) {
    return mapApiError(data);
}

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(extractErrorMessage(data));
                setLoading(false);
                return;
            }

            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);

            storeCredentials(email, password);

            localStorage.setItem('bayti_user', JSON.stringify(normalizeUser(data.user)));

            navigate('/home');
        } catch {
            setError('تعذر الاتصال بالخادم، تأكد من تشغيل الخادم وحاول مرة أخرى.');
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
                    backgroundImage: `linear-gradient(180deg, rgba(14, 43, 69, 0.25) 0%, rgba(10, 25, 41, 0.65) 100%), url(${heroImg})`
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