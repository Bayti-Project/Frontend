import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaBell, FaUser, FaKey, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import logoImg from "./logo.png";
import defaultAvatar from "./default-avatar.svg";
import { useStoredUser, useUserAvatar } from "../state/currentUser.js";
import { useUnreadNotificationsCount } from "../state/notifications.js";

const NAV_ITEMS = [
  { id: "home", label: "الرئيسية", action: "onHomeClick", exact: true, paths: ["/", "/home", "/home-tenant", "/home-owner"] },
  { id: "search", label: "البحث", action: "onSearchClick", paths: ["/search", "/property-search"] },
  { id: "requests", label: "طلباتي", action: "onRequestsClick", paths: ["/my-requests", "/owner-requests"] },
  { id: "saved", label: "المحفوظات", action: "onSavedClick", paths: ["/saved"] },
  { id: "dashboard", label: "لوحة التحكم", to: "/owner-dashboard", ownerOnly: true, paths: ["/owner-dashboard"] },
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef(null);
  const user = useStoredUser();
  const avatar = useUserAvatar();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const unreadCount = useUnreadNotificationsCount();

  const isOwner = user?.role === "owner" || user?.role === "مالك عقار";

  // «لوحة التحكم» بتظهر للمالك فقط
  const items = useMemo(
    () => NAV_ITEMS.filter((item) => !item.ownerOnly || isOwner),
    [isOwner]
  );

  const activeLink = useMemo(() => {
    const match = items.find((item) =>
      item.paths.some((path) => {
        if (path === "/") return pathname === "/";
        // مطابقة تامة للرئيسية، وإلا "/home" كانت بتطابق "/home-owner" و "/home-tenant"
        return item.exact ? pathname === path : pathname.startsWith(path);
      })
    );
    return match ? match.id : "";
  }, [pathname, items]);

  const handlers = { onHomeClick, onSearchClick, onRequestsClick, onSavedClick };

  // فتح قائمة الموبايل بيقفل قائمة البروفايل والعكس
  function toggleMobile() {
    setMobileOpen((prev) => !prev);
    setShowMenu(false);
  }

  useEffect(() => {
    if (!showMenu && !mobileOpen) return;

    function handleOutsideClick(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setShowMenu(false);
        setMobileOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setShowMenu(false);
        setMobileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showMenu, mobileOpen]);

  // رجوع لعرض الديسكتوب بيقفل قائمة الموبايل
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 860) setMobileOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function selectLink(item) {
    setMobileOpen(false);
    // اللينكات اللي عندها مسار مباشر بدل handler
    if (item.to) {
      navigate(item.to);
      return;
    }
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
        <ul className={`main-nav${mobileOpen ? " is-open" : ""}`}>
          {items.map((item) => (
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
              setMobileOpen(false);
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

        <button
          className="mobile-toggle"
          aria-label={mobileOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={mobileOpen}
          onClick={toggleMobile}
        >
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </header>
  );
}
