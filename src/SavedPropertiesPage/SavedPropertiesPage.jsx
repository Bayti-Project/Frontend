import { useState } from "react";
import "./SavedPropertiesPage.css";
import SharePropertyModal from "../components/SharePropertyModal";
import { useSaved, addSaved, removeSaved, clearSaved } from "../state/savedProperties";
import { hasPropertyImage } from "../services/api.js";
import apartmentSeaView from "./apartment-sea-view.jpg";
import villaExterior from "./villa-exterior.jpg";
import officeSpace from "./office-space.jpg";

// عقارات مقترحة تظهر لما تكون قائمة المحفوظات فارغة بالكامل (نفس بيانات
// قسم "اقتراحات قد تعجبك" في صفحة تفاصيل العقار)
const recommendedProperties = [
    {
        id: "rec-apartment",
        title: "شقة فاخرة مطلة على البحر",
        location: "غزة، الرمال الجنوبي",
        price: 4000,
        currency: "₪",
        bedrooms: 3,
        bathrooms: 2,
        area: 160,
        image: apartmentSeaView,
    },
    {
        id: "rec-villa",
        title: "فيلا عصرية مع حديقة",
        location: "غزة، تل الهوا",
        price: 80000,
        currency: "₪",
        bedrooms: 4,
        bathrooms: 3,
        area: 260,
        image: villaExterior,
    },
    {
        id: "rec-office",
        title: "مكتب تجاري في موقع حيوي",
        location: "غزة، النصر",
        price: 40000,
        currency: "₪",
        bedrooms: 3,
        bathrooms: 2,
        area: 160,
        image: officeSpace,
        imagePosition: "50% 58%",
    },
];

// أزرار الفلترة (بنفس ترتيب الفيجما) — "الكل" يظهر آخر السطر كما في التصميم
const categories = [
    { id: "residential", label: "شقق سكنية" },
    { id: "storage", label: "حاصل" },
    { id: "chalet", label: "شاليه" },
];

const sortOptions = [
    { value: "newest", label: "اضيف حديثا" },
    { value: "oldest", label: "الأقدم أولاً" },
];

