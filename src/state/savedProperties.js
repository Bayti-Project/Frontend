import { useEffect, useState } from "react";
import { saveProperty, unsaveProperty, fetchSavedProperties } from "../services/api.js";

const STORAGE_KEY = "bayti_saved_properties";
/* عقارات المستخدم حذفها محلياً وماوصل الحذف للسيرفر — منستثنيها من المزامنة
   لحد ما السيرفر يؤكد، وبعدها بينمسح */
const REMOVALS_KEY = "bayti_saved_pending_removals";

const isLoggedIn = () => Boolean(localStorage.getItem("access_token"));

function loadRemovals() {
    try {
        const raw = JSON.parse(localStorage.getItem(REMOVALS_KEY) || "[]");
        return new Set(Array.isArray(raw) ? raw.map(String) : []);
    } catch {
        return new Set();
    }
}

let pendingRemovals = loadRemovals();

function persistRemovals() {
    try {
        localStorage.setItem(REMOVALS_KEY, JSON.stringify([...pendingRemovals]));
    } catch {
        /* تجاهل تعذر الحفظ */
    }
}

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

/* الحفظ والإلغاء يروحون على الـAPI مع تحديث محلي فوري. إذا الـAPI رفض
   الطلب ما بنمسح اللي شافه المستخدم: بنخليه محلياً وبنعلّمه "معلّق" لحد ما
   ينجح الإرسال (أو أول ما يسجّل دخول) — قبل كان بنرجع للنسخة السابقة
   بصمت، فما كان المستخدم شايف شي بينمسح بدون سبب. */
function describeSaveError(status, data) {
    if (status === 401) return "انتهت الجلسة — حفظنا العقار محلياً وبنرسله أول ما تسجّل دخول.";
    if (status === 403) return "ما إلك صلاحية على هذا العقار — حفظناه محلياً.";
    if (status === 404) return "العقار مو موجود بالسيرفر — حفظناه محلياً.";
    if (status >= 500) return "خطأ بالسيرفر — حفظناه محلياً وبنحاول نبعثه تاني.";
    return data?.message || data?.detail || "تعذر الحفظ بالسيرفر — حفظناه محلياً.";
}

export function addSaved(property) {
    const item = toSavedItem(property);
    if (!item || item.id === undefined || item.id === null || item.id === "") {
        return Promise.resolve({ ok: false, message: "تعذر حفظ العقار" });
    }
    if (isSaved(item.id)) return Promise.resolve({ ok: true });

    pendingRemovals.delete(String(item.id));
    savedItems = [...savedItems, item];
    persist();

    /* الزائر: بينحفظ محلياً وبينرفع للسيرفر أول ما يسجّل دخول */
    if (!isLoggedIn()) return Promise.resolve({ ok: true, local: true });

    return saveProperty(item.id)
        .then(async (res) => {
            if (res.ok) return { ok: true };
            const data = await res.json().catch(() => ({}));
            return { ok: true, pending: true, message: describeSaveError(res.status, data) };
        })
        .catch(() => ({
            ok: true,
            pending: true,
            message: "تعذر الاتصال بالسيرفر — حفظنا العقار محلياً وبنبعثه أول ما يرجع الاتصال.",
        }));
}

export function removeSaved(id) {
    savedItems = savedItems.filter((p) => String(p.id) !== String(id));
    /* الحذف المعلّق: لازم نستثنيه من مزامنة السيرفر، وإلا رجع تاني فوراً */
    pendingRemovals.add(String(id));
    persistRemovals();
    persist();

    if (!isLoggedIn()) return Promise.resolve({ ok: true, local: true });

    return unsaveProperty(id)
        .then(async (res) => {
            if (res.ok || res.status === 404) {
                pendingRemovals.delete(String(id));
                persistRemovals();
                return { ok: true };
            }
            await res.json().catch(() => ({}));
            return { ok: true, pending: true, message: "تعذر الإلغاء بالسيرفر — حذفناه محلياً." };
        })
        .catch(() => ({ ok: true, pending: true, message: "تعذر الاتصال — حذفناه محلياً." }));
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

/* رد السيرفر ممكن يطلع بأكثر من شكل: مصفوفة مباشرة، أو saved_properties،
   أو results. كنا بنقرأ saved_properties بس، وأي شكل ثاني كان بيرجّع []
   وبيمسح المحفوظات كلها — كان هاد سبب "فظطت حفظ وما ظهر بالمحفوظات". */
function parseSavedPayload(data) {
    const raw =
        (Array.isArray(data) && data) ||
        (Array.isArray(data?.saved_properties) && data.saved_properties) ||
        (Array.isArray(data?.results) && data.results) ||
        (Array.isArray(data?.saved) && data.saved) ||
        (Array.isArray(data?.items) && data.items) ||
        [];
    return raw
        .map((entry) => {
            const item = toSavedItem(entry?.property || entry);
            if (!item) return null;
            return { ...item, savedAt: entry?.created_at || entry?.saved_at || null };
        })
        .filter(Boolean);
}

let syncInFlight = null;

/* زرار الحفظ موجود بكل كارد بالبحث، فبدون حarness واحد كل كارد بيفتح
   طلب للسيرفر لحاله */
export function syncSavedFromApi() {
    if (!isLoggedIn()) return Promise.resolve(getSaved());
    if (syncInFlight) return syncInFlight;

    syncInFlight = (async () => {
        try {
            const res = await fetchSavedProperties();
            if (!res.ok) {
                console.warn("[saved] تعذّر جلب المحفوظات من السيرفر:", res.status);
                return getSaved();
            }
            const data = await res.json().catch(() => ({}));
            const fromApi = parseSavedPayload(data).filter(
                (item) => !pendingRemovals.has(String(item.id))
            );
            /* اللي شفناه محلياً وما رجع من السيرفر (زائر قبل الدخول، أو طلب
               فاشل): بنحتفظ فيه بدل ما نمسحه، وبنبعثه للسيرفر هلق */
            const localOnly = savedItems.filter(
                (item) => !fromApi.some((s) => String(s.id) === String(item.id))
            );

            savedItems = [...fromApi, ...localOnly];
            persist();

            localOnly.forEach((item) => {
                saveProperty(item.id).catch(() => {});
            });
            pendingRemovals.forEach((id) => {
                unsaveProperty(id)
                    .then((r) => {
                        if (r.ok || r.status === 404) {
                            pendingRemovals.delete(id);
                            persistRemovals();
                        }
                    })
                    .catch(() => {});
            });
        } catch (err) {
            console.warn("[saved] فشل المزامنة — بنبقى على النسخة المحلية:", err);
        } finally {
            syncInFlight = null;
        }
        return getSaved();
    })();

    return syncInFlight;
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
        /* size: كارد البحث بيحوّل area_sqm إلى size قبل ما يمرّر العقار */
        area: p.area_sqm || p.area || p.size || 0,
        image: image || "",
        imagePosition: p.imagePosition,
        status: p.status,
        property_type: type,
    };
}