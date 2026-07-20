import React from 'react'
import { motion } from 'framer-motion'

export const Card = ({
    children,
    className = '',
    hoverEffect = true, // Default to true for smooth premium feel
    glass = false,
    onClick,
    ...props
}) => {
    // Base styles with standard rounded-card (12px), shadow, border, and transitions
    const baseStyles = 'rounded-card p-6 border transition-all duration-300 ease-in-out font-sans text-dark'

    const styles = glass
        ? 'bg-white/70 backdrop-blur-md border-white/40 shadow-[0_8px_32px_0_rgba(46,125,50,0.06)]'
        : 'bg-white border-dark/5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'

    const Element = onClick ? motion.div : 'div'

    const motionProps = onClick
        ? {
            whileHover: { scale: 1.015, translateY: -3, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)' },
            whileTap: { scale: 0.985 },
            className: `${baseStyles} ${styles} cursor-pointer hover:border-primary/25 ${className}`,
            onClick,
            ...props
        }
        : {
            className: `${baseStyles} ${styles} ${hoverEffect ? 'hover:shadow-md hover:translate-y-[-2px] hover:border-primary/10' : ''} ${className}`,
            ...props
        }

    return (
        <Element {...motionProps}>
            {children}
        </Element>
    )
}

export default Card
