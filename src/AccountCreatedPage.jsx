import React, { useState, useEffect, useRef } from "react";
import "./AccountCreatedPage.css";
import baytiLogoGaza from "./assets/created/bayti-logo-gaza.png";

/* ---------- أيقونات ---------- */
function MailIcon() {
  return (
    <svg viewBox="0 0 28 22" width="28" height="22" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="25" height="19" rx="3.5" stroke="currentColor" strokeWidth="2.2" />
      <path d="M3 5.5 14 13l11-7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// صفحة "تم إنشاء حسابك بنجاح" — حسب الفيجما.
// الـ CSS الخاص بها في AccountCreatedPage.css فقط.
export default function AccountCreatedPage({ onBackToLogin, onResend }) {
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function handleResend() {
    if (status !== "idle") return;
    setStatus("sending");
    timers.current.push(
      setTimeout(() => {
        setStatus("sent");
        onResend?.();
        timers.current.push(setTimeout(() => setStatus("idle"), 2500));
      }, 900)
    );
  }

  const resendLabel =
    status === "sending" ? "جارٍ الإرسال..." : status === "sent" ? "تم إرسال الرابط ✓" : "اعادة ارسال الرابط";

  return (
    <main className="ac-page">
      <header className="ac-header">
        <img className="ac-logo" src={baytiLogoGaza} alt="بيتي - عقار غزة" />
      </header>

      <section className="ac-card">
        <div className="ac-icon">
          <span className="ac-icon-circle">
            <MailIcon />
          </span>
          <span className="ac-icon-badge">
            <CheckIcon />
          </span>
        </div>

        <h1 className="ac-title">تم إنشاء حسابك بنجاح</h1>
        <p className="ac-subtitle">تم إرسال رابط التفعيل إلى بريدك الإلكتروني، يرجى الضغط عليه لتفعيل حسابك.</p>

        <div className="ac-actions">
          <button type="button" className="ac-btn ac-btn-outline" onClick={onBackToLogin}>
            العودة لتسجيل الدخول
          </button>
          <button
            type="button"
            className="ac-btn ac-btn-primary"
            onClick={handleResend}
            disabled={status === "sending"}
          >
            {resendLabel}
          </button>
        </div>

        <p className="ac-note">
          <span className="ac-note-muted">لم تستلم البريد؟</span>
          <span>تحقق من مجلد الرسائل غير المرغوب فيها أو السبام</span>
        </p>
      </section>
    </main>
  );
}
