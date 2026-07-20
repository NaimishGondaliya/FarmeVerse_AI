import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authAPI } from '../../services/api'
import FormContainer from '../../components/common/FormContainer'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Toast from '../../components/common/Toast'
import { FiUser, FiLock } from 'react-icons/fi'

export const AdminLogin = () => {
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
            username: '',
            password: ''
        }
    })

    const onSubmit = async (data) => {
        if (isLoading) return;
        setIsLoading(true)
        try {
            const res = await authAPI.login({
                credential: data.username,
                password: data.password,
                role: 'Admin'
            })
            if (res.success) {
                const { tokens, user } = res.data
                localStorage.setItem('access_token', tokens.access)
                localStorage.setItem('refresh_token', tokens.refresh)
                localStorage.setItem('user', JSON.stringify(user))
                localStorage.setItem('role', user.role)
                navigate('/admin/dashboard')
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
            title="એડમિન કંટ્રોલ પેનલ (Admin Portal)"
            subtitle="સિસ્ટમ ઓવરરાઇડ અને વહીવટી પ્રવેશ"
            roleTheme="admin"
            backTo="/"
        >
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Username/ID field */}
                <Input
                    label="વપરાશકર્તા નામ (Username)"
                    name="username"
                    placeholder="એડમિનિસ્ટ્રેટર આઈડી"
                    icon={FiUser}
                    required
                    error={errors.username}
                    {...register('username', {
                        required: 'એડમિનિસ્ટ્રેટર આઈડી લખવું ફરજિયાત છે'
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
                <Button type="submit" variant="dark" isLoading={isLoading} disabled={isLoading} className="mt-2 bg-green-950 hover:bg-slate-900 border border-green-800">
                    સુરક્ષિત પ્રવેશ કરો (Secure Login)
                </Button>
            </form>
        </FormContainer>
    )
}

export default AdminLogin
