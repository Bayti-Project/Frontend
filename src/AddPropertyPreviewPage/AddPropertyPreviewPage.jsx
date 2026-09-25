import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiInfo, FiImage, FiRefreshCw, FiAlertCircle } from "react-icons/fi";
import { getDraft, saveDraft, persistDraft, clearPersistedDraft } from "../state/addPropertyDraft";
import { apiFetch, mapApiError } from "../services/api";
import "../PropertyEditPage/PropertyEditPage.css";
import "../AddPropertyPage/AddPropertyPage.css";
import "./AddPropertyPreviewPage.css";

/* ---------- أيقونات ---------- */
function CheckCircleIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" width="30" height="30">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
            <path d="m8 12.5 2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

function MinusIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" width="13" height="13">
            <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function Field({ label, children, full }) {
    return (
        <div className={`edit-field${full ? " edit-field-full" : ""}`}>
            <label>{label}</label>
            {children}
        </div>
    );
}

const FEATURE_LABELS = {
    balcony: "بلكونة",
    sharedPool: "مسبح مشترك",
    parking: "موقف سيارات",
    centralAC: "تكييف مركزي",
    gym: "صالة رياضية",
    garden: "حديقة",
    main_grid: "الكهرباء العامة",
    solar: "طاقة شمسية",
    generator: "مولد كهربائي",
    tank: "خزان",
    well: "بئر",
};

