import React, { useState } from 'react';
import './Login.css'; // تأكدي أن اسم ملف الاستايل مطابق

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <div className="login-container" style={{ display: 'flex', minHeight: '100vh', direction: 'rtl', fontFamily: 'sans-serif' }}>
            {/* القسم الأيسر: الصورة والعبارة */}
            <div
                className="login-image-section"
                style={{
                    flex: 1,
                    position: 'relative',
                    backgroundImage: `url('/src/assets/hero.png')`, // أو مسار الصورة المعتمد عندك
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '40px',
                    color: '#fff'
                }}
            >
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Bayti</div>
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>
                        اكتشف فرصاً عقارية استثنائية
                    </h1>
                    <p style={{ fontSize: '14px', opacity: 0.9 }}>
                        نحن نصلك بأفضل الملاك والمستأجرين في المنطقة عبر منصة ذكية وآمنة.
                    </p>
                </div>
            </div>

            {/* القسم الأيمن: نموذج تسجيل الدخول */}
            <div
                className="login-form-section"
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px',
                    backgroundColor: '#ffffff'
                }}
            >
                <div style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#111' }}>
                        أهلاً بك في بيتي
                    </h2>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '30px' }}>
                        أدخل بياناتك لتسجيل الدخول إلى حسابك.
                    </p>

                    <form onSubmit={handleSubmit} style={{ textAlign: 'right' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', color: '#333', marginBottom: '6px' }}>
                                البريد الإلكتروني
                            </label>
                            <input
                                type="email"
                                placeholder="أدخل البريد الإلكتروني"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #e0e0e0',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', color: '#333', marginBottom: '6px' }}>
                                كلمة المرور
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #e0e0e0',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', fontSize: '12px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#555' }}>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                تذكرني
                            </label>
                            <a href="#forgot" style={{ color: '#0056b3', textDecoration: 'none' }}>
                                هل نسيت كلمة السر؟
                            </a>
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#0b1d3a',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                marginBottom: '20px'
                            }}
                        >
                            تسجيل الدخول
                        </button>
                    </form>

                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>أو</div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                        <button style={{ flex: 1, padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '13px' }}>
                            Apple 🍏
                        </button>
                        <button style={{ flex: 1, padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '13px' }}>
                            Google <span style={{ color: '#ea4335', fontWeight: 'bold' }}>G</span>
                        </button>
                    </div>

                    <p style={{ fontSize: '12px', color: '#666' }}>
                        ليس لديك حساب بعد؟ <a href="#signup" style={{ color: '#0056b3', textDecoration: 'none', fontWeight: 'bold' }}>أنشئ حساباً جديداً</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;