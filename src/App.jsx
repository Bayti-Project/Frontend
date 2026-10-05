import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useParams, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingFooter from "./components/LandingFooter";
import AuthPromptModal from "./components/AuthPromptModal";
import { resolveMediaUrl, clearCredentials, isOwnerRole, isTenantRole, resolveRole, fetchCurrentRole } from "./services/api.js";
import { resetNotifications } from "./state/notifications.js";
import defaultAvatar from "./components/default-avatar.svg";
import "./styles/style.css";

import ResetPasswordForm from "./ResetPasswordForm/ResetPasswordForm";
import ChangePasswordForm from "./ChangePasswordForm/ChangePasswordForm";
import OwnerProfile from "./OwnerProfile/OwnerProfile";
import TenantProfile from "./TenantProfile/TenantProfile";
import EditProfile from "./EditProfile/EditProfile";
import Home from "./HomeVisitor/HomeVisitor";
import HomeTenant from "./HomeTenant/HomeTenant";
import OwnerHome from "./OwnerHome/OwnerHome";
import OwnerDashboard from "./ownerDashboard/OwnerDashboard";
import PropertyEditPage from "./PropertyEditPage/PropertyEditPage";
import AddPropertyPage from "./AddPropertyPage/AddPropertyPage";
import AddPropertyPhotosPage from "./AddPropertyPhotosPage/AddPropertyPhotosPage";
import AddPropertyPreviewPage from "./AddPropertyPreviewPage/AddPropertyPreviewPage";
import Login from "./Login/Login";
import Register from "./Register/Register";
import ForgotPassword from "./ForgotPassword/ForgotPassword";
import PropertyDetailsOwner from "./PropertyDetailsOwner/PropertyDetailsOwner";
import SavedPropertiesPage from "./SavedPropertiesPage/SavedPropertiesPage";
import SearchPage from "./Search/search";
import PropertySearchPage from "./PropertySearch/PropertySearch";
import MyRequests from "./myRequests/my requests.jsx";
import Notifications from "./notifications/Notifications.jsx";
import OwnerNotification from "./OwnerNotification/OwnerNotification";
import TenantNotification from "./TenantNotification/TenantNotification";
import OwnerRequests from "./ownerRequests/OwnerRequests.jsx";


const isLoggedIn = () => Boolean(localStorage.getItem("access_token"));

function homePathFor(role) {
  if (isTenantRole(role)) return "/home-tenant";
  if (isOwnerRole(role)) return "/home-owner";
  return null;
}

/**
 * يمنع الزائر غير المسجّل من الوصول لصفحة تفاصيل العقار من أي رابط،
 * ويعرض نافذة "يجب إنشاء حساب لعرض التفاصيل" بدلاً منها.
 */
/* صفحة الطلبات: المالك يشوف صفحة طلباته (قبول/رفض) والمستأجر يشوف
     طلباته هو. بتشتغل حتى لو الدور لسا مجهول — بتسأل الـAPI لحالها،
     فالمالك ما بيقدر يوصل لصفحة المستأجر */
