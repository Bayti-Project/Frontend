import React, { useState } from "react";
import ResetPasswordForm from "./ResetPasswordForm";
import ChangePasswordForm from "./ChangePasswordForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import Header from "./Header";
import OwnerHome from "./OwnerHome";
import PropertyEditPage from "./PropertyEditPage";
import PropertyDetailsPage from "./PropertyDetailsPage";
import SavedPropertiesPage from "./SavedPropertiesPage";
import NotFoundPage from "./NotFoundPage";
import AccountCreatedPage from "./AccountCreatedPage";
import SuspendUserPage from "./SuspendUserPage";
import DeleteUserPage from "./DeleteUserPage";
import HideListingPage from "./HideListingPage";
import RemoveSuccessPage from "./RemoveSuccessPage";
import NotificationsPage from "./NotificationsPage";
import SavedHeader from "./SavedHeader";
import SavedFooter from "./SavedFooter";
import Footer from "./Footer";
import "./style.css";

export default function App() {
  // "home"     = صفحة الرئيسية الخاصة بالمالك (إدارة العقارات)
  // "edit"     = صفحة تعديل عقار
  // "details"  = صفحة تفاصيل العقار (مع تأكيد الحذف)
  // "saved"    = صفحة العقارات المحفوظة (بهيدر وفوتر الفيجما الخاصين فيها)
  // "notifications" = صفحة الإشعارات (بهيدر وفوتر صفحة المحفوظات)
  // "notifications-owner" = صفحة الإشعارات لدى المالك (طلبات اهتمام)
  // "notifications-empty" = صفحة الإشعارات عندما لا توجد إشعارات
  // "notifications-owner-empty" = نفس الصفحة الفارغة لكن نسخة المالك (3 فلاتر فقط)
  // "notfound" = صفحة 404 - العقار غير موجود (بنفس هيدر وفوتر صفحة المحفوظات)
  // "forgot" = صفحة نسيت كلمة المرور (حقل الإيميل)
  // "reset"  = صفحة إعادة تعيين كلمة المرور (بعد الضغط على الرابط)
  // "change" = صفحة تغيير كلمة المرور (وأنت مسجّل دخول بالفعل)
  // "created" = صفحة تم إنشاء حسابك بنجاح (بدون هيدر/فوتر - حسب الفيجما)
  // "remove-success" = مودال نجاح إزالة الإعلان المخالف (شاشة كاملة بخلفية داكنة - حسب الفيجما)
  // "hide-listing" = مودال إخفاء الإعلان مؤقتاً مع اختيار السبب (شاشة كاملة بخلفية داكنة - حسب الفيجما)
  // "delete-user" = مودال حذف حساب المستخدم نهائياً (شاشة كاملة بخلفية داكنة - حسب الفيجما)
  // "suspend" = مودال إيقاف حساب المستخدم مؤقتاً (شاشة كاملة بخلفية داكنة - حسب الفيجما)
  const [page, setPage] = useState("home");
  const isSaved = page === "saved";
  const isNotFound = page === "notfound";
  const isNotifications = page === "notifications" || page === "notifications-owner" || page === "notifications-empty" || page === "notifications-owner-empty";
  const useSavedChrome = isSaved || isNotFound || isNotifications; // نفس الهيدر/الفوتر الخاصين بالفيجما

  // صفحة "تم إنشاء الحساب" بتاخد الشاشة كاملة (فيها الشعار فقط، بدون هيدر ولا فوتر)
  if (page === "created") {
    return <AccountCreatedPage onBackToLogin={() => setPage("home")} />;
  }

  // مودال "إيقاف حساب المستخدم مؤقتاً" بيغطي الشاشة كاملة
  if (page === "suspend") {
    return <SuspendUserPage onCancel={() => setPage("home")} onConfirm={() => setPage("home")} />;
  }

  if (page === "remove-success") {
    return <RemoveSuccessPage onBack={() => setPage("home")} onClose={() => setPage("home")} />;
  }

  if (page === "hide-listing") {
    return <HideListingPage onCancel={() => setPage("home")} onConfirm={() => setPage("home")} />;
  }

  if (page === "delete-user") {
    return <DeleteUserPage onCancel={() => setPage("home")} onConfirm={() => setPage("home")} />;
  }

  return (
    <div className="page">
      {useSavedChrome ? <SavedHeader onBellClick={() => setPage("notifications")} /> : <Header />}

      {/* شريط بسيط للتبديل بين الصفحات (للتجربة فقط) */}
      <div
        className="page-switcher"
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "center",
          padding: "16px 0 0",
          background: useSavedChrome ? "#fff" : "transparent",
        }}
      >
        <button onClick={() => setPage("home")} style={navBtnStyle(page === "home")}>
          الرئيسية (المالك)
        </button>
        <button onClick={() => setPage("edit")} style={navBtnStyle(page === "edit")}>
          تعديل عقار
        </button>
        <button onClick={() => setPage("details")} style={navBtnStyle(page === "details")}>
          تفاصيل العقار
        </button>
        <button onClick={() => setPage("saved")} style={navBtnStyle(isSaved)}>
          العقارات المحفوظة
        </button>
        <button onClick={() => setPage("notifications")} style={navBtnStyle(page === "notifications")}>
          الإشعارات
        </button>
        <button onClick={() => setPage("notifications-empty")} style={navBtnStyle(page === "notifications-empty")}>
          الإشعارات (فارغة)
        </button>
        <button onClick={() => setPage("notifications-owner")} style={navBtnStyle(page === "notifications-owner")}>
          الإشعارات - المالك
        </button>
        <button
          onClick={() => setPage("notifications-owner-empty")}
          style={navBtnStyle(page === "notifications-owner-empty")}
        >
          الإشعارات - المالك (فارغة)
        </button>
        <button onClick={() => setPage("notfound")} style={navBtnStyle(isNotFound)}>
          صفحة 404
        </button>
        <button onClick={() => setPage("forgot")} style={navBtnStyle(page === "forgot")}>
          نسيت كلمة المرور
        </button>
        <button onClick={() => setPage("reset")} style={navBtnStyle(page === "reset")}>
          إعادة تعيين كلمة المرور
        </button>
        <button onClick={() => setPage("change")} style={navBtnStyle(page === "change")}>
          تغيير كلمة المرور
        </button>
        <button onClick={() => setPage("created")} style={navBtnStyle(false)}>
          تم إنشاء الحساب
        </button>
        <button onClick={() => setPage("suspend")} style={navBtnStyle(false)}>
          إيقاف حساب مستخدم
        </button>
        <button onClick={() => setPage("delete-user")} style={navBtnStyle(false)}>
          حذف حساب مستخدم
        </button>
        <button onClick={() => setPage("hide-listing")} style={navBtnStyle(false)}>
          إخفاء الإعلان
        </button>
        <button onClick={() => setPage("remove-success")} style={navBtnStyle(false)}>
          نجاح إزالة الإعلان
        </button>
      </div>

      {page === "home" && <OwnerHome />}
      {page === "edit" && <PropertyEditPage />}
      {page === "details" && <PropertyDetailsPage />}
      {isSaved && <SavedPropertiesPage onOpenDetails={() => setPage("details")} />}
      {page === "notifications" && <NotificationsPage />}
      {page === "notifications-owner" && <NotificationsPage variant="owner" />}
      {page === "notifications-empty" && <NotificationsPage empty onBrowse={() => setPage("home")} />}
      {page === "notifications-owner-empty" && (
        <NotificationsPage empty variant="owner" onBrowse={() => setPage("home")} />
      )}
      {isNotFound && (
        <NotFoundPage
          onOpenDetails={() => setPage("details")}
          onBrowseAll={() => setPage("home")}
          onGoSearch={() => setPage("home")}
        />
      )}

      {page !== "home" && page !== "edit" && page !== "details" && !useSavedChrome && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            padding: "30px 0",
          }}
        >
          {page === "forgot" && <ForgotPasswordForm />}
          {page === "reset" && <ResetPasswordForm />}
          {page === "change" && <ChangePasswordForm />}
        </div>
      )}

      {useSavedChrome ? <SavedFooter /> : <Footer />}
    </div>
  );
}

function navBtnStyle(active) {
  return {
    padding: "10px 18px",
    borderRadius: "8px",
    border: active ? "none" : "1.5px solid #E7E9EE",
    background: active ? "#16243F" : "#fff",
    color: active ? "#fff" : "#16243F",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    fontFamily: "'Tajawal', sans-serif",
  };
}
