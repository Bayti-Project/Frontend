import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaLock, FaArrowLeft } from "react-icons/fa";
import "./AuthPromptModal.css";

const COPY = {
  details: {
    title: "يجب إنشاء حساب لعرض التفاصيل",
    body: "قم بإنشاء حساب مجاني على بيتي لتتمكن من مشاهدة تفاصيل العقار والتواصل مع المالك مباشرة.",
  },
  save: {
    title: "يجب إنشاء حساب لحفظ العقار",
    body: "قم بإنشاء حساب مجاني على بيتي لحفظ هذا العقار في قائمتك المفضلة والعودة إليه لاحقاً بسهولة.",
  },
};

/**
 * نافذة تسجيل الدخول/إنشاء الحساب للزائر.
 * تُغلق بمفتاح Escape، وتعيد المستخدم إلى العقار بعد تسجيل الدخول.
 */
export default function AuthPromptModal({ property, intent = "details", onClose }) {
  const navigate = useNavigate();
  const copy = COPY[intent] || COPY.details;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!property) return null;

  const redirectTo = `/property/${property.id}`;

  return (
    <div className="lp-auth-prompt" role="dialog" aria-modal="true">
      <div className="lp-auth-prompt__backdrop" onClick={onClose} />
      <div className="lp-auth-prompt__box">
        <button
          className="lp-auth-prompt__close"
          onClick={onClose}
          aria-label="إغلاق"
        >
          <FaTimes />
        </button>

        <div className="lp-auth-prompt__icon">
          <FaLock />
        </div>

        <h3>{copy.title}</h3>
        <p>{copy.body}</p>

        <button
          className="lp-auth-prompt__btn primary"
          onClick={() =>
            navigate("/register", { state: { redirectTo, property } })
          }
        >
          إنشاء حساب <FaArrowLeft />
        </button>
        <button
          className="lp-auth-prompt__btn outline"
          onClick={() => navigate("/login", { state: { redirectTo, property } })}
        >
          تسجيل الدخول
        </button>
      </div>
    </div>
  );
}
