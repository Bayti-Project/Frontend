import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, resolveMediaUrl, GOVERNORATE_OPTIONS } from "../services/api";
import { useSaved, toggleSaved } from "../state/savedProperties";
import "./OwnerHome.css";
import containerImg from "./Container.jpg";

// Icons
function BookmarkIcon({ filled = false }) {
    return (
        <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} width="16" height="16">
            <path d="M6 4h12v16l-6-4-6 4V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
    );
}
function PinIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" width="13" height="13">
            <path d="M12 21s7-6.5 7-11.5a7 7 0 1 0-14 0C5 14.5 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <circle cx="12" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
        </svg>
    );
}
function AreaIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
            <path d="M4 15V4h11M20 9v11H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
function BathIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
            <path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2Z" stroke="currentColor" strokeWidth="1.6" />
            <path d="M7 12V6a2 2 0 0 1 3.6-1.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M4 19h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}
function BedIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
            <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18v2M21 18v2M3 12V8h6v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
function FilterIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
            <path d="M4 6h7M15 6h5M4 12h11M19 12h1M4 18h7M15 18h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12.5" cy="6" r="2" fill="#fff" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="16" cy="12" r="2" fill="#fff" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="10.5" cy="18" r="2" fill="#fff" stroke="currentColor" strokeWidth="1.6" />
        </svg>
    );
}
function SearchIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}
function EditIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
            <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
    );
}
function TrashIcon({ color = "#fff" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
            <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
function PlusIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
            <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}
function WarnIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
            <path d="M12 9v4m0 4h.01M10.3 3.9 2.6 17a1.8 1.8 0 0 0 1.5 2.7h15.8A1.8 1.8 0 0 0 21.4 17L13.7 3.9a1.8 1.8 0 0 0-3.4 0Z" stroke="#E5484D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
function CheckIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
            <circle cx="12" cy="12" r="10" stroke="#34C6C6" strokeWidth="1.6" />
            <path d="m8 12.5 2.5 2.5L16 9.5" stroke="#34C6C6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

const STATUS_LABELS = { available: "متاح", reserved: "محجوز", rented: "مؤجر" };
const STATUS_KEYS = Object.keys(STATUS_LABELS);

// الـ Backend يقبل رقماً فقط ل bedrooms، لذلك لا قيم مثل "4+"
const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];

function getPropertyImage(p) {
    if (typeof p.image === "string" && p.image) return p.image;
    if (typeof p.thumbnail === "string" && p.thumbnail) return p.thumbnail;
    if (Array.isArray(p.images) && p.images.length) {
        const first = p.images[0];
        if (typeof first === "string") return first;
        if (first && typeof first.image === "string") return first.image;
    }
    return "";
}

function handleImageError(e) {
    e.currentTarget.onerror = null;
    e.currentTarget.src = containerImg;
}

