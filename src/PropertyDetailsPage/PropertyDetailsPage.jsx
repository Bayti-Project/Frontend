import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { apiFetch, resolveMediaUrl } from "../services/api";
import "./PropertyDetailsPage.css";

const mockProperty = {
    title: "شقة فاخرة بغزة",
    location: "بلوك فلسطين الجديدة، غزة",
    price: "1,500",
    currency: "₪",
    type: "شقة",
    status: "متاح",
    owner: {
        name: "أحمد رمضان",
        isMe: false,
        avatar: "https://i.pravatar.cc/150?img=12",
    },
    stats: [
        { icon: "bed", value: "3", label: "غرف نوم" },
        { icon: "bath", value: "2.5", label: "حمامات" },
        { icon: "area", value: "1,450", label: "قدم مربع" },
    ],
    description:
        "شقة سكنية راقية تتميز بتصميم عصري وتشطيبات سوبر ديلوكس وإطلالة بحرية خلابة، تقع في منطقة هادئة وراقية بالقرب من جميع الخدمات الأساسية. تتميز الشقة بصالة جلوس واسعة مع نوافذ كبيرة تسمح بدخول الضوء الطبيعي، ومطبخ مجهز بالكامل بأحدث الأجهزة. الغرف واسعة وتحتوي على خزائن حائط، والعمارة مزودة بكاميرات مراقبة وحراسة على مدار الساعة.",
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
            src: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80",
            alt: "إطلالة البحر",
        },
        {
            src: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&q=80",
            alt: "الحمام",
        },
        {
            src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
            alt: "صالة المعيشة",
        },
    ],
};

const similarListings = [
    {
        title: "فيلا عائلية بإطلالة بحرية",
        address: "شارع الرشيد، غزة",
        price: 2800,
        type: "فيلا",
        status: "available",
        bedrooms: 5,
        bathrooms: 4,
        area: 320,
        description:
            "فيلا عائلية واسعة بإطلالة مباشرة على البحر، تشطيبات فاخرة وحديقة خاصة ومرآب مزدوج.",
        image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80",
        owner: { full_name: "سامي النجار", profile_image: null },
    },
    {
        title: "شقة حديثة بجانب البرج",
        address: "السرايا، غزة",
        price: 1800,
        type: "شقة",
        status: "reserved",
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        description:
            "شقة عصرية بتشطيبات سوبر ديلوكس قرب البرج، مطبخ مجهز بالكامل وشرفة بإطلالة المدينة.",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
        owner: { full_name: "ليلى عيد", profile_image: null },
    },
    {
        title: "دوبلكس فاخر بتشطيبات راقية",
        address: "الرمال الجنوبية، غزة",
        price: 2400,
        type: "دوبلكس",
        status: "available",
        bedrooms: 4,
        bathrooms: 3,
        area: 240,
        description:
            "دوبلكس فاخر بمستويين، سقوف عالية ونوافذ بانورامية وخدمات راقية في البناية.",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
        owner: { full_name: "محمود شعبان", profile_image: null },
    },
];

const STATUS_LABELS = { available: "متاح", reserved: "محجوز", rented: "مؤجر" };

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

function ensureImages(images) {
    if (!images.length) return mockProperty.images;
    const result = [...images];
    while (result.length < 5) result.push(result[0]);
    return result.slice(0, 5);
}

function mapListProperty(p) {
    const stats = [];
    if (p.bedrooms) stats.push({ icon: "bed", value: `${p.bedrooms}`, label: "غرف نوم" });
    if (p.bathrooms) stats.push({ icon: "bath", value: `${p.bathrooms}`, label: "حمامات" });
    if (p.area) stats.push({ icon: "area", value: `${p.area}`, label: "متر مربع" });

    return {
        title: p.title || mockProperty.title,
        location: p.address || p.location || mockProperty.location,
        price: p.price ? Number(p.price).toLocaleString() : mockProperty.price,
        currency: "₪",
        type: p.type || "شقة",
        status: STATUS_LABELS[p.status] || p.status || "متاح",
        owner: {
            name: p.owner?.full_name || "مالك العقار",
            isMe: false,
            avatar: resolveMediaUrl(p.owner?.profile_image) || mockProperty.owner.avatar,
        },
        stats: stats.length ? stats : mockProperty.stats,
        description: p.description || mockProperty.description,
        amenities: buildAmenities(p),
        images: ensureImages(p.image ? [{ src: p.image, alt: p.title || "صورة العقار" }] : []),
    };
}

