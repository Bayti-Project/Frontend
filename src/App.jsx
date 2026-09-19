import React, { useState } from "react";
import ResetPasswordForm from "./ResetPasswordForm";
import ChangePasswordForm from "./ChangePasswordForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import Header from "./Header";
import OwnerHome from "./OwnerHome";
import PropertyEditPage from "./PropertyEditPage";
import PropertyDetailsPage from "./PropertyDetailsPage";
import Footer from "./Footer";
import "./style.css";

export default function App() {
  // "home"    = صفحة الرئيسية الخاصة بالمالك (إدارة العقارات)
  // "edit"    = صفحة تعديل عقار
  // "details" = صفحة تفاصيل العقار (مع تأكيد الحذف)
  // "forgot" = صفحة نسيت كلمة المرور (حقل الإيميل)
  // "reset"  = صفحة إعادة تعيين كلمة المرور (بعد الضغط على الرابط)
  // "change" = صفحة تغيير كلمة المرور (وأنت مسجّل دخول بالفعل)
  const [page, setPage] = useState("home");

  return (
    <div className="page">
      <Header />

      {/* شريط بسيط للتبديل بين الصفحات (للتجربة فقط) */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", padding: "16px 0 0" }}>
        <button onClick={() => setPage("home")} style={navBtnStyle(page === "home")}>
          الرئيسية (المالك)
        </button>
        <button onClick={() => setPage("edit")} style={navBtnStyle(page === "edit")}>
          تعديل عقار
        </button>
        <button onClick={() => setPage("details")} style={navBtnStyle(page === "details")}>
          تفاصيل العقار
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
      </div>

      {page === "home" && <OwnerHome />}
      {page === "edit" && <PropertyEditPage />}
      {page === "details" && <PropertyDetailsPage />}

      {page !== "home" && page !== "edit" && page !== "details" && (
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

      <Footer />
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
