import React from 'react'
import { motion } from 'framer-motion'

export const Logo = ({ size = 'md', showText = true, invert = false }) => {
    const iconSizes = {
        sm: 'w-8 h-8 text-xl',
        md: 'w-12 h-12 text-2xl',
        lg: 'w-16 h-16 text-3xl',
    }

    const textSizes = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-3.5xl',
    }

    return (
        <div className="flex items-center gap-3 select-none">
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-light to-secondary border border-primary/20 ${iconSizes[size]}`}
            >
                <span role="img" aria-label="leaf" className="translate-y-[-1px]">🌱</span>
            </motion.div>
            {showText && (
                <div className="flex flex-col">
                    <span className={`font-extrabold tracking-tight leading-none ${textSizes[size]} ${invert ? 'text-white' : 'text-primary-dark'}`}>
                        FarmVerse <span className="text-accent">AI</span>
                    </span>
                    <span className={`text-[10px] font-semibold tracking-widest uppercase opacity-75 mt-0.5 ${invert ? 'text-primary-light' : 'text-dark-light'}`}>
                        Gujarat State
                    </span>
                </div>
            )}
        </div>
    )
}

export default Logo
