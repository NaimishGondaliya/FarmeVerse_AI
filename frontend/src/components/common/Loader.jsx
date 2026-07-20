import React from 'react'
import { motion } from 'framer-motion'

export const Loader = ({ fullScreen = false, variant = 'spinner', type = 'card', count = 3 }) => {
    const spinner = (
        <div className="flex flex-col items-center justify-center space-y-4 select-none animate-fadeIn">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full flex items-center justify-center shadow-sm"
            >
                <span className="text-2xl">🌱</span>
            </motion.div>
            <div className="text-center">
                <h3 className="font-bold text-primary text-sm mt-2">માહિતી લોડ થઈ રહી છે...</h3> {/* Loading in Gujarati */}
                <p className="text-[10px] text-dark-light/75 font-medium">કૃપા કરીને થોડીવાર રાહ જુઓ</p>
            </div>
        </div>
    )

    if (variant === 'spinner') {
        if (fullScreen) {
            return (
                <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
                    {spinner}
                </div>
            )
        }
        return (
            <div className="w-full flex items-center justify-center p-8 animate-fadeIn">
                {spinner}
            </div>
        )
    }

    // Skeleton Loader Variant
    if (variant === 'skeleton') {
        if (type === 'table') {
            return (
                <div className="w-full bg-white rounded-card border border-dark/5 shadow-sm p-6 space-y-4 animate-pulse">
                    <div className="flex justify-between items-center pb-4 border-b border-dark/5">
                        <div className="h-4 bg-dark/10 rounded w-1/4"></div>
                        <div className="h-8 bg-dark/10 rounded w-32"></div>
                    </div>
                    <div className="space-y-3">
                        <div className="grid grid-cols-6 gap-4">
                            <div className="h-3 bg-dark/10 rounded col-span-2"></div>
                            <div className="h-3 bg-dark/10 rounded"></div>
                            <div className="h-3 bg-dark/10 rounded"></div>
                            <div className="h-3 bg-dark/10 rounded"></div>
                            <div className="h-3 bg-dark/10 rounded"></div>
                        </div>
                        {[...Array(count)].map((_, i) => (
                            <div key={i} className="grid grid-cols-6 gap-4 pt-3 border-t border-dark/5">
                                <div className="h-4 bg-dark/10 rounded col-span-2"></div>
                                <div className="h-4 bg-dark/10 rounded"></div>
                                <div className="h-4 bg-dark/10 rounded"></div>
                                <div className="h-4 bg-dark/10 rounded"></div>
                                <div className="h-4 bg-dark/10 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }

        if (type === 'form') {
            return (
                <div className="w-full max-w-2xl mx-auto bg-white rounded-card border border-dark/5 shadow-sm p-6 space-y-6 animate-pulse">
                    <div className="h-6 bg-dark/10 rounded w-1/3 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="h-3 bg-dark/10 rounded w-1/4"></div>
                            <div className="h-10 bg-dark/10 rounded w-full"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 bg-dark/10 rounded w-1/4"></div>
                            <div className="h-10 bg-dark/10 rounded w-full"></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 bg-dark/10 rounded w-1/6"></div>
                        <div className="h-24 bg-dark/10 rounded w-full"></div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-dark/5">
                        <div className="h-10 bg-dark/10 rounded w-24"></div>
                        <div className="h-10 bg-dark/10 rounded w-28"></div>
                    </div>
                </div>
            )
        }

        // Default skeleton is 'card' grid
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse w-full">
                {[...Array(count * 2)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-card border border-dark/5 shadow-sm space-y-4">
                        <div className="flex justify-between items-start gap-4">
                            <div className="space-y-2 flex-grow">
                                <div className="h-4 bg-dark/10 rounded w-3/4"></div>
                                <div className="h-3 bg-dark/10 rounded w-1/2"></div>
                            </div>
                            <div className="h-6 bg-dark/10 rounded w-12"></div>
                        </div>
                        <div className="space-y-2 pt-2 border-t border-dark/5">
                            <div className="h-3 bg-dark/10 rounded"></div>
                            <div className="h-3 bg-dark/10 rounded w-5/6"></div>
                        </div>
                        <div className="pt-4 flex gap-2">
                            <div className="h-9 bg-dark/10 rounded flex-grow"></div>
                            <div className="h-9 bg-dark/10 rounded w-12"></div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return null
}

export default Loader
