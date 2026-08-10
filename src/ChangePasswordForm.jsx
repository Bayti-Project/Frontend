import React, { useState } from "react";
import "./style.css"; // نفس ملف الـ CSS المشترك

export default function ChangePasswordForm() {
  // ---------- الحالة (State) ----------
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // ---------- الشروط (لتحديد قوة كلمة المرور الجديدة) ----------
  const rules = [
    (v) => v.length >= 8,
    (v) => /[A-Z]/.test(v),
    (v) => /[a-z]/.test(v),
    (v) => /[0-9]/.test(v),
  ];

  const passedCount = rules.filter((test) => test(newPassword)).length;
  const allRulesPassed = passedCount === rules.length;

  // حالة التطابق
  const matches = confirmPassword.length > 0 && confirmPassword === newPassword;
  const showMatchMsg = confirmPassword.length > 0;

  // الزر يتفعل فقط لو كلمة المرور الحالية مكتوبة + الجديدة قوية + التأكيد متطابق
  const canSubmit =
    currentPassword.length > 0 && allRulesPassed && matches;

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

  function handleCancel() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess(false);
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <div className="card-icon">🔄</div>

      <h1 style={{ textAlign: "center" }}>تغيير كلمة المرور</h1>
      <p className="subtitle" style={{ textAlign: "center" }}>
        يرجى التأكد من اختيار كلمة مرور قوية لحماية حسابك.
      </p>

      {/* كلمة المرور الحالية */}
      <div className="field">
        <label htmlFor="currentPassword">كلمة المرور الحالية</label>
        <div className="input-wrap">
          <input
            id="currentPassword"
            type="password"
            placeholder="أدخل كلمة المرور"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
      </div>

      {/* كلمة المرور الجديدة */}
      <div className="field">
        <label htmlFor="newPassword">كلمة المرور الجديدة</label>
        <div className="input-wrap">
          <input
            id="newPassword"
            type="password"
            placeholder="أدخل كلمة المرور"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        {/* شريط القوة فقط (بدون قائمة شروط تفصيلية) */}
        <div className="strength-bar" style={{ marginTop: "10px" }}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={strengthClass(i)} />
          ))}
        </div>
      </div>

      {/* تأكيد كلمة المرور الجديدة */}
      <div className="field">
        <label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</label>
        <div className="input-wrap">
          <input
            id="confirmPassword"
            type="password"
            placeholder="أدخل كلمة المرور"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={showMatchMsg && !matches ? "invalid" : ""}
          />
        </div>
        {showMatchMsg && (
          <div className={`match-msg show ${matches ? "ok" : "err"}`}>
            {matches ? "كلمتا المرور متطابقتان" : "كلمتا المرور غير متطابقتين"}
          </div>
        )}
      </div>

      {/* الأزرار */}
      <div className="btn-row">
        <button type="submit" className="submit-btn" disabled={!canSubmit || submitting}>
          {success
            ? "تم التحديث بنجاح ✓"
            : submitting
              ? "جارٍ الحفظ..."
              : "تحديث كلمة المرور"}
        </button>
        <button type="button" className="cancel-btn" onClick={handleCancel}>
          إلغاء
        </button>
      </div>
    </form>
  );
}