function RoleAwareRequests({ role }) {
  const [resolved, setResolved] = useState(role);
  const [loading, setLoading] = useState(!role);

  useEffect(() => {
    if (resolved) return undefined;
    let active = true;
    fetchCurrentRole().then((r) => {
      if (!active) return;
      setResolved(r);
      setLoading(false);
    });
    /* لو الـAPI ما ردّ بنعرض صفحة المستأجر (الوضع القديم) بدل ما نعلق */
    const timer = setTimeout(() => {
      if (active) setLoading(false);
    }, 5000);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [resolved]);

  if (loading) {
    return <p className="op-empty">جاري التحميل...</p>;
  }
  return isOwnerRole(resolved) ? <OwnerRequests /> : <MyRequests />;
}

function RequireAuth({ children }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [token] = useState(isLoggedIn);

  if (token) return children;

  return (
    <div className="page" dir="rtl">
      <AuthPromptModal
        property={{ id }}
        intent="details"
        onClose={() => navigate(-1)}
      />
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem("bayti_user") || "null");
    } catch {
      saved = null;
    }
    /* ما في fallback ثابت لـrole — لو ما في مستخدم محفوظ بيضل "" (زائر)
      Fallback "مالك" كان بيسبّب المستأجر يفتح صفحات المالك */
    return {
      name: saved?.name || "",
      email: saved?.email || "",
      role: saved?.role || "",
      accountType: saved?.accountType || "",
      phone: saved?.phone || "",
      createdAt: saved?.createdAt || "",
      avatar: resolveMediaUrl(saved?.avatar) || defaultAvatar,
      city: saved?.city || "",
      bio: saved?.bio || "",
    };
  });

  const [role, setRole] = useState(() => resolveRole(user.role));
  /* بننتظر تغيّر الدور مرة وحدة بس — بعد ما يخلص الطلب بنكمل
     العرض حتى لو الـAPI ما ردّ، عشان ما نعلق على شاشة تحميل */
  const [roleChecked, setRoleChecked] = useState(() => !localStorage.getItem("access_token"));

  /* localStorage ممكن يكون قديم أو فيه دور غلط، فنرجع نشيك الدور من الـAPI
     أول ما تفتح التطبيق — هذا اللي بيوجه لكل صفحات المالك/المستأجر */
  useEffect(() => {
    /* الزائر: الدور مو محتاج تحقق — وroleChecked بيبدأ true أصلاً */
    if (!isLoggedIn()) return undefined;
    let active = true;
    fetchCurrentRole().then((resolved) => {
      if (!active) return;
      if (resolved) {
        setRole(resolved);
        try {
          const saved = JSON.parse(localStorage.getItem('bayti_user') || 'null');
          if (saved && resolveRole(saved.role) !== resolved) {
            localStorage.setItem(
              'bayti_user',
              JSON.stringify({ ...saved, role: resolved === 'owner' ? 'مالك عقار' : 'مستأجر' })
            );
          }
        } catch {
          /* تجاهل localStorage غير الصالح */
        }
      }
      setRoleChecked(true);
    }).catch(() => {
      if (active) setRoleChecked(true);
    });
    /* شبكة أمان: لو الـAPI اتعلّق، بنكمّل العرض بعد 4 ثواني */
    const timer = setTimeout(() => {
      if (active) setRoleChecked(true);
    }, 4000);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const navProps = {
    onPropertyClick: (id) => navigate(`/property/${id}`),
    onSearchClick: () => navigate("/search"),
    /* صفحة الطلبات بتختلف حسب دور المستخدم: للمالك "طلبات الاهتمام"، وللمستأجر "طلباتي" */
    onRequestsClick: async () => {
      /* نفس ترتيب onHomeClick: state ثم المحفوظ ثم الـAPI — حتى ما تفتحش
         صفحة المستأجر لمالك دوره لسا ما اتحدد */
      let resolved = homePathFor(role) ? role : resolveRole(user.role);
      if (!resolved) resolved = await fetchCurrentRole();
      navigate(isOwnerRole(resolved) ? "/owner-requests" : "/my-requests");
    },
    onSavedClick: () => navigate("/saved"),
    onHomeClick: async () => {
      /* ترتيب المصادر: الدور بالـstate، ثم المحفوظ، ثم الـAPI.
         ولو كلهم ما نفعوا ما بنسيب المستخدم صفحة الزائر */
      let resolved = homePathFor(role) ? role : resolveRole(user.role);
      if (!resolved) resolved = await fetchCurrentRole();
      navigate(homePathFor(resolved) || (isLoggedIn() ? "/home-tenant" : "/"));
    },
    onProfileClick: () => {
      try {
        const saved = JSON.parse(localStorage.getItem("bayti_user") || "null");
        if (saved) setUser((prev) => ({ ...prev, ...saved }));
      } catch {
        /* تجاهل بيانات localStorage غير الصالحة */
      }
      navigate("/profile");
    },
    onChangePasswordClick: () => {
      navigate("/change-password");
    },
    onLogoutClick: () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("bayti_user");
      // مهم: بدون مسح بيانات الاعتماد يبقى refreshTokens يعيد تسجيل الدخول تلقائياً
      clearCredentials();
      /* كاش الإشعارات في الذاكرة: بدون مسحه ممكن يظهر عدّاد إشعارات
         المستخدم السابق لو تغيّر المستخدم بدون إعادة تحميل للصفحة */
      resetNotifications();
      setUser({
        name: "",
        email: "",
        role: "",
        accountType: "",
        phone: "",
        createdAt: "",
        avatar: defaultAvatar,
        city: "",
        bio: "",
      });
      setRole("");
      navigate("/login");
    },
  };

  /* البروفايل والتعديل صاروا راوت حقيقي ("/profile" و"/edit-profile")
     بدل ما نرسمهم بره الـRoutes — كان أي لينك بالناف بار ما بيشتغل
     من صفحاتهم لأن navigate كان بيغيّر المسار والصفحة ما بترجع ترسم */
  const profileProps = {
    currentUser: user,
    ...navProps,
    onEditProfileClick: () => navigate("/edit-profile"),
    onAddPropertyClick: () => navigate("/add-property"),
  };

  const profileElement = isOwnerRole(role) ? (
    <OwnerProfile {...profileProps} />
  ) : (
    <TenantProfile {...profileProps} />
  );

  /* نفس الصفحة للدورين — التشييل جواها بيختار حسب الدور */
  const requestsElement = <RoleAwareRequests role={role} />;

  const editProfileElement = (
    <EditProfile
      currentUser={user}
      onSave={(updated) => {
        setUser((prev) => {
          const merged = { ...prev, ...updated };
          try {
            localStorage.setItem("bayti_user", JSON.stringify(merged));
          } catch {
            /* تجاهل تعذر الحفظ */
          }
          return merged;
        });
        navigate("/profile");
      }}
      onCancel={() => navigate("/profile")}
      {...navProps}
    />
  );

  /* بنستنى تغيّر الدور مرة وحدة عشان ما نرسم صفحة المستأجر لمالك
     لحظة قبل ما يوصل رد الـAPI */
  if (!roleChecked) {
    return (
      <div className="page" dir="rtl">
        <p className="op-empty">جاري التحميل...</p>
      </div>
    );
  }

  /* "/" و"/home" للزائر — المستخدم المسجّل ينبعت لصفحته حسب دوره */
  const landingRoute = () => {
    const path = isLoggedIn() ? homePathFor(role) : null;
    if (path) return <Navigate to={path} replace />;
    return <Home {...navProps} />;
  };

  return (
    <Routes>
      {/* 1. إضافة مسار الصفحة الرئيسية للرابط الأساسي "/" */}

      <Route path="/" element={landingRoute()} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/home" element={landingRoute()} />
      <Route path="/home-tenant" element={<HomeTenant {...navProps} />} />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <div dir="rtl">{profileElement}</div>
          </RequireAuth>
        }
      />
      <Route
        path="/edit-profile"
        element={
          <RequireAuth>
            <div dir="rtl">{editProfileElement}</div>
          </RequireAuth>
        }
      />
      <Route
        path="/saved"
        element={
          <div className="page" dir="rtl">
            <Navbar {...navProps} />
            <SavedPropertiesPage
              onOpenDetails={(id) => navigate(id ? `/property/${id}` : "/search")}
            />
            <LandingFooter />
          </div>
        }
      />
      <Route
        path="/my-requests"
        element={
          <RequireAuth>
            <div className="page" dir="rtl">
              <Navbar {...navProps} />
              {requestsElement}
              <LandingFooter />
            </div>
          </RequireAuth>
        }
      />
      <Route
        path="/owner-notifications"
        element={
          <RequireAuth>
            <div className="page" dir="rtl">
              <Navbar {...navProps} />
              <OwnerNotification onBrowse={() => navigate("/search")} />
              <LandingFooter />
            </div>
          </RequireAuth>
        }
      />
      <Route
        path="/tenant-notifications"
        element={
          <RequireAuth>
            <div className="page" dir="rtl">
              <Navbar {...navProps} />
              <TenantNotification onBrowse={() => navigate("/search")} />
              <LandingFooter />
            </div>
          </RequireAuth>
        }
      />
      <Route
        path="/notifications"
        element={
          <RequireAuth>
            <div className="page" dir="rtl">
              <Navbar {...navProps} />
              <Notifications onOpenLink={(path) => navigate(path)} />
              <LandingFooter />
            </div>
          </RequireAuth>
        }
      />
      <Route
        path="/owner-requests"
        element={
          <RequireAuth>
            <div className="page" dir="rtl">
              <Navbar {...navProps} />
              {requestsElement}
              <LandingFooter />
            </div>
          </RequireAuth>
        }
      />
      <Route path="/search" element={<SearchPage {...navProps} />} />
      <Route path="/property-search" element={<PropertySearchPage {...navProps} />} />
      <Route
        path="/owner-dashboard"
        element={
          <div className="page">
            <Navbar {...navProps} />
            <main className="main">
              <OwnerDashboard />
            </main>
            <LandingFooter />
          </div>
        }
      />
      <Route
        path="/home-owner"
        element={
          <div className="page">
            <Navbar {...navProps} />
            <main className="main">
              <OwnerHome />
            </main>
            <LandingFooter />
          </div>
        }
      />
      <Route
        path="/property-edit/:id"
        element={
          <div className="page">
            <Navbar {...navProps} />
            <main className="main">
              <PropertyEditPage />
            </main>
            <LandingFooter />
          </div>
        }
      />
      <Route
        path="/property-owner/:id"
        element={
          <div className="page">
            <Navbar {...navProps} />
            <main className="main">
              <PropertyDetailsOwner />
            </main>
            <LandingFooter />
          </div>
        }
      />
      <Route
        path="/add-property/photos"
        element={
          <div className="page">
            <Navbar {...navProps} />
            <main className="main">
              <AddPropertyPhotosPage />
            </main>
            <LandingFooter />
          </div>
        }
      />
      <Route
        path="/add-property/preview"
        element={
          <div className="page">
            <Navbar {...navProps} />
            <main className="main">
              <AddPropertyPreviewPage />
            </main>
            <LandingFooter />
          </div>
        }
      />
      <Route
        path="/add-property"
        element={
          <div className="page">
            <Navbar {...navProps} />
            <main className="main">
              <AddPropertyPage />
            </main>
            <LandingFooter />
          </div>
        }
      />

      <Route
        path="/property/:id"
        element={
          <RequireAuth>
            <div className="page">
              <Navbar {...navProps} />
              <main className="main">
                <PropertyDetailsOwner />
              </main>
              <LandingFooter />
            </div>
          </RequireAuth>
        }
      />
      <Route
        path="/change-password"
        element={
          <div className="page">
            <Navbar {...navProps} />
            <main className="main">
              <ChangePasswordForm />
            </main>
            <LandingFooter />
          </div>
        }
      />
      {/* صفحة إعادة تعيين كلمة المرور بكل الصيغ الممكنة، مع ناف بار مثل باقي الصفحات */}
      <Route path="/reset-password" element={<ResetPasswordForm />} />
      <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
      <Route
        path="/ResetPasswordForm"
        element={
          <div className="page">
            <Navbar {...navProps} />
            <main className="main">
              <ResetPasswordForm />
            </main>
          </div>
        }
      />

      {/* المسار الاحتياطي يحوّل لأي رابط غير معروف إلى الصفحة الرئيسية */}
      <Route path="*" element={<Home {...navProps} />} />
    </Routes>
  );
}
