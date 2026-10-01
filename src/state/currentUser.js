import { useEffect, useState } from "react";
import { resolveMediaUrl } from "../services/api.js";

const STORAGE_KEY = "bayti_user";
const CHANGE_EVENT = "bayti:user-change";

function readUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getStoredUser() {
  return readUser();
}

export function notifyUserChange() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// يحدّث بيانات المستخدم المحفوظة ويخبر النافبار بالتغيير
export function persistUser(patch) {
  const next = { ...(readUser() || {}), ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return next;
  }
  notifyUserChange();
  return next;
}

export function useStoredUser() {
  const [user, setUser] = useState(readUser);

  useEffect(() => {
    const sync = () => setUser(readUser());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return user;
}

export function useUserAvatar() {
  const user = useStoredUser();
  return resolveMediaUrl(user?.avatar || "") || "";
}
