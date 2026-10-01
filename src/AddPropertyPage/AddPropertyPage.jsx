import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiImage, FiEye } from "react-icons/fi";
import { saveDraft, loadPersistedDraft, clearPersistedDraft } from "../state/addPropertyDraft";
import "./AddPropertyPage.css";

/* ---------- الأيقونات ---------- */
function InfoCircleIcon({ size = 14 }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" width={size} height={size} stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
    );
}

function DocIcon({ size = 14 }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" width={size} height={size} stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <line x1="8" y1="13" x2="16" y2="17" />
            <line x1="8" y1="17" x2="16" y2="17" />
        </svg>
    );
}

function AlertCircleIcon({ size = 12 }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" width={size} height={size} stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}

function ChevronDownIcon({ size = 14 }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" width={size} height={size} stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

function PlusIcon({ size = 14 }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" width={size} height={size} stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
        </svg>
    );
}

function MinusIcon({ size = 14 }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" width={size} height={size} stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14" />
        </svg>
    );
}

const initialFeatures = {
    sharedPool: false,
    parking: false,
    balcony: true,
    centralAC: true,
    gym: false,
    main_grid: false,
    solar: false,
    generator: false,
    tank: false,
    well: false,
    Interested: false,
};

const initialFormData = {
    title: "",
    price: "",
    type: "apartment",
    governorate: "gaza",
    region: "",
    area: "",
    area_sqm: "",
    floor: "",
    description: "",
};

