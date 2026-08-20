import { useState } from "react";
import { FaRecycle } from "react-icons/fa";
import { apiFetch, mapApiError } from "./api.js";
import "./style.css"; // نفس ملف الـ CSS المشترك

export default function ChangePasswordForm() {
  // ---------- الحالة (State) ----------
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

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
  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setApiError("");
    setSubmitting(true);

    try {
      const res = await apiFetch("/api/auth/change-password/", {
        method: "PUT",
        json: {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setApiError(mapApiError(data));
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setApiError("تعذر الاتصال بالخادم، تحقق من اتصالك بالإنترنت وحاول مرة أخرى");
      setSubmitting(false);
    }
  }

  function handleCancel() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess(false);
    setApiError("");
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <div className="card-icon">
        <FaRecycle />
      </div>

      <h1 style={{ textAlign: "center" }}>تغيير كلمة المرور</h1>
      <p className="subtitle" style={{ textAlign: "center" }}>
        يرجى التأكد من اختيار كلمة مرور قوية لحماية حسابك.
      </p>

      {apiError && (
        <div className="form-error" role="alert" style={{ marginBottom: "14px", color: "#E5484D", background: "#fef2f2", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", textAlign: "center" }}>
          {apiError}
        </div>
      )}

      {/* كلمة المرور الحالية */}
      <div className="field">
        <label htmlFor="currentPassword">كلمة المرور الحالية</label>
        <div className="input-wrap">
          <input
            id="currentPassword"
            type={showCurrent ? "text" : "password"}
            placeholder="أدخل كلمة المرور"
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

      {/* كلمة المرور الجديدة */}
      <div className="field">
        <label htmlFor="newPassword">كلمة المرور الجديدة</label>
        <div className="input-wrap">
          <input
            id="newPassword"
            type={showNew ? "text" : "password"}
            placeholder="أدخل كلمة المرور"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            type="button"
            className="toggle-eye"
            aria-label={showNew ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            onClick={() => setShowNew((prev) => !prev)}
          >
            👁
          </button>
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

      {success && (
        <p className="match-msg show ok" style={{ justifyContent: "center", marginTop: "14px" }}>
          تم تغيير كلمة المرور، سجّل دخولك مرة أخرى بكلمة المرور الجديدة.
        </p>
      )}
    </form>
  );
}
