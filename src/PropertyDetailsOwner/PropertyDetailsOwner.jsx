import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { apiFetch, resolveMediaUrl, isOwnerRole } from "../services/api";
import { useStoredUser, useUserAvatar } from "../state/currentUser";
import defaultAvatar from "../components/default-avatar.svg";
import "./PropertyDetailsOwner.css";

/**
 * بيانات وهمية (Mock Data) — بدّلها ببيانات حقيقية قادمة من الـ API لاحقاً
 */
const mockProperty = {
    title: "شقة فاخرة بغزة",
    location: "برج الظافر، السرايا، غزة",
    price: "1,500",
    currency: "₪",
    type: "شقة",
    status: "متاح",
    owner: {
        id: null,
        name: "احمد رمضان",
        phone: "",
        avatar: "https://i.pravatar.cc/150?img=12",
    },
    stats: [
        { icon: "bed", value: "3 سرير", label: "غرف نوم" },
        { icon: "bath", value: "2.5 الحمامات", label: "الحمامات" },
        { icon: "area", value: "2,450 قدم مربع", label: "المساحة الكلية" },
    ],
    description:
        "شقة سكنية راقية تتميز بتصميم عصري وتشطيبات سوبر ديلوكس، تقع في منطقة هادئة وراقية بالقرب من جميع الخدمات الأساسية. الشقة تحتوي على صالة جلوس واسعة مع نوافذ كبيرة تسمح بدخول الضوء الطبيعي، ومطبخ مجهز بالكامل بأحدث الأجهزة. الغرف واسعة وتحتوي على خزائن حائط، والعمارة مزودة بكاميرات مراقبة وحراسة على مدار الساعة.",
    amenities: [],
    images: [
        {
            src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
            alt: "المطبخ",
        },
        {
            src: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=80",
            alt: "غرفة النوم",
        },
        {
            src: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
            alt: "إطلالة المارينا",
        },
        {
            src: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&q=80",
            alt: "الحمام",
        },
        {
            src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&q=80",
            alt: "صالة المعيشة",
        },
    ],
};

/* -------------------------------------------------------------------------- */
/*  طلب الاهتمام (Interest request)                                            */
/*  ⚠️ المسار الحقيقي (US-17) — بدون trailing slash، مع slash بيرجع 404      */
/*  (`/api/properties/{id}/interest-request`)                                      */
/*  الشيفرة مربوطة فعلياً — الباك اند فيه POST فقط للطلب                          */
/*  عدّل هذا المسار وشكل الاستجابة ليطابق الـ Backend عندك                      */
/*  POST   → إرسال طلب اهتمام (201 · body فاضي · للـtenant فقط)                  */
/*  GET    → ❌ ما موجود بالـbackend — ما في طريقة للمستأجر يتابع حالة طلبه        */
/*  DELETE → ❌ ما موجود بالـbackend — ما في إلغاء للطلب                           */
/* -------------------------------------------------------------------------- */
const interestUrl = (propertyId) => `/api/properties/${propertyId}/interest-request`;

const isLoggedIn = () => Boolean(localStorage.getItem("access_token"));

/* الباك اند بيرجّع رسائل إنجليزية — بنترجمها قبل ما توصل للمستخدم */
const INTEREST_ERROR_AR = {
    "Authentication credentials were not provided.": "انتهت الجلسة، يرجى تسجيل الدخول من جديد.",
    "Only tenants can send interest requests.": "طلب الاهتمام متاح للمستأجرين فقط.",
    "You have already sent an interest request for this property.": "لديك طلب اهتمام على هذا العقار مسبقاً.",
    "This property is rented and cannot receive interest requests.": "هذا العقار مؤجر حالياً ولا يستقبل طلبات اهتمام.",
    "You cannot send an interest request for your own property.": "لا يمكنك إرسال طلب اهتمام على عقارك.",
};

/* رسائل عربية واضحة بدل رسالة عامة واحدة، حتى يبقى سبب الفشل ظاهراً للمستخدم */
function describeInterestError(status, data) {
    const detail = typeof data?.detail === "string" ? data.detail : "";
    if (INTEREST_ERROR_AR[detail]) return INTEREST_ERROR_AR[detail];
    if (status === 401) return "انتهت الجلسة، يرجى تسجيل الدخول من جديد.";
    if (status === 403) return "طلب الاهتمام متاح للمستأجرين فقط.";
    if (status === 400) return detail || "تعذر إرسال الطلب، يرجى المحاولة مرة أخرى.";
    if (status === 404) return "العقار غير موجود.";
    if (status >= 500) return "خطأ في الخادم، حاول مرة أخرى بعد قليل.";
    return detail || "تعذر إرسال الطلب، حاول مرة أخرى.";
}