function mapApiProperty(p) {
    const images = Array.isArray(p.images)
        ? p.images.map((img) => ({
              src: resolveMediaUrl(img.image || img),
              alt: p.title || "صورة العقار",
          }))
        : [];

    const stats = [];
    if (p.bedrooms) stats.push({ icon: "bed", value: `${p.bedrooms}`, label: "غرف نوم" });
    if (p.bathrooms) stats.push({ icon: "bath", value: `${p.bathrooms}`, label: "حمامات" });
    if (p.area) stats.push({ icon: "area", value: `${p.area}`, label: "متر مربع" });

    return {
        title: p.title || mockProperty.title,
        location: p.address || p.location || mockProperty.location,
        price: p.price ? Number(p.price).toLocaleString() : mockProperty.price,
        currency: "₪",
        type: p.type || "شقة",
        status: STATUS_LABELS[p.status] || p.status || "متاح",
        owner: {
            name: p.owner?.full_name || p.owner?.email || "مالك العقار",
            isMe: false,
            avatar: resolveMediaUrl(p.owner?.profile_image) || mockProperty.owner.avatar,
        },
        stats: stats.length ? stats : mockProperty.stats,
        description: p.description || mockProperty.description,
        amenities: buildAmenities(p),
        images: ensureImages(images),
    };
}

/* -------------------------------------------------------------------------- */
/*  أيقونات SVG                                                                */
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
        case "menu":
            return (
                <svg {...props}>
                    <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            );
        case "home":
            return (
                <svg {...props}>
                    <path d="M3 10.5 12 3l9 7.5" />
                    <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
                    <path d="M9.5 21v-6h5v6" />
                </svg>
            );
        case "calendar":
            return (
                <svg {...props}>
                    <rect x="3" y="4" width="18" height="17" rx="2" />
                    <path d="M8 2v4M16 2v4M3 9h18" />
                </svg>
            );
        case "whatsapp":
            return (
                <svg {...props}>
                    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Z" />
                    <path
                        d="M8.6 8.3c-.4-.1-.8 0-1 .5l-.7 1c-.2.4.1 1 .4 1.5.6 1 2 2.9 3.6 3.7l1.3.7c.5.2 1 .2 1.3-.3.3-.5.9-1.3 1.1-1.7.2-.4 0-.8-.4-1l-1.5-.7c-.4-.2-.8 0-1 .3l-.4.5c-.3-.2-.7-.4-1-.7-.4-.3-.7-.6-.9-.9l.5-.4c.3-.3.4-.7.2-1l-.5-1.2Z"
                        fill="currentColor"
                        stroke="none"
                    />
                </svg>
            );
        case "headset":
            return (
                <svg {...props}>
                    <path d="M4 13a8 8 0 0 1 16 0" />
                    <rect x="2.5" y="13" width="4.5" height="6" rx="2" />
                    <rect x="17" y="13" width="4.5" height="6" rx="2" />
                    <path d="M20 19a2.5 2.5 0 0 1-2.5 2.5H14" />
                </svg>
            );
        case "heart":
            return (
                <svg {...props}>
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
                </svg>
            );
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
        default:
            return null;
    }
};

