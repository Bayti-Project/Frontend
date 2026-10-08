import { useCallback, useEffect, useState } from "react";
import {
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from "../services/api.js";

/* --------------------------------------------------------------------------
    US-22 — إشعارات المستخدم

    كان الملف كله بيانات تجريبية + localStorage، والـAPI الحين موجود
    (GET /api/notifications/ + PATCH read/ + PATCH read-all/)، فحوّلناه
    لمصدر واحد للحقيقة: الـstore تحت بيستخدمه النافبار (عدّاد غير المقروء)
    وصفحات الإشعارات كلها بنفس الوقت، وبنتشارك نفس الطلب بدل ما كل صفحة
    تنادي الـendpoint لحالها.
   -------------------------------------------------------------------------- */

const CACHE_TTL = 30_000;

const listeners = new Set();
let inflight = null;
let fetchedAt = 0;

const initialSnapshot = {
    items: [],
    /* idle: لسا ما طلبنا · loading: جاري · ready: عندنا بيانات
       · error: فشل · unauthenticated: ما في session */
    status: "idle",
    error: "",
    /* IDs عم نتعامل معها الآن (تعطيل زرار المقروء أثناء الحفظ) */
    saving: [],
};

let snapshot = initialSnapshot;

function emit(patch) {
    snapshot = { ...snapshot, ...patch };
    listeners.forEach((listener) => listener(snapshot));
}

function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

const hasToken = () => Boolean(localStorage.getItem("access_token"));

/* أقل من TTL ما بنعيد الطلب — عشان التنقل بين الصفحات ما يولّد طلب كل مرة */
function isFresh() {
    return snapshot.status === "ready" && Date.now() - fetchedAt < CACHE_TTL;
}

export function ensureNotifications({ force = false } = {}) {
    if (inflight) return inflight;
    if (!force && isFresh()) return Promise.resolve(snapshot);

    /* بدون توكن: الزائر بيطلع 401 — ما بنجيب شبكة بلا فايدة */
    if (!hasToken()) {
        fetchedAt = 0;
        emit({ items: [], status: "unauthenticated", error: "" });
        return Promise.resolve(snapshot);
    }

    emit({ status: snapshot.items.length ? snapshot.status : "loading" });

    inflight = fetchNotifications()
        .then((result) => {
            fetchedAt = Date.now();
            if (result.state === "ready") {
                emit({ items: result.items, status: "ready", error: "" });
            } else if (result.state === "unauthenticated") {
                fetchedAt = 0;
                emit({ items: [], status: "unauthenticated", error: result.message });
            } else {
                emit({ items: [], status: "error", error: result.message });
            }
            return snapshot;
        })
        .catch(() => {
            emit({ items: [], status: "error", error: "تعذر تحميل الإشعارات، حاول مرة أخرى." });
            return snapshot;
        })
        .finally(() => {
            inflight = null;
        });

    return inflight;
}

/* نسيّر التحديث مباشرة (optimistic) عشان الواجهة ما تنتظر الشبكة،
   وبنرجّع الحالة لو الـPATCH فشل */
function applyLocally(ids) {
    const keys = new Set(ids.map(String));
    emit({
        items: snapshot.items.map((item) =>
            keys.has(String(item.id)) && !item.read ? { ...item, read: true } : item
        ),
        saving: [...snapshot.saving, ...ids],
    });
}

function revertLocally(ids, message = "تعذر تحديث حالة الإشعار، حاول مرة أخرى.") {
    const keys = new Set(ids.map(String));
    emit({
        items: snapshot.items.map((item) =>
            keys.has(String(item.id)) ? { ...item, read: false } : item
        ),
        saving: snapshot.saving.filter((id) => !keys.has(String(id))),
        error: message,
    });
}

function endSaving(ids) {
    const keys = new Set(ids.map(String));
    emit({ saving: snapshot.saving.filter((id) => !keys.has(String(id))) });
}

export async function readNotification(id) {
    if (snapshot.items.some((item) => String(item.id) === String(id) && item.read)) return;

    applyLocally([id]);
    try {
        const res = await markNotificationRead(id);
        if (res && res.status === 401) {
            emit({
                items: [],
                status: "unauthenticated",
                error: "انتهت الجلسة، يرجى تسجيل الدخول من جديد.",
            });
            return;
        }
        if (res && res.status === 403) {
            revertLocally([id], "ليس لديك صلاحية لتحديث حالة هذا الإشعار.");
            return;
        }
        if (res && !res.ok && res.status !== 404) revertLocally([id]);
        else endSaving([id]);
    } catch {
        revertLocally([id]);
    }
}

export async function readAllNotifications() {
    if (!snapshot.items.some((item) => !item.read)) return;

    const unreadIds = snapshot.items.filter((item) => !item.read).map((item) => item.id);
    applyLocally(unreadIds);
    try {
        const res = await markAllNotificationsRead();
        if (res && res.status === 401) {
            emit({
                items: [],
                status: "unauthenticated",
                error: "انتهت الجلسة، يرجى تسجيل الدخول من جديد.",
            });
            return;
        }
        if (res && res.status === 403) {
            revertLocally(unreadIds, "ليس لديك صلاحية لتحديث الإشعارات.");
            return;
        }
        if (res && !res.ok) revertLocally(unreadIds);
        else endSaving(unreadIds);
    } catch {
        revertLocally(unreadIds);
    }
}

/* logout / تبديل مستخدم: بنمسح الكاش حتى ما تظهر إشعارات مستخدم سابق */
export function resetNotifications() {
    fetchedAt = 0;
    inflight = null;
    snapshot = initialSnapshot;
    listeners.forEach((listener) => listener(snapshot));
}

/* -------------------------------------------------------------------------- */
/*  التوقيت بالعربي                                                           */
/* -------------------------------------------------------------------------- */
const dateFormatter = new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
});

function plural(count, singular, dual, pluralForm) {
    if (count === 1) return singular;
    if (count === 2) return dual;
    return `${count} ${pluralForm}`;
}

export function formatNotificationTime(createdAt) {
    if (!createdAt) return "";
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return String(createdAt);

    const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
    if (minutes < 1) return "الآن";
    if (minutes < 60) return `منذ ${plural(minutes, "دقيقة", "دقيقتين", "دقائق")}`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${plural(hours, "ساعة", "ساعتين", "ساعات")}`;

    const days = Math.floor(hours / 24);
    if (days === 1) return "أمس";
    if (days < 7) return `منذ ${plural(days, "يوم", "يومين", "أيام")}`;

    return dateFormatter.format(date);
}

/* -------------------------------------------------------------------------- */
/*  Hooks                                                                     */
/* -------------------------------------------------------------------------- */
export function useNotifications() {
    const [state, setState] = useState(snapshot);

    useEffect(() => {
        const unsubscribe = subscribe(setState);
        /* بنزامن مع آخر snapshot بعد الاشتراك: ممكن تحديث يوصل بين أول
           render والاشتراك (خصوصة لو النافبار بدأ الطلب قبل هالصفحة) */
        setState(snapshot);
        ensureNotifications();
        return unsubscribe;
    }, []);

    const refresh = useCallback(() => ensureNotifications({ force: true }), []);

    return {
        items: state.items,
        status: state.status,
        error: state.error,
        saving: state.saving,
        isLoading: state.status === "loading" || (state.status === "idle" && hasToken()),
        isUnauthorized: state.status === "unauthenticated",
        refresh,
        markRead: readNotification,
        markAllRead: readAllNotifications,
    };
}

export function useUnreadNotificationsCount() {
    const { items } = useNotifications();
    return items.filter((item) => !item.read).length;
}
