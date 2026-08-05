import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { FiPhone, FiLock, FiShield } from 'react-icons/fi'
import FormContainer from '../../components/common/FormContainer'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Toast from '../../components/common/Toast'

import { authAPI } from '../../services/api'

export const ForgotPasswordFlow = () => {
    const navigate = useNavigate()
    const [step, setStep] = useState(1) // 1: Mobile, 2: OTP, 3: Reset
    const [isLoading, setIsLoading] = useState(false)
    const [userMobile, setUserMobile] = useState('')
    const [resetToken, setResetToken] = useState('')
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
        return errorMsg || 'પ્રક્રિયા નિષ્ફળ ગઈ'
    }

    // Form hooks for Step 1 (Mobile)
    const {
        register: regMobile,
        handleSubmit: handleMobileSubmit,
        formState: { errors: errorsMobile }
    } = useForm({ defaultValues: { mobile: '' } })

    // Form hooks for Step 2 (OTP)
    const {
        register: regOtp,
        handleSubmit: handleOtpSubmit,
        formState: { errors: errorsOtp }
    } = useForm({ defaultValues: { otp: '' } })

    // Form hooks for Step 3 (Reset Password)
    const {
        register: regReset,
        handleSubmit: handleResetSubmit,
        watch: watchReset,
        formState: { errors: errorsReset }
    } = useForm({ defaultValues: { password: '', confirmPassword: '' } })

    const password = watchReset('password')

    // Step 1: Mobile Form submission
    const onMobileSubmit = async (data) => {
        if (isLoading) return;
        setIsLoading(true)
        try {
            const res = await authAPI.forgotPassword(data.mobile)
            if (res.success) {
                setUserMobile(data.mobile)
                triggerToast(res.message || 'OTP મોકલવામાં આવ્યો છે!', 'success')
                setStep(2) // Move to OTP
            } else {
                triggerToast(res.message || 'મોબાઈલ ચકાસણી નિષ્ફળ ગઈ', 'error')
            }
        } catch (err) {
            console.error(err)
            triggerToast(getErrorMessage(err), 'error')
        } finally {
            setIsLoading(false)
        }
    }

    // Step 2: OTP Form submission
    const onOtpSubmit = async (data) => {
        if (isLoading) return;
        setIsLoading(true)
        try {
            const res = await authAPI.verifyOtp(userMobile, data.otp)
            if (res.success) {
                setResetToken(res.data?.reset_token || '')
                triggerToast(res.message || 'OTP મળ્યો છે!', 'success')
                setStep(3) // Move to Reset Password
            } else {
                triggerToast(res.message || 'OTP અયોગ્ય છે', 'error')
            }
        } catch (err) {
            console.error(err)
            triggerToast(getErrorMessage(err), 'error')
        } finally {
            setIsLoading(false)
        }
    }

    // Step 3: Password Reset submission
    const onResetSubmit = async (data) => {
        if (isLoading) return;
        setIsLoading(true)
        try {
            const res = await authAPI.resetPassword(userMobile, data.password, data.confirmPassword, resetToken)
            if (res.success) {
                triggerToast(res.message || 'પાસવર્ડ સફળતાપૂર્વક બદલાઈ ગયો છે!', 'success')
                setTimeout(() => navigate('/farmer/login'), 2000)
            } else {
                triggerToast(res.message || 'રીસેટ નિષ્ફળ રહ્યું', 'error')
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
            title={
                step === 1
                    ? 'પાસવર્ડ પુનઃપ્રાપ્તિ' // Password Recovery
                    : step === 2
                        ? 'OTP ચકાસણી' // OTP Verification
                        : 'નવો પાસવર્ડ સેટ કરો' // Set new password
            }
            subtitle={
                step === 1
                    ? 'તમારા ખાતાનો રજીસ્ટર્ડ મોબાઈલ નંબર દાખલ કરો'
                    : step === 2
                        ? `અમે તમારા રજિસ્ટર્ડ ઈમેલ સરનામા પર 6 અંકનો OTP મોકલ્યો છે.`
                        : 'કૃપા કરીને નીચે તમારો નવો પાસવર્ડ દાખલ કરો'
            }
            roleTheme="farmer"
            backTo="/farmer/login"
            backLabel="લોગિન પર પાછા જાઓ"
        >
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* STEP 1: Enter Mobile */}
            {step === 1 && (
                <form onSubmit={handleMobileSubmit(onMobileSubmit)} className="space-y-4">
                    <Input
                        label="મોબાઈલ નંબર (Mobile Number)"
                        name="mobile"
                        type="tel"
                        placeholder="મોબાઈલ નંબર દાખલ કરો"
                        icon={FiPhone}
                        required
                        error={errorsMobile.mobile}
                        {...regMobile('mobile', {
                            required: 'મોબાઈલ નંબર ફરજિયાત છે',
                            pattern: {
                                value: /^[6-9]\d{9}$/,
                                message: 'કૃપા કરીને માન્ય ૧૦-અંકનો મોબાઈલ નંબર પ્રદાન કરો'
                            }
                        })}
                    />
                    <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
                        OTP મોકલો (Send OTP)
                    </Button>
                </form>
            )}

            {/* STEP 2: Enter OTP */}
            {step === 2 && (
                <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-4">
                    <Input
                        label="OTP કોડ (6 આંકડાનો)"
                        name="otp"
                        type="text"
                        maxLength={6}
                        placeholder="દા.ત. 123456"
                        icon={FiShield}
                        required
                        error={errorsOtp.otp}
                        {...regOtp('otp', {
                            required: 'OTP ફરજિયાત છે',
                            pattern: {
                                value: /^\d{6}$/,
                                message: 'OTP કોડ ફક્ત ૬ અંકનો હોવો જોઈએ'
                            }
                        })}
                    />
                    <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
                        કોડ ચકાસો (Verify OTP)
                    </Button>
                    <div className="text-center">
                        <button
                            type="button"
                            className="text-xs text-primary font-bold hover:underline"
                            disabled={isLoading}
                            onClick={async () => {
                                try {
                                    const res = await authAPI.forgotPassword(userMobile)
                                    if (res.success) {
                                        triggerToast(res.message || 'નવો OTP મોકલવામાં આવ્યો છે!', 'success')
                                    } else {
                                        triggerToast(res.message || 'OTP રિસેન્ડ નિષ્ફળ રહ્યો', 'error')
                                    }
                                } catch (err) {
                                    triggerToast(getErrorMessage(err), 'error')
                                }
                            }}
                        >
                            ફરીથી OTP મોકલો (Resend OTP)
                        </button>
                    </div>
                </form>
            )}

            {/* STEP 3: Enter New Password */}
            {step === 3 && (
                <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-4">
                    <Input
                        label="નવો પાસવર્ડ (New Password)"
                        name="password"
                        type="password"
                        placeholder="નવો ગુપ્ત કોડ લખો"
                        icon={FiLock}
                        required
                        error={errorsReset.password}
                        {...regReset('password', {
                            required: 'નવો પાસવર્ડ ફરજિયાત છે',
                            pattern: {
                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                message: 'પાસવર્ડમાં ઓછામાં ઓછો ૮ અક્ષર, ૧ કેપિટલ, ૧ સ્મોલ, નંબર અને સ્પેશિયલ કેરેક્ટર હોવો જોઈએ'
                            }
                        })}
                    />
                    <Input
                        label="પાસવર્ડની ખાતરી કરો"
                        name="confirmPassword"
                        type="password"
                        placeholder="ફરીથી પાસવર્ડ દાખલ કરો"
                        icon={FiLock}
                        required
                        error={errorsReset.confirmPassword}
                        {...regReset('confirmPassword', {
                            required: 'પાસવર્ડ ખાતરી કરવો ફરજિયાત છે',
                            validate: (val) => val === password || 'પાસવર્ડ એકસમાન નથી'
                        })}
                    />
                    <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
                        પાસવર્ડ બદલો (Reset Password)
                    </Button>
                </form>
            )}
        </FormContainer>
    )
}

export default ForgotPasswordFlow
