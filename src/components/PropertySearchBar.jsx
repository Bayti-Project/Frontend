import { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaSearch, FaCheck } from "react-icons/fa";
import "./PropertySearchBar.css";

const DEFAULT_FILTERS = {
  region: "كل المناطق",
  propertyType: "شقق سكنية",
  priceRange: "بدون حد اقصي",
  rooms: "3",
};

/**
 * شريط بحث عقارات قابل لإعادة الاستخدام.
 *
 * Props:
 *  - regions:      مصفوفة مناطق (strings)
 *  - propertyTypes: مصفوفة أنواع عقارات (strings)
 *  - priceRanges:  مصفوفة نطاقات أسعار (strings)
 *  - roomOptions:  مصفوفة عدد الغرف (strings)
 *  - labels:       object اختياري لتخصيص النصوص
 *                  { region, propertyType, priceRange, rooms, search, placeholder }
 *  - searchButtonClass: كلاس إضافي اختياري لزر البحث
 *  - onSearch(draft): دالة تُستدعى عند الضغط على ابحث مع كامل القيم
 */
function SelectField({
  label,
  value,
  options,
  placeholder,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const closeOnOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, []);

  const handlePick = (opt) => {
    onChange(opt);
    setOpen(false);
  };

  return (
    <div className="psb-field" ref={wrapRef}>
      <label className="psb-label">{label}</label>
      <button
        type="button"
        className={`psb-trigger${open ? " open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={`psb-value${value ? "" : " placeholder"}`}>
          {value || placeholder || "اختر"}
        </span>
        <FaChevronDown size={12} className="psb-chevron" />
      </button>

      {open && (
        <ul className="psb-menu" role="listbox">
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                className={`psb-option${opt === value ? " selected" : ""}`}
                onClick={() => handlePick(opt)}
                role="option"
                aria-selected={opt === value}
              >
                <span>{opt}</span>
                {opt === value && <FaCheck size={12} className="psb-check" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PropertySearchBar({
  regions = [],
  propertyTypes = [],
  priceRanges = [],
  roomOptions = [],
  labels = {},
  searchButtonClass = "",
  initial = {},
  onSearch,
}) {
  const [filters, setFilters] = useState(() => ({
    region: initial.region || DEFAULT_FILTERS.region,
    propertyType: initial.propertyType || DEFAULT_FILTERS.propertyType,
    priceRange: initial.priceRange || DEFAULT_FILTERS.priceRange,
    rooms: initial.rooms || DEFAULT_FILTERS.rooms,
  }));

  const t = {
    region: labels.region || "المنطقة",
    propertyType: labels.propertyType || "نوع العقار",
    priceRange: labels.priceRange || "نطاق السعر",
    rooms: labels.rooms || "عدد الغرف",
    search: labels.search || "ابحث",
    placeholder: labels.placeholder || "اختر",
  };

  const setFilter = (key) => (val) =>
    setFilters((prev) => ({ ...prev, [key]: val }));

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.(filters);
  };

  return (
    <form className="psb-container" dir="rtl" onSubmit={handleSearch}>
      {/* المنطقة — أقصى اليمين */}
      <SelectField
        label={t.region}
        value={filters.region}
        options={regions}
        placeholder={t.placeholder}
        onChange={setFilter("region")}
      />

      {/* نوع العقار */}
      <SelectField
        label={t.propertyType}
        value={filters.propertyType}
        options={propertyTypes}
        placeholder={t.placeholder}
        onChange={setFilter("propertyType")}
      />

      {/* نطاق السعر */}
      <SelectField
        label={t.priceRange}
        value={filters.priceRange}
        options={priceRanges}
        placeholder={t.placeholder}
        onChange={setFilter("priceRange")}
      />

      {/* عدد الغرف — قرب زر البحث */}
      <SelectField
        label={t.rooms}
        value={filters.rooms}
        options={roomOptions}
        placeholder={t.placeholder}
        onChange={setFilter("rooms")}
      />

      {/* زر البحث — أقصى اليسار */}
      <button type="submit" className={`psb-search-btn ${searchButtonClass}`}>
        <FaSearch size={14} />
        <span>{t.search}</span>
      </button>
    </form>
  );
}