import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { FiMail, FiLock } from 'react-icons/fi'
import FormContainer from '../../components/common/FormContainer'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Toast from '../../components/common/Toast'

import { expertAPI } from '../../services/api'

export const ExpertLogin = () => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [toast, setToast] = useState(null)
    const triggerToast = (msg, type = 'error') => setToast({ message: msg, type })

    const getErrorMessage = (err) => {
        if (!err.response) return 'Network error: Please check your connection'
        if (err.response.status === 401) return 'Unauthorized: Please check credentials'
        if (err.response.status === 404) return 'No data found'
        if (err.response.status >= 500) return 'Server error: Please try again later'

        const errorData = err.response.data
        let errorMsg = errorData?.error || errorData?.message
        if (!errorMsg && errorData?.errors) {
            const fields = Object.keys(errorData.errors)
            if (fields.length > 0) {
                const firstField = fields[0]
                const firstMsg = errorData.errors[firstField]
                errorMsg = `${firstField}: ${Array.isArray(firstMsg) ? firstMsg[0] : firstMsg}`
            }
        }
        return errorMsg || 'પ્રવેશ નિષ્ફળ ગયું છે'
    }

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const onSubmit = async (data) => {
        if (isLoading) return;
        setIsLoading(true)
        try {
            const res = await expertAPI.login({
                email: data.email,
                password: data.password
            })
            const { tokens, user } = res
            localStorage.setItem('access_token', tokens.access)
            localStorage.setItem('refresh_token', tokens.refresh)
            localStorage.setItem('user', JSON.stringify(user))
            localStorage.setItem('role', 'Expert')
            navigate('/expert/dashboard')
        } catch (err) {
            console.error(err)
            triggerToast(getErrorMessage(err), 'error')
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <FormContainer
            title="કૃષિ નિષ્ણાત પ્રવેશ (Expert Login)"
            subtitle="કૃષિ વિજ્ઞાન સલાહકાર સેવાઓ"
            roleTheme="expert"
            backTo="/"
        >
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email/Username field */}
                <Input
                    label="ઈમેલ સરનામું (Email Address)"
                    name="email"
                    type="email"
                    placeholder="officer@farmverse.gov.in"
                    icon={FiMail}
                    required
                    error={errors.email}
                    {...register('email', {
                        required: 'ઈમેલ આઈડી ફરજિયાત છે',
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'માનક ઈમેલ આઈડી દાખલ કરો'
                        }
                    })}
                />

                {/* Password field */}
                <Input
                    label="ગુપ્ત કોડ (Password)"
                    name="password"
                    type="password"
                    placeholder="પાસવર્ડ દાખલ કરો"
                    icon={FiLock}
                    required
                    error={errors.password}
                    {...register('password', {
                        required: 'પાસવર્ડ ફરજિયાત છે',
                        pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                            message: 'પાસવર્ડમાં ઓછામાં ઓછો ૮ અક્ષર, ૧ કેપિટલ, ૧ સ્મોલ, નંબર અને સ્પેશિયલ કેરેક્ટર હોવો જોઈએ'
                        }
                    })}
                />

                {/* Submit */}
                <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading} className="mt-2 bg-emerald-600 hover:bg-emerald-700">
                    નિષ્ણાત તરીકે લોગિન કરો (Login as Expert)
                </Button>
            </form>
        </FormContainer>
    )
}

export default ExpertLogin
