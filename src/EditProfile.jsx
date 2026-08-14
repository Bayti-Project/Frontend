import { useState } from "react";
import { FaUserEdit, FaCheckCircle } from "react-icons/fa";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./style.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EditProfile({ currentUser, onSave, onCancel, onProfileClick, onChangePasswordClick }) {
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [city, setCity] = useState(currentUser?.city || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [savedData, setSavedData] = useState(null);

  const emailValid = EMAIL_RE.test(email);
  const canSubmit = name.trim().length > 0 && emailValid;

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
        city: city.trim(),
        bio: bio.trim(),
      });
      setSuccess(true);
    }, 900);
  }

  function handleBackToProfile() {
    setSuccess(false);
    onSave(savedData);
  }

  return (
    <div className="page" dir="rtl">
      <Navbar
        onProfileClick={onProfileClick}
        onChangePasswordClick={onChangePasswordClick}
      />

      <main className="main">
        <form className="card edit-card" onSubmit={handleSubmit} noValidate>
          <div className="card-icon">
            <FaUserEdit />
          </div>

          <h1>تعديل الملف الشخصي</h1>
          <p className="subtitle" style={{ textAlign: "center" }}>
            حدّث بياناتك وسيظهر التغيير مباشرة في ملفك الشخصي.
          </p>

          <div className="field">
            <label htmlFor="profileName">الاسم الكامل</label>
            <div className="input-wrap">
              <input
                id="profileName"
                type="text"
                placeholder="الاسم الكامل"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="profileEmail">البريد الإلكتروني</label>
            <div className="input-wrap">
              <input
                id="profileEmail"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={email && !emailValid ? "invalid" : ""}
              />
            </div>
            {email && !emailValid && (
              <div className="match-msg show err">البريد الإلكتروني غير صالح</div>
            )}
          </div>

          <div className="field">
            <label htmlFor="profilePhone">رقم الهاتف</label>
            <div className="input-wrap">
              <input
                id="profilePhone"
                type="tel"
                placeholder="0598 123 456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="profileCity">المدينة / المنطقة</label>
            <div className="input-wrap">
              <input
                id="profileCity"
                type="text"
                placeholder="مثال: غزة - الرمال"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="profileBio">نبذة عنك</label>
            <div className="input-wrap">
              <textarea
                id="profileBio"
                rows="3"
                placeholder="اكتب نبذة قصيرة عنك..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>

          <div className="btn-row">
            <button type="submit" className="submit-btn" disabled={!canSubmit || submitting}>
              {submitting ? "جارٍ الحفظ..." : "حفظ التغييرات"}
            </button>
            <button type="button" className="cancel-btn" onClick={onCancel}>
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
