import "./register.css";
import building from "./assets/building.png";

import {
  FaCamera,
  FaUserTie,
  FaBuilding,
  FaArrowLeft,
} from "react-icons/fa";

function Register() {
  return (
    <div className="register">

      {/* الصورة */}
      <div className="image-section">

        <img src={building} alt="Building" />

        <div className="overlay"></div>

        <div className="logo">
          Bayti
        </div>

        <div className="image-content">

          <h1>
            مستقبلك يبدأ من هنا
          </h1>

          <p>
            اكتشف المساحات المكتبية والعقارية في أفضل المواقع،
            للاستثمار والسكن، بخيارات تناسب احتياجاتك.
          </p>

        </div>

      </div>


      {/* الفورم */}
      <div className="form-section">

        <h2>
          إنشاء حساب جديد
        </h2>

        <p className="subtitle">
          انضم إلى مجتمع بيتي العقاري الرائد في قطاع غزة.
        </p>


        {/* صورة المستخدم */}
        <div className="avatar">

          <FaCamera />

          <span className="edit-dot"></span>

        </div>

        <p className="upload-text">
          صورة الملف الشخصي
        </p>


        {/* الاسم ورقم الهاتف */}
        <div className="row">

          <div className="field">

            <label>
              الاسم
            </label>

            <input
              type="text"
              placeholder="أدخل اسمك"
            />

          </div>
          <div className="field">
  <label>رقم الهاتف</label>

  <input
    type="tel"
    placeholder="059 000 0000"
    dir="ltr"
  />
</div>

        </div>


        {/* البريد الإلكتروني */}
        <div className="field full">

          <label>
            البريد الإلكتروني
          </label>

          <input
            type="email"
            placeholder="أدخل البريد الإلكتروني"
          />

        </div>


        {/* كلمة المرور */}
        <div className="field full">

          <label>
            كلمة المرور
          </label>

          <input
            type="password"
            placeholder="أدخل كلمة المرور"
          />

        </div>


        {/* صفة المستخدم */}
        <div className="field full">

          <label>
            صفة المستخدم
          </label>

          <div className="buttons">

            <button className="option active">

              <FaBuilding />

              مالك عقار

            </button>


            <button className="option">

              <FaUserTie />

             مستأجر

            </button>

          </div>

        </div>


        {/* نوع الحساب */}
        <div className="field full">

          <label>
            نوع الحساب
          </label>

          <div className="buttons">

            <button className="option active">
              فرد
            </button>


            <button className="option">
              مكتب عقاري
            </button>

          </div>

        </div>


        {/* الموافقة */}
        <div className="agree">

          <input type="checkbox" />

          <span>

            أوافق على

            <a href="#">
               شروط الخدمة
            </a>

            و

            <a href="#">
               سياسة الخصوصية
            </a>

            الخاصة بمنصة بيتي. 

          </span>

        </div>


        {/* زر إنشاء الحساب */}
        <button className="register-btn">

          إنشاء حساب

          <FaArrowLeft />

        </button>


        {/* تسجيل الدخول */}
        <p className="login">

          لديك حساب بالفعل؟

          <a href="/login">
            تسجيل الدخول
          </a>

        </p>

      </div>

    </div>
  );
}

export default Register;