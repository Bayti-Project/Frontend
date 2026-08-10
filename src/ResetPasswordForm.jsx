import React, { useState } from "react";
import "./style.css"; // نفس ملف الـ CSS اللي عندك

export default function ResetPasswordForm() {
  // ---------- الحالة (State) ----------
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // ---------- الشروط ----------
  const rules = {
    length: { label: "8 أحرف على الأقل", test: (v) => v.length >= 8 },
    upper: { label: "حرف كبير واحد", test: (v) => /[A-Z]/.test(v) },
    lower: { label: "حرف صغير واحد", test: (v) => /[a-z]/.test(v) },
    number: { label: "رقم واحد", test: (v) => /[0-9]/.test(v) },
  };

  // كام شرط اتحقق (بدل passedCount بنحسبها كل مرة بشكل مباشر)
  const passedCount = Object.values(rules).filter((r) => r.test(password)).length;
  const allRulesPassed = passedCount === Object.keys(rules).length;

  // حالة التطابق
  const matches = confirmPassword.length > 0 && confirmPassword === password;
  const showMatchMsg = confirmPassword.length > 0;

  // الزر يتفعل بس لو كل الشروط اتحققت والتأكيد متطابق
  const canSubmit = allRulesPassed && matches;

  // لون شريط القوة حسب عدد الشروط المتحققة
  function strengthClass(index) {
    if (index >= passedCount) return "";
    if (passedCount <= 1) return "filled-weak";
    if (passedCount <= 3) return "filled-mid";
    return "filled-strong";
  }

  // ---------- إرسال الفورم ----------
  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 900);
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h1>إعادة تعيين كلمة المرور</h1>
      <p className="subtitle">أدخل كلمة المرور الجديدة الخاصة بك.</p>

      {/* حقل كلمة المرور */}
      <div className="field">
        <label htmlFor="password">كلمة المرور</label>
        <div className="input-wrap">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="أدخل كلمة المرور"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="toggle-eye"
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            👁
          </button>
        </div>

        {/* شريط القوة */}
        <div className="strength">
          <div className="strength-bar">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={strengthClass(i)} />
            ))}
          </div>

          {/* قائمة الشروط */}
          <ul className="rules">
            {Object.entries(rules).map(([key, rule]) => (
              <li key={key} className={rule.test(password) ? "ok" : ""}>
                <span className="dot">✓</span>
                {rule.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* حقل تأكيد كلمة المرور */}
      <div className="field">
        <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>
        <div className="input-wrap">
          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="أدخل كلمة المرور"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={showMatchMsg && !matches ? "invalid" : ""}
          />
          <button
            type="button"
            className="toggle-eye"
            aria-label={showConfirm ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            onClick={() => setShowConfirm((prev) => !prev)}
          >
            👁
          </button>
        </div>

        {showMatchMsg && (
          <div className={`match-msg show ${matches ? "ok" : "err"}`}>
            {matches ? "كلمتا المرور متطابقتان" : "كلمتا المرور غير متطابقتين"}
          </div>
        )}
      </div>

      <button type="submit" className="submit-btn" disabled={!canSubmit || submitting}>
        {success
          ? "تم تعيين كلمة المرور بنجاح ✓"
          : submitting
            ? "جارٍ الحفظ..."
            : "اعادة تعيين كلمة السر"}
      </button>

      <a href="#" className="back-link">
        العودة لتسجيل الدخول →
      </a>
    </form>
  );
}
