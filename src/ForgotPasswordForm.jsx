import React, { useState } from "react";
import "./style.css";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValidEmail) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
    }, 900);
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h1>نسيت كلمة المرور؟</h1>
      <p className="subtitle">
        أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
      </p>

      <div className="field">
        <label htmlFor="email">البريد الإلكتروني</label>
        <div className="input-wrap">
          <input
            id="email"
            type="email"
            placeholder="example@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <button type="submit" className="submit-btn" disabled={!isValidEmail || submitting}>
        {sent ? "تم إرسال الرابط ✓" : submitting ? "جارٍ الإرسال..." : "إرسال رابط إعادة التعيين"}
      </button>

      <a href="#" className="back-link">
        العودة لتسجيل الدخول →
      </a>
    </form>
  );
}
