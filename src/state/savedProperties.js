import { useEffect, useState } from "react";

const STORAGE_KEY = "bayti_saved_properties";

function loadSaved() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(list)) return [];
        // تطبيع العقارات المحفوظة سابقاً لتوحيد العملة على الشيكل
        return list.map((p) => (p && typeof p === "object" ? { ...p, currency: "₪" } : p));
    } catch {
        return [];
    }
}

let savedItems = loadSaved();
const listeners = new Set();

function notify() {
    listeners.forEach((cb) => {
        try {
            cb();
        } catch {
            /* تجاهل أخطاء المستمعين */
        }
    });
}

function persist() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedItems));
    } catch {
        /* تجاهل تعذر الحفظ */
    }
    notify();
}

export function getSaved() {
    return [...savedItems];
}

export function isSaved(id) {
    return savedItems.some((p) => String(p.id) === String(id));
}

export function addSaved(property) {
    const item = toSavedItem(property);
    if (!item || item.id === undefined || item.id === null || item.id === "") return;
    if (isSaved(item.id)) return;
    savedItems = [...savedItems, item];
    persist();
}

export function removeSaved(id) {
    savedItems = savedItems.filter((p) => String(p.id) !== String(id));
    persist();
}

export function toggleSaved(property) {
    if (isSaved(property?.id)) removeSaved(property.id);
    else addSaved(property);
}

export function clearSaved() {
    savedItems = [];
    persist();
}

export function subscribeSaved(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
}

export function useSaved() {
    const [items, setItems] = useState(() => getSaved());
    useEffect(() => subscribeSaved(() => setItems(getSaved())), []);
    return items;
}

const CATEGORY_MAP = {
    apartment: "residential",
    villa: "residential",
    land: "residential",
    store_room: "storage",
    barracks: "storage",
    barrack: "storage",
    chalet: "chalet",
    shop: "residential",
};

// الموقع للإيجار فقط، فأي نوع تعامل قديم يُوحَّد إلى "للايجار"
function normalizeListingType(value) {
    const raw = typeof value === "string" ? value.trim() : "";
    if (!raw) return "للايجار";
    if (raw.includes("بيع")) return "للايجار";
    return raw;
}

export function toSavedItem(p) {
    if (!p) return null;

    // الموقع موحّد على الشيكل: أي رمز في السعر القديم يُتجاهل
    let rawPrice = p.price;
    if (typeof rawPrice === "string") {
        rawPrice = parseFloat(rawPrice.replace(/[^0-9.]/g, "")) || 0;
    }
    const currency = "₪";

    const type = p.property_type || p.type;
    let image = p.image || "";
    if (!image && Array.isArray(p.images) && p.images.length) {
        image = typeof p.images[0] === "string" ? p.images[0] : p.images[0]?.image || "";
    }

    return {
        id: p.id,
        category: p.category || CATEGORY_MAP[type] || "residential",
        // الموقع للإيجار فقط: أي "للبيع" قديمة تتحوّل إلى "للايجار"
        listingType: normalizeListingType(
            p.listingType ||
            p.listing_type ||
            p.purpose
        ),
        title: p.title || "عقار",
        location:
            p.location ||
            p.address ||
            [p.neighborhood, p.area].filter(Boolean).join(", ") ||
            "",
        price: Number(rawPrice) || 0,
        currency,
        bedrooms: p.bedrooms || p.beds || 0,
        bathrooms: p.bathrooms || p.baths || 0,
        area: p.area_sqm || p.area || 0,
        image: image || "",
        imagePosition: p.imagePosition,
        status: p.status,
        property_type: type,
    };
}