/* ---------- أيقونات ---------- */
function ShareIcon() {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
            <circle cx="18" cy="5" r="2.6" stroke="#1F2937" strokeWidth="1.8" />
            <circle cx="6" cy="12" r="2.6" stroke="#1F2937" strokeWidth="1.8" />
            <circle cx="18" cy="19" r="2.6" stroke="#1F2937" strokeWidth="1.8" />
            <path d="m8.3 13.3 7.4 4.3M15.7 6.4l-7.4 4.3" stroke="#1F2937" strokeWidth="1.8" />
        </svg>
    );
}
function BookmarkFilledIcon() {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
            <path d="M6.5 3h11v18l-5.5-4.2L6.5 21V3Z" fill="#0282AD" />
        </svg>
    );
}
function PinIcon() {
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
            <path
                d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
                stroke="#1F2937"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
            <circle cx="12" cy="10" r="3" stroke="#1F2937" strokeWidth="1.8" />
        </svg>
    );
}
function BedIcon() {
    return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
            <path
                d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M12 4v6M2 18h20"
                stroke="#0282AD"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
function BathIcon() {
    return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
            <path
                d="M3.5 13h17v2a4.5 4.5 0 0 1-4.5 4.5H8A4.5 4.5 0 0 1 3.5 15v-2ZM7 19.5V21M17 19.5V21"
                stroke="#0282AD"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M18 13V6.5A2.5 2.5 0 0 0 15.5 4H14" stroke="#0282AD" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="7.5" cy="7.8" r="1.6" fill="#0282AD" />
            <path d="M5.5 13v-1.2a2 2 0 0 1 4 0V13" stroke="#0282AD" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}
function AreaIcon() {
    return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
            <path
                d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"
                stroke="#0282AD"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
function CheckIcon() {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
            <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
function ChevronDownIcon() {
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
            <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
function ClearIcon() {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
            <path
                d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
function BookmarkOutlineIcon({ size = 34 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
            <path
                d="M6.5 3h11v18l-5.5-4.2L6.5 21V3Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
            />
        </svg>
    );
}
function SearchIcon() {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}
function SparkleIcon() {
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <g transform="translate(0.5,6) scale(0.6)" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            </g>
            <g transform="translate(12,0.5) scale(0.42)" fill="currentColor">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            </g>
            <g transform="translate(12.5,13) scale(0.3)" fill="currentColor">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            </g>
        </svg>
    );
}
function ArrowLeftSmallIcon() {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
            <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/* ---------- نصوص الأعداد بالعربي ---------- */
function countText(n) {
    if (n === 1) return "عقار واحد";
    if (n === 2) return "عقاران";
    return `${n} عقارات`;
}
function subtitleText(n) {
    if (n === 0) return "لا توجد عقارات محفوظة في قائمتك حالياً";
    if (n === 1) return "لديك عقار واحد محفوظ في قائمتك المفضلة للمقارنة والمتابعة السريعة";
    if (n === 2) return "لديك عقاران محفوظان في قائمتك المفضلة للمقارنة والمتابعة السريعة";
    return `لديك ${n} عقارات محفوظة في قائمتك المفضلة للمقارنة والمتابعة السريعة`;
}

export default function SavedPropertiesPage({ onOpenDetails }) {
    const saved = useSaved();
    const [activeFilter, setActiveFilter] = useState("all");
    const [sort, setSort] = useState("newest");
    const [shareTarget, setShareTarget] = useState(null);

    const removeSavedItem = (id) => removeSaved(id);
    const clearAllItems = () => clearSaved();
    const addRecommended = (property) => addSaved(property);

    // العقارات بدون صور ما بتنعرض
    const withImage = saved.filter(hasPropertyImage);
    const filtered =
        activeFilter === "all" ? withImage : withImage.filter((p) => p.category === activeFilter);
    const visible = sort === "oldest" ? [...filtered].reverse() : filtered;

    return (
        <main className="saved-page">
            <div className="saved-inner">
                {/* العنوان */}
                <div className="saved-title-row">
                    <h1>العقارات المحفوظة</h1>
                    <span className="saved-count-pill">{countText(withImage.length)}</span>
                </div>
                <p className="saved-subtitle">{subtitleText(withImage.length)}</p>

                {/* شريط الفلترة والترتيب */}
                <div className="saved-filter-bar">
                    <div className="saved-chips" role="group" aria-label="تصنيف العقارات">
                        {categories.map((cat) => {
                            const count = withImage.filter((p) => p.category === cat.id).length;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    className={`saved-chip${activeFilter === cat.id ? " active" : ""}`}
                                    aria-pressed={activeFilter === cat.id}
                                    onClick={() => setActiveFilter(cat.id)}
                                >
                                    {cat.label}
                                    {count > 0 && ` (${count})`}
                                    {activeFilter === cat.id && <CheckIcon />}
                                </button>
                            );
                        })}
                        <button
                            type="button"
                            className={`saved-chip${activeFilter === "all" ? " active" : ""}`}
                            aria-pressed={activeFilter === "all"}
                            onClick={() => setActiveFilter("all")}
                        >
                            الكل
                            {activeFilter === "all" && <CheckIcon />}
                        </button>
                    </div>

                    <div className="saved-tools">
                        <label className="saved-sort">
                            <span className="saved-sort-label">ترتيب حسب:</span>
                            <span className="saved-select">
                                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                                    {sortOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDownIcon />
                            </span>
                        </label>

                        <button
                            type="button"
                            className="saved-clear"
                            onClick={clearAllItems}
                            disabled={withImage.length === 0}
                        >
                            <ClearIcon />
                            تفريغ المحفوظات
                        </button>
                    </div>
                </div>

                {/* البطاقات */}
                {withImage.length === 0 ? (
                    <>
                        <div className="saved-empty-hero">
                            <div className="saved-empty-icon">
                                <BookmarkOutlineIcon />
                            </div>
                            <h2>قائمة محفوظاتك فارغة حالياً</h2>
                            <p>
                                أثناء تصفحك للعقارات والشقق في غزة، اضغط على أيقونة القلب لحفظ العقارات التي تناسبك
                                لمقارنتها لاحقاً والتواصل السريع مع الملاك دون عناء البحث من جديد.
                            </p>
                            <button type="button" className="saved-empty-cta" onClick={onOpenDetails}>
                                استكشف العقارات المتاحة الان
                                <SearchIcon />
                            </button>
                        </div>

                        <div className="saved-recommend">
                            <div className="saved-recommend-head">
                                <div className="saved-recommend-heading">
                                    <h3>
                                        <SparkleIcon />
                                        عقارات مقترحة قد تهمك للبدء
                                    </h3>
                                    <p>شقق ومنازل موثقة ومتاحة للإيجار حالياً يمكنك حفظها بالضغط على رمز القلب</p>
                                </div>
                                <a href="#" className="saved-recommend-link">
                                    عرض جميع عقارات غزة المتاحة
                                    <ArrowLeftSmallIcon />
                                </a>
                            </div>

                            <div className="saved-grid">
                                {recommendedProperties.map((property) => (
                                    <article key={property.id} className="saved-card">
                                        <div className="saved-card-media">
                                            <img
                                                src={property.image}
                                                alt={property.title}
                                                style={property.imagePosition ? { objectPosition: property.imagePosition } : undefined}
                                            />
                                            <span className="saved-badge">للايجار</span>
                                            <div className="saved-card-tools">
                                                <button
                                                    type="button"
                                                    className="saved-round-btn"
                                                    aria-label="مشاركة"
                                                    onClick={() => setShareTarget(property)}
                                                >
                                                    <ShareIcon />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="saved-round-btn"
                                                    aria-label="حفظ العقار"
                                                    onClick={() => addRecommended(property)}
                                                >
                                                    <BookmarkOutlineIcon size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="saved-card-body">
                                            <h3 className="saved-card-title">{property.title}</h3>

                                            <div className="saved-meta-row">
                                                <span className="saved-location">
                                                    <PinIcon />
                                                    {property.location}
                                                </span>
                                                <span className="saved-price" dir="ltr">
                                                    {property.currency}
                                                    {property.price.toLocaleString("en-US")}
                                                </span>
                                            </div>

                                            <div className="saved-divider" />

                                            <div className="saved-stats">
                                                <span className="saved-stat">
                                                    <BedIcon />
                                                    {property.bedrooms}
                                                </span>
                                                <span className="saved-stat">
                                                    <BathIcon />
                                                    {property.bathrooms}
                                                </span>
                                                <span className="saved-stat">
                                                    <AreaIcon />
                                                    {property.area}م²
                                                </span>
                                            </div>

                                            <button type="button" className="saved-view-btn" onClick={() => onOpenDetails?.(property.id)}>
                                                عرض التفاصيل
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </>
                ) : visible.length > 0 ? (
                    <div className="saved-grid">
                        {visible.map((property) => (
                            <article key={property.id} className="saved-card">
                                <div className="saved-card-media">
                                    <img
                                        src={property.image}
                                        alt={property.title}
                                        style={property.imagePosition ? { objectPosition: property.imagePosition } : undefined}
                                    />
                                    <span className="saved-badge">{property.listingType}</span>
                                    <div className="saved-card-tools">
                                                <button
                                                    type="button"
                                                    className="saved-round-btn"
                                                    aria-label="مشاركة"
                                                    onClick={() => setShareTarget(property)}
                                                >
                                                    <ShareIcon />
                                                </button>
                                        <button
                                            type="button"
                                            className="saved-round-btn"
                                            aria-label="إزالة من المحفوظات"
                                            onClick={() => removeSavedItem(property.id)}
                                        >
                                            <BookmarkFilledIcon />
                                        </button>
                                    </div>
                                </div>

                                <div className="saved-card-body">
                                    <h3 className="saved-card-title">{property.title}</h3>

                                    <div className="saved-meta-row">
                                        <span className="saved-location">
                                            <PinIcon />
                                            {property.location}
                                        </span>
                                        <span className="saved-price" dir="ltr">
                                            {property.currency}
                                            {property.price.toLocaleString("en-US")}
                                        </span>
                                    </div>

                                    <div className="saved-divider" />

                                    <div className="saved-stats">
                                        <span className="saved-stat">
                                            <BedIcon />
                                            {property.bedrooms}
                                        </span>
                                        <span className="saved-stat">
                                            <BathIcon />
                                            {property.bathrooms}
                                        </span>
                                        <span className="saved-stat">
                                            <AreaIcon />
                                            {property.area}م²
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className="saved-view-btn"
                                        onClick={() => onOpenDetails?.(property.id)}
                                    >
                                        عرض التفاصيل
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="saved-empty">
                        لا توجد عقارات محفوظة في هذا التصنيف
                    </div>
                )}
            </div>

            <SharePropertyModal property={shareTarget} onClose={() => setShareTarget(null)} />
        </main>
    );
}