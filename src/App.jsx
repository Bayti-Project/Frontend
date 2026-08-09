import React, { useState } from "react";
import ResetPasswordForm from "./ResetPasswordForm";
import ChangePasswordForm from "./ChangePasswordForm";
import "./style.css";

export default function App() {
  // "reset"  = صفحة إعادة تعيين كلمة المرور (نسيت كلمة المرور)
  // "change" = صفحة تغيير كلمة المرور (وأنت مسجّل دخول بالفعل)
  const [page, setPage] = useState("reset");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#F3F4F6",
        gap: "20px",
        padding: "30px 0",
      }}
    >
      {/* شريط بسيط للتبديل بين الصفحتين (للتجربة فقط، احذفه لاحقاً لو مش محتاجه) */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => setPage("reset")}
          style={navBtnStyle(page === "reset")}
        >
          إعادة تعيين كلمة المرور
        </button>
        <button
          onClick={() => setPage("change")}
          style={navBtnStyle(page === "change")}
        >
          تغيير كلمة المرور
        </button>
      </div>

      {page === "reset" ? <ResetPasswordForm /> : <ChangePasswordForm />}
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
