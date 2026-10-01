import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  apiFetch,
  resolveMediaUrl,
  GOVERNORATE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  AREA_OPTIONS,
  GOVERNORATE_LABELS,
} from "../services/api";
import "./PropertyEditPage.css";

/* ---------- Icons ---------- */
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
    const { id: propertyId } = useParams();
    const navigate = useNavigate();

    // Form inputs state
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [type, setType] = useState("apartment");
    const [bedrooms, setBedrooms] = useState(2);
    const [bathrooms, setBathrooms] = useState(2);
    const [governorate, setGovernorate] = useState("gaza");
    const [area, setArea] = useState("");
    const [region, setRegion] = useState("");
    const [areaSqm, setAreaSqm] = useState("");
    const [description, setDescription] = useState("");

    // Features state
    const [features, setFeatures] = useState({
        furnished: false,
        parking: false,
        gym: false,
        balcony: false,
        sharedPool: false,
        centralAC: false,
        main_grid: false,
        solar: false,
        generator: false,
        tank: false,
        well: false,
    });

    // Photos state
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [photoToDelete, setPhotoToDelete] = useState(null);

    // API & UI state
    const [loading, setLoading] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // 1) جلب البيانات الحالية للعقار من الـ Backend
    useEffect(() => {
        if (!propertyId) return;

        const fetchProperty = async () => {
            try {
                const res = await apiFetch(`/api/properties/${propertyId}/`);

                if (!res.ok) throw new Error("تعذر جلب بيانات العقار");

                const data = await res.json();

                setTitle(data.title || "");
                setPrice(data.price || "");
                setType(data.property_type || "apartment");
                setBedrooms(data.bedrooms || 2);
                setBathrooms(data.bathrooms || 2);
                setGovernorate(data.governorate || "gaza");
                setArea(data.area || "");
                setRegion(data.neighborhood || "");
                setAreaSqm(data.area_sqm || "");
                setDescription(data.description || "");

                if (data.images && Array.isArray(data.images)) {
                    setPhotoPreviews(
                        data.images.map((img) => ({
                            url: resolveMediaUrl(typeof img === "string" ? img : img.image),
                            isNew: false,
                            file: null,
                        }))
                    );
                }

                // تحميل ميزات العقار المخزنة من الـ Backend (حقول has_*)
                const HAS_FIELD_MAP = {
                    has_main_grid: "main_grid",
                    has_solar: "solar",
                    has_generator_line: "generator",
                    has_water_tank: "tank",
                    has_private_well: "well",
                };
                const loadedFeatures = {};
                Object.entries(HAS_FIELD_MAP).forEach(([apiKey, stateKey]) => {
                    if (data[apiKey]) loadedFeatures[stateKey] = true;
                });
                if (data.features && typeof data.features === "object" && !Array.isArray(data.features)) {
                    Object.assign(loadedFeatures, data.features);
                }
                if (Object.keys(loadedFeatures).length) setFeatures((prev) => ({ ...prev, ...loadedFeatures }));
            } catch (err) {
                setErrorMessage(err.message);
            }
        };

        fetchProperty();
    }, [propertyId]);

    const toggleFeature = (key) =>
        setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));

    const handleFiles = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const newItems = files.map((file) => ({
            url: URL.createObjectURL(file),
            isNew: true,
            file: file,
        }));

        setPhotoPreviews((prev) => [...prev, ...newItems]);
        e.target.value = "";
    };

    const confirmDeletePhoto = () => {
        if (photoToDelete !== null) {
            setPhotoPreviews((prev) => {
                const target = prev[photoToDelete];
                if (target?.isNew && target.url) {
                    URL.revokeObjectURL(target.url);
                }
                return prev.filter((_, i) => i !== photoToDelete);
            });
            setPhotoToDelete(null);
        }
    };

    // 2) حفظ التعديلات وإرسال البيانات عبر PATCH
    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setShowSaved(false);
        setErrorMessage("");

        try {
            const formData = new FormData();

            formData.append("title", title);
            formData.append("price", price);
            formData.append("property_type", type);
            formData.append("bedrooms", bedrooms);
            formData.append("bathrooms", bathrooms);
            formData.append("governorate", governorate);
            formData.append("area", area || "");
            formData.append("neighborhood", region);
            formData.append("area_sqm", areaSqm);
            formData.append("description", description);

            // حقل address إجباري في الباك إند
            const govLabel = GOVERNORATE_LABELS[governorate] || governorate || "";
            formData.append("address", [govLabel, region].filter(Boolean).join(" - ") || "عنوان غير محدد");

            photoPreviews.forEach((item) => {
                if (item.isNew && item.file) {
                    formData.append("images", item.file);
                }
            });

            // حفظ ميزات الكهرباء والمياه مباشرة بالحقول الفعلية للـ Backend
            formData.append("has_main_grid", features.main_grid ? "true" : "false");
            formData.append("has_solar", features.solar ? "true" : "false");
            formData.append("has_generator_line", features.generator ? "true" : "false");
            formData.append("has_water_tank", features.tank ? "true" : "false");
            formData.append("has_private_well", features.well ? "true" : "false");

            // مسار احتياطي إذا كان الـ Backend يعتمد على النصوص المفصولة بفواصل
            const electricity = ["main_grid", "solar", "generator"].filter((k) => features[k]);
            const water = ["tank", "well"].filter((k) => features[k]);
            if (electricity.length) formData.append("electricity", electricity.join(","));
            if (water.length) formData.append("water", water.join(","));

            const response = await apiFetch(`/api/properties/${propertyId}/`, {
                method: "PATCH",
                formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || errorData.message || "فشل تحديث البيانات");
            }

            setShowSaved(true);
        } catch (err) {
            setErrorMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-page" dir="rtl">
            <div className="edit-page-inner">
                <h1 className="edit-title">تعديل عقار</h1>

                {errorMessage && (
                    <div className="ap-error-banner" style={{ marginBottom: 16 }}>
                        {errorMessage}
                    </div>
                )}

                <div className="edit-grid">
                    {/* Sidebar */}
                    <aside className="edit-sidebar">
                        <div>
                            <div className="edit-photos-head">
                                <h2>صور العقار</h2>
                                <label className="edit-add-photo-link" style={{ cursor: "pointer" }}>
                                    <ImagePlusIcon />
                                    إضافة صورة
                                    <input type="file" multiple accept="image/*" hidden onChange={handleFiles} />
                                </label>
                            </div>

                            {photoPreviews.length > 0 && (
                                <div className="edit-main-photo">
                                    <img src={photoPreviews[0].url} alt="صورة العقار الرئيسية" />
                                    <button
                                        type="button"
                                        className="edit-photo-remove"
                                        onClick={() => setPhotoToDelete(0)}
                                        aria-label="حذف الصورة"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}

                            {photoPreviews.length > 1 && (
                                <div className="edit-photo-grid">
                                    {photoPreviews.slice(1).map((item, i) => (
                                        <div className="edit-photo-item" key={i}>
                                            <img src={item.url} alt="صورة العقار" />
                                            <button
                                                type="button"
                                                className="edit-photo-remove"
                                                onClick={() => setPhotoToDelete(i + 1)}
                                                aria-label="حذف الصورة"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <label className="edit-dropzone">
                            <ImagePlusIcon />
                            <span className="edit-dropzone-title">أضف المزيد من الصور</span>
                            <span className="edit-dropzone-hint">اسحب وأفلت أو انقر للتصفح (Max 5MB)</span>
                            <input type="file" multiple accept="image/*" hidden onChange={handleFiles} />
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
                                    سيتم مراجعة أي تغييرات جوهرية قبل ظهورها للمستخدمين.
                                </p>
                            </div>
                        </div>

                        <div className="edit-actions">
                            <button type="submit" form="edit-property-form" className="submit-btn" disabled={loading}>
                                {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
                            </button>
                            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>
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
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="فيلا فاخرة بإطلالة بانورامية"
                                    />
                                </Field>
                                <Field label="السعر (شيكل)">
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                </Field>
                                <Field label="نوع العقار">
                                    <select value={type} onChange={(e) => setType(e.target.value)}>
                                        {PROPERTY_TYPE_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
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
                                <Field label="الحمامات">
                                    <Counter value={bathrooms} onChange={setBathrooms} />
                                </Field>

                                <Field label="المحافظة">
                                    <select value={governorate} onChange={(e) => setGovernorate(e.target.value)}>
                                        <option value="">الكل</option>
                                        {GOVERNORATE_OPTIONS.filter((o) => o.value).map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="المنطقة (الحي)">
                                    <select value={area} onChange={(e) => setArea(e.target.value)}>
                                        <option value="">بدون</option>
                                        {AREA_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="الحارة / التفاصيل">
                                    <input
                                        type="text"
                                        value={region}
                                        onChange={(e) => setRegion(e.target.value)}
                                        placeholder="مثال: الرمال"
                                    />
                                </Field>
                                <Field label="المساحة (م²)">
                                    <input
                                        type="number"
                                        value={areaSqm}
                                        onChange={(e) => setAreaSqm(e.target.value)}
                                        placeholder="مثال: 120"
                                    />
                                </Field>
                            </div>
                        </section>

                        <section>
                            <h2>الوصف</h2>
                            <textarea
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="اكتب وصفاً تفصيلياً للعقار..."
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
                            <h2>الكهرباء</h2>
                            <div className="edit-features-grid">
                                <Checkbox label="الكهرباء العامة" checked={features.main_grid} onChange={() => toggleFeature("main_grid")} />
                                <Checkbox label="طاقة شمسية" checked={features.solar} onChange={() => toggleFeature("solar")} />
                                <Checkbox label="مولد كهربائي" checked={features.generator} onChange={() => toggleFeature("generator")} />
                            </div>
                            <h2>المياه</h2>
                            <div className="edit-features-grid">
                                <Checkbox label="خزان" checked={features.tank} onChange={() => toggleFeature("tank")} />
                                <Checkbox label="بئر" checked={features.well} onChange={() => toggleFeature("well")} />
                            </div>
                        </section>
                    </form>
                </div>
            </div>

            {/* Popup تأكيد الحذف */}
            {photoToDelete !== null && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>تأكيد الحذف</h3>
                        <p>هل أنتِ متأكدة من حذف هذه الصورة؟</p>
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="modal-btn-confirm"
                                onClick={confirmDeletePhoto}
                            >
                                نعم، احذف
                            </button>
                            <button
                                type="button"
                                className="modal-btn-cancel"
                                onClick={() => setPhotoToDelete(null)}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}