/* رد الـPOST: { id, tenant, property, owner, status: "pending", created_at, updated_at }
   ما في endpoint للحالة، فبنعتبر أي رد ناجح = pending */
function parseInterest(data) {
    const raw = String(data?.status || "").toLowerCase();
    if (raw === "accepted" || raw === "approved") return { status: "accepted", phone: "" };
    if (raw === "pending") return { status: "pending", phone: "" };
    return { status: "none", phone: "" };
}

/* -------------------------------------------------------------------------- */
/*  وسائل الراحة: تُبنى فقط من البيانات الفعلية المخزنة للعقار                  */
/* -------------------------------------------------------------------------- */
const AMENITY_FEATURE_MAP = [
    { key: "parking", icon: "parking", label: "موقف سيارات" },
    { key: "wifi", icon: "wifi", label: "واي فاي" },
    { key: "gym", icon: "gym", label: "صالة الألعاب الرياضية" },
    { key: "centralAC", icon: "ac", label: "تكييف مركزي" },
    { key: "ac", icon: "ac", label: "تكييف مركزي" },
    { key: "pool", icon: "pool", label: "مسبح" },
    { key: "sharedPool", icon: "pool", label: "مسبح مشترك" },
    { key: "shield", icon: "shield", label: "أمان 24/7" },
    { key: "furnished", icon: "bed", label: "مفروش" },
    { key: "balcony", icon: "area", label: "بلكونة" },
    { key: "garden", icon: "area", label: "حديقة" },
];

const UTILITY_FEATURE_MAP = [
    { key: "main_grid", icon: "ac", label: "الكهرباء العامة" },
    { key: "has_main_grid", icon: "ac", label: "الكهرباء العامة" },
    { key: "solar", icon: "ac", label: "طاقة شمسية" },
    { key: "has_solar", icon: "ac", label: "طاقة شمسية" },
    { key: "generator", icon: "ac", label: "مولد كهربائي" },
    { key: "has_generator_line", icon: "ac", label: "مولد كهربائي" },
    { key: "tank", icon: "area", label: "خزان" },
    { key: "has_water_tank", icon: "area", label: "خزان" },
    { key: "well", icon: "area", label: "بئر" },
    { key: "has_private_well", icon: "area", label: "بئر" },
];

const ALL_FEATURE_MAP = [...AMENITY_FEATURE_MAP, ...UTILITY_FEATURE_MAP];

const isTruthy = (v) => v === true || v === "true" || v === 1 || v === "1";

/* بناء قائمة وسائل الراحة من بيانات العقار الفعلية فقط */
function buildAmenities(p) {
    const result = [];

    // 1) قائمة وسائل راحة جاهزة قادمة من الـ API
    if (Array.isArray(p.amenities) && p.amenities.length) {
        p.amenities.forEach((a) => {
            if (typeof a === "string") {
                result.push({ icon: "parking", label: a });
            } else if (a && typeof a === "object") {
                const label = a.label || a.name || "";
                if (label) {
                    const known = ALL_FEATURE_MAP.find(
                        (f) => f.label === a.label || f.key === a.icon
                    );
                    result.push({ icon: known?.icon || a.icon || "parking", label });
                }
            }
        });
        return result;
    }

    // 2) خصائص boolean قادمة من الـ API: كائن features أو حقول has_* مباشرة
    const flags =
        p.features && typeof p.features === "object"
            ? Array.isArray(p.features)
                ? Object.fromEntries(p.features.map((k) => [k, true]))
                : { ...p.features }
            : {};
    ALL_FEATURE_MAP.forEach(({ key }) => {
        if (p && Object.prototype.hasOwnProperty.call(p, key) && isTruthy(p[key])) {
            flags[key] = true;
        }
    });
    ALL_FEATURE_MAP.forEach(({ key, icon, label }) => {
        if (flags[key] && !result.some((r) => r.label === label)) result.push({ icon, label });
    });

    // 3) حقول electricity/water القادمة كنص مفصول بفواصل
    ["electricity", "water"].forEach((field) => {
        const raw = p[field];
        const keys = typeof raw === "string" ? raw.split(",") : Array.isArray(raw) ? raw : [];
        keys.forEach((k) => {
            const item = UTILITY_FEATURE_MAP.find((u) => u.key === String(k).trim());
            if (item && !result.some((r) => r.label === item.label)) result.push(item);
        });
    });

    return result;
}

