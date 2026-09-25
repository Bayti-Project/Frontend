import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiInfo, FiImage, FiEye, FiUploadCloud, FiAlertCircle, FiFile, FiCheck, FiX } from "react-icons/fi";
import { saveDraft } from "../state/addPropertyDraft";
import "../AddPropertyPage/AddPropertyPage.css";
import "./AddPropertyPhotosPage.css";

const SAMPLE_THUMB = "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=100&q=80";

/* ---------- المكون الرئيسي: الخطوة 2 (الصور والوسائط) ---------- */
export default function AddPropertyPhotosPage() {
    const navigate = useNavigate();
    const [uploads, setUploads] = useState([]);
    const timersRef = useRef({});
    const progressRef = useRef({});

    const addFiles = (e) => {
        const files = Array.from(e.target.files || []);
        files.forEach((file, i) => {
            const id = `upload-${Date.now()}-${Math.random()}`;
            const url = URL.createObjectURL(file);
            const name = file.name || (i === 0 ? "living_room_01.jpg" : `upload_${i}.jpg`);

            setUploads((prev) => [...prev, { id, name, url, file, progress: 0, done: false }]);

            const timer = setInterval(() => {
                const current = progressRef.current[id] ?? 0;
                const next = Math.min(100, current + 12);
                progressRef.current[id] = next;
                setUploads((prev) =>
                    prev.map((u) => (u.id === id ? { ...u, progress: next, done: next >= 100 } : u))
                );
                if (next >= 100) {
                    clearInterval(timer);
                    delete timersRef.current[id];
                }
            }, 180);
            timersRef.current[id] = timer;
        });
        e.target.value = "";
    };

    const removeItem = (id) => {
        if (timersRef.current[id]) {
            clearInterval(timersRef.current[id]);
            delete timersRef.current[id];
        }
        delete progressRef.current[id];
        setUploads((prev) => prev.filter((u) => u.id !== id));
    };

    const canProceed = uploads.length > 0 && uploads.some((u) => u.done);

    const handleNext = () => {
        saveDraft({
            photos: uploads.filter((u) => u.done).map((u) => ({ url: u.url, file: u.file })),
        });
        navigate("/add-property/preview");
    };

    return (
        <div className="add-property-photos-page" dir="rtl">
            <div className="ph-inner">
                {/* 1) رأس الصفحة */}
                <header className="ap-header">
                    <h1>إضافة عقار جديد</h1>
                    <p>أدخل تفاصيل العقار لنشره على المنصة</p>
                </header>

                {/* 2) شريط الخطوات */}
                <div className="ap-stepper">
                    <div className="ap-step">
                        <span className="ap-step-icon"><FiInfo size={12} /></span>
                        <span className="ap-step-label">المعلومات الأساسية</span>
                    </div>
                    <span className="ap-step-line" />
                    <div className="ap-step">
                        <span className="ap-step-icon active"><span className="ap-step-dot" /></span>
                        <span className="ap-step-label active">الصور والوسائط</span>
                    </div>
                    <span className="ap-step-line" />
                    <div className="ap-step">
                        <span className="ap-step-icon"><FiEye size={12} /></span>
                        <span className="ap-step-label">معاينة الاعلان</span>
                    </div>
                </div>

                {/* 3) قسم الصور */}
                <section className="ph-section">
                    <div className="ph-section-head">
                        <h2>صور العقار</h2>
                        <FiImage size={16} />
                    </div>
                    <div className="ph-section-divider" />

                    {/* 4) صندوق السحب والإفلات */}
                    <label className="ph-dropzone">
                        <FiUploadCloud className="ph-dropzone-cloud" size={28} />
                        <span className="ph-dropzone-title">اسحب وأفلت الصور هنا</span>
                        <span className="ph-dropzone-hint">أو انقر لاختيار ملفات (JPG, PNG)</span>
                        <span className="ph-dropzone-btn">اختيار الملفات</span>
                        <input type="file" multiple accept="image/*" hidden onChange={addFiles} />
                    </label>

                    {/* 5) صفوف تقدم الرفع */}
                    {uploads.length > 0 && (
                        <div className="ph-upload-list">
                            {uploads.map((u) => (
                                <div key={u.id} className={`ph-upload-item${u.done ? " done" : ""}`}>
                                    <img className="ph-upload-thumb" src={u.url || SAMPLE_THUMB} alt={u.name} />
                                    <span className="ph-upload-filename">{u.name}</span>

                                    {!u.done ? (
                                        <div className="ph-upload-progress">
                                            <span className="ph-upload-percent">{u.progress}%</span>
                                            <div className="ph-upload-bar">
                                                <div className="ph-upload-fill" style={{ width: `${u.progress}%` }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="ph-upload-done-check"><FiCheck size={14} /> تم الرفع</span>
                                    )}

                                    {u.done ? (
                                        <button
                                            type="button"
                                            className="ph-upload-delete"
                                            onClick={() => removeItem(u.id)}
                                            aria-label="حذف الصورة"
                                        >
                                            <FiX size={12} />
                                        </button>
                                    ) : (
                                        <span className="ph-upload-file-icon"><FiFile size={10} /></span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 6) صندوق تنبيه الخطأ */}
                    {uploads.length === 0 && (
                        <div className="ph-error">
                            <div className="ph-error-title"><FiAlertCircle size={16} /> يجب إضافة صورة واحدة على الأقل للعقار</div>
                            <div className="ph-error-sub">يرجى تحميل صور العقار لإكمال عملية الإضافة بنجاح.</div>
                        </div>
                    )}

                    {/* 7) زر الإجراء */}
                    <div className="ph-actions">
                        <button type="button" className="ph-next" disabled={!canProceed} onClick={handleNext}>التالي</button>
                    </div>
                </section>
            </div>
        </div>
    );
}