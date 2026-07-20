import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import {
    FiUser, FiCheckCircle, FiShield,
    FiTrash2, FiCamera,
    FiX, FiCheck, FiAlertTriangle, FiCalendar, FiActivity
} from 'react-icons/fi'
import { adminProfileAPI } from '../../services/api'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import Input from '../../components/common/Input'

const T = {
    ENG: {
        title: "Admin Profile Control Center",
        subtitle: "Manage personal details, security credentials, and preferences.",
        personalInfo: "Personal Information",
        fullName: "Full Name",
        emailAddress: "Email Address",
        mobileNumber: "Mobile Number",
        username: "Username",
        role: "Role",
        accountInfo: "Account Information",
        createdDate: "Account Created Date",
        lastLogin: "Last Login",
        accountStatus: "Account Status",
        active: "Active",
        inactive: "Inactive",
        security: "Security & Passwords",
        changePassword: "Change Account Password",
        currentPwd: "Current Password",
        newPwd: "New Password",
        confirmPwd: "Confirm New Password",
        pwdStrength: "Password Strength",
        strengthWeak: "Weak",
        strengthMedium: "Medium",
        strengthStrong: "Strong",
        profilePhoto: "Profile Photo",
        uploadPhoto: "Upload Photo",
        changePhoto: "Change",
        removePhoto: "Remove",
        preferences: "System Preferences",
        saveBtn: "Save Profile Changes",
        updatePwdBtn: "Update Password",
        saving: "Saving changes...",
        loading: "Retrieving admin credentials...",
        photoRemoved: "Profile photo removed successfully",
        photoUploaded: "Profile photo uploaded successfully",
        profileUpdated: "Profile updated successfully",
        pwdUpdated: "Password updated successfully",
        confirmTitle: "Are you sure?",
        confirmDeletePhoto: "Do you want to remove your profile photo?",
        yes: "Yes, Remove",
        cancel: "Cancel",
        errorLoad: "Failed to load admin profile information.",
        retry: "Retry"
    },
    GUJ: {
        title: "એડમિન પ્રોફાઇલ કંટ્રોલ સેન્ટર",
        subtitle: "વ્યક્તિગત વિગતો, સુરક્ષા ઓળખપત્રો અને પસંદગીઓનું સંચાલન કરો.",
        personalInfo: "વ્યક્તિગત માહિતી",
        fullName: "પૂરું નામ",
        emailAddress: "ઈમેલ આઈડી",
        mobileNumber: "મોબાઇલ નંબર",
        username: "વપરાશકર્તા નામ",
        role: "ભૂમિકા (રોલ)",
        accountInfo: "એકાઉન્ટ વિગતો",
        createdDate: "એકાઉન્ટ બનાવ્યાની તારીખ",
        lastLogin: "છેલ્લું લોગિન",
        accountStatus: "એકાઉન્ટ સ્થિતિ",
        active: "સક્રિય",
        inactive: "નિષ્ક્રિય",
        security: "સુરક્ષા અને ગુપ્ત કોડ",
        changePassword: "એકાઉન્ટ પાસવર્ડ બદલો",
        currentPwd: "વર્તમાન ગુપ્ત કોડ",
        newPwd: "નવો ગુપ્ત કોડ",
        confirmPwd: "નવા ગુપ્ત કોડની પુષ્ટિ કરો",
        pwdStrength: "પાસવર્ડની મજબૂતાઈ",
        strengthWeak: "નબળો",
        strengthMedium: "મધ્યમ",
        strengthStrong: "મજબૂત",
        profilePhoto: "પ્રોફાઇલ ફોટો",
        uploadPhoto: "ફોટો અપલોડ કરો",
        changePhoto: "બદલો",
        removePhoto: "દૂર કરો",
        preferences: "સિસ્ટમ સેટિંગ્સ",
        saveBtn: "ફેરફારો સાચવો",
        updatePwdBtn: "પાસવર્ડ અપડેટ કરો",
        saving: "સાચવી રહ્યાં છીએ...",
        loading: "એડમિન પ્રોફાઇલમાં માહિતી લોડ થઈ રહી છે...",
        photoRemoved: "પ્રોફાઇલ ફોટો સફળતાપૂર્વક દૂર કરવામાં આવ્યો",
        photoUploaded: "પ્રોફાઇલ ફોટો સફળતાપૂર્વક અપલોડ કરવામાં આવ્યો",
        profileUpdated: "પ્રોફાઇલ સફળતાપૂર્વક અપડેટ થઈ",
        pwdUpdated: "પાસવર્ડ સફળતાપૂર્વક અપડેટ થયો",
        confirmTitle: "શું આપ ખાતરીપૂર્વક કરવા માંગો છો?",
        confirmDeletePhoto: "શું તમે તમારો પ્રોફાઇલ ફોટો દૂર કરવા માંગો છો?",
        yes: "હા, દૂર કરો",
        cancel: "રદ કરો",
        errorLoad: "એડમિન પ્રોફાઇલ ડેટા લોડ કરવામાં નિષ્ફળતા.",
        retry: "ફરી પ્રયાસ કરો"
    }
}

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000)
        return () => clearTimeout(timer)
    }, [onClose])
    const bg = type === 'success' ? 'bg-emerald-600' : 'bg-rose-605 text-white bg-red-600'
    return (
        <div className={`fixed top-6 right-6 z-[100] ${bg} text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-semibold animate-slide-down`}>
            {type === 'success' ? <FiCheck size={18} /> : <FiAlertTriangle size={18} />}
            <span>{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-75"><FiX size={16} /></button>
        </div>
    )
}