/* -------------------------------------------------------------------------- */
/*  تحويل بيانات الـ API إلى شكل مكون تفاصيل العقار                            */
/* -------------------------------------------------------------------------- */
const STATUS_LABELS = { available: "متاح", reserved: "محجوز", rented: "مؤجر" };

const PROPERTY_TYPE_LABELS = {
    apartment: "شقة",
    villa: "فيلا",
    land: "قطعة أرض",
    store_room: "حاصل",
    shop: "محل تجاري",
    barracks: "بركس",
};

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

/* يضمن وجود 5 صور على الأقل لمعرض الصور */
function ensureImages(images) {
    if (!images.length) return mockProperty.images;
    const result = [...images];
    while (result.length < 5) result.push(result[0]);
    return result.slice(0, 5);
}

function mapOwner(p, fallbackName) {
    return {
        id: p.owner?.id ?? p.owner_id ?? null,
        name: p.owner?.full_name || fallbackName,
        phone: p.owner?.phone || p.owner?.phone_number || "",
        avatar: resolveMediaUrl(p.owner?.profile_image) || mockProperty.owner.avatar,
    };
}

/* تحويل عقار بطاقة المالك (من قائمة OwnerHome) إلى شكل صفحة التفاصيل */
function mapListProperty(p) {
    const stats = [];
    if (p.bedrooms) stats.push({ icon: "bed", value: `${p.bedrooms}`, label: "غرف نوم" });
    if (p.bathrooms) stats.push({ icon: "bath", value: `${p.bathrooms}`, label: "الحمامات" });
    const area = p.area_sqm || p.area;
    if (area) stats.push({ icon: "area", value: `${area} متر مربع`, label: "المساحة الكلية" });

    const mainImage = getPropertyImage(p);

    return {
        title: p.title || mockProperty.title,
        location: p.address || p.location || mockProperty.location,
        price: p.price ? Number(p.price).toLocaleString() : mockProperty.price,
        currency: "₪",
        type: PROPERTY_TYPE_LABELS[p.property_type || p.type] || p.type || "شقة",
        status: STATUS_LABELS[p.status] || p.status || "متاح",
        owner: mapOwner(p, "مالك العقار"),
        stats: stats.length ? stats : mockProperty.stats,
        description: p.description || mockProperty.description,
        amenities: buildAmenities(p),
        images: ensureImages(
            mainImage ? [{ src: resolveMediaUrl(mainImage), alt: p.title || "صورة العقار" }] : []
        ),
    };
}

function mapApiProperty(p) {
    const images = Array.isArray(p.images)
        ? p.images.map((img) => ({
            src: resolveMediaUrl(img.image || img),
            alt: p.title || "صورة العقار",
        }))
        : mockProperty.images;

    const stats = [];
    const area = p.area_sqm || p.area;
    if (area) stats.push({ icon: "area", value: `${area} متر مربع`, label: "المساحة الكلية" });
    if (p.bedrooms) stats.push({ icon: "bed", value: `${p.bedrooms}`, label: "غرف نوم" });
    if (p.bathrooms) stats.push({ icon: "bath", value: `${p.bathrooms}`, label: "الحمامات" });

    return {
        title: p.title || mockProperty.title,
        location: p.address || p.location || mockProperty.location,
        price: p.price ? Number(p.price).toLocaleString() : mockProperty.price,
        currency: "₪",
        type: PROPERTY_TYPE_LABELS[p.property_type || p.type] || p.type || "شقة",
        status: STATUS_LABELS[p.status] || p.status || "متاح",
        owner: mapOwner(p, p.owner?.email || "مالك العقار"),
        stats: stats.length ? stats : mockProperty.stats,
        description: p.description || mockProperty.description,
        amenities: buildAmenities(p),
        images: images.length ? ensureImages(images) : mockProperty.images,
    };
}

