import { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaSyncAlt, FaEnvelope, FaPhone } from "react-icons/fa";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("يرجى إدخال البريد الإلكتروني");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  }

  return (
    <div className="fp-page" dir="rtl">
      {/* ───── الهيدر ───── */}
      <header className="fp-header">
        <div className="fp-header-inner">
          <Link to="/home" className="fp-logo">
            <img src="/logo.png" alt="بيتي Bayti" className="fp-logo-img" />
          </Link>

          <nav className="fp-nav">
            <Link to="/home">الرئيسية</Link>
            <a href="#">كيف يعمل بيتي؟</a>
            <a href="#">عن نحن</a>
            <a href="#">الدعم الفني</a>
          </nav>

          <div className="fp-header-actions">
            <Link to="/login" className="fp-btn-login">
              تسجيل الدخول
            </Link>
            <Link to="/register" className="fp-btn-register">
              إنشاء حساب
              <FaArrowLeft />
            </Link>
          </div>
        </div>
      </header>

      {/* ───── المحتوى الرئيسي ───── */}
      <main className="fp-main">
        <div className="fp-card">
          <div className="fp-card-icon">
            <FaSyncAlt />
          </div>

          <h1>نسيت كلمة المرور؟</h1>
          <p className="fp-card-desc">
            أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور وسنقوم بإرسال رابط خاص بك
          </p>

          {sent ? (
            <div className="fp-success-msg">
              <FaEnvelope className="fp-success-icon" />
              <p>تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني</p>
              <Link to="/login" className="fp-back-link">
                <FaArrowLeft /> العودة لتسجيل الدخول
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && <div className="fp-error">{error}</div>}

              <div className="fp-field">
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                />
              </div>

              <button type="submit" className="fp-submit" disabled={loading}>
                {loading ? "جارٍ الإرسال..." : "إرسال الرابط"}
                {!loading && <FaArrowLeft />}
              </button>
            </form>
          )}

          {!sent && (
            <Link to="/login" className="fp-back-link">
              <FaArrowLeft /> العودة لتسجيل الدخول
            </Link>
          )}
        </div>
      </main>

      {/* ───── الفوتر ───── */}
      <footer className="fp-footer">
        <div className="fp-footer-divider" />

        <div className="fp-footer-inner">

          {/*SECTION 4 — القسم التعريفي */}
          <div className="fp-footer-col fp-footer-brand">
            <div className="fp-footer-logo">
              <img src="/footer.png" alt="بيتي Bayti" className="fp-footer-logo-img" />
            </div>
            <p>
              بيتي هي وجهتك الموثوقة لكل ما يتعلق بالعقارات في قطاع غزة.
              الجودة والسرعة والأمان شعارنا.
            </p>
          </div>


          {/*SECTION 2 — روابط سريعة */}
          <div className="fp-footer-col">
            <h4>روابط سريعة</h4>
            <ul>
              <li><Link to="/home">الرئيسية</Link></li>
              <li><a href="#">من نحن</a></li>
              <li><a href="#">كيف تعمل المنصة</a></li>
              <li><a href="#">الدعم الفني</a></li>
            </ul>
          </div>

          {/*SECTION 3 — أنواع العقارات */}
          <div className="fp-footer-col">
            <h4>أنواع العقارات</h4>
            <ul>
              <li><a href="#">شقق</a></li>
              <li><a href="#">فلل</a></li>
              <li><a href="#">أراضي</a></li>
              <li><a href="#">مكاتب</a></li>
              <li><a href="#">محلات</a></li>
              <li><a href="#">مخازن</a></li>
            </ul>
          </div>

          {/*SECTION 1 — التواصل */}
          <div className="fp-footer-col">
            <h4>تواصل معنا</h4>
            <ul className="fp-contact-list">
              <li>
                <span className="fp-contact-icon"><FaEnvelope /></span>
                info@bayti.ps
              </li>
              <li>
                <span className="fp-contact-icon"><FaPhone /></span>
                0598 123 456
              </li>
              <li>
                <span className="fp-contact-icon"><FaPhone /></span>
                0598 123 456
              </li>
            </ul>
            <div className="fp-social-row">
              <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
            </div>
          </div>
        </div>

        <div className="fp-footer-bottom">
          © 2024 Bayti - جميع الحقوق محفوظة لقطاع غزة
        </div>
      </footer>
    </div>
  );
}
