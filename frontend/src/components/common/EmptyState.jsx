import React from 'react'
import { Card } from './Card'

export const EmptyState = ({
    icon: Icon,
    title,
    description,
    actionText,
    actionLink,
    onActionClick,
    className = ''
}) => {
    return (
        <Card className={`flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto border border-dark/5 shadow-sm bg-white animate-fadeIn ${className}`}>
            {Icon && (
                <div className="w-16 h-16 bg-primary-light text-primary rounded-full flex items-center justify-center mb-5 border border-primary/10 shadow-sm animate-pulse">
                    <Icon size={28} />
                </div>
            )}
            <h3 className="text-base md:text-lg font-bold text-dark mb-2 tracking-tight">{title}</h3>
            <p className="text-xs md:text-sm text-dark-light leading-relaxed mb-6 max-w-sm">
                {description}
            </p>
            {actionText && (actionLink || onActionClick) && (
                actionLink ? (
                    <a href={actionLink} className="inline-flex items-center justify-center h-[42px] px-5 text-xs md:text-sm font-semibold rounded-btn bg-primary text-white hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200">
                        {actionText}
                    </a>
                ) : (
                    <button onClick={onActionClick} className="inline-flex items-center justify-center h-[42px] px-5 text-xs md:text-sm font-semibold rounded-btn bg-primary text-white hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200">
                        {actionText}
                    </button>
                )
            )}
        </Card>
    )
}

export default EmptyState
