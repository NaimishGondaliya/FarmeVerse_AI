import React, { useState, useEffect } from 'react'
import {
    FiUser, FiLock, FiAward, FiBookOpen, FiMail, FiPhone,
    FiMapPin, FiCheckCircle, FiClock, FiCalendar, FiEdit3,
    FiSave, FiXCircle
} from 'react-icons/fi'
import { expertAPI } from '../../services/api'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import Input from '../../components/common/Input'
import { useLanguage } from '../../context/LanguageContext'
import { useTranslation } from '../../hooks/useTranslation'
import { formatGujaratiDate, formatGujaratiNumber, toGujaratiDigits } from '../../utils/gujaratiFormat'

export const ExpertProfile = () => {
    const [profile, setProfile] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)
    const { language } = useLanguage()
    const { t: tRaw } = useTranslation()
    const lang = language === 'en' ? 'en' : 'gu'
    const te = (key) => tRaw(`expert.${key}`)

    // Editable profile state
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState({
        bio: '',
        qualification: '',
        experience: '',
        phone: '',
        photo: ''
    })
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [profileMsg, setProfileMsg] = useState({ type: '', text: '' })

    // Password Update state
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' })
    const [isSubmittingPwd, setIsSubmittingPwd] = useState(false)

    const fetchProfile = async () => {
        setIsLoading(true)
        setIsError(false)
        try {
            const res = await expertAPI.getDashboard()
            setProfile(res.profile)
            setEditForm({
                bio: res.profile.bio || '',
                qualification: res.profile.qualification || '',
                experience: res.profile.experience || '',
                phone: res.profile.phone || '',
                photo: res.profile.photo || ''
            })
        } catch (err) {
            console.error("Profile load error", err)
            setIsError(true)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    // ── Profile Edit Handlers ──
    const handleEditChange = (e) => {
        const { name, value } = e.target
        setEditForm(prev => ({ ...prev, [name]: value }))
    }

    const triggerProfileMsg = (type, text) => {
        setProfileMsg({ type, text })
        setTimeout(() => setProfileMsg({ type: '', text: '' }), 5000)
    }

    const handleProfileSave = async (e) => {
        e.preventDefault()
        if (!profile) return

        // Basic validations
        if (!editForm.qualification.trim()) {
            triggerProfileMsg('error', lang === 'gu' ? 'લાયકાત ફરજિયાત છે.' : 'Qualification is required.')
            return
        }
        const expNum = Number(editForm.experience)
        if (isNaN(expNum) || expNum < 0 || expNum > 80) {
            triggerProfileMsg('error', lang === 'gu' ? 'અનુભવ 0-80 વર્ષની વચ્ચે હોવો જરૂરી છે.' : 'Experience must be between 0 and 80 years.')
            return
        }
        if (editForm.phone && !/^\d{10}$/.test(editForm.phone)) {
            triggerProfileMsg('error', lang === 'gu' ? 'મોબાઈલ નંબર ૧૦ અંકનો હોવો જોઈએ.' : 'Phone must be exactly 10 digits.')
            return
        }

        setIsSavingProfile(true)
        setProfileMsg({ type: '', text: '' })

        try {
            const payload = {
                bio: editForm.bio,
                qualification: editForm.qualification,
                experience: parseInt(editForm.experience, 10),
                phone: editForm.phone,
                photo: editForm.photo
            }

            const updated = await expertAPI.update(profile.id, payload)
            setProfile(updated)
            setIsEditing(false)
            triggerProfileMsg('success', lang === 'gu' ? 'પ્રોફાઇલ સફળતાપૂર્વક અપડેટ થયું!' : 'Profile updated successfully!')
        } catch (err) {
            console.error(err)
            const errorMsg = err.response?.data?.error || err.response?.data?.message || (lang === 'gu' ? 'અપડેટ કરવામાં નિષ્ફળ.' : 'Failed to update profile.')
            triggerProfileMsg('error', errorMsg)
        } finally {
            setIsSavingProfile(false)
        }
    }

    const cancelEditing = () => {
        setIsEditing(false)
        setEditForm({
            bio: profile?.bio || '',
            qualification: profile?.qualification || '',
            experience: profile?.experience || '',
            phone: profile?.phone || '',
            photo: profile?.photo || ''
        })
        setProfileMsg({ type: '', text: '' })
    }

    // ── Password Handlers ──
    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswords(prev => ({ ...prev, [name]: value }))
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        setPwdMsg({ type: '', text: '' })

        if (passwords.newPassword !== passwords.confirmPassword) {
            setPwdMsg({ type: 'error', text: lang === 'gu' ? 'નવો પાસવર્ડ મેળ ખાતો નથી.' : 'New passwords do not match.' })
            return
        }
        if (passwords.newPassword.length < 6) {
            setPwdMsg({
                type: 'error',
                text: lang === 'gu' ? 'પાસવર્ડ ઓછામાં ઓછો ૬ અક્ષરનો હોવો જોઈએ.' : 'Password must be at least 6 characters.'
            })
            return
        }

        setIsSubmittingPwd(true)
        try {
            await expertAPI.update(profile.id, { password: passwords.newPassword })
            setPwdMsg({
                type: 'success',
                text: lang === 'gu' ? 'પાસવર્ડ સફળતાપૂર્વક અપડેટ થયો!' : 'Password updated successfully!'
            })
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (err) {
            console.error(err)
            const errorMsg = err.response?.data?.error || err.response?.data?.message || (lang === 'gu' ? 'પાસવર્ડ અપડેટ કરવામાં નિષ્ફળ.' : 'Failed to update password.')
            setPwdMsg({ type: 'error', text: errorMsg })
        } finally {
            setIsSubmittingPwd(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                <p className="mt-4 text-dark-light text-sm font-semibold">{te('loadingProfile')}</p>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="p-6 bg-white rounded-card shadow-sm text-center mt-12 max-w-xl mx-auto border">
                <FiLock size={40} className="text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-dark">{te('errorProfile')}</h3>
                <Button onClick={fetchProfile} className="mt-4 bg-emerald-600">{te('retry')}</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fadeIn pb-12 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-card border shadow-xs">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <FiUser className="text-emerald-600" /> {te('profileTitle')}
                    </h1>
                    <p className="text-xs text-dark-light font-medium">{te('profileSubtitle')}</p>
                </div>
            </div>

            {/* Alert */}
            {profileMsg.text && (
                <div className={`p-4 rounded-card border leading-relaxed text-sm font-medium ${profileMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                    {profileMsg.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Card: Verified identity & Meta */}
                <Card className="lg:col-span-1 p-6 space-y-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center font-extrabold text-3xl mb-4 border border-emerald-100 overflow-hidden shadow-inner">
                            {profile.photo ? (
                                <img
                                    src={profile.photo}
                                    alt={profile.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '';
                                    }}
                                />
                            ) : (
                                <span>{profile.name ? profile.name.slice(0, 1).toUpperCase() : 'E'}</span>
                            )}
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 leading-tight">{profile.name}</h2>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full mt-2">
                            {profile.specialization}
                        </span>
                    </div>

                    <div className="border-t border-slate-100 pt-6 space-y-4">
                        <h3 className="text-xs font-bold text-dark-light uppercase tracking-wider">{te('certInfo')}</h3>
                        <div className="flex items-start gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 text-xs">
                            <FiCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
                            <div>
                                <p className="font-bold text-emerald-800">{te('verifiedText')}</p>
                                <p className="text-dark-light/80 mt-0.5">{te('deptApproved')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-dark-light">
                            <FiCalendar size={15} />
                            <span>{te('registerDate')}: <strong>{formatGujaratiDate(profile.created_date, lang)}</strong></span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-dark-light">
                            <FiAward size={15} />
                            <span>
                                {te('totalConsultsMgd')}: <strong>
                                    {lang === 'gu'
                                        ? toGujaratiDigits(profile.total_consultations || 0)
                                        : (profile.total_consultations || 0)
                                    } {te('cases')}
                                </strong>
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Editable Profile Details */}
                    <Card className="p-6 space-y-5">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                <FiBookOpen className="text-emerald-600" /> {te('profileInfo')}
                            </h3>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100 text-xs font-bold transition"
                                >
                                    <FiEdit3 size={13} /> {te('editProfile')}
                                </button>
                            ) : (
                                <button
                                    onClick={cancelEditing}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 text-xs font-bold transition"
                                >
                                    <FiXCircle size={13} /> {te('cancelEdit')}
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleProfileSave} className="space-y-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500">{te('bioLabel')}</label>
                                    <textarea
                                        name="bio"
                                        value={editForm.bio}
                                        onChange={handleEditChange}
                                        rows={3}
                                        className="w-full bg-slate-50 text-dark px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-emerald-500 transition resize-none placeholder:text-slate-400"
                                        placeholder={lang === 'gu' ? 'તમારો પ્રોફેશનલ પરિચય લખો...' : 'Write your professional biography...'}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-500">{te('qualLabel')}</label>
                                        <input
                                            name="qualification"
                                            value={editForm.qualification}
                                            onChange={handleEditChange}
                                            className="w-full bg-slate-50 text-dark px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-emerald-500 transition placeholder:text-slate-400"
                                            placeholder="M.Sc Agriculture"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-500">{te('expLabel')}</label>
                                        <input
                                            name="experience"
                                            type="number"
                                            min="0"
                                            max="80"
                                            value={editForm.experience}
                                            onChange={handleEditChange}
                                            className="w-full bg-slate-50 text-dark px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-emerald-500 transition placeholder:text-slate-400"
                                            placeholder="10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-500">{te('phoneLabel')}</label>
                                        <input
                                            name="phone"
                                            value={editForm.phone}
                                            onChange={handleEditChange}
                                            className="w-full bg-slate-50 text-dark px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-emerald-500 transition placeholder:text-slate-400"
                                            placeholder="9876543210"
                                            maxLength={10}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-500">{te('photoLabel')}</label>
                                        <input
                                            name="photo"
                                            value={editForm.photo}
                                            onChange={handleEditChange}
                                            className="w-full bg-slate-50 text-dark px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-emerald-500 transition placeholder:text-slate-400"
                                            placeholder="https://example.com/photo.jpg"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        isLoading={isSavingProfile}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold inline-flex items-center gap-1.5"
                                    >
                                        <FiSave size={15} /> {te('saveProfile')}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4 text-sm">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{te('bioLabel')}</p>
                                    <p className="text-slate-700 font-medium leading-relaxed">
                                        {profile.bio || <span className="italic text-slate-400">{te('notSet')}</span>}
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{te('qualLabel')}</p>
                                        <p className="text-slate-700 font-semibold">{profile.qualification || te('notSet')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{te('expLabel')}</p>
                                        <p className="text-slate-700 font-semibold">
                                            {lang === 'gu' ? toGujaratiDigits(profile.experience) : profile.experience} {te('years')}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{te('phoneLabel')}</p>
                                        <p className="text-slate-700 font-semibold">{profile.phone || te('notSet')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{te('photoLabel')}</p>
                                        <p className="text-slate-700 font-semibold truncate max-w-[200px]">{profile.photo || te('notSet')}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Password Card */}
                    <Card className="p-6 space-y-6">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-1">
                                <FiLock className="text-emerald-600" />
                                {te('securityTitle')}
                            </h3>
                            <p className="text-xs text-dark-light">{te('securityDesc')}</p>
                        </div>

                        {pwdMsg.text && (
                            <div className={`p-4 rounded-card border leading-relaxed text-sm font-medium ${pwdMsg.type === 'success'
                                ? 'bg-emerald-50 border-emerald-250 text-emerald-800'
                                : 'bg-red-50 border-red-200 text-red-700'
                                }`}>
                                {pwdMsg.text}
                            </div>
                        )}

                        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                            <Input
                                label={te('currPwd')}
                                name="currentPassword"
                                type="password"
                                value={passwords.currentPassword}
                                onChange={handlePasswordChange}
                                placeholder="••••••••"
                                required
                            />
                            <Input
                                label={te('newPwd')}
                                name="newPassword"
                                type="password"
                                value={passwords.newPassword}
                                onChange={handlePasswordChange}
                                placeholder="••••••••"
                                required
                            />
                            <Input
                                label={te('confPwd')}
                                name="confirmPassword"
                                type="password"
                                value={passwords.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder="••••••••"
                                required
                            />

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    isLoading={isSubmittingPwd}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                >
                                    {te('updatePwdBtn')}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default ExpertProfile
