import React, { useState } from "react";
import "./style.css";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const rules = {
    length: { label: "8 أحرف على الأقل", test: (v) => v.length >= 8 },
    upper: { label: "حرف كبير واحد", test: (v) => /[A-Z]/.test(v) },
    lower: { label: "حرف صغير واحد", test: (v) => /[a-z]/.test(v) },
    number: { label: "رقم واحد", test: (v) => /[0-9]/.test(v) },
  };

  const passedCount = Object.values(rules).filter((r) => r.test(password)).length;
  const allRulesPassed = passedCount === Object.keys(rules).length;

  const matches = confirmPassword.length > 0 && confirmPassword === password;
  const showMatchMsg = confirmPassword.length > 0;

  const canSubmit = currentPassword.length > 0 && allRulesPassed && matches;

  function strengthClass(index) {
    if (index >= passedCount) return "";
    if (passedCount <= 1) return "filled-weak";
    if (passedCount <= 3) return "filled-mid";
    return "filled-strong";
  }

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
      <div className="card-icon">🔒</div>
      <h1>تغيير كلمة المرور</h1>
      <p className="subtitle">أدخل كلمة المرور الحالية ثم كلمة المرور الجديدة.</p>

      <div className="field">
        <label htmlFor="currentPassword">كلمة المرور الحالية</label>
        <div className="input-wrap">
          <input
            id="currentPassword"
            type={showCurrent ? "text" : "password"}
            placeholder="أدخل كلمة المرور الحالية"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <button
            type="button"
            className="toggle-eye"
            aria-label={showCurrent ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            onClick={() => setShowCurrent((prev) => !prev)}
          >
            👁
          </button>
        </div>
      </div>

      <div className="field">
        <label htmlFor="newPassword">كلمة المرور الجديدة</label>
        <div className="input-wrap">
          <input
            id="newPassword"
            type={showPassword ? "text" : "password"}
            placeholder="أدخل كلمة المرور الجديدة"
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

        <div className="strength">
          <div className="strength-bar">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={strengthClass(i)} />
            ))}
          </div>

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

      <div className="field">
        <label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</label>
        <div className="input-wrap">
          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="أعد إدخال كلمة المرور الجديدة"
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

      <div className="btn-row">
        <button type="button" className="cancel-btn">
          إلغاء
        </button>
        <button type="submit" className="submit-btn" disabled={!canSubmit || submitting}>
          {success ? "تم الحفظ ✓" : submitting ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}
        </button>
      </div>
    </form>
  );
}