/* ---------- المكون الرئيسي: الخطوة 3 (معاينة الإعلان) ---------- */
export default function AddPropertyPreviewPage() {
    const navigate = useNavigate();
    const draft = getDraft();
    const f = draft.formData || {};
    const photos = draft.photos || [];

    // استخراج معالجة الصور لضمان قراءة المطبوعات النصية أو الكائنات بلا أخطاء
    const photoUrls = photos.map((p) => {
        if (!p) return "";
        if (typeof p === "string") return p;
        if (p.url) return p.url;
        if (p.file instanceof File || p.file instanceof Blob) {
            return URL.createObjectURL(p.file);
        }
        return "";
    }).filter(Boolean);

    useEffect(() => {
        if (!Object.keys(f).length) {
            navigate("/add-property", { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [phase, setPhase] = useState("idle");
    const [showToast, setShowToast] = useState(false);
    const [publishError, setPublishError] = useState("");

    // حقول قابلة للتعديل
    const [formData, setFormData] = useState({
        ...f,
        area: f.area || f.area_sqm || "",
        area_sqm: f.area_sqm || f.area || "",
    });
    const [bedrooms, setBedrooms] = useState(draft.bedrooms ?? 2);
    const [bathrooms, setBathrooms] = useState(draft.bathrooms ?? 2);
    const [features, setFeatures] = useState({ ...(draft.features || {}) });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "area") {
            setFormData((prev) => ({
                ...prev,
                area: value,
                area_sqm: value,
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const toggleFeature = (key) =>
        setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));

    const handlePublish = async () => {
        setPublishError("");
        setPhase("loading");

        const data = new FormData();
        data.append("title", formData.title || "");
        data.append("price", formData.price || "");
        data.append("property_type", formData.type || "apartment");
        data.append("bedrooms", bedrooms);
        data.append("bathrooms", bathrooms);
        data.append("governorate", formData.governorate || "gaza");
        data.append("neighborhood", formData.region || "");

        // إضافة حقل address المطلوب للباك إند
        const fullAddress = [formData.governorate, formData.region].filter(Boolean).join(" - ");
        data.append("address", fullAddress || "عنوان غير محدد");

        const finalArea = formData.area || formData.area_sqm || "";
        data.append("area_sqm", finalArea);
        data.append("description", formData.description || "");

        // حفظ ميزات الكهرباء والمياه مباشرة بالحقول الفعلية للـ Backend
        data.append("has_main_grid", features.main_grid ? "true" : "false");
        data.append("has_solar", features.solar ? "true" : "false");
        data.append("has_generator_line", features.generator ? "true" : "false");
        data.append("has_water_tank", features.tank ? "true" : "false");
        data.append("has_private_well", features.well ? "true" : "false");

        // مسار احتياطي إذا كان الـ Backend يعتمد على النصوص المفصولة بفواصل
        const electricity = ["main_grid", "solar", "generator"].filter((k) => features[k]);
        const water = ["tank", "well"].filter((k) => features[k]);
        if (electricity.length) data.append("electricity", electricity.join(","));
        if (water.length) data.append("water", water.join(","));

        photos.forEach((p) => {
            const file = p && typeof p === "object" ? p.file : null;
            if (file && file instanceof File) {
                data.append("images", file);
            }
        });

        try {
            const res = await apiFetch("/api/properties/", { method: "POST", formData: data });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                setPublishError(mapApiError(err));
                setPhase("idle");
                return;
            }
            setPhase("success");
        } catch (err) {
            setPublishError(err?.message || "تعذر الاتصال بالخادم");
            setPhase("idle");
        }
    };

    const handleSaveDraft = () => {
        const updatedFormData = {
            ...formData,
            area_sqm: formData.area_sqm || formData.area || "",
        };
        saveDraft({
            formData: updatedFormData,
            features,
            bedrooms,
            bathrooms,
            photos,
        });
        persistDraft();
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
    };

    const handleDone = (path) => {
        clearPersistedDraft();
        setPhase("idle");
        navigate(path);
    };

    return (
        <div className="add-property-page" dir="rtl">
            <div className="edit-page-inner">
                {/* 1) رأس الصفحة */}
                <header className="ap-header">
                    <h1>إضافة عقار جديد</h1>
                    <p>أدخل تفاصيل العقار لنشره على المنصة</p>
                </header>

                {/* 2) شريط الخطوات */}
                <div className="ap-stepper pv-stepper">
                    <div className="ap-step">
                        <span className="ap-step-icon"><FiInfo size={12} /></span>
                        <span className="ap-step-label">المعلومات الأساسية</span>
                    </div>
                    <span className="ap-step-line" />
                    <div className="ap-step">
                        <span className="ap-step-icon"><FiImage size={12} /></span>
                        <span className="ap-step-label">الصور والوسائط</span>
                    </div>
                    <span className="ap-step-line" />
                    <div className="ap-step">
                        <span className="ap-step-icon active"><span className="ap-step-dot" /></span>
                        <span className="ap-step-label active">معاينة الاعلان</span>
                    </div>
                </div>

                <div className="edit-grid">
                    {/* Sidebar: الصور والحالة والأزرار */}
                    <aside className="edit-sidebar">
                        <div>
                            <div className="edit-photos-head">
                                <h2>صور العقار</h2>
                            </div>

                            {photoUrls.length > 0 && (
                                <div className="edit-main-photo">
                                    <img src={photoUrls[0]} alt="صورة العقار الرئيسية" />
                                    <span className="edit-main-photo-badge">الصورة الرئيسية</span>
                                </div>
                            )}

                            {photoUrls.length > 1 && (
                                <div className="edit-photo-grid">
                                    {photoUrls.slice(1).map((src, i) => (
                                        <div className="edit-photo-item" key={i}>
                                            <img src={src} alt={`صورة الفرعية ${i + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {photoUrls.length === 0 && (
                                <div className="pv-empty">لم يتم إضافة صور بعد</div>
                            )}
                        </div>

                        {/* الأزرار */}
                        <div className="edit-actions">
                            <button type="button" className="submit-btn" onClick={handlePublish}>نشر الإعلان</button>
                            <button type="button" className="cancel-btn" onClick={handleSaveDraft}>حفظ كمسودة</button>
                        </div>
                    </aside>

                    {/* البيانات */}
                    <div className="edit-form">
                        <section>
                            <h2>المعلومات الأساسية</h2>
                            <div className="edit-form-grid cols-2">
                                <Field label="عنوان العقار" full>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title || ""}
                                        onChange={handleChange}
                                    />
                                </Field>
                                <Field label="سعر الإيجار (دولار)">
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price || ""}
                                        onChange={handleChange}
                                    />
                                </Field>
                                <Field label="نوع العقار">
                                    <select name="type" value={formData.type || "apartment"} onChange={handleChange}>
                                        <option value="apartment">شقة</option>
                                        <option value="villa">فيلا</option>
                                        <option value="land">قطعة أرض</option>
                                        <option value="store_room">حاصل</option>
                                        <option value="shop">محل تجاري</option>
                                        <option value="barracks">بركس</option>
                                    </select>
                                </Field>
                            </div>
                        </section>

                        <section>
                            <h2>الموقع والمساحة</h2>
                            <div className="edit-form-grid cols-3">
                                <Field label="غرف النوم">
                                    <div className="edit-counter">
                                        <button type="button" onClick={() => setBedrooms((v) => v + 1)} aria-label="زيادة">
                                            <PlusIcon />
                                        </button>
                                        <span>{bedrooms}</span>
                                        <button type="button" onClick={() => setBedrooms((v) => Math.max(0, v - 1))} aria-label="إنقاص">
                                            <MinusIcon />
                                        </button>
                                    </div>
                                </Field>
                                <Field label="الطابق">
                                    <input
                                        type="number"
                                        name="floor"
                                        value={formData.floor || ""}
                                        onChange={handleChange}
                                        placeholder="مثال: 15"
                                    />
                                </Field>
                                <Field label="الحمامات">
                                    <div className="edit-counter">
                                        <button type="button" onClick={() => setBathrooms((v) => v + 1)} aria-label="زيادة">
                                            <PlusIcon />
                                        </button>
                                        <span>{bathrooms}</span>
                                        <button type="button" onClick={() => setBathrooms((v) => Math.max(0, v - 1))} aria-label="إنقاص">
                                            <MinusIcon />
                                        </button>
                                    </div>
                                </Field>
                                <Field label="المحافظة">
                                    <select name="governorate" value={formData.governorate || "gaza"} onChange={handleChange}>
                                        <option value="north_gaza">شمال غزة</option>
                                        <option value="gaza">غزة</option>
                                        <option value="middle_gaza">وسط غزة</option>
                                        <option value="khan_younis">خانيونس</option>
                                        <option value="rafah">رفح</option>
                                    </select>
                                </Field>
                                <Field label="المنطقة">
                                    <input
                                        type="text"
                                        name="region"
                                        value={formData.region || ""}
                                        onChange={handleChange}
                                        placeholder="مثال: الرمال"
                                    />
                                </Field>
                                <Field label="المساحة (م²)">
                                    <input
                                        type="number"
                                        name="area"
                                        value={formData.area || ""}
                                        onChange={handleChange}
                                        placeholder="مثال: 120"
                                    />
                                </Field>
                            </div>
                        </section>

                        <section>
                            <h2>الوصف</h2>
                            <textarea
                                rows={4}
                                name="description"
                                value={formData.description || ""}
                                onChange={handleChange}
                                placeholder="اكتب وصفاً تفصيلياً للعقار..."
                            />
                        </section>

                        <section>
                            <h2>مميزات العقار</h2>
                            <div className="edit-features-grid">
                                {Object.keys(FEATURE_LABELS).map((key) => (
                                    <label className="edit-checkbox" key={key}>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(features[key])}
                                            onChange={() => toggleFeature(key)}
                                        />
                                        <span>{FEATURE_LABELS[key]}</span>
                                    </label>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* نافذة جاري النشر */}
            {phase === "loading" && (
                <div className="modal-overlay">
                    <div className="pv-modal">
                        <span className="pv-spinner"><FiRefreshCw size={26} /></span>
                        <h3>جاري نشر العقار...</h3>
                        <p>يرجى الانتظار بينما نقوم برفع الصور وحفظ بيانات العقار، قد يستغرق هذا بضع ثوانٍ.</p>
                    </div>
                </div>
            )}

            {/* نافذة تم النشر بنجاح */}
            {phase === "success" && (
                <div className="modal-overlay">
                    <div className="pv-modal">
                        <span className="pv-check"><CheckCircleIcon /></span>
                        <h3>تم نشر العقار بنجاح</h3>
                        <p>تم إضافة عقارك إلى المنصة وهو الآن متاح للباحثين عن عقارات.</p>
                        <div className="pv-modal-actions">
                            <button type="button" className="submit-btn" onClick={() => handleDone("/home-owner")}>
                                عرض إعلان العقار
                            </button>
                            <button type="button" className="pv-secondary" onClick={() => handleDone("/home-owner")}>
                                العودة للرئيسية ←
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* نافذة فشل النشر */}
            {phase === "idle" && publishError && (
                <div className="modal-overlay">
                    <div className="pv-modal">
                        <span className="pv-error"><FiAlertCircle size={26} /></span>
                        <h3>تعذر نشر العقار</h3>
                        <p>{publishError}</p>
                        <div className="pv-modal-actions">
                            <button type="button" className="submit-btn" onClick={handlePublish}>
                                إعادة المحاولة
                            </button>
                            <button type="button" className="pv-secondary" onClick={() => setPublishError("")}>
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* تنبيه الحفظ كمسودة */}
            {showToast && <div className="pv-toast">تم حفظ الإعلان كمسودة</div>}
        </div>
    );
}