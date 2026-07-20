import React, { forwardRef, useState } from 'react'
import { FiEye, FiEyeOff, FiAlertTriangle } from 'react-icons/fi'

export const Input = forwardRef(({
    label,
    name,
    type = 'text',
    error,
    placeholder,
    icon: Icon,
    className = '',
    required = false,
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'

    const handleTogglePassword = () => {
        setShowPassword(!showPassword)
    }

    // Determine current input type
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
        <div className={`w-full flex flex-col mb-4 ${className} font-sans`}>
            {label && (
                <label htmlFor={name} className="text-xs md:text-sm font-semibold text-dark/85 mb-1.5 flex items-center gap-1 select-none">
                    {label}
                    {required && <span className="text-red-500 font-bold">*</span>}
                </label>
            )}

            <div className={`relative flex items-center w-full h-[48px] bg-white rounded-btn border transition-all duration-200 overflow-hidden ${
                error
                    ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/10 bg-red-50/5 animate-shake'
                    : 'border-dark/15 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10'
            }`}>
                {/* Left Side Icon */}
                {Icon && (
                    <div className="flex items-center justify-center pl-4 pr-3 h-full text-dark-light/60 pointer-events-none">
                        <Icon size={18} />
                    </div>
                )}

                <input
                    id={name}
                    name={name}
                    type={inputType}
                    placeholder={placeholder}
                    ref={ref}
                    className={`flex-1 w-full bg-transparent border-none focus:ring-0 text-dark placeholder:text-dark-light/40 outline-none text-sm leading-normal py-2 ${
                        Icon ? 'pl-0' : 'pl-4'
                    } ${isPassword ? 'pr-0' : 'pr-4'}`}
                    {...props}
                />

                {/* Password Eye Toggle */}
                {isPassword && (
                    <button
                        type="button"
                        onClick={handleTogglePassword}
                        tabIndex="-1"
                        className="flex items-center justify-center pr-4 pl-3 h-full text-dark-light/60 hover:text-dark outline-none cursor-pointer transition-colors"
                    >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                )}
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

Input.displayName = 'Input'

export default Input
