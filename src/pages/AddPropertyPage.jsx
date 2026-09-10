import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
            <line x1="8" y1="13" x2="16" y2="13" />
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

function CameraIcon({ size = 13 }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" width={size} height={size} stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
        </svg>
    );
}

function PersonIcon({ size = 13 }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" width={size} height={size} stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
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

/* ---------- المكون الرئيسي ---------- */
export default function AddPropertyPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        price: "",
        type: "شقة",
        governorate: "غزة",
        region: "",
        area: "",
        floor: "",
        description: "",
    });
    const [touched, setTouched] = useState({});
    const [bedrooms, setBedrooms] = useState(2);
    const [bathrooms, setBathrooms] = useState(2);
    const [features, setFeatures] = useState({
        sharedPool: false,   // مسبح مشترك
        parking: false,      // موقف سيارات
        balcony: true,       // شرفة / تهوية
        garden: false,       // حديقة
        centralAC: true,     // تكييف مركزي
        gym: false,          // صالة رياضية
    });

    const toggleFeature = (key) => {
        setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    const isEmpty = (name) => !String(formData[name] ?? "").trim();

    const showError = (name) => touched[name] && isEmpty(name);

    const canProceed =
        Object.keys(formData).every((k) => !isEmpty(k)) &&
        bedrooms > 0 &&
        bathrooms > 0;

    const handleNext = () => {
        setTouched(Object.fromEntries(Object.keys(formData).map((k) => [k, true])));
        if (canProceed) {
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

                {/* 2) شريط الخطوات */}
                <div className="ap-stepper">
                    <div className="ap-step">
                        <span className="ap-step-icon active"><span className="ap-step-dot" /></span>
                        <span className="ap-step-label active">المعلومات الأساسية</span>
                    </div>
                    <span className="ap-step-line" />
                    <div className="ap-step">
                        <span className="ap-step-icon"><CameraIcon /></span>
                        <span className="ap-step-label">الصور والوسائط</span>
                    </div>
                    <span className="ap-step-line" />
                    <div className="ap-step">
                        <span className="ap-step-icon"><PersonIcon /></span>
                        <span className="ap-step-label">معاينة الاعلان</span>
                    </div>
                </div>

                <form className="ap-form" noValidate>
                    {/* 3) المحتويات الأساسية */}
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
                                    <span className="ap-unit">دولار</span>
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
                                    >
                                        <option value="شقة">شقة</option>
                                        <option value="فيلا">فيلا</option>
                                        <option value="أرض">أرض</option>
                                        <option value="مكتب">مكتب</option>
                                    </select>
                                    <ChevronDownIcon />
                                </div>
                                {showError("type") && <span className="ap-hint"><AlertCircleIcon /> يرجى اختيار نوع العقار</span>}
                            </div>
                        </div>
                    </section>

                    {/* 4) الموقع والمساحة */}
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
                                    >
                                        <option value="غزة">غزة</option>
                                        <option value="خان يونس">خان يونس</option>
                                        <option value="رفح">رفح</option>
                                        <option value="الوسطى">الوسطى</option>
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
                                <input
                                    type="number"
                                    name="area"
                                    className={showError("area") ? "error" : ""}
                                    placeholder="1230"
                                    value={formData.area}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
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
                                {touched.bedrooms && bedrooms <= 0 && <span className="ap-hint"><AlertCircleIcon /> يرجى اختيار عدد غرف النوم</span>}
                            </div>

                            <div className="ap-field">
                                <label>الحمامات</label>
                                <div className="ap-stepper-control">
                                    <button type="button" onClick={() => setBathrooms((v) => Math.max(0, v - 1))}><MinusIcon /></button>
                                    <span className="value">{bathrooms}</span>
                                    <button type="button" className="plus" onClick={() => setBathrooms((v) => v + 1)}><PlusIcon /></button>
                                </div>
                                {touched.bathrooms && bathrooms <= 0 && <span className="ap-hint"><AlertCircleIcon /> يرجى اختيار عدد الحمامات</span>}
                            </div>

                            <div className="ap-field">
                                <label>الطابق</label>
                                <input
                                    type="number"
                                    name="floor"
                                    className={showError("floor") ? "error" : ""}
                                    placeholder="مثال: 15"
                                    value={formData.floor}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                {showError("floor") && <span className="ap-hint"><AlertCircleIcon /> يرجى ادخال الطابق</span>}
                            </div>
                        </div>
                    </section>

                    {/* 5) الوصف والمرفقات */}
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
                                    <input type="checkbox" checked={features.garden} onChange={() => toggleFeature("garden")} />
                                    حديقة
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
                    </section>
                </form>

                {/* 6) صندوق تنبيه الخطأ */}
                {Object.keys(touched).some((k) => isEmpty(k)) && (
                    <div className="ap-error-banner">
                        <div className="ap-error-title"><AlertCircleIcon size={16} /> تعذر حفظ العقار</div>
                        <div className="ap-error-sub">يرجى مراجعة الحقول المحددة باللون الأحمر وتصحيح الأخطاء قبل المحاولة مرة أخرى.</div>
                    </div>
                )}

                {/* زر التالي */}
                <button type="button" className="ap-next-btn" onClick={handleNext} disabled={!canProceed}>التالي</button>
            </div>
        </div>
    );
}