export const AdminProfile = () => {
    const { language } = useLanguage()
    const lang = language === 'en' ? 'ENG' : 'GUJ'
    const t = T[lang]

    const fileInputRef = useRef(null)

    // Primary State
    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        mobile: '',
        username: '',
        role: 'Admin',
        profile_picture: null,
        created_at: null,
        last_login: null,
        is_active: true
    })

    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [toast, setToast] = useState(null)

    // Form errors
    const [formErrors, setFormErrors] = useState({})

    // Security state
    const [passwords, setPasswords] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    })
    const [isSavingPassword, setIsSavingPassword] = useState(false)
    const [passwordErrors, setPasswordErrors] = useState({})
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        label: 'Weak',
        color: 'bg-red-500'
    })

    // Confirm dialog modal state
    const [showConfirmDeletePhoto, setShowConfirmDeletePhoto] = useState(false)

    // Fetch Profile
    const loadProfile = async () => {
        setIsLoading(true)
        setIsError(false)
        try {
            const data = await adminProfileAPI.get()
            setProfile(data)

        } catch (err) {
            console.error(err)
            setIsError(true)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadProfile()
    }, [])

    const triggerToast = (msg, type = 'success') => {
        setToast({ message: msg, type })
    }

    // Handles standard form values change
    const handleProfileChange = (e) => {
        const { name, value } = e.target
        setProfile(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error on modify
        if (formErrors[name]) {
            setFormErrors(prev => {
                const nextErrors = { ...prev }
                delete nextErrors[name]
                return nextErrors
            })
        }
    }

    // Client-side validations
    const validateProfileForm = () => {
        const errors = {}
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const mobileRegex = /^\d{10}$/

        if (!profile.full_name || !profile.full_name.trim()) {
            errors.full_name = lang === 'GUJ' ? 'પૂરું નામ જરૂરી છે.' : 'Full name is required.'
        }

        if (!profile.email) {
            errors.email = lang === 'GUJ' ? 'ઈમેલ જરૂરી છે.' : 'Email is required.'
        } else if (!emailRegex.test(profile.email)) {
            errors.email = lang === 'GUJ' ? 'અમાન્ય ઈમેલ ફોર્મેટ.' : 'Invalid email format.'
        }

        if (!profile.mobile) {
            errors.mobile = lang === 'GUJ' ? 'મોબાઇલ નંબર જરૂરી છે.' : 'Mobile number is required.'
        } else if (!mobileRegex.test(profile.mobile)) {
            errors.mobile = lang === 'GUJ' ? 'મોબાઇલ નંબર બરાબર ૧૦ આંકડાનો હોવો જોઈએ.' : 'Mobile number must be exactly 10 digits.'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Submit Profile Details
    const handleProfileSubmit = async (e) => {
        e.preventDefault()
        if (!validateProfileForm()) return

        setIsSavingProfile(true)
        try {
            const payload = {
                full_name: profile.full_name,
                email: profile.email,
                mobile: profile.mobile,
                username: profile.username
            }
            const updatedData = await adminProfileAPI.update(payload)
            setProfile(updatedData)



            // Sync user object local storage to update nav header names
            const storedUser = localStorage.getItem('user')
            if (storedUser) {
                try {
                    const userObj = JSON.parse(storedUser)
                    userObj.full_name = updatedData.full_name
                    userObj.email = updatedData.email
                    userObj.mobile = updatedData.mobile
                    localStorage.setItem('user', JSON.stringify(userObj))
                } catch (jsonErr) {
                    console.error(jsonErr)
                }
            }

            triggerToast(t.profileUpdated, 'success')
        } catch (err) {
            console.error(err)
            if (err.response && err.response.data) {
                // Backend validations mapping
                setFormErrors(err.response.data)
            } else {
                triggerToast(lang === 'GUJ' ? 'પ્રોફાઇલ સાચવવામાં સમસ્યા આવી.' : 'An error occurred while saving the profile.', 'error')
            }
        } finally {
            setIsSavingProfile(false)
        }
    }

    // Password validations change & strength check
    const checkPasswordStrength = (password) => {
        let score = 0
        if (!password) {
            return { score: 0, label: 'Weak', color: 'bg-red-500' }
        }

        if (password.length >= 8) score++
        if (/[A-Z]/.test(password)) score++
        if (/[a-z]/.test(password)) score++
        if (/\d/.test(password)) score++
        if (/[!@#$%^&*()-_=+[\]{}|;:'",.<>/?`~]/.test(password)) score++

        let label = 'Weak'
        let color = 'bg-red-500'

        if (score >= 4) {
            label = 'Strong'
            color = 'bg-emerald-500'
        } else if (score >= 2) {
            label = 'Medium'
            color = 'bg-yellow-500'
        }

        return { score, label, color }
    }

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswords(prev => ({ ...prev, [name]: value }))

        if (name === 'new_password') {
            const strength = checkPasswordStrength(value)
            setPasswordStrength(strength)
        }

        if (passwordErrors[name]) {
            setPasswordErrors(prev => {
                const nextErrors = { ...prev }
                delete nextErrors[name]
                return nextErrors
            })
        }
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        const errors = {}

        if (!passwords.current_password) {
            errors.current_password = lang === 'GUJ' ? 'વર્તમાન પાસવર્ડ જરૂરી છે.' : 'Current password is required.'
        }
        if (!passwords.new_password) {
            errors.new_password = lang === 'GUJ' ? 'નવો પાસવર્ડ જરૂરી છે.' : 'New password is required.'
        }
        if (!passwords.confirm_password) {
            errors.confirm_password = lang === 'GUJ' ? 'નવા પાસવર્ડની પુષ્ટિ જરૂરી છે.' : 'Password confirmation is required.'
        }

        if (passwords.new_password !== passwords.confirm_password) {
            errors.confirm_password = lang === 'GUJ' ? 'નવા પાસવર્ડો મેળ ખાતા નથી.' : 'New passwords do not match.'
        }

        if (passwords.new_password && passwordStrength.score < 4) {
            errors.new_password = lang === 'GUJ'
                ? 'કૃપા કરીને મજબૂત પાસવર્ડ દાખલ કરો (કેપિટલ અક્ષરો, અંકો અને ચિહ્નો સાથે ઓછામાં ઓછા ૮ અક્ષરો).'
                : 'Please use a stronger password (must have uppercase, lowercase, numbers, special characters, and >= 8 characters).'
        }

        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors)
            return
        }

        setIsSavingPassword(false)
        setIsSavingPassword(true)
        try {
            await adminProfileAPI.changePassword({
                current_password: passwords.current_password,
                new_password: passwords.new_password,
                confirm_password: passwords.confirm_password
            })

            triggerToast(t.pwdUpdated, 'success')
            setPasswords({
                current_password: '',
                new_password: '',
                confirm_password: ''
            })
            setPasswordStrength({ score: 0, label: 'Weak', color: 'bg-red-500' })
        } catch (err) {
            console.error(err)
            if (err.response && err.response.data) {
                setPasswordErrors(err.response.data)
            } else {
                triggerToast(lang === 'GUJ' ? 'ગુપ્ત કોડ બદલવામાં નિષ્ફળતા.' : 'Failed to change password.', 'error')
            }
        } finally {
            setIsSavingPassword(false)
        }
    }

    // Photo Management
    const handlePhotoChangeTrigger = () => {
        fileInputRef.current.click()
    }

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('profile_picture', file)

        setIsSavingProfile(true)
        try {
            const data = await adminProfileAPI.uploadPhoto(formData)
            setProfile(prev => ({
                ...prev,
                profile_picture: data.profile_picture
            }))
            triggerToast(t.photoUploaded, 'success')
        } catch (err) {
            console.error(err)
            const errorMsg = err.response?.data?.profile_picture || (lang === 'GUJ' ? 'ફોટો અપલોડ નિષ્ફળ ગયો.' : 'Profile image upload failed.')
            triggerToast(errorMsg, 'error')
        } finally {
            setIsSavingProfile(false)
            // Reset browser input element value
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handlePhotoRemove = async () => {
        setShowConfirmDeletePhoto(false)
        setIsSavingProfile(true)
        try {
            await adminProfileAPI.deletePhoto()
            setProfile(prev => ({
                ...prev,
                profile_picture: null
            }))
            triggerToast(t.photoRemoved, 'success')
        } catch (err) {
            console.error(err)
            triggerToast(lang === 'GUJ' ? 'ફોટો દૂર કરવામાં નિષ્ફળતા.' : 'Failed to delete photo.', 'error')
        } finally {
            setIsSavingProfile(false)
        }
    }

    // Utility: Date Format
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A'
        return new Date(dateStr).toLocaleString(lang === 'GUJ' ? 'gu-IN' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                <p className="mt-4 text-dark-light text-sm font-semibold">{t.loading}</p>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="p-12 bg-white rounded-card shadow-sm text-center mt-12 max-w-xl mx-auto border border-red-100">
                <FiAlertTriangle size={48} className="text-red-500 mx-auto mb-4 animate-bounce" />
                <h3 className="text-lg font-bold text-dark">{t.errorLoad}</h3>
                <Button onClick={loadProfile} className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">{t.retry}</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fadeIn pb-12 max-w-7xl mx-auto w-full">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Confirmation Dialog Modal */}
            {showConfirmDeletePhoto && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border animate-scaleUp">
                        <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
                            <FiTrash2 className="text-red-500" />
                            {t.confirmTitle}
                        </h4>
                        <p className="text-sm text-slate-500 leading-relaxed mb-6">{t.confirmDeletePhoto}</p>
                        <div className="flex justify-end gap-3.5">
                            <button
                                onClick={() => setShowConfirmDeletePhoto(false)}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-650 hover:bg-slate-50 text-sm font-bold transition"
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={handlePhotoRemove}
                                className="px-5 py-2.5 rounded-xl bg-red-650 text-white hover:bg-red-700 text-sm font-bold transition bg-red-600"
                            >
                                {t.yes}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-card border shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <FiUser className="text-emerald-600" /> {t.title}
                    </h1>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{t.subtitle}</p>
                </div>

            </div>

            {/* Left and Right Grid Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT BLOCK: PHOTO, METRICS, PREFERENCES */}
                <div className="space-y-6 lg:col-span-1">

                    {/* PHOTO CARD */}
                    <Card className="p-6 text-center space-y-6 flex flex-col items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest self-start">{t.profilePhoto}</span>
                        <div className="relative group">
                            {/* Profile image placeholder circle */}
                            <div className="w-32 h-32 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center font-extrabold text-4xl border border-emerald-100/50 overflow-hidden shadow-inner relative">
                                {profile.profile_picture ? (
                                    <img
                                        src={profile.profile_picture}
                                        alt={profile.full_name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null
                                            e.target.src = ''
                                        }}
                                    />
                                ) : (
                                    <span>{profile.full_name ? profile.full_name.slice(0, 1).toUpperCase() : 'A'}</span>
                                )}
                            </div>

                            {/* Camera overlay */}
                            <button
                                onClick={handlePhotoChangeTrigger}
                                className="absolute bottom-1 right-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-2.5 shadow-md border-2 border-white transition flex items-center justify-center cursor-pointer"
                                title={t.uploadPhoto}
                            >
                                <FiCamera size={16} />
                            </button>
                        </div>

                        {/* File inputs */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoUpload}
                            accept="image/*"
                            className="hidden"
                        />

                        {/* Photo action controls */}
                        <div className="flex gap-3 justify-center w-full">
                            <button
                                onClick={handlePhotoChangeTrigger}
                                className="px-4 py-2 border text-emerald-600 hover:border-emerald-600 hover:bg-emerald-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                            >
                                <FiCamera size={13} /> {t.changePhoto}
                            </button>
                            {profile.profile_picture && (
                                <button
                                    onClick={() => setShowConfirmDeletePhoto(true)}
                                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                                >
                                    <FiTrash2 size={13} /> {t.removePhoto}
                                </button>
                            )}
                        </div>
                    </Card>

                    {/* ACCOUNT INFO CARD */}
                    <Card className="p-6 space-y-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block pb-2 border-b border-slate-100">{t.accountInfo}</span>

                        <div className="space-y-4 pt-2">
                            <div className="flex justify-between items-start text-xs leading-relaxed">
                                <span className="text-slate-450 font-bold flex items-center gap-1.5">
                                    <FiCalendar size={14} className="text-slate-400" />
                                    {t.createdDate}
                                </span>
                                <span className="text-slate-700 font-semibold text-right">{formatDate(profile.created_at)}</span>
                            </div>

                            <div className="flex justify-between items-start text-xs leading-relaxed">
                                <span className="text-slate-450 font-bold flex items-center gap-1.5">
                                    <FiActivity size={14} className="text-slate-400" />
                                    {t.lastLogin}
                                </span>
                                <span className="text-slate-700 font-semibold text-right">{formatDate(profile.last_login)}</span>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-450 font-bold flex items-center gap-1.5">
                                    <FiCheckCircle size={14} className="text-slate-400" />
                                    {t.accountStatus}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${profile.is_active
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                                    : 'bg-red-50 text-red-800 border border-red-100'
                                    }`}>
                                    {profile.is_active ? t.active : t.inactive}
                                </span>
                            </div>
                        </div>
                    </Card>


                </div>

                {/* RIGHT BLOCK: PERSONAL INFO & SECURITY */}
                <div className="lg:col-span-2 space-y-6">

                    {/* PERSONAL INFORMATION CARD */}
                    <Card className="p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
                                <FiUser className="text-emerald-600" />
                                {t.personalInfo}
                            </h3>
                            <p className="text-xs text-slate-400 font-medium">Update your core personal login and contact credentials.</p>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label={t.fullName}
                                    name="full_name"
                                    type="text"
                                    value={profile.full_name}
                                    onChange={handleProfileChange}
                                    error={formErrors.full_name}
                                    required
                                />
                                <Input
                                    label={t.emailAddress}
                                    name="email"
                                    type="email"
                                    value={profile.email}
                                    onChange={handleProfileChange}
                                    error={formErrors.email}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label={t.mobileNumber}
                                    name="mobile"
                                    type="text"
                                    value={profile.mobile}
                                    onChange={handleProfileChange}
                                    error={formErrors.mobile}
                                    required
                                />
                                <Input
                                    label={t.username}
                                    name="username"
                                    type="text"
                                    value={profile.username || ''}
                                    onChange={handleProfileChange}
                                    error={formErrors.username || formErrors.detail}
                                    placeholder="Enter administrative username"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col mb-4">
                                    <label className="text-sm font-semibold text-dark/85 mb-1.5 flex items-center gap-1 select-none">
                                        {t.role}
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.role}
                                        disabled
                                        className="w-full bg-slate-105 text-slate-500 px-4 py-3 rounded-btn border border-dark/15 text-sm font-semibold cursor-not-allowed select-none bg-slate-50"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <Button
                                    type="submit"
                                    isLoading={isSavingProfile}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                >
                                    {t.saveBtn}
                                </Button>
                            </div>
                        </form>
                    </Card>

                    {/* CHANGE PASSWORD CARD */}
                    <Card className="p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
                                <FiShield className="text-emerald-600" />
                                {t.security}
                            </h3>
                            <p className="text-xs text-slate-400 font-medium">Protect administrative access by refreshing passwords frequently.</p>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label={t.currentPwd}
                                    name="current_password"
                                    type="password"
                                    value={passwords.current_password}
                                    onChange={handlePasswordChange}
                                    error={passwordErrors.current_password}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label={t.newPwd}
                                    name="new_password"
                                    type="password"
                                    value={passwords.new_password}
                                    onChange={handlePasswordChange}
                                    error={passwordErrors.new_password}
                                    placeholder="••••••••"
                                    required
                                />
                                <Input
                                    label={t.confirmPwd}
                                    name="confirm_password"
                                    type="password"
                                    value={passwords.confirm_password}
                                    onChange={handlePasswordChange}
                                    error={passwordErrors.confirm_password}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            {/* Password strength checker bar */}
                            {passwords.new_password && (
                                <div className="space-y-1.5 max-w-sm pt-1">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-500">{t.pwdStrength}:</span>
                                        <span className={`font-bold ${passwordStrength.label === 'Strong' ? 'text-emerald-600' :
                                            passwordStrength.label === 'Medium' ? 'text-yellow-650 text-amber-500' :
                                                'text-red-500'
                                            }`}>
                                            {passwordStrength.label === 'Strong' ? t.strengthStrong :
                                                passwordStrength.label === 'Medium' ? t.strengthMedium :
                                                    t.strengthWeak}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex gap-0.5">
                                        <div className={`h-full ${passwordStrength.color} flex-1`}></div>
                                        <div className={`h-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200'} flex-1`}></div>
                                        <div className={`h-full ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-slate-200'} flex-1`}></div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                                        Password requires at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol.
                                    </p>
                                </div>
                            )}

                            <div className="pt-2 flex justify-end">
                                <Button
                                    type="submit"
                                    isLoading={isSavingPassword}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                >
                                    {t.updatePwdBtn}
                                </Button>
                            </div>
                        </form>
                    </Card>

                </div>

            </div>

        </div>
    )
}

export default AdminProfile
