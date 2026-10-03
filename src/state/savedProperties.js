import { useEffect, useState } from "react";
import { saveProperty, unsaveProperty, fetchSavedProperties } from "../services/api.js";

const STORAGE_KEY = "bayti_saved_properties";

const isLoggedIn = () => Boolean(localStorage.getItem("access_token"));

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

/* الحفظ والإلغاء يروحون على الـAPI مع تحديث محلي فوري،efnرجع للنسخة السابقة
   إذا الـAPI رفض الطلب. 400/404 معناها الحالة متطابقة أصلاً فبنعتبرها نجاح */
export function addSaved(property) {
    const item = toSavedItem(property);
    if (!item || item.id === undefined || item.id === null || item.id === "") {
        return Promise.resolve({ ok: false, message: "تعذر حفظ العقار" });
    }
    if (isSaved(item.id)) return Promise.resolve({ ok: true });

    const previous = savedItems;
    savedItems = [...savedItems, item];
    persist();

    if (!isLoggedIn()) return Promise.resolve({ ok: true });

    return saveProperty(item.id)
        .then(async (res) => {
            if (res.ok) return { ok: true };
            const data = await res.json().catch(() => ({}));
            if (res.status === 400) return { ok: true };
            savedItems = previous;
            persist();
            return { ok: false, message: data?.message || "تعذر حفظ العقار" };
        })
        .catch(() => {
            savedItems = previous;
            persist();
            return { ok: false, message: "تعذر الاتصال بالخادم" };
        });
}

export function removeSaved(id) {
    const previous = savedItems;
    savedItems = savedItems.filter((p) => String(p.id) !== String(id));
    persist();

    if (!isLoggedIn()) return Promise.resolve({ ok: true });

    return unsaveProperty(id)
        .then(async (res) => {
            if (res.ok) return { ok: true };
            await res.json().catch(() => ({}));
            if (res.status === 404) return { ok: true };
            savedItems = previous;
            persist();
            return { ok: false, message: "تعذر إلغاء حفظ العقار" };
        })
        .catch(() => {
            savedItems = previous;
            persist();
            return { ok: false, message: "تعذر الاتصال بالخادم" };
        });
}

export function toggleSaved(property) {
    if (isSaved(property?.id)) return removeSaved(property.id);
    return addSaved(property);
}

/* ما في endpoint مسح للكل، فنلغي الحفظ طلب طلب */
export async function clearSaved() {
    const previous = savedItems;
    const ids = previous.map((p) => p.id);
    savedItems = [];
    persist();

    if (!isLoggedIn()) return { ok: true };

    const results = await Promise.all(
        ids.map((id) => unsaveProperty(id).catch(() => null))
    );
    const failed = results.filter((res) => res && !res.ok && res.status !== 404).length;
    if (failed) {
        savedItems = previous;
        persist();
        return { ok: false, message: "تعذر إلغاء حفظ بعض العقارات" };
    }
    return { ok: true };
}

export async function syncSavedFromApi() {
    if (!isLoggedIn()) return getSaved();

    try {
        const res = await fetchSavedProperties();
        if (!res.ok) return getSaved();
        const data = await res.json().catch(() => ({}));
        const list = Array.isArray(data?.saved_properties) ? data.saved_properties : [];
        savedItems = list
            .map((entry) => {
                const item = toSavedItem(entry?.property || entry);
                return item ? { ...item, savedAt: entry?.created_at || null } : null;
            })
            .filter(Boolean);
        persist();
    } catch {
        /* نخلي النسخة المحلية */
    }
    return getSaved();
}

export function subscribeSaved(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
}

export function useSaved() {
    const [items, setItems] = useState(() => getSaved());
    useEffect(() => {
        const unsubscribe = subscribeSaved(() => setItems(getSaved()));
        if (isLoggedIn()) syncSavedFromApi();
        return unsubscribe;
    }, []);
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