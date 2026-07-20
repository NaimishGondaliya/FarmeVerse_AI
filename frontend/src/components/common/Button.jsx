import React from 'react'
import { motion } from 'framer-motion'

export const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    isLoading = false,
    disabled = false,
    className = '',
    ...props
}) => {
    // Base styles with standardized height (h-[46px]), rounded-btn border radius, and smooth animations
    const baseStyles = 'w-full flex items-center justify-center h-[46px] px-5 text-sm font-semibold rounded-btn transition-all duration-200 outline-none select-none disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border focus:ring-2 focus:ring-offset-2'

    const variants = {
        primary: 'bg-primary text-white border-transparent hover:bg-primary-dark hover:shadow-md focus:ring-primary/50',
        accent: 'bg-accent text-dark border-transparent hover:bg-yellow-500 hover:shadow-md focus:ring-accent/50',
        outline: 'bg-transparent text-primary border-primary hover:bg-primary/5 focus:ring-primary/50',
        danger: 'bg-red-650 text-white border-transparent hover:bg-red-700 hover:shadow-md focus:ring-red-500/50',
        dark: 'bg-dark text-white border-transparent hover:bg-dark-dark hover:shadow-md focus:ring-dark/50',
        secondary: 'bg-secondary-dark text-dark border-dark/10 hover:bg-dark/5 hover:text-dark-dark focus:ring-dark/20'
    }

    return (
        <motion.button
            whileHover={!disabled && !isLoading ? { scale: 1.01, translateY: -1 } : {}}
            whileTap={!disabled && !isLoading ? { scale: 0.99 } : {}}
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-semibold">રાહ જુઓ...</span>
                </div>
            ) : children}
        </motion.button>
    )
}

export default Button
