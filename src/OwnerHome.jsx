import React, { useState } from "react";
import apartmentSeaView from "./assets/listings/apartment-sea-view.png";
import villaExterior from "./assets/listings/villa-exterior.png";
import officeSpace from "./assets/listings/office-space.png";

const initialProperties = [
  {
    id: 4721,
    title: "شقة فاخرة مطلة على البحر",
    location: "غزة، الرمال، شارع خالد بن الوليد",
    price: 120000,
    area: 160,
    bathrooms: 2,
    bedrooms: 3,
    status: "متاح",
    image: apartmentSeaView,
  },
  {
    id: 4722,
    title: "شقة فاخرة مطلة على البحر",
    location: "غزة، الرمال، شارع خالد بن الوليد",
    price: 120000,
    area: 160,
    bathrooms: 2,
    bedrooms: 3,
    status: "متاح",
    image: villaExterior,
  },
  {
    id: 4723,
    title: "شقة فاخرة مطلة على البحر",
    location: "غزة، الرمال، شارع خالد بن الوليد",
    price: 120000,
    area: 160,
    bathrooms: 2,
    bedrooms: 3,
    status: "متاح",
    image: officeSpace,
  },
];

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
      <path
        d="M6 4h12v16l-6-4-6 4V4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="13" height="13">
      <path
        d="M12 21s7-6.5 7-11.5a7 7 0 1 0-14 0C5 14.5 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function AreaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
      <path
        d="M4 15V4h11M20 9v11H9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function BathIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
      <path
        d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M7 12V6a2 2 0 0 1 3.6-1.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 19h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function BedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
      <path
        d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18v2M21 18v2M3 12V8h6v4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
      <path
        d="M4 6h7M15 6h5M4 12h11M19 12h1M4 18h7M15 18h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12.5" cy="6" r="2" fill="#fff" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="12" r="2" fill="#fff" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="10.5" cy="18" r="2" fill="#fff" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
      <path
        d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function TrashIcon({ color = "#fff" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
      <path
        d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
      <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function WarnIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
      <path
        d="M12 9v4m0 4h.01M10.3 3.9 2.6 17a1.8 1.8 0 0 0 1.5 2.7h15.8A1.8 1.8 0 0 0 21.4 17L13.7 3.9a1.8 1.8 0 0 0-3.4 0Z"
        stroke="#E5484D"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
      <circle cx="12" cy="12" r="10" stroke="#34C6C6" strokeWidth="1.6" />
      <path d="m8 12.5 2.5 2.5L16 9.5" stroke="#34C6C6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function OwnerHome() {
  const [properties, setProperties] = useState(initialProperties);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const askDelete = (property) => setPendingDelete(property);
  const cancelDelete = () => setPendingDelete(null);

  const confirmDelete = () => {
    const deleted = pendingDelete;
    setProperties((prev) => prev.filter((p) => p.id !== deleted.id));
    setPendingDelete(null);
    setToast(deleted);
    window.clearTimeout(confirmDelete._timer);
    confirmDelete._timer = window.setTimeout(() => setToast(null), 4000);
  };

  const undoDelete = () => {
    if (!toast) return;
    setProperties((prev) => [toast, ...prev]);
    setToast(null);
    window.clearTimeout(confirmDelete._timer);
  };

  return (
    <div className="owner-home">
      <div className="owner-home-inner">
        <div className="owner-title-row">
          <div>
            <h1>إدارة العقارات</h1>
            <p>قم بإدارة عروضك العقارية، تتبع الأداء وحدث التفاصيل بسهولة</p>
          </div>
          <button className="submit-btn add-property-btn">
            <PlusIcon />
            إضافة عقار
          </button>
        </div>

        <div className="owner-search-row">
          <div className="owner-search-box">
            <SearchIcon />
            <input type="text" placeholder="ادخل كلمة البحث هنا" />
          </div>
          <button className="icon-btn" aria-label="فلترة">
            <FilterIcon />
          </button>
        </div>

        <div className="owner-listings">
          {properties.map((property) => (
            <div key={property.id} className="listing-card">
              <div className="listing-image">
                <img src={property.image} alt={property.title} />
              </div>

              <div className="listing-body">
                <div>
                  <div className="listing-top-row">
                    <span className="status-badge">{property.status}</span>
                    <BookmarkIcon />
                  </div>
                  <h3>{property.title}</h3>
                  <p className="listing-location">
                    <PinIcon />
                    {property.location}
                  </p>
                  <p className="listing-price">
                    ${property.price.toLocaleString()}
                  </p>
                </div>

                <div className="listing-stats">
                  <span>
                    <BedIcon /> عدد الغرف {property.bedrooms}
                  </span>
                  <span>
                    <BathIcon /> عدد الحمامات {property.bathrooms}
                  </span>
                  <span>
                    <AreaIcon /> مساحة {property.area}م²
                  </span>
                </div>

                <div className="listing-actions">
                  <button
                    className="listing-action-btn delete"
                    aria-label="حذف"
                    onClick={() => askDelete(property)}
                  >
                    <TrashIcon />
                  </button>
                  <button className="listing-action-btn edit" aria-label="تعديل">
                    <EditIcon />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {properties.length === 0 && (
            <div className="listing-empty">لا توجد عقارات مضافة حالياً</div>
          )}
        </div>
      </div>

      {pendingDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                <WarnIcon /> تأكيد الحذف
              </div>
              <button className="modal-close" onClick={cancelDelete} aria-label="إغلاق">
                ✕
              </button>
            </div>

            <p className="modal-text">
              هل أنت متأكد من حذف هذا الإعلان؟
              <br />
              سيتم إزالة هذا العقار من نتائج البحث ولا يمكن التراجع عن هذا
              الإجراء.
            </p>

            <div className="modal-property">
              <img src={pendingDelete.image} alt={pendingDelete.title} />
              <div>
                <p className="modal-property-id">#{pendingDelete.id}</p>
                <p className="modal-property-title">{pendingDelete.title}</p>
                <p className="modal-property-price">
                  ${pendingDelete.price.toLocaleString()}
                </p>
              </div>
            </div>

            <button className="submit-btn danger full" onClick={confirmDelete}>
              <TrashIcon /> حذف الإعلان
            </button>
            <button className="cancel-btn full" onClick={cancelDelete}>
              إلغاء
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          <CheckIcon />
          <span className="toast-text">تم حذف الإعلان بنجاح</span>
          <button className="toast-undo" onClick={undoDelete}>
            تراجع
          </button>
        </div>
      )}
    </div>
  );
}