/* -------------------------------------------------------------------------- */
/*  معرض الصور                                                                 */
/* -------------------------------------------------------------------------- */
function Gallery({ images, onOpen }) {
    return (
        <div className="pdp-gallery">
            <button className="pdp-gallery__item g-main" onClick={() => onOpen(2)}>
                <img src={images[2].src} alt={images[2].alt} />
            </button>
            <button className="pdp-gallery__item g-a" onClick={() => onOpen(0)}>
                <img src={images[0].src} alt={images[0].alt} />
            </button>
            <button className="pdp-gallery__item g-b" onClick={() => onOpen(3)}>
                <img src={images[3].src} alt={images[3].alt} />
            </button>
            <button className="pdp-gallery__item g-c" onClick={() => onOpen(4)}>
                <img src={images[4].src} alt={images[4].alt} />
                <span className="pdp-gallery__more">
                    <Icon name="images" size={18} />
                    عرض الكل
                </span>
            </button>
            <button className="pdp-gallery__item g-d" onClick={() => onOpen(1)}>
                <img src={images[1].src} alt={images[1].alt} />
            </button>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Lightbox                                                                   */
/* -------------------------------------------------------------------------- */
function Lightbox({ images, index, onClose, onNext, onPrev }) {
    if (index === null) return null;
    return (
        <div className="pdp-lightbox" role="dialog" aria-modal="true">
            <div className="pdp-lightbox__backdrop" onClick={onClose} />
            <div className="pdp-lightbox__content">
                <button className="pdp-lightbox__close" onClick={onClose} aria-label="إغلاق">
                    <Icon name="close" size={22} />
                </button>
                <button
                    className="pdp-lightbox__nav pdp-lightbox__nav--prev"
                    onClick={onPrev}
                    aria-label="السابق"
                >
                    <Icon name="chevronRight" size={22} />
                </button>
                <img src={images[index].src} alt={images[index].alt} />
                <button
                    className="pdp-lightbox__nav pdp-lightbox__nav--next"
                    onClick={onNext}
                    aria-label="التالي"
                >
                    <Icon name="chevronLeft" size={22} />
                </button>
                <span className="pdp-lightbox__counter">
                    {index + 1} / {images.length}
                </span>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  تفاصيل العقار (العمود الأيمن)                                                */
/* -------------------------------------------------------------------------- */
function PropertyInfo({ property }) {
    return (
        <section className="pdp-card">
            <div className="pdp-badges">
                <span className="pdp-badge pdp-badge--status">{property.status}</span>
                <span className="pdp-badge pdp-badge--type">{property.type}</span>
            </div>

            <div className="pdp-title-row">
                <h1 className="pdp-title">{property.title}</h1>

                <div className="pdp-price">
                    <span className="pdp-price__icon">
                        <Icon name="home" size={20} />
                    </span>
                    <span className="pdp-price__value">{property.price}</span>
                    <span className="pdp-price__currency">{property.currency}</span>
                </div>
            </div>

            <p className="pdp-location">
                <Icon name="pin" size={16} />
                <span>{property.location}</span>
            </p>

            <hr className="pdp-divider" />

            <div className="pdp-stats">
                {property.stats.map((s) => (
                    <div className="pdp-stat" key={s.label}>
                        <span className="pdp-stat__icon">
                            <Icon name={s.icon} size={20} />
                        </span>
                        <span className="pdp-stat__value">{s.value}</span>
                        <span className="pdp-stat__label">{s.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */
/*  بطاقة الفورم (العمود الأيسر)                                                 */
/* -------------------------------------------------------------------------- */
function ActionCard({ property, onAction }) {
    return (
        <aside className="pdp-side-card">
            <div className="pdp-owner">
                <img className="pdp-owner__avatar" src={property.owner.avatar} alt={property.owner.name} />
                <div className="pdp-owner__meta">
                    <span className="pdp-owner__name">{property.owner.name}</span>
                    <span className="pdp-owner__role">مالك العقار</span>
                </div>
            </div>

            <div className="pdp-actions">
                <button className="pdp-btn pdp-btn--primary" onClick={onAction}>
                    <Icon name="calendar" size={17} />
                    احجز الآن
                </button>
                <button className="pdp-btn pdp-btn--outline" onClick={onAction}>
                    <Icon name="whatsapp" size={18} />
                    ارسال رسالة عبر واتساب
                </button>
                <button className="pdp-btn pdp-btn--whatsapp" onClick={onAction}>
                    <Icon name="headset" size={18} />
                    تحدث مع الوكيل
                </button>
            </div>
        </aside>
    );
}

/* -------------------------------------------------------------------------- */
/*  الوصف                                                                      */
/* -------------------------------------------------------------------------- */
function Description({ description, expanded, onToggle }) {
    const short = description.length > 160 && !expanded
        ? description.slice(0, 160).trim() + "…"
        : description;

    return (
        <section className="pdp-card">
            <h2 className="pdp-section-title">وصف</h2>
            <p className="pdp-desc">
                {short}{" "}
                {description.length > 160 && (
                    <button className="pdp-read-more" onClick={onToggle}>
                        {expanded ? "عرض أقل" : "عرض المزيد"}
                    </button>
                )}
            </p>
        </section>
    );
}

/* -------------------------------------------------------------------------- */
/*  وسائل الراحة                                                               */
/* -------------------------------------------------------------------------- */
function Amenities({ amenities }) {
    if (!amenities.length) return null;
    return (
        <section className="pdp-card">
            <h2 className="pdp-section-title">وسائل الراحة الرئيسية</h2>
            <div className="pdp-amenities">
                {amenities.map((a) => (
                    <div className="pdp-amenity" key={a.label}>
                        <span className="pdp-amenity__icon">
                            <Icon name={a.icon} size={18} />
                        </span>
                        <span>{a.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */
/*  اقتراحات مشابهة                                                            */
/* -------------------------------------------------------------------------- */
function Similar({ listings, onSelect }) {
    return (
        <section className="pdp-block">
            <h2 className="pdp-section-title">اقتراحات قد تعجبك</h2>
            <div className="pdp-similar">
                {listings.map((p, i) => (
                    <div className="pdp-sim" key={p.title}>
                        <div className="pdp-sim__img-wrap">
                            <img src={p.image} alt={p.title} />
                            <span className="pdp-sim__badge">{STATUS_LABELS[p.status] || p.status}</span>
                        </div>
                        <div className="pdp-sim__body">
                            <div className="pdp-sim__price">
                                {Number(p.price).toLocaleString()} ₪
                            </div>
                            <h3 className="pdp-sim__title">{p.title}</h3>
                            <p className="pdp-sim__loc">
                                <Icon name="pin" size={14} />
                                {p.address}
                            </p>
                            <div className="pdp-sim__stats">
                                <span className="pdp-sim__stat">
                                    <Icon name="bed" size={15} />
                                    {p.bedrooms}
                                </span>
                                <span className="pdp-sim__stat">
                                    <Icon name="bath" size={15} />
                                    {p.bathrooms}
                                </span>
                                <span className="pdp-sim__stat">
                                    <Icon name="area" size={15} />
                                    {p.area} م²
                                </span>
                            </div>
                            <button className="pdp-sim__btn" onClick={() => onSelect(i)}>
                                عرض التفاصيل
                                <Icon name="arrowLeft" size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */
/*  Dialog طلب تسجيل الدخول                                                     */
/* -------------------------------------------------------------------------- */
function LoginPrompt({ open, onClose }) {
    const navigate = useNavigate();
    if (!open) return null;
    return (
        <div className="pdp-login-prompt" role="dialog" aria-modal="true">
            <div className="pdp-login-prompt__backdrop" onClick={onClose} />
            <div className="pdp-login-prompt__box">
                <button className="pdp-login-prompt__close" onClick={onClose} aria-label="إغلاق">
                    <Icon name="close" size={16} />
                </button>

                <div className="pdp-login-prompt__badge">
                    <div className="pdp-login-prompt__badge-inner">
                        <Icon name="user" size={26} />
                    </div>
                </div>

                <h3 className="pdp-login-prompt__title">سجّل الدخول للمتابعة</h3>
                <p className="pdp-login-prompt__subtitle">
                    يجب إنشاء حساب لتتمكن من حفظ العقارات والتواصل مع الملاك.
                </p>

                <button
                    className="pdp-login-prompt__btn pdp-login-prompt__btn--primary"
                    onClick={() => navigate("/login")}
                >
                    <span>تسجيل الدخول</span>
                    <Icon name="arrowLeft" size={18} />
                </button>
                <button
                    className="pdp-login-prompt__btn pdp-login-prompt__btn--outline"
                    onClick={() => navigate("/register")}
                >
                    انشاء حساب جديد
                </button>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  الصفحة                                                                     */
/* -------------------------------------------------------------------------- */
export default function PropertyDetailsPage() {
    const { id } = useParams();
    const location = useLocation();
    const passedProperty = location.state?.property;
    const [property, setProperty] = useState(() =>
        passedProperty ? mapListProperty(passedProperty) : mockProperty
    );
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [loginPromptOpen, setLoginPromptOpen] = useState(false);
    const [descExpanded, setDescExpanded] = useState(false);

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

    const closeLightbox = () => setLightboxIndex(null);
    const nextImage = () => setLightboxIndex((i) => (i + 1) % property.images.length);
    const prevImage = () =>
        setLightboxIndex((i) => (i - 1 + property.images.length) % property.images.length);

    const onProtectedAction = () => {
        if (!localStorage.getItem("access_token")) setLoginPromptOpen(true);
    };

    const onSelectSimilar = (index) => {
        setProperty(mapListProperty(similarListings[index]));
        setDescExpanded(false);
        setLightboxIndex(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="pdp-page" dir="rtl">
            <div className="pdp-inner">
                <Gallery images={property.images} onOpen={setLightboxIndex} />

                <div className="pdp-layout">
                    <div className="pdp-details-col">
                        <PropertyInfo property={property} />

                        <Description
                            description={property.description}
                            expanded={descExpanded}
                            onToggle={() => setDescExpanded((v) => !v)}
                        />

                        <Amenities amenities={property.amenities} />
                    </div>

                    <ActionCard property={property} onAction={onProtectedAction} />
                </div>

                <Similar listings={similarListings} onSelect={onSelectSimilar} />
            </div>

            <Lightbox
                images={property.images}
                index={lightboxIndex}
                onClose={closeLightbox}
                onNext={nextImage}
                onPrev={prevImage}
            />

            <LoginPrompt open={loginPromptOpen} onClose={() => setLoginPromptOpen(false)} />
        </div>
    );
}