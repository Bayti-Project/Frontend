import React, { useState, useRef, useEffect } from "react";
import propertyMain from "./assets/listings/property-main.png";
import propertyLivingRoom from "./assets/listings/property-living-room.png";
import propertyKitchen from "./assets/listings/property-kitchen.png";

/* ---------- Icons (same inline-SVG convention as OwnerHome.jsx) ---------- */
function ImagePlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
      <rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8.5" cy="9.5" r="1.4" stroke="currentColor" strokeWidth="1.4" />
      <path d="m4 15 3.5-3.5L11 15l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 4v6M15 7h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 11v5.5M12 8v.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
      <circle cx="12" cy="12" r="10" stroke="#22C55E" strokeWidth="1.6" />
      <path d="m8 12.5 2.5 2.5L16 9.5" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 7l1 13a1.5 1.5 0 0 0 1.5 1.4h7a1.5 1.5 0 0 0 1.5-1.4L18 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="13" height="13">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="13" height="13">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- Small reusable form pieces ---------- */
function Field({ label, children, full }) {
  return (
    <div className={`edit-field${full ? " edit-field-full" : ""}`}>
      <label>{label}</label>
      {children}
    </div>
  );
}

function Counter({ value, onChange, min = 0 }) {
  return (
    <div className="edit-counter">
      <button type="button" onClick={() => onChange(value + 1)} aria-label="زيادة">
        <PlusIcon />
      </button>
      <span>{value}</span>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label="إنقاص">
        <MinusIcon />
      </button>
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="edit-checkbox">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

/* ---------- Main page ---------- */
export default function PropertyEditPage() {
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [showSaved, setShowSaved] = useState(true);
  const [features, setFeatures] = useState({
    furnished: false,
    parking: false,
    gym: false,
    balcony: true,
    sharedPool: false,
    centralAC: true,
  });

  /* ---------- Photo management: keep existing + add new + delete individually ---------- */
  const [photos, setPhotos] = useState([
    { id: "existing-1", src: propertyMain, alt: "صورة العقار الرئيسية", isNew: false },
    { id: "existing-2", src: propertyKitchen, alt: "صورة المطبخ", isNew: false },
    { id: "existing-3", src: propertyLivingRoom, alt: "صورة الصالة", isNew: false },
  ]);
  const fileInputRef = useRef(null);

  // Revoke object URLs created for newly-added photos when they're removed or on unmount
  useEffect(() => {
    return () => {
      photos.forEach((p) => {
        if (p.isNew) URL.revokeObjectURL(p.src);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newItems = files.map((file) => ({
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      src: URL.createObjectURL(file),
      alt: file.name,
      isNew: true,
      file,
    }));
    setPhotos((prev) => [...prev, ...newItems]);
    e.target.value = ""; // allow re-selecting the same file later
  };

  const handleRemovePhoto = (id) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.isNew) URL.revokeObjectURL(target.src);
      return prev.filter((p) => p.id !== id);
    });
  };

  const toggleFeature = (key) =>
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = (e) => {
    e.preventDefault();
    setShowSaved(true);
  };

  const [mainPhoto, ...restPhotos] = photos;

  return (
    <div className="edit-page">
      <div className="edit-page-inner">
        <h1 className="edit-title">تعديل عقار</h1>

        <div className="edit-grid">
            {/* Sidebar */}
            <aside className="edit-sidebar">
              <div>
                <div className="edit-photos-head">
                  <h2>صور العقار</h2>
                  <button
                    type="button"
                    className="edit-add-photo-link"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlusIcon />
                    إضافة صورة
                  </button>
                </div>

                {mainPhoto && (
                  <div className="edit-main-photo">
                    <img src={mainPhoto.src} alt={mainPhoto.alt} />
                    <button
                      type="button"
                      className="edit-photo-remove-btn edit-photo-remove-btn-main"
                      onClick={() => handleRemovePhoto(mainPhoto.id)}
                      aria-label={`حذف ${mainPhoto.alt}`}
                      title="حذف هذه الصورة"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                )}

                {restPhotos.length > 0 && (
                  <div className="edit-photo-grid">
                    {restPhotos.map((photo) => (
                      <div className="edit-photo-item" key={photo.id}>
                        <img src={photo.src} alt={photo.alt} />
                        <button
                          type="button"
                          className="edit-photo-remove-btn"
                          onClick={() => handleRemovePhoto(photo.id)}
                          aria-label={`حذف ${photo.alt}`}
                          title="حذف هذه الصورة"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {photos.length === 0 && (
                  <p className="edit-photos-empty">لا توجد صور حاليًا، أضف صورة من الأسفل.</p>
                )}
              </div>

              <label className="edit-dropzone">
                <ImagePlusIcon />
                <span className="edit-dropzone-title">أضف المزيد من الصور</span>
                <span className="edit-dropzone-hint">اسحب وأفلت أو انقر للتصفح (Max 5MB)</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  hidden
                  ref={fileInputRef}
                  onChange={handleAddPhotos}
                />
              </label>

              {/* Publish status */}
              <div className="edit-status-card">
                <h3>حالة النشر</h3>
                <div className="edit-status-row">
                  <div className="edit-status-right">
                    <span className="edit-status-icons">
                      <EyeIcon />
                    </span>
                    <div className="edit-status-text">
                      <p className="edit-status-title">منشور للعامة</p>
                      <p className="edit-status-sub">يظهر في نتائج البحث</p>
                    </div>
                  </div>
                  <span className="edit-status-dot" />
                </div>
                <div className="edit-status-note">
                  <InfoIcon />
                  <p>
                    آخر تحديث تم في 12 أكتوبر 2023. سيتم
                    <br />
                    مراجعة أي تغييرات جوهرية قبل ظهورها
                    <br />
                    للمستخدمين.
                  </p>
                </div>
              </div>

              <div className="edit-actions">
                <button type="submit" form="edit-property-form" className="submit-btn">
                  حفظ التغييرات
                </button>
                <button type="button" className="cancel-btn">
                  إلغاء
                </button>
              </div>

              {showSaved && (
                <div className="edit-saved-banner">
                  <CheckCircleIcon />
                  تم تحديث بيانات العقار بنجاح
                </div>
              )}
            </aside>

            {/* Form */}
            <form id="edit-property-form" className="edit-form" onSubmit={handleSave}>
              <section>
                <h2>المعلومات الأساسية</h2>
                <div className="edit-form-grid cols-2">
                  <Field label="عنوان العقار" full>
                    <input type="text" defaultValue="فيلا فاخرة بإطلالة بانورامية" />
                  </Field>
                  <Field label="السعر (دولار)">
                    <input type="number" defaultValue={850000} />
                  </Field>
                  <Field label="نوع العقار">
                    <select defaultValue="فيلا">
                      <option value="فيلا">فيلا</option>
                      <option value="شقة">شقة</option>
                      <option value="أرض">أرض</option>
                      <option value="مكتب">مكتب</option>
                    </select>
                  </Field>
                </div>
              </section>

              <section>
                <h2>الموقع والمساحة</h2>
                <div className="edit-form-grid cols-3">
                  <Field label="غرف النوم">
                    <Counter value={bedrooms} onChange={setBedrooms} />
                  </Field>
                  <Field label="الطابق">
                    <input type="text" placeholder="مثال: 15" />
                  </Field>
                  <Field label="الحمامات">
                    <Counter value={bathrooms} onChange={setBathrooms} />
                  </Field>

                  <Field label="المحافظة">
                    <select defaultValue="غزة">
                      <option value="غزة">غزة</option>
                      <option value="خان يونس">خان يونس</option>
                      <option value="رفح">رفح</option>
                      <option value="دير البلح">دير البلح</option>
                    </select>
                  </Field>
                  <Field label="المنطقة">
                    <input type="text" placeholder="مثال: الرمال" />
                  </Field>
                  <Field label="المساحة (قدم مربع)">
                    <input type="text" placeholder="مثال: 1200" />
                  </Field>
                </div>
              </section>

              <section>
                <h2>الوصف</h2>
                <textarea
                  rows={4}
                  defaultValue="فيلا فاخرة تقع في قلب حي الرمال الراقي، تتميز بتصميم عصري وتشطيبات سوبر ديلوكس. تتكون من طابقين ومسبح خاص وحديقة واسعة. إطلالة خلابة وقريبة من جميع الخدمات."
                />
              </section>

              <section>
                <h2>مميزات العقار</h2>
                <div className="edit-features-grid">
                  <Checkbox label="بلكونة" checked={features.balcony} onChange={() => toggleFeature("balcony")} />
                  <Checkbox label="مفروش" checked={features.furnished} onChange={() => toggleFeature("furnished")} />
                  <Checkbox label="مسبح مشترك" checked={features.sharedPool} onChange={() => toggleFeature("sharedPool")} />
                  <Checkbox label="موقف سيارات" checked={features.parking} onChange={() => toggleFeature("parking")} />
                  <Checkbox label="تكييف مركزي" checked={features.centralAC} onChange={() => toggleFeature("centralAC")} />
                  <Checkbox label="صالة رياضية" checked={features.gym} onChange={() => toggleFeature("gym")} />
                </div>
              </section>
            </form>
        </div>
      </div>
    </div>
  );
}