/* -------------------------------------------------------------------------- */
/*  أيقونات SVG بسيطة (بدون أي مكتبة خارجية)                                   */
/* -------------------------------------------------------------------------- */
const Icon = ({ name, size = 18 }) => {
    const props = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    };

    switch (name) {
        case "pin":
            return (
                <svg {...props}>
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
            );
        case "bed":
            return (
                <svg {...props}>
                    <path d="M2 9v10M2 13h20M22 13v6" />
                    <path d="M4 13V7a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v1" />
                    <path d="M13 8h5a2 2 0 0 1 2 2v3" />
                </svg>
            );
        case "bath":
            return (
                <svg {...props}>
                    <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" />
                    <path d="M6 12V6a2 2 0 0 1 3.5-1.3" />
                    <path d="M2 19h20" />
                </svg>
            );
        case "area":
            return (
                <svg {...props}>
                    <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
                </svg>
            );
        case "parking":
            return (
                <svg {...props}>
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <path d="M9 16V8h3.5a2.5 2.5 0 0 1 0 5H9" />
                </svg>
            );
        case "wifi":
            return (
                <svg {...props}>
                    <path d="M2 8.5a16 16 0 0 1 20 0" />
                    <path d="M5.5 12a11 11 0 0 1 13 0" />
                    <path d="M9 15.5a6 6 0 0 1 6 0" />
                    <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
                </svg>
            );
        case "shield":
            return (
                <svg {...props}>
                    <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5Z" />
                </svg>
            );
        case "ac":
            return (
                <svg {...props}>
                    <path d="M2 12h20M6 12v7M12 12v9M18 12v5" />
                    <path d="M2 12l4-5M2 12l4 5M22 12l-4-5M22 12l-4 5" />
                </svg>
            );
        case "gym":
            return (
                <svg {...props}>
                    <path d="M4 8v8M20 8v8" />
                    <path d="M1 10v4M23 10v4" />
                    <path d="M7 12h10" />
                </svg>
            );
        case "pool":
            return (
                <svg {...props}>
                    <path d="M2 17c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0" />
                    <path d="M8 13V6a2 2 0 1 1 4 0v7" />
                </svg>
            );
        case "images":
            return (
                <svg {...props}>
                    <rect x="3" y="3" width="18" height="14" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                </svg>
            );
        case "close":
            return (
                <svg {...props}>
                    <path d="M18 6 6 18M6 6l12 12" />
                </svg>
            );
        case "user":
            return (
                <svg {...props}>
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            );
        case "arrowLeft":
            return (
                <svg {...props}>
                    <path d="M19 12H5" />
                    <path d="m12 19-7-7 7-7" />
                </svg>
            );
        case "chevronLeft":
            return (
                <svg {...props}>
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            );
        case "chevronRight":
            return (
                <svg {...props}>
                    <path d="M9 18l6-6-6-6" />
                </svg>
            );
        case "check":
            return (
                <svg {...props} strokeWidth={2.4}>
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
            );
        case "checkCircle":
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="m8 12 3 3 5-6" />
                </svg>
            );
        case "lock":
            return (
                <svg {...props}>
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
                </svg>
            );
        case "clock":
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                </svg>
            );
        case "phone":
            return (
                <svg {...props}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
            );
        case "message":
            return (
                <svg {...props}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            );
        case "trash":
            return (
                <svg {...props}>
                    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                </svg>
            );
        case "edit":
            return (
                <svg {...props}>
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
            );
        case "whatsapp":
            return (
                <svg {...props}>
                    <path d="M3 21l1.65-4.9A9 9 0 1 1 8 19.4L3 21z" />
                    <path d="M9 10c.5 2 2 3.5 4 4l1.2-1.2a.6.6 0 0 1 .6-.15l1.6.5" />
                </svg>
            );
        default:
            return null;
    }
};

