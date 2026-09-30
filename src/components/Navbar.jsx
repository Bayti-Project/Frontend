import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaBell, FaUser, FaKey, FaSignOutAlt } from "react-icons/fa";
import logoImg from "./logo.png";
import defaultAvatar from "./default-avatar.svg";
import { useUserAvatar } from "../state/currentUser.js";
import { useUnreadNotificationsCount } from "../state/notifications.js";

const NAV_ITEMS = [
  { id: "home", label: "الرئيسية", action: "onHomeClick", paths: ["/", "/home", "/home-tenant", "/home-owner"] },
  { id: "search", label: "البحث", action: "onSearchClick", paths: ["/search", "/property-search"] },
  { id: "requests", label: "طلباتي", action: "onRequestsClick", paths: ["/my-requests"] },
  { id: "saved", label: "المحفوظات", action: "onSavedClick", paths: ["/saved"] },
];

export default function Navbar({
  onProfileClick,
  onChangePasswordClick,
  onLogoutClick,
  onHomeClick,
  onSearchClick,
  onRequestsClick,
  onSavedClick,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const headerRef = useRef(null);
  const avatar = useUserAvatar();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const unreadCount = useUnreadNotificationsCount();

  const activeLink = useMemo(() => {
    const match = NAV_ITEMS.find((item) =>
      item.paths.some((path) =>
        path === "/" ? pathname === "/" : pathname.startsWith(path)
      )
    );
    return match ? match.id : "";
  }, [pathname]);

  const handlers = { onHomeClick, onSearchClick, onRequestsClick, onSavedClick };

  useEffect(() => {
    if (!showMenu) return;

    function handleOutsideClick(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showMenu]);

  function selectLink(item) {
    const handler = item.action ? handlers[item.action] : null;
    if (handler) handler();
  }

  return (
    <header className="site-header" dir="rtl" ref={headerRef}>
      <a
        href="#"
        className="logo"
        onClick={(e) => {
          e.preventDefault();
          onHomeClick?.();
        }}
      >
        <img src={logoImg} alt="بيتي Bayti" className="logo-img" />
      </a>

      <nav className="nav-container">
        <ul className="main-nav">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <a
                href="#"
                className={activeLink === item.id ? "active" : ""}
                aria-current={activeLink === item.id ? "page" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  selectLink(item);
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="header-actions">
        <div className="notif-menu">
          <button
            className="icon-btn"
            aria-label="الإشعارات"
            onClick={() => navigate("/notifications")}
          >
            <FaBell />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
        </div>

        <div className="avatar-menu">
          <button
            className="avatar"
            aria-label="الملف الشخصي"
            aria-expanded={showMenu}
            onClick={() => {
              setShowMenu((prev) => !prev);
            }}
          >
            <img src={avatar || defaultAvatar} alt="الصورة الشخصية" />
          </button>

          {showMenu && (
            <div className="dropdown-menu">
              <button onClick={onProfileClick}>
                <FaUser /> الملف الشخصي
              </button>
              <button onClick={onChangePasswordClick}>
                <FaKey /> تغيير كلمة المرور
              </button>
              <button className="logout-btn" onClick={onLogoutClick}>
                <FaSignOutAlt /> تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
