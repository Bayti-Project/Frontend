const DRAFT_KEY = "bayti_property_draft";

const draft = {
    formData: {},
    features: {},
    bedrooms: 2,
    bathrooms: 2,
    photos: [],
    savedAt: null,
};

export function saveDraft(data) {
    Object.assign(draft, data);
    draft.savedAt = new Date().toISOString();
}

export function getDraft() {
    return draft;
}

export function persistDraft() {
    try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
        console.error("تعذر حفظ المسودة", e);
    }
}

export function loadPersistedDraft() {
    try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return null;
        const saved = JSON.parse(raw);
        Object.assign(draft, {
            formData: saved.formData || {},
            features: saved.features || {},
            bedrooms: typeof saved.bedrooms === "number" ? saved.bedrooms : 2,
            bathrooms: typeof saved.bathrooms === "number" ? saved.bathrooms : 2,
            photos: Array.isArray(saved.photos)
                ? saved.photos.map((p) => (typeof p === "string" ? { url: p } : { url: p?.url || "" }))
                : [],
            savedAt: saved.savedAt || null,
        });
        return draft;
    } catch (e) {
        return null;
    }
}

export function hasPersistedDraft() {
    try {
        return Boolean(localStorage.getItem(DRAFT_KEY));
    } catch (e) {
        return false;
    }
}

export function clearPersistedDraft() {
    try {
        localStorage.removeItem(DRAFT_KEY);
    } catch (e) {
        /* تجاهل تعذر الحذف */
    }
    resetDraft();
}

export function resetDraft() {
    draft.formData = {};
    draft.features = {};
    draft.bedrooms = 2;
    draft.bathrooms = 2;
    draft.photos = [];
    draft.savedAt = null;
}