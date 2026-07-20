import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Card from './Card'
import Logo from './Logo'
import LanguageSwitcher from './LanguageSwitcher'

export const FormContainer = ({
    children,
    title,
    subtitle,
    backTo = '/',
    backLabel = 'મુખ્ય પૃષ્ઠ પર પાછા જાઓ', // "Back to main page" in Gujarati
    roleTheme = 'farmer', // default, changes style elements (farmer, expert, admin)
}) => {
    const themes = {
        farmer: {
            gradient: 'from-primary-light/40 to-white',
            accentBar: 'bg-primary',
            bgGraphic: 'text-primary/10',
        },
        expert: {
            gradient: 'from-emerald-50 to-white',
            accentBar: 'bg-emerald-600',
            bgGraphic: 'text-emerald-600/10',
        },
        admin: {
            gradient: 'from-green-950/20 to-secondary',
            accentBar: 'bg-dark-dark',
            bgGraphic: 'text-dark/10',
        }
    }

    const activeTheme = themes[roleTheme] || themes.farmer

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 md:p-8 bg-gradient-to-tr ${activeTheme.gradient} relative overflow-hidden`}>
            {/* Language Switcher */}
            <div className="absolute top-4 right-4 z-50">
                <LanguageSwitcher />
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute top-[-100px] right-[-100px] w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-[-100px] left-[-100px] w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-lg z-10"
            >
                {/* Back Link */}
                <div className="mb-4">
                    <Link
                        to={backTo}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors duration-150"
                    >
                        <span>←</span> {backLabel}
                    </Link>
                </div>

                {/* Card Wrapping form */}
                <Card glass className="relative border-t-4 border-t-primary shadow-xl p-8 overflow-hidden">
                    {/* Theme Accent Bar */}
                    <div className={`absolute top-0 left-0 w-full h-[4px] ${activeTheme.accentBar}`} />

                    <div className="flex flex-col items-center mb-6 text-center select-none">
                        <Logo size="md" />
                        <h2 className="text-xl font-bold text-dark mt-4">{title}</h2>
                        {subtitle && <p className="text-xs text-dark-light/80 mt-1">{subtitle}</p>}
                    </div>

                    {children}
                </Card>
            </motion.div>
        </div>
    )
}

export default FormContainer
