import { useRef, useState, useEffect } from "react";
import { FaCheckCircle, FaUpload, FaSpinner } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { mapApiError, apiFetch, resolveMediaUrl, normalizeUser } from "../services/api.js";
import "../styles/style.css";
import "./EditProfile.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export default function EditProfile({ currentUser, onSave, onCancel, onHomeClick, onProfileClick, onChangePasswordClick, onLogoutClick }) {
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [whatsapp, setWhatsapp] = useState(currentUser?.whatsapp || "");
  const [countryCode, setCountryCode] = useState(currentUser?.countryCode || "+970");
  const [avatar, setAvatar] = useState(resolveMediaUrl(currentUser?.avatar) || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [success, setSuccess] = useState(false);
  const [savedData, setSavedData] = useState(null);
  const [formError, setFormError] = useState("");

  const fileInputRef = useRef(null);

  // جلب البيانات الحالية من API عند تحميل الصفحة لضمان مطابقة الداتا
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setLoadingProfile(true);
    apiFetch('/api/auth/profile/')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const u = normalizeUser(data);
        setName(u.name || currentUser?.name || "");
        setEmail(u.email || currentUser?.email || "");
        setPhone(u.phone || currentUser?.phone || "");

        let rawWhatsapp = u.whatsapp || currentUser?.whatsapp || "";
        if (rawWhatsapp.startsWith("+970")) {
          setCountryCode("+970");
          rawWhatsapp = rawWhatsapp.replace("+970", "");
        } else if (rawWhatsapp.startsWith("+972")) {
          setCountryCode("+972");
          rawWhatsapp = rawWhatsapp.replace("+972", "");
        } else if (rawWhatsapp.startsWith("+966")) {
          setCountryCode("+966");
          rawWhatsapp = rawWhatsapp.replace("+966", "");
        } else if (rawWhatsapp.startsWith("+962")) {
          setCountryCode("+962");
          rawWhatsapp = rawWhatsapp.replace("+962", "");
        }
        setWhatsapp(rawWhatsapp);

        if (u.avatar) {
          setAvatar(resolveMediaUrl(u.avatar));
        }
      })
      .catch((err) => console.error("Error fetching initial profile:", err))
      .finally(() => setLoadingProfile(false));
  }, []);

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
      setAvatarFile(file);
      setFormError("");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setFormError("");
    setSubmitting(true);

    const fullWhatsapp = whatsapp.trim() ? `${countryCode}${whatsapp.trim()}` : "";

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("full_name", name.trim());
    formData.append("email", email.trim());
    formData.append("phone", phone.trim());
    formData.append("phone_number", phone.trim());
    formData.append("whatsapp", fullWhatsapp);
    formData.append("whatsapp_number", fullWhatsapp);

    if (avatarFile) {
      formData.append("avatar", avatarFile);
      formData.append("profile_image", avatarFile);
    }

    apiFetch("/api/auth/profile/", {
      method: "PATCH", // أو "PUT" حسب إعدادات السيرفر
      body: formData,
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setFormError(mapApiError(data) || "حدث خطأ أثناء حفظ البيانات");
          setSubmitting(false);
          return null;
        }
        return data;
      })
      .then((data) => {
        if (!data) return;
        setSubmitting(false);

        const u = normalizeUser(data);
        const updatedAvatar = resolveMediaUrl(u.avatar || data.profile_image) || avatar;

        const updatedData = {
          name: u.name || name.trim(),
          email: u.email || email.trim(),
          phone: u.phone || phone.trim(),
          whatsapp: fullWhatsapp,
          countryCode,
          avatar: updatedAvatar,
        };

        // تحديث البيانات في LocalStorage
        const saved = JSON.parse(localStorage.getItem('bayti_user') || '{}');
        localStorage.setItem(
          'bayti_user',
          JSON.stringify({ ...saved, ...updatedData })
        );

        setSavedData(updatedData);
        setSuccess(true);
      })
      .catch(() => {
        setFormError("تعذر الاتصال بالخادم، تحقق من اتصالك بالإنترنت وحاول مرة أخرى");
        setSubmitting(false);
      });
  }

  function handleBackToProfile() {
    setSuccess(false);
    if (onSave && savedData) {
      onSave(savedData);
    }
  }

  return (
    <div className="page edit-profile-page" dir="rtl">
      <Navbar
        onHomeClick={onHomeClick}
        onProfileClick={onProfileClick}
        onChangePasswordClick={onChangePasswordClick}
        onLogoutClick={onLogoutClick}
      />

      <main className="edit-profile-main">
        <div className="edit-profile-header">
          <h1>تعديل الملف الشخصي</h1>
          <p>قم بتحديث معلوماتك الشخصية وصورة العرض الخاصة بك.</p>
        </div>

        {loadingProfile ? (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <FaSpinner style={{ animation: "spin 1s linear infinite", fontSize: "2rem", color: "#0284c7" }} />
            <p style={{ marginTop: "1rem", color: "#666" }}>جاري تحميل البيانات...</p>
          </div>
        ) : (
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
                {formError && <span className="field-error" style={{ display: "block", marginTop: "5px" }}>{formError}</span>}
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
        )}
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