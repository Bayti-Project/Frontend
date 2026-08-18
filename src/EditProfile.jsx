import { useRef, useState } from "react";
import { FaCheckCircle, FaUpload } from "react-icons/fa";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./style.css";
import "./EditProfile.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export default function EditProfile({ currentUser, onSave, onCancel, onProfileClick, onChangePasswordClick, onLogoutClick }) {
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [whatsapp, setWhatsapp] = useState(currentUser?.whatsapp || "");
  const [countryCode, setCountryCode] = useState(currentUser?.countryCode || "+972");
  const [avatar, setAvatar] = useState(currentUser?.avatar || "");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [savedData, setSavedData] = useState(null);
  const [formError, setFormError] = useState("");

  const fileInputRef = useRef(null);

  const emailValid = EMAIL_RE.test(email);
  const emailError = email.length > 0 && !emailValid;
  const canSubmit = name.trim().length > 0 && emailValid;

  function handleAvatarSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      setFormError("حجم الصورة يتجاوز 2MB");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
      setFormError("");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSavedData({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        countryCode,
        avatar,
      });
      setSuccess(true);
    }, 900);
  }

  function handleBackToProfile() {
    setSuccess(false);
    onSave(savedData);
  }

  return (
    <div className="page edit-profile-page" dir="rtl">
      <Navbar
        onProfileClick={onProfileClick}
        onChangePasswordClick={onChangePasswordClick}
        onLogoutClick={onLogoutClick}
      />

      <main className="edit-profile-main">
        <div className="edit-profile-header">
          <h1>تعديل الملف الشخصي</h1>
          <p>قم بتحديث معلوماتك الشخصية وصورة العرض الخاصة بك.</p>
        </div>

        <form className="edit-profile-card" onSubmit={handleSubmit} noValidate>
          {/* قسم صورة الملف الشخصي */}
          <div className="edit-avatar-section">
            <img
              src={avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"}
              alt="الصورة الشخصية"
              className="edit-avatar"
            />
            <div className="edit-avatar-actions">
              <button
                type="button"
                className="upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <FaUpload /> تحميل صورة جديدة
              </button>
              <span className="upload-hint">
                JPG, GIF or PNG. الحجم الأقصى: 2MB
              </span>
              {formError && <span className="field-error">{formError}</span>}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/gif,image/png"
              hidden
              onChange={handleAvatarSelect}
            />
          </div>

          <div className="edit-divider" />

          {/* حقول النموذج */}
          <div className="edit-form-grid">
            <div className="edit-field">
              <label htmlFor="editName">الاسم</label>
              <input
                id="editName"
                type="text"
                placeholder="اسمك"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="edit-field">
              <label htmlFor="editEmail">البريد الإلكتروني</label>
              <input
                id="editEmail"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={emailError ? "invalid" : ""}
              />
              {emailError && <span className="field-error">البريد الإلكتروني غير صالح</span>}
            </div>

            <div className="edit-field">
              <label htmlFor="editPhone">رقم الهاتف</label>
              <input
                id="editPhone"
                type="tel"
                placeholder="0598 123 456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="edit-field">
              <label htmlFor="editWhatsapp">رقم الواتس</label>
              <div className="phone-input">
                <input
                  id="editWhatsapp"
                  type="tel"
                  placeholder="0598 123 456"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
                <select
                  aria-label="رمز الدولة"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  <option value="+970">+970</option>
                  <option value="+972">+972</option>
                  <option value="+966">+966</option>
                  <option value="+962">+962</option>
                </select>
              </div>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="edit-actions">
            <button type="submit" className="save-btn" disabled={!canSubmit || submitting}>
              {submitting ? "جارٍ الحفظ..." : "حفظ التغييرات"}
            </button>
            <button type="button" className="outline-btn" onClick={onCancel}>
              إلغاء
            </button>
          </div>
        </form>
      </main>

      {/* نافذة النجاح المنبثقة */}
      {success && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="success-modal-title">
          <div className="modal-box">
            <div className="modal-icon">
              <FaCheckCircle />
            </div>
            <h2 id="success-modal-title">تم التحديث بنجاح</h2>
            <p>تم تحديث الملف الشخصي بنجاح</p>
            <button type="button" className="modal-btn" onClick={handleBackToProfile}>
              العودة للملف الشخصي
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
