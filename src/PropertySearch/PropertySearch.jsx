import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaListUl, FaMapMarkerAlt, FaHome, FaThLarge } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import LandingFooter from '../components/LandingFooter';
import PropertySearchBar from '../components/PropertySearchBar';
import { FilterSidebar } from '../Search/search';
import './PropertySearch.css';

const PropertySearch = ({
    onHomeClick,
    onSearchClick,
    onProfileClick,
    onChangePasswordClick,
    onLogoutClick,
    onSavedClick,
}) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const goToSearch = () => {
        const query = searchParams.toString();
        navigate(`/search${query ? `?${query}` : ''}`);
    };
    const regions = ['شمال غزة', 'غزة', 'وسط غزة', 'خانيونس', 'رفح', 'كل المناطق'];
    const propertyTypes = ['شقق سكنية', 'قطعة أرض', 'فيلا', 'حاصل', 'بركس', 'محل تجاري'];
    const priceRanges = [
        'اقل من 500 ₪',
        '500 ₪',
        '1,000 ₪',
        '1,500 ₪',
        '2,000 ₪',
        '2,500 ₪',
        '2,500 ₪ فاكثر',
        'بدون حد اقصي',
    ];
    const roomOptions = ['1', '2', '3', '4+ فما فوق'];
    const govSlugs = {
        'شمال غزة': 'north_gaza',
        'غزة': 'gaza',
        'وسط غزة': 'middle_gaza',
        'خانيونس': 'khan_younis',
        'رفح': 'rafah',
    };
    const typeSlugs = {
        'شقق سكنية': 'apartment',
        'فيلا': 'villa',
        'قطعة أرض': 'land',
        'حاصل': 'store_room',
        'بركس': 'barracks',
        'محل تجاري': 'shop',
    };
    const priceMax = {
        'اقل من 500 ₪': '500',
        '500 ₪': '1000',
        '1,000 ₪': '1500',
        '1,500 ₪': '2000',
        '2,000 ₪': '2500',
        '2,500 ₪': '3000',
    };
    const governorateParam = searchParams.get('governorate');
    const propertyTypeParam = searchParams.get('property_type');
    const maxPriceParam = searchParams.get('max_price');
    const initialRegion = Object.keys(govSlugs).find((key) => govSlugs[key] === governorateParam) || '';
    const initialPropertyType = Object.keys(typeSlugs).find((key) => typeSlugs[key] === propertyTypeParam) || '';
    const initialPriceRange = searchParams.get('min_price')
        ? '2,500 ₪ فاكثر'
        : Object.keys(priceMax).find((key) => priceMax[key] === maxPriceParam) || '';
    const initialBar = {
        region: initialRegion,
        propertyType: initialPropertyType,
        priceRange: initialPriceRange,
        rooms: searchParams.get('bedrooms') || '',
    };

    const handleSearch = (filters) => {
        const params = new URLSearchParams();
        const gov = govSlugs[filters.region];
        if (gov) params.append('governorate', gov);
        const type = typeSlugs[filters.propertyType];
        if (type) params.append('property_type', type);
        if (filters.rooms && filters.rooms !== '4+ فما فوق') params.append('bedrooms', filters.rooms);
        if (filters.priceRange) {
            if (filters.priceRange === '2,500 ₪ فاكثر') {
                params.append('min_price', '2500');
            } else if (priceMax[filters.priceRange]) {
                params.append('max_price', priceMax[filters.priceRange]);
            }
        }
        const query = params.toString();
        navigate(`/search${query ? `?${query}` : ''}`);
    };

    return (
        <div className="page property-search-page" dir="rtl">
            <Navbar
                onHomeClick={onHomeClick}
                onSearchClick={onSearchClick}
                onProfileClick={onProfileClick}
                onChangePasswordClick={onChangePasswordClick}
                onLogoutClick={onLogoutClick}
                onSavedClick={onSavedClick}
            />

            <section className="props-hero">
                <div className="props-hero-pattern" />
                <div className="props-hero-content">
                    <h1>ابحث عن عقارك المثالي في غزة</h1>
                    <p>اكتشف آلاف العقارات المتاحة في مختلف مناطق قطاع غزة بأسعار تنافسية وموثوقة.</p>

                    <div className="w-full max-w-5xl mx-auto mt-6">
                        <PropertySearchBar
                            regions={regions}
                            propertyTypes={propertyTypes}
                            priceRanges={priceRanges}
                            roomOptions={roomOptions}
                            initial={initialBar}
                            onSearch={handleSearch}
                        />
                    </div>
                </div>
            </section>

            {/* 2. Main Content Area */}
            <div className="props-main">

                {/* Layout: Sidebar Right & Content Left */}
                <div className="props-layout">

                    {/* Right Sidebar Filters */}
                    <FilterSidebar onApply={goToSearch} onReset={goToSearch} />

                    {/* Main Results View */}
                    <main className="results-main">
                        {/* Header Title & Sorting */}
                        <div className="results-header">
                            <h2>عقارات للإيجار</h2>
                            <div className="header-controls">
                                <div className="sort-dropdown">
                                    <select>
                                        <option>الأحدث إضافة</option>
                                        <option>الأقل سعراً</option>
                                        <option>الأعلى سعراً</option>
                                    </select>
                                </div>
                                <div className="view-toggle">
                                    <button className="active" type="button"><FaThLarge size={18} /></button>
                                    <button type="button"><FaListUl size={18} /></button>
                                </div>
                            </div>
                        </div>

                        <div className="empty-state-card">
                            <div className="empty-icon-wrapper">
                                <FaMapMarkerAlt className="pin-icon" size={32} />
                                <FaHome className="home-icon" size={48} />
                            </div>
                            <h3>لم يتم العثور على عقارات مطابقة</h3>
                            <p>جرب تعديل خيارات البحث أو مسح بعض الفلاتر لعرض نتائج أكثر</p>

                            <div className="empty-actions">
                                 <button className="btn-primary" type="button" onClick={goToSearch}>
                                     مسح الفلاتر
                                 </button>
                                 <button className="btn-outline" type="button" onClick={goToSearch}>
                                     تعديل البحث
                                 </button>
                            </div>
                        </div>

                        {/* Nearby Suggestions Section */}
                        <div className="nearby-section">
                            <h4>اقتراحات قريبة</h4>
                            <p>مناطق مجاورة فيها عقارات متاحة بنفس مواصفات تقريباً</p>

                            <div className="suggestions-grid">
                                <div className="suggestion-card">
                                    <h5>النصر</h5>
                                    <span>24 عقار متاح - على بعد 1.2 كم من بحثك</span>
                                </div>
                                <div className="suggestion-card">
                                    <h5>الشيخ رضوان</h5>
                                    <span>18 عقار متاح - على بعد 2.1 كم من بحثك</span>
                                </div>
                                <div className="suggestion-card">
                                    <h5>تل الهوى</h5>
                                    <span>17 عقار متاح - على بعد 3.1 كم من بحثك</span>
                                </div>
                            </div>
                        </div>
                    </main>

                </div>
            </div>

            <LandingFooter />
        </div>
    );
};

export default PropertySearch