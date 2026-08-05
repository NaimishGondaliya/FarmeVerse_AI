import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, NavLink, useNavigate } from 'react-router-dom'
import { FiMenu, FiX, FiBell, FiLogOut, FiUser } from 'react-icons/fi'
import LanguageSwitcher from './components/common/LanguageSwitcher'
import { useTranslation } from './hooks/useTranslation'

// Reusable Views & Layouts
import LandingPage from './pages/LandingPage'
import FarmerLogin from './pages/Authentication/FarmerLogin'
import FarmerRegister from './pages/Authentication/FarmerRegister'
import ForgotPasswordFlow from './pages/Authentication/ForgotPasswordFlow'
import ExpertLogin from './pages/Authentication/ExpertLogin'
import AdminLogin from './pages/Authentication/AdminLogin'
import NotFoundPage from './pages/NotFoundPage'
import FarmerDashboard from './pages/Farmer/FarmerDashboard'
import MyFarms from './pages/Farmer/MyFarms'
import CropRecords from './pages/Farmer/CropRecords'
import ProfitCalculator from './pages/Farmer/ProfitCalculator'
import MarketPrices from './pages/Farmer/MarketPrices'
import DiseaseDetection from './pages/Farmer/DiseaseDetection'
import Weather from './pages/Farmer/Weather'
import CropRecommendation from './pages/Farmer/CropRecommendation'
import GovernmentSchemes from './pages/Farmer/GovernmentSchemes'
import FarmerProfile from './pages/Farmer/FarmerProfile'
import { ExpertConsultation } from './pages/Farmer/ExpertConsultation'
import { ExpertDashboard } from './pages/Expert/ExpertDashboard'
import { ExpertProfile } from './pages/Expert/ExpertProfile'
import { SendMessage } from './pages/Farmer/SendMessage'
import { MyConsultations } from './pages/Farmer/MyConsultations'
import { ExpertInbox } from './pages/Expert/ExpertInbox'
import { ConversationView } from './pages/Expert/ConversationView'
import { ExpertFarmerList } from './pages/Expert/ExpertFarmerList'
import { ExpertAvailability } from './pages/Expert/ExpertAvailability'
import { authAPI, notificationAPI } from './services/api'
import AdminExpertManagement from './pages/Admin/AdminExpertManagement'
import AdminConsultationCenter from './pages/Admin/AdminConsultationCenter'
import { AdminSchemesManagement } from './pages/Admin/AdminSchemesManagement'
import AdminAnalytics from './pages/Admin/AdminAnalytics'
import AdminProfile from './pages/Admin/AdminProfile'

import EmptyState from './components/common/EmptyState'

// Clean Empty-State Page Component
const EmptyStatePage = ({ name }) => (
    <div className="p-4 md:p-8">
        <EmptyState
            icon={FiUser}
            title={name}
            description="This section is not yet available. New features and integrations will appear here in future updates."
        />
    </div>
)