/* ---------- المكون الرئيسي ---------- */
export default function AddPropertyPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormData);
    const [touched, setTouched] = useState({});
    const [bedrooms, setBedrooms] = useState(2);
    const [bathrooms, setBathrooms] = useState(2);
    const [features, setFeatures] = useState(initialFeatures);
    const [restored, setRestored] = useState(false);

    // استرجاع مسودة محفوظة عند فتح الصفحة
    useEffect(() => {
        const saved = loadPersistedDraft();
        if (saved && Object.keys(saved.formData || {}).length) {
            const savedArea = saved.formData.area_sqm || saved.formData.area || "";
            setFormData({
                ...saved.formData,
                area: saved.formData.area || savedArea,
                area_sqm: savedArea,
            });
            setBedrooms(saved.bedrooms ?? 2);
            setBathrooms(saved.bathrooms ?? 2);
            setFeatures((prev) => ({ ...prev, ...saved.features }));
            setRestored(true);
        }
    }, []);

    const discardDraft = () => {
        clearPersistedDraft();
        setFormData(initialFormData);
        setTouched({});
        setBedrooms(2);
        setBathrooms(2);
        setFeatures(initialFeatures);
        setRestored(false);
    };

    const toggleFeature = (key) => {
        setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
    };

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

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    const isEmpty = (val) => !String(val ?? "").trim();
    const showError = (name) => touched[name] && isEmpty(formData[name]);

    // تحديد الحقول المطلوبة الأساسية (استثناء الطابق في حال لم يكن إجبارياً لجميع الأنواع)
    const requiredFields = ["title", "price", "type", "governorate", "region", "area", "description"];

    const isFormValid = () => {
        const areRequiredFieldsFilled = requiredFields.every((field) => !isEmpty(formData[field]));
        const isBedroomsValid = formData.type === "land" || bedrooms >= 0;
        const isBathroomsValid = formData.type === "land" || bathrooms >= 0;
        return areRequiredFieldsFilled && isBedroomsValid && isBathroomsValid;
    };

    const handleNext = () => {
        const allTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});

        setTouched({ ...allTouched, bedrooms: true, bathrooms: true });

        if (isFormValid()) {
            const updatedFormData = {
                ...formData,
                area_sqm: formData.area_sqm || formData.area,
            };
            saveDraft({ formData: updatedFormData, features, bedrooms, bathrooms });
            navigate("/add-property/photos");
        }
    };

    return (
        <div className="add-property-page" dir="rtl">
            <div className="ap-inner">
                {/* 1) رأس الصفحة */}
                <header className="ap-header">
                    <h1>إضافة عقار جديد</h1>
                    <p>أدخل تفاصيل العقار لنشره على المنصة</p>
                </header>

                {/* 2) تنبيه المسودة المحفوظة */}
                {restored && (
                    <div className="ap-draft-banner">
                        <div className="ap-draft-text">
                            <AlertCircleIcon size={12} />
                            تم استرجاع مسودة محفوظة. يمكنك المتابعة من حيث توقفت.
                        </div>
                        <div className="ap-draft-actions">
                            <button type="button" onClick={() => setRestored(false)}>متابعة التحرير</button>
                            <button type="button" onClick={discardDraft}>حذف المسودة</button>
                        </div>
                    </div>
                )}

                {/* 3) شريط الخطوات */}
                <div className="ap-stepper">
                    <div className="ap-step">
                        <span className="ap-step-icon active"><span className="ap-step-dot" /></span>
                        <span className="ap-step-label active">المعلومات الأساسية</span>
                    </div>
                    <span className="ap-step-line" />
                    <div className="ap-step">
                        <span className="ap-step-icon"><FiImage size={12} /></span>
                        <span className="ap-step-label">الصور والوسائط</span>
                    </div>
                    <span className="ap-step-line" />
                    <div className="ap-step">
                        <span className="ap-step-icon"><FiEye size={12} /></span>
                        <span className="ap-step-label">معاينة الاعلان</span>
                    </div>
                </div>

                <form className="ap-form" noValidate onSubmit={(e) => e.preventDefault()}>
                    {/* المحتويات الأساسية */}
                    <section>
                        <div className="ap-section-head">
                            <h2>المحتويات الأساسية</h2>
                            <InfoCircleIcon />
                        </div>
                        <div className="ap-section-divider" />

                        <div className="ap-field">
                            <label>عنوان العقار</label>
                            <input
                                type="text"
                                name="title"
                                className={showError("title") ? "error" : ""}
                                placeholder="مثل: شقة فاخرة بموقع مميز"
                                value={formData.title}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                            {showError("title") && <span className="ap-hint"><AlertCircleIcon /> يرجى ادخال عنوان العقار</span>}
                        </div>

                        <div className="ap-row" style={{ marginTop: 16 }}>
                            <div className="ap-field">
                                <label>سعر الإيجار الشهرية</label>
                                <div className={`ap-input-wrap ${showError("price") ? "error" : ""}`}>
                                    <input
                                        type="number"
                                        name="price"
                                        className={showError("price") ? "error" : ""}
                                        placeholder="1000"
                                        value={formData.price}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    <span className="ap-unit">شيكل</span>
                                </div>
                                {showError("price") && <span className="ap-hint"><AlertCircleIcon /> يرجى ادخال السعر</span>}
                            </div>

                            <div className="ap-field">
                                <label>نوع العقار</label>
                                <div className={`ap-select-wrap ${showError("type") ? "error" : ""}`}>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={showError("type") ? "input-error" : ""}
                                    >
                                        <option value="apartment">شقة</option>
                                        <option value="villa">فيلا</option>
                                        <option value="land">قطعة أرض</option>
                                        <option value="store_room">حاصل</option>
                                        <option value="shop">محل تجاري</option>
                                        <option value="barracks">بركس</option>
                                    </select>
                                    <ChevronDownIcon />
                                </div>
                                {showError("type") && <span className="ap-hint"><AlertCircleIcon /> يرجى اختيار نوع العقار</span>}
                            </div>
                        </div>
                    </section>

                    {/* الموقع والمساحة */}
                    <section>
                        <div className="ap-section-head">
                            <h2>الموقع والمساحة</h2>
                            <InfoCircleIcon />
                        </div>
                        <div className="ap-section-divider" />

                        <div className="ap-row">
                            <div className="ap-field">
                                <label>المحافظة</label>
                                <div className={`ap-select-wrap ${showError("governorate") ? "error" : ""}`}>
                                    <select
                                        name="governorate"
                                        value={formData.governorate}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={showError("governorate") ? "input-error" : ""}
                                    >
                                        <option value="north_gaza">شمال غزة</option>
                                        <option value="gaza">غزة</option>
                                        <option value="middle_gaza">وسط غزة</option>
                                        <option value="khan_younis">خانيونس</option>
                                        <option value="rafah">رفح</option>
                                    </select>
                                    <ChevronDownIcon />
                                </div>
                                {showError("governorate") && <span className="ap-hint"><AlertCircleIcon /> يرجى اختيار المحافظة</span>}
                            </div>

                            <div className="ap-field">
                                <label>المنطقة</label>
                                <input
                                    type="text"
                                    name="region"
                                    className={showError("region") ? "error" : ""}
                                    placeholder="مثال: الرمال"
                                    value={formData.region}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                {showError("region") && <span className="ap-hint"><AlertCircleIcon /> يرجى ادخال المنطقة</span>}
                            </div>

                            <div className="ap-field">
                                <label>المساحة</label>
                                <div className={`ap-input-wrap ${showError("area") ? "error" : ""}`}>
                                    <input
                                        type="number"
                                        name="area"
                                        className={showError("area") ? "error" : ""}
                                        placeholder="120"
                                        value={formData.area}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    <span className="ap-unit">م²</span>
                                </div>
                                {showError("area") && <span className="ap-hint"><AlertCircleIcon /> يرجى ادخال المساحة</span>}
                            </div>
                        </div>

                        <div className="ap-row" style={{ marginTop: 16 }}>
                            <div className="ap-field">
                                <label>غرف النوم</label>
                                <div className="ap-stepper-control">
                                    <button type="button" onClick={() => setBedrooms((v) => Math.max(0, v - 1))}><MinusIcon /></button>
                                    <span className="value">{bedrooms}</span>
                                    <button type="button" className="plus" onClick={() => setBedrooms((v) => v + 1)}><PlusIcon /></button>
                                </div>
                            </div>

                            <div className="ap-field">
                                <label>الحمامات</label>
                                <div className="ap-stepper-control">
                                    <button type="button" onClick={() => setBathrooms((v) => Math.max(0, v - 1))}><MinusIcon /></button>
                                    <span className="value">{bathrooms}</span>
                                    <button type="button" className="plus" onClick={() => setBathrooms((v) => v + 1)}><PlusIcon /></button>
                                </div>
                            </div>

                            <div className="ap-field">
                                <label>الطابق (اختياري)</label>
                                <input
                                    type="number"
                                    name="floor"
                                    placeholder="مثال: 3"
                                    value={formData.floor}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </div>
                        </div>
                    </section>

                    {/* الوصف والمرفقات */}
                    <section>
                        <div className="ap-section-head">
                            <h2>الوصف والمرفقات</h2>
                            <DocIcon />
                        </div>
                        <div className="ap-section-divider" />

                        <div className="ap-field">
                            <label>وصف العقار</label>
                            <textarea
                                name="description"
                                className={showError("description") ? "error" : ""}
                                placeholder="اكتب وصفاً تفصيلياً للعقار وميزاته"
                                value={formData.description}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                            {showError("description") && <span className="ap-hint"><AlertCircleIcon /> يرجى ادخال الوصف</span>}
                        </div>

                        <div className="ap-features">
                            <h3>ميزات العقار</h3>
                            <div className="ap-features-grid">
                                <label className="ap-checkbox">
                                    <input type="checkbox" checked={features.sharedPool} onChange={() => toggleFeature("sharedPool")} />
                                    مسبح مشترك
                                </label>
                                <label className="ap-checkbox">
                                    <input type="checkbox" checked={features.parking} onChange={() => toggleFeature("parking")} />
                                    موقف سيارات
                                </label>
                                <label className="ap-checkbox">
                                    <input type="checkbox" checked={features.balcony} onChange={() => toggleFeature("balcony")} />
                                    شرفة / تهوية
                                </label>
                                <label className="ap-checkbox">
                                    <input type="checkbox" checked={features.centralAC} onChange={() => toggleFeature("centralAC")} />
                                    تكييف مركزي
                                </label>
                                <label className="ap-checkbox">
                                    <input type="checkbox" checked={features.gym} onChange={() => toggleFeature("gym")} />
                                    صالة رياضية
                                </label>
                            </div>
                        </div>

                        <div className="ap-features">
                            <h4>الكهرباء</h4>
                            <div className="ap-features-grid">
                                <label className="ap-checkbox">
                                    <input type="checkbox" checked={features.main_grid} onChange={() => toggleFeature("main_grid")} />
                                    الكهرباء العامة
                                </label>
                                <label className="ap-checkbox">
                                    <input type="checkbox" checked={features.solar} onChange={() => toggleFeature("solar")} />
                                    طاقة شمسية
                                </label>
                                <label className="ap-checkbox">
                                    <input type="checkbox" checked={features.generator} onChange={() => toggleFeature("generator")} />
                                    مولد كهربائي
                                </label>
                            </div>
                        </div>

                        <div className="ap-features">
                            <h4>المياه</h4>
                            <div className="ap-features-grid">
                                <label className="ap-checkbox">
                                    <input type="checkbox" checked={features.tank} onChange={() => toggleFeature("tank")} />
                                    خزان
                                </label>
                                <label className="ap-checkbox">
                                    <input type="checkbox" checked={features.well} onChange={() => toggleFeature("well")} />
                                    بئر
                                </label>
                            </div>
                        </div>

                        <div className="ap-features">
                            <h3>تفعيل معلومات التواصل</h3>
                            <div className="ap-features-grid">
                                <label className="ap-checkbox">
                                    <input type="checkbox" checked={features.Interested} onChange={() => toggleFeature("Interested")} />
                                    أنا مهتم (في حال تم تفعيل هذا الخيار سوف يتم إخفاء معلومات تواصلك إلا بموافقتك)
                                </label>
                            </div>
                        </div>
                    </section>
                </form>

                {/* 6) صندوق تنبيه الخطأ عند المحاولة وكان هناك حقول فارغة */}
                {Object.keys(touched).length > 0 && !isFormValid() && (
                    <div className="ap-error-banner">
                        <div className="ap-error-title"><AlertCircleIcon size={16} /> تعذر حفظ العقار</div>
                        <div className="ap-error-sub">يرجى مراجعة الحقول المحددة باللون الأحمر وتصحيح الأخطاء قبل المحاولة مرة أخرى.</div>
                    </div>
                )}

                {/* زر التالي */}
                <button type="button" className="ap-next-btn" onClick={handleNext}>
                    التالي
                </button>
            </div>
        </div>
    );
}