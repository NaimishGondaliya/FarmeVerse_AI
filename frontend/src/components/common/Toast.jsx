import React, { useEffect } from 'react'
import { FiCheck, FiAlertTriangle, FiX } from 'react-icons/fi'

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000)
        return () => clearTimeout(timer)
    }, [onClose])
    const bg = type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
    return (
        <div className={`fixed top-6 right-6 z-[100] ${bg} text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-semibold animate-slide-down`}>
            {type === 'success' ? <FiCheck size={18} /> : <FiAlertTriangle size={18} />}
            <span>{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-75"><FiX size={16} /></button>
        </div>
    )
}

export default Toast
