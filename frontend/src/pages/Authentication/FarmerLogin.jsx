import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { FiPhone, FiLock } from 'react-icons/fi'
import FormContainer from '../../components/common/FormContainer'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Toast from '../../components/common/Toast'

import { authAPI } from '../../services/api'

export const FarmerLogin = () => {
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
        let errorMsg = errorData?.message || errorData?.errors?.non_field_errors?.[0] || errorData?.errors?.error
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
            mobile: '',
            password: '',
            rememberMe: false
        }
    })

    const onSubmit = async (data) => {
        if (isLoading) return;
        setIsLoading(true)
        try {
            const res = await authAPI.login({
                credential: data.mobile,
                password: data.password,
                role: 'Farmer'
            })
            if (res.success) {
                const { tokens, user } = res.data
                localStorage.setItem('access_token', tokens.access)
                localStorage.setItem('refresh_token', tokens.refresh)
                localStorage.setItem('user', JSON.stringify(user))
                localStorage.setItem('role', user.role)
                navigate('/farmer/dashboard')
            } else {
                triggerToast(res.message || 'પ્રવેશ અસ્વીકાર્ય', 'error')
            }
        } catch (err) {
            console.error(err)
            triggerToast(getErrorMessage(err), 'error')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <FormContainer
            title="ખેડૂત લોગિન" // "Farmer Login" in Gujarati
            subtitle="ખેડૂત વ્યવસ્થાપન પોર્ટલ પર આપનું સ્વાગત છે" // "Welcome to farmer management portal"
            roleTheme="farmer"
            backTo="/"
        >
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Mobile Input */}
                <Input
                    label="મોબાઈલ નંબર (Mobile Number)"
                    name="mobile"
                    type="tel"
                    placeholder="મોબાઈલ નંબર દાખલ કરો (દા.ત. 9876543210)"
                    icon={FiPhone}
                    required
                    error={errors.mobile}
                    {...register('mobile', {
                        required: 'મોબાઈલ નંબર ફરજિયાત છે',
                        pattern: {
                            value: /^[6-9]\d{9}$/,
                            message: 'કૃપા કરીને માન્ય ૧૦-અંકનો મોબાઈલ નંબર દાખલ કરો'
                        }
                    })}
                />

                {/* Password Input */}
                <Input
                    label="પાસવર્ડ (Password)"
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

                {/* Remember Me and Forgot Password bar */}
                <div className="flex items-center justify-between text-sm select-none">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-dark-light">
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded text-primary focus:ring-primary border-dark/15 cursor-pointer"
                            {...register('rememberMe')}
                        />
                        <span>યાદ રાખો</span> {/* Remember me */}
                    </label>

                    <Link
                        to="/farmer/forgot-password"
                        className="text-primary font-semibold hover:underline"
                    >
                        પાસવર્ડ ભૂલી ગયા છો?
                    </Link>
                </div>

                {/* Submit button */}
                <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading} className="mt-2">
                    પ્રવેશ કરો (Login)
                </Button>

                {/* Registration Link */}
                <div className="text-center text-sm text-dark-light/95 pt-2 border-t border-dark/5">
                    <span>નવું ખાતું બનાવવું છે? </span>
                    <Link to="/farmer/register" className="text-primary font-bold hover:underline">
                        અહીં રજીસ્ટ્રેશન કરો (Register here)
                    </Link>
                </div>
            </form>
        </FormContainer>
    )
}

export default FarmerLogin
