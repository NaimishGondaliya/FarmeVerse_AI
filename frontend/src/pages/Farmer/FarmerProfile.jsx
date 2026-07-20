import React, { useState, useEffect, useRef } from 'react'
import {
    FiUser, FiMail, FiPhone, FiMapPin, FiCalendar,
    FiGlobe, FiEdit3, FiSave, FiXCircle, FiCamera
} from 'react-icons/fi'
import { profileAPI } from '../../services/api'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import Input from '../../components/common/Input'
import Toast from '../../components/common/Toast'
import { useLanguage } from '../../context/LanguageContext'

export const FarmerProfile = () => {
    const { language, changeLanguage } = useLanguage()
    const lang = language === 'en' ? 'ENG' : 'GUJ'
    const fileInputRef = useRef(null)

    const [userProfile, setUserProfile] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [toast, setToast] = useState(null)
    const [isSavingProfile, setIsSavingProfile] = useState(false)

    // Form inputs state
    const [editForm, setEditForm] = useState({
        full_name: '',
        email: '',
        mobile: '',
        village: '',
        taluka: '',
        district: '',
        state: 'Gujarat',
        pincode: '',
        preferred_language: 'en',
        photo: ''
    })

    const triggerToast = (message, type = 'error') => {
        setToast({ message, type })
    }

    const t = {
        ENG: {
            title: "Farmer Profile Dashboard",
            subtitle: "Manage your personal details, address context, and regional language preferences.",
            editProfile: "Edit Profile",
            cancelEdit: "Cancel",
            saveProfile: "Save Changes",
            fullName: "Full Name",
            email: "Email Address",
            mobile: "Mobile Number",
            village: "Village",
            taluka: "Taluka",
            district: "District",
            state: "State",
            pincode: "Pincode",
            preferredLanguage: "Preferred Language",
            accountCreated: "Account Created Date",
            personalInfo: "Personal Information",
            addressDetails: "Address Details",
            selectLanguage: "Select Language",
            english: "English (અંગ્રેજી)",
            gujarati: "Gujarati (ગુજરાતી)",
            loading: "Loading profile...",
            loadError: "Failed to load profile. Please try again.",
            successMsg: "Profile updated successfully!",
            photoUpload: "Upload Profile Photo",
            photoUploadHint: "Select an image file (Max 2MB)",
            requiredField: "All fields are required.",
            invalidMobile: "Mobile number must be exactly 10 digits.",
            invalidPincode: "Pincode must be exactly 6 digits.",
            saveInProgress: "Saving changes...",
            registrationDate: "Registered On",
            verificationStatus: "Verification Status",
            verifiedText: "Verified Farmer Account",
            activeStatus: "Active",
            verifiedBadge: "Approved",
            unverifiedBadge: "Pending Verification",
            districtPlaceholder: "e.g. Anand",
            talukaPlaceholder: "e.g. Petlad",
            villagePlaceholder: "e.g. Dharmaj",
            pincodePlaceholder: "e.g. 388430"
        },
        GUJ: {
            title: "ખેડૂત પ્રોફાઇલ ડેશબોર્ડ",
            subtitle: "તમારી વ્યક્તિગત વિગતો, સરનામું અને પ્રાદેશિક ભાષા પસંદગીઓનું વ્યવસ્થાપન કરો.",
            editProfile: "પ્રોફાઇલ સંપાદિત કરો",
            cancelEdit: "રદ કરો",
            saveProfile: "ફેરફારો સાચવો",
            fullName: "સાચું નામ (પૂરું નામ)",
            email: "ઇમેઇલ સરનામું",
            mobile: "મોબાઇલ નંબર",
            village: "ગામ",
            taluka: "તાલુકો",
            district: "જિલ્લો",
            state: "રાજ્ય",
            pincode: "પિનકોડ",
            preferredLanguage: "પસંદગીની ભાષા",
            accountCreated: "ખાતું બનાવ્યાની તારીખ",
            personalInfo: "વ્યક્તિગત માહિતી",
            addressDetails: "સરનામાની વિગતો",
            selectLanguage: "ભાષા પસંદ કરો",
            english: "English (અંગ્રેજી)",
            gujarati: "Gujarati (ગુજરાતી)",
            loading: "પ્રોફાઇલ લોડ થઈ રહી છે...",
            loadError: "પ્રોફાઇલ લોડ કરવામાં નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો.",
            successMsg: "પ્રોફાઇલ સફળતાપૂર્વક અપડેટ થઈ ગઈ છે!",
            photoUpload: "પ્રોફાઇલ ફોટો અપલોડ કરો",
            photoUploadHint: "છબી ફાઇલ પસંદ કરો (મહત્તમ ૨ એમબી)",
            requiredField: "બધા ફીલ્ડ્સ ભરવા ફરજિયાત છે.",
            invalidMobile: "મોબાઇલ નંબર બરાબર ૧૦ અંકનો હોવો જોઈએ.",
            invalidPincode: "પિનકોડ બરાબર ૬ અંકનો હોવો જોઈએ.",
            saveInProgress: "ફેરફારો સાચવી રહ્યા છીએ...",
            registrationDate: "નોંધણી તારીખ",
            verificationStatus: "ચકાસણી સ્થિતિ",
            verifiedText: "ચકાસાયેલ ખેડૂત ખાતું",
            activeStatus: "સક્રિય",
            verifiedBadge: "મંજૂર",
            unverifiedBadge: "ચકાસણી બાકી",
            districtPlaceholder: "દા.ત. આણંદ",
            talukaPlaceholder: "દા.ત. પેટલાદ",
            villagePlaceholder: "દા.ત. ધર્મજ",
            pincodePlaceholder: "દા.ત. ૩૮૮૪૩૦"
        }
    }[lang]

    const fetchUserProfile = async () => {
        setIsLoading(true)
        setIsError(false)
        try {
            const res = await profileAPI.get()
            const backendUser = res.data || res

            // Load extra fields from local storage unique to this user UUID
            const storageKey = `farmer_profile_${backendUser.uuid}`
            const storedDataRaw = localStorage.getItem(storageKey)
            let storedData = {}
            if (storedDataRaw) {
                try {
                    storedData = JSON.parse(storedDataRaw)
                } catch (e) {
                    console.error("Local storage parse error", e)
                }
            }

            const mergedProfile = {
                uuid: backendUser.uuid,
                full_name: storedData.full_name || backendUser.full_name || '',
                email: storedData.email || backendUser.email || '',
                mobile: storedData.mobile || backendUser.mobile || '',
                created_at: backendUser.created_at || new Date().toISOString(),
                is_verified: backendUser.is_verified || false,
                role: backendUser.role || 'Farmer',
                village: storedData.village || '',
                taluka: storedData.taluka || '',
                district: storedData.district || '',
                state: storedData.state || 'Gujarat',
                pincode: storedData.pincode || '',
                preferred_language: storedData.preferred_language || language || 'en',
                photo: storedData.photo || ''
            }

            setUserProfile(mergedProfile)
            setEditForm({
                full_name: mergedProfile.full_name,
                email: mergedProfile.email,
                mobile: mergedProfile.mobile,
                village: mergedProfile.village,
                taluka: mergedProfile.taluka,
                district: mergedProfile.district,
                state: mergedProfile.state,
                pincode: mergedProfile.pincode,
                preferred_language: mergedProfile.preferred_language,
                photo: mergedProfile.photo
            })
        } catch (err) {
            console.error("Profile view fetch error:", err)
            setIsError(true)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUserProfile()
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setEditForm(prev => ({ ...prev, [name]: value }))
    }

    // Handles Base64 translation photo preview
    const handlePhotoChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                triggerToast(t.photoUploadHint)
                return
            }
            const reader = new FileReader()
            reader.onloadend = () => {
                setEditForm(prev => ({ ...prev, photo: reader.result }))
            }
            reader.readAsDataURL(file)
        }
    }

    const cancelEditing = () => {
        setIsEditing(false)
        if (userProfile) {
            setEditForm({
                full_name: userProfile.full_name,
                email: userProfile.email,
                mobile: userProfile.mobile,
                village: userProfile.village,
                taluka: userProfile.taluka,
                district: userProfile.district,
                state: userProfile.state,
                pincode: userProfile.pincode,
                preferred_language: userProfile.preferred_language,
                photo: userProfile.photo
            })
        }
    }

    const handleProfileSave = async (e) => {
        e.preventDefault()

        // Validation Checks
        if (!editForm.full_name.trim() || !editForm.email.trim() || !editForm.village.trim() ||
            !editForm.taluka.trim() || !editForm.district.trim() || !editForm.state.trim() ||
            !editForm.pincode.trim() || !editForm.mobile.trim()) {
            triggerToast(t.requiredField)
            return
        }

        if (!/^\d{10}$/.test(editForm.mobile)) {
            triggerToast(t.invalidMobile)
            return
        }

        if (!/^\d{6}$/.test(editForm.pincode)) {
            triggerToast(t.invalidPincode)
            return
        }

        setIsSavingProfile(true)
        try {
            // Update backend details (name and email)
            const updatePayload = {
                full_name: editForm.full_name,
                email: editForm.email
            }
            await profileAPI.update(updatePayload)

            // Save all fields to localStorage
            const customData = {
                full_name: editForm.full_name,
                email: editForm.email,
                mobile: editForm.mobile,
                village: editForm.village,
                taluka: editForm.taluka,
                district: editForm.district,
                state: editForm.state,
                pincode: editForm.pincode,
                preferred_language: editForm.preferred_language,
                photo: editForm.photo
            }
            localStorage.setItem(`farmer_profile_${userProfile.uuid}`, JSON.stringify(customData))

            // Update standard user key in localStorage for sidebar/headers to keep sync
            const storedUserRaw = localStorage.getItem('user')
            if (storedUserRaw) {
                try {
                    const parsed = JSON.parse(storedUserRaw)
                    localStorage.setItem('user', JSON.stringify({
                        ...parsed,
                        full_name: editForm.full_name,
                        mobile: editForm.mobile,
                        email: editForm.email
                    }))
                } catch (e) {
                    console.error("Local user key parse error", e)
                }
            }

            // Apply selected preferred language directly to context
            if (editForm.preferred_language !== language) {
                changeLanguage(editForm.preferred_language)
            }

            setUserProfile(prev => ({
                ...prev,
                ...customData
            }))
            setIsEditing(false)
            triggerToast(t.successMsg, 'success')
        } catch (err) {
            console.error(err)
            const errMsg = err.response?.data?.errors?.detail || err.response?.data?.message || t.loadError
            triggerToast(errMsg, 'error')
        } finally {
            setIsSavingProfile(false)
        }
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
            <div className="p-6 bg-white rounded-card shadow-sm text-center mt-12 max-w-xl mx-auto border">
                <FiUser size={40} className="text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-dark">{t.loadError}</h3>
                <Button onClick={fetchUserProfile} className="mt-4 bg-emerald-600 text-white font-bold">{lang === 'GUJ' ? 'ફરી પ્રયાસ કરો' : 'Retry'}</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fadeIn pb-12 max-w-5xl mx-auto">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Title Header Card */}
            <div className="flex justify-between items-center bg-white p-4 rounded-card border shadow-xs">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <FiUser className="text-emerald-600" /> {t.title}
                    </h1>
                    <p className="text-xs text-dark-light font-medium">{t.subtitle}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Card - Identity Profile & Meta Info */}
                <Card className="lg:col-span-1 p-6 space-y-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="relative group">
                            <div className="w-28 h-28 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center font-extrabold text-4xl mb-4 border border-emerald-100 overflow-hidden shadow-inner select-none">
                                {editForm.photo ? (
                                    <img
                                        src={editForm.photo}
                                        alt={userProfile.full_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{userProfile.full_name ? userProfile.full_name.slice(0, 1).toUpperCase() : 'F'}</span>
                                )}
                            </div>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-4 right-0 p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition shadow-md"
                                    title={t.photoUpload}
                                >
                                    <FiCamera size={16} />
                                </button>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePhotoChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        <h2 className="text-lg font-bold text-slate-800 leading-tight">{userProfile.full_name}</h2>
                        <span className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{userProfile.role}</span>

                        {isEditing && (
                            <p className="text-[10px] text-slate-400 font-semibold mt-1">{t.photoUploadHint}</p>
                        )}
                    </div>

                    <div className="border-t border-slate-100 pt-6 space-y-4">
                        <h3 className="text-xs font-bold text-dark-light uppercase tracking-wider">{t.verificationStatus}</h3>
                        <div className="flex items-start gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 text-xs">
                            <span className="flex h-2.5 w-2.5 translate-y-1.5 rounded-full bg-emerald-500"></span>
                            <div>
                                <p className="font-bold text-emerald-800">{t.verifiedText}</p>
                                <p className="text-dark-light/80 mt-0.5">{lang === 'GUJ' ? 'ખાતું વણાયેલું અને સક્રિય છે' : 'Account linked & active'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-dark-light">
                            <FiCalendar size={15} />
                            <span>{t.registerDate}: <strong>{userProfile.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}</strong></span>
                        </div>
                    </div>
                </Card>

                {/* Right Column - Detail Card */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 space-y-5">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                <FiUser className="text-emerald-600" /> {t.personalInfo}
                            </h3>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100 text-xs font-bold transition"
                                >
                                    <FiEdit3 size={13} /> {t.editProfile}
                                </button>
                            ) : (
                                <button
                                    onClick={cancelEditing}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 text-xs font-bold transition"
                                >
                                    <FiXCircle size={13} /> {t.cancelEdit}
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleProfileSave} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label={t.fullName}
                                        name="full_name"
                                        value={editForm.full_name}
                                        onChange={handleInputChange}
                                        required
                                        className="mb-0"
                                    />
                                    <Input
                                        label={t.email}
                                        name="email"
                                        type="email"
                                        value={editForm.email}
                                        onChange={handleInputChange}
                                        required
                                        className="mb-0"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label={t.mobile}
                                        name="mobile"
                                        value={editForm.mobile}
                                        onChange={handleInputChange}
                                        required
                                        maxLength={10}
                                        className="mb-0"
                                    />
                                    <div className="flex flex-col mb-4 font-sans">
                                        <label className="text-xs md:text-sm font-semibold text-dark/85 mb-1.5 flex items-center gap-1">
                                            {t.preferredLanguage} <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <select
                                            name="preferred_language"
                                            value={editForm.preferred_language}
                                            onChange={handleInputChange}
                                            className="w-full h-[48px] bg-white rounded-btn border border-dark/15 px-3 select-none text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200"
                                        >
                                            <option value="en">{t.english}</option>
                                            <option value="gu">{t.gujarati}</option>
                                        </select>
                                    </div>
                                </div>

                                <h3 className="font-bold text-slate-800 text-sm border-t border-slate-100 pt-4 flex items-center gap-2">
                                    <FiMapPin className="text-emerald-600" /> {t.addressDetails}
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label={t.village}
                                        name="village"
                                        value={editForm.village}
                                        onChange={handleInputChange}
                                        placeholder={t.villagePlaceholder}
                                        required
                                        className="mb-0"
                                    />
                                    <Input
                                        label={t.taluka}
                                        name="taluka"
                                        value={editForm.taluka}
                                        onChange={handleInputChange}
                                        placeholder={t.talukaPlaceholder}
                                        required
                                        className="mb-0"
                                    />
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <div className="col-span-1">
                                        <Input
                                            label={t.district}
                                            name="district"
                                            value={editForm.district}
                                            onChange={handleInputChange}
                                            placeholder={t.districtPlaceholder}
                                            required
                                            className="mb-0"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <Input
                                            label={t.state}
                                            name="state"
                                            value={editForm.state}
                                            onChange={handleInputChange}
                                            required
                                            className="mb-0"
                                        />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <Input
                                            label={t.pincode}
                                            name="pincode"
                                            value={editForm.pincode}
                                            onChange={handleInputChange}
                                            placeholder={t.pincodePlaceholder}
                                            required
                                            maxLength={6}
                                            className="mb-0"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        isLoading={isSavingProfile}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold inline-flex items-center gap-1.5"
                                    >
                                        <FiSave size={15} /> {t.saveProfile}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                {/* Personal metadata grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{t.fullName}</p>
                                        <p className="text-slate-700 font-semibold">{userProfile.full_name || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{t.email}</p>
                                        <p className="text-slate-700 font-semibold">{userProfile.email || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{t.mobile}</p>
                                        <p className="text-slate-700 font-semibold">{userProfile.mobile || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{t.preferredLanguage}</p>
                                        <p className="text-slate-700 font-semibold select-none">
                                            {userProfile.preferred_language === 'gu' ? t.gujarati : t.english}
                                        </p>
                                    </div>
                                </div>

                                {/* Address metadata grid */}
                                <div className="border-t border-slate-100 pt-4 space-y-4">
                                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                        <FiMapPin className="text-emerald-600" /> {t.addressDetails}
                                    </h4>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{t.village}</p>
                                            <p className="text-slate-700 font-semibold">{userProfile.village || <span className="italic text-slate-400">Not set</span>}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{t.taluka}</p>
                                            <p className="text-slate-700 font-semibold">{userProfile.taluka || <span className="italic text-slate-400">Not set</span>}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{t.district}</p>
                                            <p className="text-slate-700 font-semibold">{userProfile.district || <span className="italic text-slate-400">Not set</span>}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{t.state}</p>
                                            <p className="text-slate-700 font-semibold">{userProfile.state || 'Gujarat'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{t.pincode}</p>
                                            <p className="text-slate-700 font-semibold">{userProfile.pincode || <span className="italic text-slate-400">Not set</span>}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default FarmerProfile