export default function OwnerHome() {
    const navigate = useNavigate();
    const savedItems = useSaved();
    const savedIds = new Set(savedItems.map((s) => String(s.id)));
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");
    const [search, setSearch] = useState("");
    const [governorate, setGovernorate] = useState("");
    const [bedrooms, setBedrooms] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);

    const [pendingDelete, setPendingDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const toastTimerRef = useRef(null);

    // ─── 1. جلب العقارات ───
    const fetchOwnerProperties = useCallback(async () => {
        setLoading(true);
        setFetchError("");
        try {
            const queryParams = new URLSearchParams();
            if (search.trim()) queryParams.append("search", search.trim());
            if (governorate) queryParams.append("governorate", governorate);
            if (bedrooms) queryParams.append("bedrooms", bedrooms);

            const queryString = queryParams.toString();
            const endpoint = `/api/properties/mine/${queryString ? `?${queryString}` : ""}`;

            const res = await apiFetch(endpoint);
            if (!res.ok) throw new Error("فشل جلب العقارات الخاصّة بك");

            const data = await res.json();
            setProperties(data.results || data);
        } catch (err) {
            const isNetworkError = !err || !err.message || err.message === "Failed to fetch" || /network|fetch|load/i.test(err.message);
            setFetchError(
                isNetworkError
                    ? "تعذر الاتصال بالخادم. تأكد من اتصالك بالإنترنت ثم أعد المحاولة."
                    : err.message || "حدث خطأ أثناء تحميل البيانات"
            );
        } finally {
            setLoading(false);
        }
    }, [search, governorate, bedrooms]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOwnerProperties();
        }, 400);
        return () => clearTimeout(timer);
    }, [fetchOwnerProperties]);

    // ─── 2. حذف العقار ───
    const askDelete = (property) => {
        setPendingDelete(property);
        setDeleteError("");
    };

    const cancelDelete = () => {
        setPendingDelete(null);
        setDeleteError("");
    };

    const confirmDelete = async () => {
        const deleted = pendingDelete;
        if (!deleted) return;

        setIsDeleting(true);
        setDeleteError("");

        try {
            const res = await apiFetch(`/api/properties/${deleted.id}/`, { method: "DELETE" });
            if (!res.ok && res.status !== 204) {
                if (res.status === 403) throw new Error("ليس لديك صلاحية حذف هذا العقار");
                if (res.status === 404) throw new Error("العقار غير موجود أصلًا");
                throw new Error("فشل حذف العقار، يرجى المحاولة لاحقاً");
            }

            setProperties((prev) => prev.filter((p) => p.id !== deleted.id));
            setPendingDelete(null);
            setToast(deleted);

            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            toastTimerRef.current = setTimeout(() => setToast(null), 4000);
        } catch (err) {
            setDeleteError(err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    // ─── 3. تغيير حالة العقار ───
    const handleStatusChange = async (property, newStatus) => {
        const prevStatus = property.status;
        setProperties((prev) =>
            prev.map((p) => (p.id === property.id ? { ...p, status: newStatus } : p))
        );

        try {
            const res = await apiFetch(`/api/properties/${property.id}/`, {
                method: "PATCH",
                json: { status: newStatus },
            });
            if (!res.ok) throw new Error("فشل تحديث الحالة");
        } catch {
            // التراجع عن التعديل في حال فشل الطلب
            setProperties((prev) =>
                prev.map((p) => (p.id === property.id ? { ...p, status: prevStatus } : p))
            );
        }
    };

    return (
        <div className="owner-home">
            <div className="owner-home-inner">
                <div className="owner-title-row">
                    <div>
                        <h1>إدارة العقارات</h1>
                        <p>قم بإدارة عروضك العقارية، تتبع الأداء وحدث التفاصيل بسهولة</p>
                    </div>
                    <button className="submit-btn add-property-btn" onClick={() => navigate("/add-property")}>
                        <PlusIcon />
                        إضافة عقار
                    </button>
                </div>

                {/* ─── شريط البحث والفلترة ─── */}
                <div className="owner-search-row">
                    <div className="owner-search-box">
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="ادخل كلمة البحث هنا..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="icon-btn" aria-label="فلترة" onClick={() => setShowFilterModal(!showFilterModal)}>
                        <FilterIcon />
                    </button>
                </div>

                {/* ─── خيارات الفلترة المنسدلة ─── */}
                {showFilterModal && (
                    <div className="filter-panel" style={{ display: "flex", gap: "10px", margin: "10px 0", flexWrap: "wrap" }}>
                        <select value={governorate} onChange={(e) => setGovernorate(e.target.value)} style={{ padding: "8px", borderRadius: "6px" }}>
                            {GOVERNORATE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>

                        <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} style={{ padding: "8px", borderRadius: "6px" }}>
                            <option value="">عدد الغرف (الكل)</option>
                            {BEDROOM_OPTIONS.map((value) => (
                                <option key={value} value={value}>
                                    {value} غرف
                                </option>
                            ))}
                        </select>

                        {(governorate || bedrooms) && (
                            <button onClick={() => { setGovernorate(""); setBedrooms(""); }} style={{ padding: "8px 12px", background: "#f0f0f0", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                                مسح الفلاتر
                            </button>
                        )}
                    </div>
                )}

                {/* ─── عرض حالة الخطأ أو التحميل أو القائمة ─── */}
                {fetchError ? (
                    <div className="listing-empty" style={{ color: "#E5484D" }}>
                        {fetchError}
                        <div style={{ marginTop: 12 }}>
                            <button className="submit-btn" onClick={fetchOwnerProperties}>إعادة المحاولة</button>
                        </div>
                    </div>
                ) : loading ? (
                    <div className="listing-empty">جاري تحميل العقارات...</div>
                ) : (
                    <div className="owner-listings">
                        {properties.map((property) => {
                            const imgUrl = getPropertyImage(property)
                                ? resolveMediaUrl(getPropertyImage(property))
                                : containerImg;
                            return (
                                <div
                                    key={property.id}
                                    className="listing-card"
                                    onClick={() =>
                                        navigate(`/property-owner/${property.id}`, {
                                            state: { property },
                                        })
                                    }
                                >
                                    <div className="listing-image">
                                        <img src={imgUrl} alt={property.title || "صورة العقار"} onError={handleImageError} />
                                    </div>

                                    <div className="listing-body">
                                        <div>
                                            <div className="listing-top-row">
                                                <select
                                                    className={`status-select status-${property.status || "available"}`}
                                                    value={property.status || "available"}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => handleStatusChange(property, e.target.value)}
                                                >
                                                    {STATUS_KEYS.map((key) => (
                                                        <option key={key} value={key}>{STATUS_LABELS[key]}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    className={`listing-save-btn${savedIds.has(String(property.id)) ? " active" : ""}`}
                                                    type="button"
                                                    aria-label={savedIds.has(String(property.id)) ? "إزالة من المحفوظات" : "حفظ العقار"}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSaved(property);
                                                    }}
                                                >
                                                    <BookmarkIcon filled={savedIds.has(String(property.id))} />
                                                </button>
                                            </div>
                                            <h3>{property.title}</h3>
                                            <p className="listing-location">
                                                <PinIcon />
                                                {property.location || property.address || property.governorate}
                                            </p>
                                            <p className="listing-price">
                                                ₪{Number(property.price || 0).toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="listing-stats">

                                            <span>
                                                <BedIcon /> عدد الغرف {property.bedrooms || 0}
                                            </span>
                                            <span>
                                                <BathIcon /> عدد الحمامات {property.bathrooms || 0}
                                            </span>
                                            <span>
                                                <AreaIcon /> مساحة {property.area_sqm || property.area || 0}م²
                                            </span>
                                        </div>


                                        <div className="listing-actions">
                                            <button
                                                className="listing-action-btn delete"
                                                aria-label="حذف"
                                                onClick={(e) => { e.stopPropagation(); askDelete(property); }}
                                            >
                                                <TrashIcon />
                                            </button>
                                            <button
                                                className="listing-action-btn edit"
                                                aria-label="تعديل"
                                                onClick={(e) => { e.stopPropagation(); navigate(`/property-edit/${property.id}`); }}
                                            >
                                                <EditIcon />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {properties.length === 0 && (
                            <div className="listing-empty">لا توجد عقارات مضافة حالياً</div>
                        )}
                    </div>
                )}
            </div>

            {/* ─── مودال الحذف ─── */}
            {pendingDelete && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <div className="modal-title">
                                <WarnIcon /> تأكيد الحذف
                            </div>
                            <button className="modal-close" onClick={cancelDelete} aria-label="إغلاق">
                                ✕
                            </button>
                        </div>

                        <p className="modal-text">
                            هل أنت متأكد من حذف هذا الإعلان؟
                            <br />
                            سيتم إزالة هذا العقار من نتائج البحث ولا يمكن التراجع عن هذا الإجراء.
                        </p>

                        <div className="modal-property">
                            <img src={getPropertyImage(pendingDelete) ? resolveMediaUrl(getPropertyImage(pendingDelete)) : containerImg} alt={pendingDelete.title} onError={handleImageError} />
                            <div>
                                <p className="modal-property-id">#{pendingDelete.id}</p>
                                <p className="modal-property-title">{pendingDelete.title}</p>
                                <p className="modal-property-price">
                                    ₪{Number(pendingDelete.price || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {deleteError && (
                            <p style={{ color: "#E5484D", fontSize: 13, marginBottom: 12, textAlign: "center" }}>
                                <WarnIcon /> {deleteError}
                            </p>
                        )}

                        <button className="submit-btn danger full" onClick={confirmDelete} disabled={isDeleting}>
                            <TrashIcon /> {isDeleting ? "جاري الحذف..." : "حذف الإعلان"}
                        </button>
                        <button className="cancel-btn full" onClick={cancelDelete} disabled={isDeleting}>
                            إلغاء
                        </button>
                    </div>
                </div>
            )}

            {/* ─── إشعار نجاح الحذف ─── */}
            {toast && (
                <div className="toast">
                    <CheckIcon />
                    <span className="toast-text">تم حذف الإعلان بنجاح</span>
                </div>
            )}
        </div>
    );
}