import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaWhatsapp,
  FaFacebook,
  FaTelegramPlane,
  FaFacebookMessenger,
  FaMapMarkerAlt,
  FaLink,
  FaCopy,
  FaCheck,
  FaTimes,
  FaHome,
} from "react-icons/fa";
import { fetchShareLink } from "../services/api.js";
import { resolveMediaUrl } from "../services/api.js";
import "./SharePropertyModal.css";

const PLATFORMS = [
  { id: "whatsapp", label: "واتساب", Icon: FaWhatsapp, color: "#25D366" },
  { id: "facebook", label: "فيسبوك", Icon: FaFacebook, color: "#1877F2" },
  { id: "telegram", label: "تيليجرام", Icon: FaTelegramPlane, color: "#229ED9" },
  { id: "messenger", label: "ماسنجر", Icon: FaFacebookMessenger, color: "#A334FA" },
];

function resolvePreviewImage(raw) {
  if (!raw) return "";
  if (/^\/(assets|src)\//i.test(raw)) return raw;
  return resolveMediaUrl(raw);
}

function getFirstImage(property) {
  if (!property) return "";
  if (Array.isArray(property.images) && property.images.length) {
    const first = property.images[0];
    const raw = typeof first === "string" ? first : first?.image;
    if (raw) return resolvePreviewImage(raw);
  }
  return resolvePreviewImage(property.image || property.main_image || property.thumbnail || "");
}

function getLocation(property) {
  if (!property) return "غزة";
  return (
    property.location ||
    property.address ||
    [property.neighborhood, property.area, property.governorate].filter(Boolean).join("، ") ||
    property.governorate ||
    "غزة"
  );
}

function getPriceLabel(property) {
  if (!property) return "";
  const amount = Number(property.price || 0).toLocaleString();
  const symbol = "₪";
  const isRent = /rent/i.test(
    [property.listing_type, property.purpose, property.rent_period, property.property_type]
      .filter(Boolean)
      .join(" ")
  );
  return isRent ? `${symbol}${amount} / شهرياً` : `${symbol}${amount}`;
}

async function writeToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* المتصفح رفض API، نجرّب الطريقة البديلة */
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-9999px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

function ShareDialog({ property, onClose }) {
const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(() =>
    property?.id ? `${window.location.origin}/property/${property.id}` : ""
  );
  const copyTimerRef = useRef(null);

  /* رابط المشاركة الرسمي من GET /api/properties/{id}/share/ — بدون توكن.
     إذا الـAPI ما ردّ (أو العقار مؤجر 400) بنرجع للرابط المبني محلياً */
  useEffect(() => {
    if (!property?.id) return undefined;
    let active = true;
    const fallback = `${window.location.origin}/property/${property.id}`;

    fetchShareLink(property.id)
      .then(async (res) => {
        if (!res.ok) return fallback;
        const data = await res.json().catch(() => ({}));
        return data?.link || fallback;
      })
      .catch(() => fallback)
      .then((url) => {
        if (active) setShareUrl(url);
      });

    return () => {
      active = false;
    };
  }, [property?.id]);

  const shareText = useMemo(() => {
    const title = property?.title || "عقار";
    const location = getLocation(property);
    const price = getPriceLabel(property);
    return [title, location, price, shareUrl].filter(Boolean).join(" — ");
  }, [property, shareUrl]);

  useEffect(() => {
    if (!property) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [property, onClose]);

  useEffect(() => {
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
  }, []);

  const flashCopied = useCallback(() => {
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2600);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;
    const ok = await writeToClipboard(shareUrl);
    if (ok) flashCopied();
  }, [shareUrl, flashCopied]);

  const handleShare = useCallback(
    (platformId) => {
      const encodedUrl = encodeURIComponent(shareUrl);
      const encodedText = encodeURIComponent(shareText);
      const targets = {
        whatsapp: `https://api.whatsapp.com/send?text=${encodedText}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
        messenger: "https://www.messenger.com/new",
      };
      if (platformId === "messenger") {
        writeToClipboard(shareUrl);
        flashCopied();
      }
      const target = targets[platformId];
      if (!target) return;
      window.open(target, "_blank", "noopener,noreferrer,width=640,height=620");
    },
    [shareUrl, shareText, flashCopied]
  );

  const image = getFirstImage(property);
  const location = getLocation(property);
  const price = getPriceLabel(property);

  return (
    <div className="share-modal" role="dialog" aria-modal="true" aria-label="مشاركة العقار">
      <div className="share-modal__backdrop" onClick={onClose} />

      <div className="share-modal__box">
        <button className="share-modal__close" type="button" onClick={onClose} aria-label="إغلاق">
          <FaTimes />
        </button>

        <header className="share-modal__head">
          <h2 className="share-modal__title">مشاركة العقار</h2>
          <p className="share-modal__subtitle">أرسل تفاصيل العقار لمن تريد بضغطة واحدة</p>
        </header>

        <div className="share-modal__preview">
          <div className="share-modal__thumb">
            {image ? (
              <img src={image} alt={property.title || "صورة العقار"} />
            ) : (
              <span className="share-modal__thumb-empty">
                <FaHome />
              </span>
            )}
          </div>
          <div className="share-modal__info">
            <h3 className="share-modal__name">{property.title || "عقار"}</h3>
            <p className="share-modal__loc">
              <FaMapMarkerAlt />
              <span>{location}</span>
            </p>
            {price && <p className="share-modal__price">{price}</p>}
          </div>
        </div>

        <div className="share-modal__platforms">
          <p className="share-modal__label">مشاركة عبر</p>
          <ul className="share-modal__grid">
            {PLATFORMS.map(({ id, label, Icon, color }) => (
              <li key={id}>
                <button
                  type="button"
                  className="share-modal__platform"
                  onClick={() => handleShare(id)}
                  style={{ "--share-color": color }}
                >
                  <span className="share-modal__platform-icon">
                    <Icon />
                  </span>
                  <span className="share-modal__platform-name">{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="share-modal__copy">
          <label className="share-modal__label" htmlFor="share-modal-link">
            رابط العقار
          </label>
          <div className="share-modal__copy-row">
            <span className="share-modal__copy-field">
              <FaLink className="share-modal__copy-icon" />
              <input id="share-modal-link" type="text" readOnly value={shareUrl} dir="ltr" />
            </span>
            <button
              type="button"
              className={`share-modal__copy-btn${copied ? " is-done" : ""}`}
              onClick={handleCopy}
            >
              {copied ? <FaCheck /> : <FaCopy />}
              <span>{copied ? "تم النسخ" : "نسخ الرابط"}</span>
            </button>
          </div>

          {copied && (
            <p className="share-modal__toast" role="status">
              <FaCheck /> تم نسخ رابط العقار إلى الحافظة
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SharePropertyModal({ property, onClose }) {
  if (!property) return null;
  // البوابة ضرورية: الكارد فيه transform عند التحويم، وبيخلّي position:fixed
  // يُحسب بالنسبة للكارد بدل الشاشة فتهتزّ النافذة وتظهر مكان العقار
  return createPortal(
    <ShareDialog key={property.id} property={property} onClose={onClose} />,
    document.body
  );
}