/* -------------------------------------------------------------------------- */
/*  معرض الصور                                                                 */
/* -------------------------------------------------------------------------- */
function Gallery({ images, onOpen }) {
    return (
        <div className="pdo-gallery">
            <button className="pdo-gallery__main" onClick={() => onOpen(4)}>
                <img src={images[4].src} alt={images[4].alt} />
            </button>

            <div className="pdo-gallery__col">
                <button className="pdo-gallery__thumb" onClick={() => onOpen(0)}>
                    <img src={images[0].src} alt={images[0].alt} />
                </button>
                <button className="pdo-gallery__thumb" onClick={() => onOpen(3)}>
                    <img src={images[3].src} alt={images[3].alt} />
                </button>
            </div>

            {/* العمود الأخير = أقصى اليسار (الصفحة RTL) */}
            <div className="pdo-gallery__col pdo-gallery__col--last">
                <button className="pdo-gallery__thumb" onClick={() => onOpen(1)}>
                    <img src={images[1].src} alt={images[1].alt} />
                </button>
                <button
                    className="pdo-gallery__thumb pdo-gallery__thumb--overlay"
                    onClick={() => onOpen(2)}
                >
                    <img src={images[2].src} alt={images[2].alt} />
                    <span className="pdo-gallery__overlay">
                        <span className="pdo-gallery__overlay-label">
                            <Icon name="images" size={16} />
                            عرض المزيد...
                        </span>
                    </span>
                </button>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Lightbox                                                                   */
/* -------------------------------------------------------------------------- */
function Lightbox({ images, index, onClose, onNext, onPrev }) {
    if (index === null) return null;
    return (
        <div className="pdo-lightbox" role="dialog" aria-modal="true">
            <div className="pdo-lightbox__backdrop" onClick={onClose} />
            <div className="pdo-lightbox__content">
                <button className="pdo-lightbox__close" onClick={onClose} aria-label="إغلاق">
                    <Icon name="close" size={22} />
                </button>
                <button className="pdo-lightbox__nav pdo-lightbox__nav--prev" onClick={onPrev} aria-label="السابق">
                    <Icon name="chevronRight" size={22} />
                </button>
                <img src={images[index].src} alt={images[index].alt} />
                <button className="pdo-lightbox__nav pdo-lightbox__nav--next" onClick={onNext} aria-label="التالي">
                    <Icon name="chevronLeft" size={22} />
                </button>
                <span className="pdo-lightbox__counter">
                    {index + 1} / {images.length}
                </span>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  فورم التواصل (3 حالات: قبل الطلب / قيد المعالجة / تمت الموافقة)              */
/* -------------------------------------------------------------------------- */
function OwnerRow({ name, avatar }) {
    return (
        <div className="pdo-owner-card__profile">
            <img
                className="pdo-owner-card__avatar"
                src={avatar || defaultAvatar}
                alt={name}
            />
            <span className="pdo-owner-card__name">{name}</span>
        </div>
    );
}

function ContactCard({
    viewerName,
    viewerAvatar,
    status,
    phone,
    submitting,
    error,
    onInterest,
    onMessage,
    onCall,
    onWhatsApp,
}) {
    /* الحالة 2: تم إرسال الطلب وبانتظار موافقة المالك */
    if (status === "pending") {
        return (
            <aside className="pdo-owner-card pdo-owner-card--success">
                <div className="pdo-contact-success">
                    <div className="pdo-contact-success__badge">
                        <span className="pdo-contact-success__badge-inner">
                            <Icon name="check" size={22} />
                        </span>
                    </div>
                    <h3 className="pdo-contact-success__title">تم إرسال طلب الاهتمام بنجاح</h3>
                    <p className="pdo-contact-success__text">
                        سيتم مراجعة طلبك وتزويدك ببيانات التواصل قريباً
                    </p>
                </div>

                <OwnerRow name={viewerName} avatar={viewerAvatar} />

                <div className="pdo-contact-locked">
                    <Icon name="lock" size={22} />
                    <span>معلومات الاتصال مخفية</span>
                </div>

                <button className="pdo-btn pdo-btn--disabled" disabled>
                    <Icon name="clock" size={16} />
                    طلب قيد المعالجة
                </button>
            </aside>
        );
    }

    /* الحالة 3: المالك وافق على الطلب */
    if (status === "accepted") {
        return (
            <aside className="pdo-owner-card">
                <div className="pdo-contact-approved">
                    <span className="pdo-contact-approved__icon">
                        <Icon name="checkCircle" size={18} />
                    </span>
                    <div>
                        <strong>تمت الموافقة على طلبك.</strong>
                        <p>المالك بانتظار تواصلك لإتمام الإجراءات وتحديد موعد المعاينة.</p>
                    </div>
                </div>

                <OwnerRow name={viewerName} avatar={viewerAvatar} />

                <hr className="pdo-divider pdo-divider--tight" />

                <div className="pdo-contact-phone">
                    <span className="pdo-contact-phone__label">رقم الجوال</span>
                    <span className="pdo-contact-phone__number" dir="ltr">
                        {phone || "—"}
                    </span>
                </div>

<button className="pdo-btn pdo-btn--primary" onClick={onCall} disabled={!phone}>
                اتصل بالمالك
                <Icon name="phone" size={16} />
            </button>
            <button className="pdo-btn pdo-btn--whatsapp" onClick={onWhatsApp} disabled={!phone}>
                    محادثة عبر الواتساب
                    <Icon name="whatsapp" size={16} />
                </button>
            </aside>
        );
    }

    /* الحالة 1: الفورم الافتراضي */
    return (
        <aside className="pdo-owner-card">
            <OwnerRow name={viewerName} avatar={viewerAvatar} />

            <button className="pdo-btn pdo-btn--primary" onClick={onInterest} disabled={submitting}>
                {submitting ? "جاري الإرسال..." : "أنا مهتم"}
                {!submitting && <Icon name="arrowLeft" size={16} />}
            </button>

            {error && <p className="pdo-contact-error">{error}</p>}

            <button
                className="pdo-btn pdo-btn--outline pdo-btn--block"
                onClick={onMessage}
                disabled
                title="يتاح بعد موافقة المالك على طلبك"
            >
                <Icon name="message" size={16} />
                ارسال رسالة عبر الرسائل
            </button>

            {/* رقم المالك يبقى مخفياً إلى أن يوافق على الطلب */}
            <button
                className="pdo-btn pdo-btn--whatsapp"
                onClick={onWhatsApp}
                disabled
                title="يتاح بعد موافقة المالك على طلبك"
            >
                <Icon name="whatsapp" size={16} />
                محادثة عبر الواتساب
            </button>
        </aside>
    );
}

/* -------------------------------------------------------------------------- */
/*  Dialog طلب تسجيل الدخول                                                     */
/* -------------------------------------------------------------------------- */
function LoginPrompt({ open, onClose }) {
    const navigate = useNavigate();
    if (!open) return null;
    return (
        <div className="pdo-login-prompt" role="dialog" aria-modal="true">
            <div className="pdo-login-prompt__backdrop" onClick={onClose} />
            <div className="pdo-login-prompt__box">
                <button
                    className="pdo-login-prompt__close"
                    onClick={onClose}
                    aria-label="إغلاق"
                >
                    <Icon name="close" size={16} />
                </button>

                <div className="pdo-login-prompt__badge">
                    <div className="pdo-login-prompt__badge-inner">
                        <Icon name="user" size={26} />
                    </div>
                </div>

                <h3 className="pdo-login-prompt__title">سجّل الدخول للمتابعة</h3>
                <p className="pdo-login-prompt__subtitle">
                    يجب إنشاء حساب لتتمكن من حفظ العقارات والتواصل مع الملاك.
                </p>

                <button
                    className="pdo-login-prompt__btn pdo-login-prompt__btn--primary"
                    onClick={() => navigate("/login")}
                >
                    <span>تسجيل الدخول</span>
                    <Icon name="arrowLeft" size={18} />
                </button>
                <button
                    className="pdo-login-prompt__btn pdo-login-prompt__btn--outline"
                    onClick={() => navigate("/register")}
                >
                    انشاء حساب جديد
                </button>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  مودال تأكيد الحذف (للمالك)                                                */
/* -------------------------------------------------------------------------- */
function DeleteConfirmDialog({ open, title, isDeleting, error, onCancel, onConfirm }) {
    if (!open) return null;
    return (
        <div className="pdo-confirm" role="dialog" aria-modal="true">
            <div className="pdo-confirm__backdrop" onClick={onCancel} />
            <div className="pdo-confirm__box">
                <h3 className="pdo-confirm__title">
                    <Icon name="trash" size={20} />
                    تأكيد الحذف
                </h3>
                <p className="pdo-confirm__text">
                    هل أنت متأكد من حذف هذا الإعلان؟
                    <br />
                    "{title}" سيختفي من نتائج البحث ولا يمكن التراجع عن هذا الإجراء.
                </p>

                {error && <p className="pdo-confirm__error">{error}</p>}

                <button
                    className="pdo-btn pdo-btn--danger pdo-btn--block"
                    onClick={onConfirm}
                    disabled={isDeleting}
                >
                    <Icon name="trash" size={16} />
                    {isDeleting ? "جاري الحذف..." : "حذف الإعلان"}
                </button>
                <button
                    className="pdo-btn pdo-btn--outline pdo-btn--block"
                    onClick={onCancel}
                    disabled={isDeleting}
                >
                    إلغاء
                </button>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  الصفحة الرئيسية                                                           */
/* -------------------------------------------------------------------------- */
export default function PropertyDetailsOwner() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const passedProperty = location.state?.property;
    const [property, setProperty] = useState(() =>
        passedProperty ? mapListProperty(passedProperty) : mockProperty
    );
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [loginPromptOpen, setLoginPromptOpen] = useState(false);
    const [descExpanded, setDescExpanded] = useState(false);

    /* هل العقار للمستخدم الحالي؟ المالك يرى أدواته، والباقي يرى نموذج التواصل */
    const viewer = useStoredUser();
    const viewerAvatar = useUserAvatar();
    const viewerName = viewer?.name || viewer?.full_name || "مالك العقار";

    /*
     * إشارة أولى: مطابقة المعرّفات مباشرة (تعتمد على وجود owner.id في استجابة الـAPI).
     * إشارة ثانية: مسار /property-owner/ — وهو مسار خاص بلوحة المالك، لا يُفتح منه
     * شيء غير عقارات المستخدم نفسه، ويبقى صحيحاً بعد تحديث الصفحة (على عكس state).
     * دور المستخدم يُشترطKnown فقط إذا كان محفوظاً، حتى لا تنكسر الحالة القديمة.
     */
    const matchesOwnerId =
        viewer?.id != null &&
        property?.owner?.id != null &&
        String(viewer.id) === String(property.owner.id);

    const viewerRole = viewer?.role || "";
    const roleAllowsOwnerView = !viewerRole || isOwnerRole(viewerRole);
    const isOwnerRoute = location.pathname.startsWith("/property-owner/");

    const isMyProperty = matchesOwnerId || (isOwnerRoute && roleAllowsOwnerView);

    /* حالة طلب الاهتمام: none | pending | accepted */
    const [interest, setInterest] = useState({ status: "none", phone: "" });
    const [submitting, setSubmitting] = useState(false);
    const [interestError, setInterestError] = useState("");

    /* حذف العقار (للمالك فقط) */
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const closeDelete = () => {
        if (isDeleting) return;
        setDeleteOpen(false);
        setDeleteError("");
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        setDeleteError("");
        try {
            const res = await apiFetch(`/api/properties/${id}/`, { method: "DELETE" });
            if (!res.ok && res.status !== 204) {
                if (res.status === 403) throw new Error("ليس لديك صلاحية حذف هذا العقار");
                if (res.status === 404) throw new Error("العقار غير موجود أصلًا");
                throw new Error("فشل حذف العقار، يرجى المحاولة لاحقاً");
            }
            navigate("/home-owner", { replace: true });
        } catch (err) {
            setDeleteError(err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    /* محاولة تحديث بيانات أكثر اكتمالاً من الـ API إن توفّر، دون إيقاف العرض عند الفشل */
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await apiFetch(`/api/properties/${id}/`);
                if (!res.ok) return;
                const data = await res.json();
                if (active) setProperty(mapApiProperty(data));
            } catch {
                /* تجاهل: نعرض البيانات الممررة/الافتراضية */
            }
        })();
        return () => {
            active = false;
        };
    }, [id]);

    /* ما في GET للحالة ولا DELETE للإلغاء بالـbackend حالياً، فما في طلب يُرسل
   عند فتح الصفحة ولا فحص دوري. الحالة بتتحدث مرة واحدة بعد POST بنجاح. */

    const closeLightbox = () => setLightboxIndex(null);
    const nextImage = () =>
        setLightboxIndex((i) => (i + 1) % property.images.length);
    const prevImage = () =>
        setLightboxIndex((i) => (i - 1 + property.images.length) % property.images.length);

    const shortDescription =
        property.description.length > 160 && !descExpanded
            ? property.description.slice(0, 160).trim() + "…"
            : property.description;

    /* ---------------------------- أفعال فورم التواصل ---------------------------- */
    const onInterest = async () => {
        if (!isLoggedIn()) {
            setLoginPromptOpen(true);
            return;
        }
        setSubmitting(true);
        setInterestError("");
        try {
            /* body فاضي — الـendpoint بيتوقع Authorization + لا شي تاني */
            const res = await apiFetch(interestUrl(id), { method: "POST" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                console.error("[interest] فشل الإرسال", res.status, data);
                setInterestError(describeInterestError(res.status, data));
                return;
            }
            /* 201 Created — الرد{bj status: "pending" } */
            setInterest(parseInterest(data).status === "none"
                ? { status: "pending", phone: "" }
                : parseInterest(data));
        } catch (err) {
            console.error("[interest] استثناء أثناء الإرسال", err);
            setInterestError("تعذر الاتصال بالخادم، تحقق من الإنترنت وحاول مرة أخرى.");
        } finally {
            setSubmitting(false);
        }
    };

    const onMessage = () => {
        if (!isLoggedIn()) {
            setLoginPromptOpen(true);
            return;
        }
        navigate("/messages", { state: { propertyId: id, ownerId: property.owner.id } });
    };

    const ownerPhone = interest.phone || property.owner.phone;

    const onCall = () => {
        if (ownerPhone) window.location.href = `tel:${ownerPhone}`;
    };

    const onWhatsApp = () => {
        const digits = String(ownerPhone || "").replace(/\D/g, "");
        if (digits) window.open(`https://wa.me/${digits}`, "_blank", "noopener");
    };

    return (
        <div className="pdo-page" dir="rtl">
            <main className="pdo-main">
                <div className="pdo-page-header">
                    <h1>التفاصيل</h1>
                </div>

                <Gallery images={property.images} onOpen={setLightboxIndex} />

                <section className="pdo-details">
                    <div className="pdo-details__main">
                        <div className="pdo-badges">
                            <span className="pdo-badge pdo-badge--status">{property.status}</span>
                            <span className="pdo-badge pdo-badge--type">{property.type}</span>
                        </div>

                        <div className="pdo-title-row">
                            <h2 className="pdo-title">{property.title}</h2>
                            <div className="pdo-price">
                                {property.price}
                                <span className="pdo-price__currency">{property.currency}</span>
                            </div>
                        </div>

                        <div className="pdo-location">
                            <Icon name="pin" size={16} />
                            <span>{property.location}</span>
                        </div>

                        <hr className="pdo-divider" />

                        <div className="pdo-stats">
                            {property.stats.map((s) => (
                                <div className="pdo-stat" key={s.label}>
                                    <span className="pdo-stat__label">{s.label}</span>
                                    <div className="pdo-stat__value-row">
                                        <Icon name={s.icon} size={18} />
                                        <span className="pdo-stat__value">{s.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h3 className="pdo-section-title">وصف</h3>
                        <p className="pdo-description">
                            {shortDescription}{" "}
                            {property.description.length > 160 && (
                                <button
                                    className="pdo-read-more"
                                    onClick={() => setDescExpanded((v) => !v)}
                                >
                                    {descExpanded ? "عرض أقل" : "اقرأ المزيد"}
                                </button>
                            )}
                        </p>

                        <h3 className="pdo-section-title">وسائل الراحة الرئيسية</h3>
                        {property.amenities.length > 0 ? (
                            <div className="pdo-amenities">
                                {property.amenities.map((a) => (
                                    <div className="pdo-amenity" key={a.label}>
                                        <span className="pdo-amenity__icon">
                                            <Icon name={a.icon} size={18} />
                                        </span>
                                        <span>{a.label}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="pdo-amenities-empty">
                                لا توجد وسائل راحة مسجلة لهذا العقار.
                            </p>
                        )}
                    </div>

                    {isMyProperty ? (
                        <aside className="pdo-owner-card">
                            <div className="pdo-owner-card__profile">
                                <img
                                    className="pdo-owner-card__avatar"
                                    src={viewerAvatar || defaultAvatar}
                                    alt={viewerName}
                                />
                                <span className="pdo-owner-card__name">{viewerName}</span>
                            </div>
                            <div className="pdo-mine-badge">
                                <Icon name="checkCircle" size={18} />
                                <span>هذا العقار من عقاراتك</span>
                            </div>
                            <button
                                className="pdo-btn pdo-btn--primary pdo-btn--block"
                                onClick={() => navigate(`/property-edit/${id}`)}
                            >
                                <Icon name="edit" size={16} />
                                تعديل الإعلان
                            </button>
                            <button
                                className="pdo-btn pdo-btn--danger pdo-btn--block"
                                onClick={() => setDeleteOpen(true)}
                            >
                                <Icon name="trash" size={16} />
                                حذف الإعلان
                            </button>
                        </aside>
                    ) : (
                        <ContactCard
                            viewerName={viewerName}
                            viewerAvatar={viewerAvatar}
                            status={interest.status}
                            phone={ownerPhone}
                            submitting={submitting}
                            error={interestError}
                            onInterest={onInterest}
                            onMessage={onMessage}
                            onCall={onCall}
                            onWhatsApp={onWhatsApp}
                        />
                    )}
                </section>
            </main>

            <Lightbox
                images={property.images}
                index={lightboxIndex}
                onClose={closeLightbox}
                onNext={nextImage}
                onPrev={prevImage}
            />

            <LoginPrompt open={loginPromptOpen} onClose={() => setLoginPromptOpen(false)} />

            <DeleteConfirmDialog
                open={deleteOpen}
                title={property.title}
                isDeleting={isDeleting}
                error={deleteError}
                onCancel={closeDelete}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
