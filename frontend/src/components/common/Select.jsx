import React, { forwardRef } from 'react'
import { FiChevronDown, FiAlertTriangle } from 'react-icons/fi'

export const Select = forwardRef(({
    label,
    name,
    error,
    icon: Icon,
    className = '',
    required = false,
    children,
    ...props
}, ref) => {
    return (
        <div className={`w-full flex flex-col mb-4 ${className} font-sans`}>
            {label && (
                <label htmlFor={name} className="text-xs md:text-sm font-semibold text-dark/85 mb-1.5 flex items-center gap-1 select-none">
                    {label}
                    {required && <span className="text-red-500 font-bold">*</span>}
                </label>
            )}

            <div className="relative flex items-center">
                {/* Left Side Icon */}
                {Icon && (
                    <div className="absolute left-4 text-dark-light/60 pointer-events-none flex items-center justify-center">
                        <Icon size={18} />
                    </div>
                )}

                <select
                    id={name}
                    name={name}
                    ref={ref}
                    className={`w-full bg-white text-dark placeholder:text-dark-light/40 pl-4 pr-11 py-3 rounded-btn border text-sm transition-all duration-200 outline-none appearance-none cursor-pointer ${
                        Icon ? 'pl-11' : ''
                    } ${
                        error
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 bg-red-50/5 animate-shake'
                            : 'border-dark/15 focus:border-primary focus:ring-2 focus:ring-primary/10'
                    }`}
                    {...props}
                >
                    {children}
                </select>

                {/* Styled Dropdown Chevron Icon */}
                <div className="absolute right-4 text-dark-light/60 pointer-events-none flex items-center justify-center">
                    <FiChevronDown size={18} />
                </div>
            </div>

            {/* Error Message with Warning Icon */}
            {error && (
                <span className="text-xs text-red-650 font-bold mt-1.5 flex items-center gap-1 animate-fadeIn">
                    <FiAlertTriangle size={13} className="text-red-500 flex-shrink-0" />
                    <span>{error.message || error}</span>
                </span>
            )}
        </div>
    )
})

Select.displayName = 'Select'

export default Select