// Main Layout Wrapper
const DashboardLayout = ({ role, children }) => {
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const { t } = useTranslation()

    const [userName, setUserName] = useState('ખેડૂત મિત્ર')
    const [showNotifications, setShowNotifications] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)

    const fetchNotifications = async () => {
        try {
            if (notificationAPI) {
                const res = await notificationAPI.getAll();
                if (res.success && res.data) {
                    setNotifications(res.data);
                    setUnreadCount(res.data.filter(n => !n.is_read).length);
                }
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            try {
                const userObj = JSON.parse(storedUser)
                if (userObj && userObj.full_name) {
                    setUserName(userObj.full_name)
                }
                // Only fetch notifications if logged in
                const token = localStorage.getItem('access_token');
                if (token && token !== 'null' && token !== 'undefined') {
                    fetchNotifications();
                    // Poll every 30 seconds
                    const interval = setInterval(fetchNotifications, 30000);
                    return () => clearInterval(interval);
                }
            } catch (err) {
                console.error(err)
            }
        }
    }, [])

    const handleMarkAsRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            await fetchNotifications();
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    const handleLogout = async () => {
        try {
            if (authAPI && authAPI.logout) {
                await authAPI.logout()
            }
        } catch (err) {
            console.error('Logout error:', err)
        } finally {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            localStorage.removeItem('role')
            sessionStorage.clear()
            // Redirect to correct login page while replacing history to prevent Back button
            navigate(`/${role}/login`, { replace: true })
        }
    }

    const navLinks = role === 'farmer'
        ? [
            { to: 'dashboard', label: t('sidebar.farmer.dashboard') },
            { to: 'my-farm', label: t('sidebar.farmer.myFarms') },
            { to: 'crops', label: t('sidebar.farmer.cropRecords') },
            { to: 'profit-calculator', label: t('sidebar.farmer.profitCalculator') },
            { to: 'market', label: t('sidebar.farmer.marketPrices') },
            { to: 'weather', label: t('sidebar.farmer.weather') },
            { to: 'disease-detection', label: t('sidebar.farmer.diseaseDetection') },
            { to: 'crop-recommendation', label: t('sidebar.farmer.cropRecommendation') },
            { to: 'schemes', label: t('sidebar.farmer.govSchemes') },
            { to: 'consultation', label: t('sidebar.farmer.consultation') },
            { to: 'profile', label: t('sidebar.farmer.profile') }
        ]
        : role === 'admin'
            ? [
                { to: 'dashboard', label: t('sidebar.admin.dashboard') },
                { to: 'consultation', label: t('sidebar.admin.consultation') },
                { to: 'schemes', label: t('sidebar.admin.schemes') },
                { to: 'analytics', label: t('sidebar.admin.analytics') },
                { to: 'profile', label: t('sidebar.admin.profile') }
            ]
            : [
                { to: 'dashboard', label: t('sidebar.expert.dashboard') },
                { to: 'consultation', label: t('sidebar.expert.consultation') },
                { to: 'farmer-list', label: t('sidebar.expert.farmerList') },
                { to: 'availability', label: t('sidebar.expert.availability') },
                { to: 'profile', label: t('sidebar.expert.profile') }
            ];



    const sidebarContent = (
        <div className="flex flex-col h-full">
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <Link to="/" className="text-xl font-bold tracking-wider text-accent flex items-center gap-2 select-none hover:opacity-90">
                        <span>🌱</span> {t('sidebar.farmVerse')}
                    </Link>
                    {/* Mobile close button */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1 rounded-btn text-primary-light hover:bg-primary/50 hover:text-white md:hidden"
                    >
                        <FiX size={20} />
                    </button>
                </div>
                <p className="text-xs text-primary-light mt-1 text-emerald-200">{t('sidebar.gujaratAg')}</p>
                <div className="mt-3 px-2.5 py-1 bg-primary rounded text-[10px] font-bold uppercase tracking-wider text-center border border-emerald-700/35">
                    {role === 'farmer' ? t('sidebar.farmerLive') : `${t(`sidebar.${role}.dashboard`, { defaultValue: role })} ${t('sidebar.workspace')}`}
                </div>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto">
                {navLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `block px-4 py-2.5 mt-2 text-sm font-semibold rounded-btn transition-colors duration-150 ${isActive
                                ? 'bg-accent text-dark font-extrabold shadow-sm'
                                : 'text-primary-light hover:bg-primary/50 hover:text-white'
                            }`
                        }
                    >
                        {link.label}
                    </NavLink>
                ))}
                {/* Logout Button available for all roles */}
                <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2.5 mt-6 text-sm font-semibold rounded-btn text-red-200 hover:bg-red-900/40 hover:text-red-100 transition-colors duration-150 flex items-center gap-2"
                >
                    <FiLogOut size={16} />
                    <span>{t('sidebar.logout')}</span>
                </button>
            </nav>
            <div className="mt-auto pt-4 border-t border-primary/40 text-center">
                <Link to="/" className="inline-block text-xs font-semibold text-accent hover:underline">
                    ← {t('sidebar.home')}
                </Link>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen flex bg-secondary-dark text-dark font-sans">
            {/* Desktop Left Sidebar (Always Visible on Large Screens) */}
            <aside className="w-64 bg-primary-dark text-white p-6 md:sticky md:top-0 h-screen md:flex flex-col hidden flex-shrink-0">
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar Navigation (Slide-in Drawer) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-dark/60 backdrop-blur-xs z-40 md:hidden animate-fadeIn"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <aside
                className={`fixed inset-y-0 left-0 w-64 bg-primary-dark text-white p-6 z-50 transform transition-transform duration-300 md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {sidebarContent}
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 p-4 md:p-8 overflow-x-hidden">
                {/* Dynamic Top Navbar */}
                <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-card shadow-sm border border-secondary-dark relative">
                    <div className="flex items-center gap-3">
                        {/* Hamburger Trigger */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-1.5 -ml-1 rounded-btn text-dark hover:bg-secondary-dark md:hidden transition-colors"
                            aria-label="Toggle Navigation"
                        >
                            <FiMenu size={22} />
                        </button>
                        <div>
                            <h2 className="text-base md:text-lg font-bold text-dark font-sans capitalize">
                                {role === 'farmer' ? t('header.farmerPanel') : `${role} ${t('header.controlCenter')}`}
                            </h2>
                            <p className="text-xs text-dark-light">{t('header.activeSession')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 md:gap-4 font-semibold text-dark">

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 rounded-btn text-dark hover:bg-secondary-dark relative transition-colors"
                            >
                                <FiBell size={20} />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">{unreadCount > 0 ? unreadCount : ''}</span>
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-72 bg-white rounded-card shadow-lg border border-dark/5 p-4 z-40 space-y-2 animate-fadeIn">
                                    <div className="flex justify-between items-center pb-2 border-b border-dark/5">
                                        <span className="text-xs font-bold text-dark font-sans">{t('header.notifications')}</span>
                                        <button
                                            className="text-[10px] text-primary hover:underline"
                                            onClick={() => setShowNotifications(false)}
                                        >
                                            {t('common.close')}
                                        </button>
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pt-1">
                                        {notifications.length === 0 ? (
                                            <div className="p-2 text-center text-dark-light text-[11px]">{t('header.noNotifications')}</div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                                                    className={`p-2 rounded-btn text-[11px] border cursor-pointer hover:border-dark/5 ${notif.is_read ? 'bg-transparent text-dark-light border-transparent' : 'bg-secondary-dark border-primary/20 hover:bg-secondary-dark/80 font-semibold text-dark'}`}
                                                >
                                                    <p className="font-bold text-dark">{notif.title}</p>
                                                    <p className={`mt-0.5 ${notif.is_read ? 'text-dark-light/80' : 'text-dark-light'}`}>{notif.message}</p>
                                                    <span className="text-[9px] text-dark-light/75 block mt-1">
                                                        {new Date(notif.created_at).toLocaleString('gu-IN')}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Language Switcher */}
                        <LanguageSwitcher />

                        {/* Profile initials */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-dark hidden sm:inline-block max-w-[100px] truncate text-dark/80">
                                {userName}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-xs border border-white shadow-xs select-none">
                                {userName.slice(0, 1).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1">
                    {children}
                </div>
            </main>
        </div>
    )
}

// ProtectedRoute Wrapper to centralize token check and prevent unauthenticated access
const ProtectedRoute = ({ role, children }) => {
    const token = localStorage.getItem('access_token');

    // Check if token exists
    if (!token) {
        return <Navigate to={`/${role}/login`} replace />;
    }

    // Role check to ensure right user is accessing right module
    const userRole = localStorage.getItem('role');
    if (userRole && userRole.toLowerCase() !== role.toLowerCase()) {
        return <Navigate to={`/${role}/login`} replace />;
    }

    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Landing Area */}
                <Route path="/" element={<LandingPage />} />

                {/* Farmer Authentication Routes */}
                <Route path="/farmer/login" element={<FarmerLogin />} />
                <Route path="/farmer/register" element={<FarmerRegister />} />
                <Route path="/farmer/forgot-password" element={<ForgotPasswordFlow />} />

                {/* Expert & Admin Authentication Routes */}
                <Route path="/expert/login" element={<ExpertLogin />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Farmer Dashboard Portal (Guarded in future use, sandbox mode currently) */}
                <Route path="/farmer/*" element={
                    <ProtectedRoute role="farmer">
                        <DashboardLayout role="farmer">
                            <Routes>
                                <Route index element={<Navigate to="dashboard" replace />} />
                                <Route path="dashboard" element={<FarmerDashboard />} />
                                <Route path="my-farm" element={<MyFarms />} />
                                <Route path="crops" element={<CropRecords />} />
                                <Route path="profit-calculator" element={<ProfitCalculator />} />
                                <Route path="market" element={<MarketPrices />} />
                                <Route path="weather" element={<Weather />} />
                                <Route path="disease-detection" element={<DiseaseDetection />} />
                                <Route path="crop-recommendation" element={<CropRecommendation />} />
                                <Route path="schemes" element={<GovernmentSchemes />} />
                                <Route path="consultation" element={<ExpertConsultation />} />
                                <Route path="consultation/history" element={<MyConsultations />} />
                                <Route path="consultation/new" element={<SendMessage />} />
                                <Route path="consultation/:id" element={<ConversationView />} />
                                <Route path="profile" element={<FarmerProfile />} />
                                <Route path="*" element={<Navigate to="dashboard" replace />} />
                            </Routes>
                        </DashboardLayout>
                    </ProtectedRoute>
                } />

                {/* Expert Dashboard Portal */}
                <Route path="/expert/*" element={
                    <ProtectedRoute role="expert">
                        <DashboardLayout role="expert">
                            <Routes>
                                <Route index element={<Navigate to="dashboard" replace />} />
                                <Route path="dashboard" element={<ExpertDashboard />} />
                                <Route path="consultation" element={<ExpertInbox />} />
                                <Route path="consultation/:id" element={<ConversationView />} />
                                <Route path="farmer-list" element={<ExpertFarmerList />} />
                                <Route path="availability" element={<ExpertAvailability />} />
                                <Route path="profile" element={<ExpertProfile />} />
                                <Route path="*" element={<Navigate to="dashboard" replace />} />
                            </Routes>
                        </DashboardLayout>
                    </ProtectedRoute>
                } />

                {/* Admin Dashboard Portal */}
                <Route path="/admin/*" element={
                    <ProtectedRoute role="admin">
                        <DashboardLayout role="admin">
                            <Routes>
                                <Route index element={<Navigate to="dashboard" replace />} />
                                <Route path="dashboard" element={<AdminExpertManagement />} />
                                <Route path="my-farm" element={<Navigate to="../dashboard" replace />} />
                                <Route path="crops" element={<Navigate to="../dashboard" replace />} />
                                <Route path="market" element={<EmptyStatePage name="System Price Feeds" />} />
                                <Route path="weather" element={<Navigate to="../dashboard" replace />} />
                                <Route path="schemes" element={<AdminSchemesManagement />} />
                                <Route path="analytics" element={<AdminAnalytics />} />
                                <Route path="consultation" element={<AdminConsultationCenter />} />
                                <Route path="profile" element={<AdminProfile />} />
                                <Route path="*" element={<Navigate to="dashboard" replace />} />
                            </Routes>
                        </DashboardLayout>
                    </ProtectedRoute>
                } />

                {/* 404 Fallback routing */}
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
