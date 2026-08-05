import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    FiAlertTriangle, FiCheckCircle, FiTrendingUp, FiCloudRain,
    FiLayers, FiBriefcase, FiBarChart2, FiAward
} from 'react-icons/fi'
import Logo from '../components/common/Logo'
import Card from '../components/common/Card'
import LanguageSwitcher from '../components/common/LanguageSwitcher'
import { useTranslation } from '../hooks/useTranslation'

export const LandingPage = () => {
    const { t } = useTranslation()
    const features = [
        {
            title: t('landing.feat1Title'),
            desc: t('landing.feat1Desc'),
            icon: FiAlertTriangle,
            color: 'text-red-500 bg-red-50'
        },
        {
            title: t('landing.feat2Title'),
            desc: t('landing.feat2Desc'),
            icon: FiCheckCircle,
            color: 'text-green-650 bg-green-50'
        },
        {
            title: t('landing.feat3Title'),
            desc: t('landing.feat3Desc'),
            icon: FiTrendingUp,
            color: 'text-blue-500 bg-blue-50'
        },
        {
            title: t('landing.feat4Title'),
            desc: t('landing.feat4Desc'),
            icon: FiCloudRain,
            color: 'text-sky-500 bg-sky-50'
        },
        {
            title: t('landing.feat5Title'),
            desc: t('landing.feat5Desc'),
            icon: FiLayers,
            color: 'text-amber-500 bg-amber-50'
        },
        {
            title: t('landing.feat6Title'),
            desc: t('landing.feat6Desc'),
            icon: FiBriefcase,
            color: 'text-emerald-500 bg-emerald-50'
        },
        {
            title: t('landing.feat7Title'),
            desc: t('landing.feat7Desc'),
            icon: FiBarChart2,
            color: 'text-indigo-500 bg-indigo-50'

        }
    ]

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    }

    return (
        <div className="min-h-screen bg-gradient-to-tr from-primary-light/30 via-white to-secondary flex flex-col">
            {/* Top Header Navigation */}
            <header className="sticky top-0 bg-white/70 backdrop-blur-md border-b border-primary/10 z-40 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Logo size="md" />

                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary-light px-2.5 py-1 rounded-full border border-primary/20">
                            {t('landing.zone')}
                        </span>
                        <LanguageSwitcher />
                        <Link
                            to="/farmer/login"
                            className="text-sm font-bold text-primary hover:text-primary-dark transition border-b-2 border-transparent hover:border-primary pb-0.5"
                        >
                            {t('landing.loginHeader')}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-16 md:py-24 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Hero Left Content */}
                    <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/15 text-accent-dark border border-accent/20 rounded-full font-bold text-xs uppercase tracking-wider"
                        >
                            <FiAward /> {t('landing.badge')}
                        </motion.div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-dark font-sans leading-tight">
                            {t('landing.heroTitle')}
                        </h1>

                        <p className="text-lg text-dark-light max-w-2xl leading-relaxed">
                            {t('landing.heroDesc')}
                        </p>

                        {/* Portal Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 select-none">
                            <Link to="/farmer/login" className="w-full sm:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.03, translateY: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full px-8 py-4 bg-primary text-white hover:bg-primary-dark font-extrabold rounded-btn shadow-md border border-transparent transition"
                                >
                                    {t('landing.btnFarmer')}
                                </motion.button>
                            </Link>

                            <Link to="/expert/login" className="w-full sm:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.03, translateY: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full px-8 py-4 bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-600 font-extrabold rounded-btn shadow-sm transition"
                                >
                                    {t('landing.btnExpert')}
                                </motion.button>
                            </Link>

                            <Link to="/admin/login" className="w-full sm:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.03, translateY: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full px-8 py-4 bg-dark text-white hover:bg-dark-dark font-extrabold rounded-btn shadow-sm border border-transparent transition"
                                >
                                    {t('landing.btnAdmin')}
                                </motion.button>
                            </Link>
                        </div>
                    </div>

                    {/* Hero Right Decorative Panel */}
                    <div className="lg:col-span-5 hidden lg:flex justify-center select-none">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="relative w-full max-w-sm"
                        >
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-primary to-accent rounded-full blur-3xl opacity-20" />

                            <Card glass className="relative border border-white/20 p-8 shadow-2xl space-y-6">
                                <span className="text-5xl">🌾</span>
                                <h3 className="text-xl font-bold text-primary-dark">{t('landing.whyFarmVerse')}</h3>
                                <ul className="space-y-3 text-sm text-dark font-semibold">
                                    <li className="flex items-center gap-3">
                                        <span className="w-2.5 h-2.5 bg-accent rounded-full"></span>
                                        {t('landing.bullet1')}
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="w-2.5 h-2.5 bg-accent rounded-full"></span>
                                        {t('landing.bullet2')}
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="w-2.5 h-2.5 bg-accent rounded-full"></span>
                                        {t('landing.bullet3')}
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="w-2.5 h-2.5 bg-accent rounded-full"></span>
                                        {t('landing.bullet4')}
                                    </li>
                                </ul>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* About Project Section */}
            <section className="bg-white py-16 px-6 border-y border-primary/5">
                <div className="max-w-5xl mx-auto text-center space-y-6">
                    <h2 className="text-3xl font-bold text-primary-dark">{t('landing.aboutTitle')}</h2>
                    <div className="w-20 h-1 bg-accent mx-auto rounded-full" />
                    <p className="text-dark-light text-base leading-relaxed">
                        {t('landing.aboutDesc')}
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 max-w-7xl mx-auto w-full">
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-primary-dark">{t('landing.featuresTitle')}</h2>
                    <p className="text-dark-light max-w-xl mx-auto">
                        {t('landing.featuresDesc')}
                    </p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {features.map((feat, index) => {
                        const Icon = feat.icon;
                        return (
                            <motion.div key={index} variants={itemVariants}>
                                <Card hoverEffect className="h-full border border-dark/5 p-6 space-y-4 flex flex-col justify-between">
                                    <div>
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feat.color}`}>
                                            <Icon size={24} className="text-primary-dark" />
                                        </div>
                                        <h3 className="text-lg font-bold text-dark">{feat.title}</h3>
                                        <p className="text-sm text-dark-light/90 mt-2 leading-relaxed">{feat.desc}</p>
                                    </div>
                                    <div className="pt-2 text-xs font-bold text-primary hover:underline cursor-default">
                                        {t('landing.featLink')}
                                    </div>
                                </Card>
                            </motion.div>
                        )
                    })}
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="mt-auto bg-primary-dark text-white border-t border-primary/20 px-6 py-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <Logo size="sm" invert />
                        <p className="text-xs text-primary-light max-w-xs leading-relaxed">
                            {t('landing.footerDesc')}
                        </p>
                    </div>
                    <div>
                        <h4 className="text-sm font-extrabold text-accent uppercase tracking-wider mb-4">{t('landing.importantLinks')}</h4>
                        <ul className="space-y-2.5 text-xs text-primary-light">
                            <li>
                                <Link to="/farmer/login" className="hover:underline">{t('landing.footerLinkFarmer')}</Link>
                            </li>
                            <li>
                                <Link to="/expert/login" className="hover:underline">{t('landing.footerLinkExpert')}</Link>
                            </li>
                            <li>
                                <Link to="/admin/login" className="hover:underline">{t('landing.footerLinkAdmin')}</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-sm font-extrabold text-accent uppercase tracking-wider mb-2">{t('landing.footerLicense')}</h4>
                        <p className="text-xs text-primary-light">
                            {t('landing.licenseText')}
                        </p>
                        <p className="text-xs text-accent font-bold mt-2">{t('landing.copyright')}</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage
