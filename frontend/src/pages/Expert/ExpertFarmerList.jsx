import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiUser, FiChevronRight, FiUsers } from 'react-icons/fi'
import { consultationAPI } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'
import { useTranslation } from '../../hooks/useTranslation'
import { Card } from '../../components/common/Card'
import { formatGujaratiDate, toGujaratiDigits } from '../../utils/gujaratiFormat'

export const ExpertFarmerList = () => {
    const [consultations, setConsultations] = useState([])
    const [search, setSearch] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const { language } = useLanguage()
    const { t } = useTranslation()
    const lang = language === 'en' ? 'en' : 'gu'

    const te = (key) => t(`expert.${key}`)

    useEffect(() => {
        const loadFarmerList = async () => {
            try {
                const data = await consultationAPI.getExpertList()
                setConsultations(data)
            } catch (err) {
                console.error('Farmer list load error', err)
            } finally {
                setIsLoading(false)
            }
        }
        loadFarmerList()
    }, [])

    // Group consultations by farmer name
    const farmerMap = {}
    consultations.forEach((c) => {
        const key = c.farmer_name
        if (!farmerMap[key]) {
            farmerMap[key] = {
                name: c.farmer_name,
                latestSubject: c.subject,
                latestDate: c.created_date,
                totalQueries: 0,
                latestId: c.id
            }
        }
        farmerMap[key].totalQueries++
        if (new Date(c.created_date) > new Date(farmerMap[key].latestDate)) {
            farmerMap[key].latestDate = c.created_date
            farmerMap[key].latestSubject = c.subject
            farmerMap[key].latestId = c.id
        }
    })
    const farmers = Object.values(farmerMap)

    const filtered = farmers.filter(
        (f) =>
            f.name.toLowerCase().includes(search.toLowerCase()) ||
            f.latestSubject.toLowerCase().includes(search.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                <p className="mt-4 text-dark-light text-sm font-semibold">{te('loading')}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fadeIn pb-12 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-card border shadow-xs">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <FiUsers className="text-emerald-600" /> {te('farmerListTitle')}
                    </h1>
                    <p className="text-xs text-dark-light font-medium">{te('farmerListSubtitle')}</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-light" size={15} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={te('searchFarmer')}
                        className="w-full pl-11 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-dark outline-none focus:border-emerald-500 transition placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Farmer Cards Grid */}
            {filtered.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-dark-light bg-white rounded-card border shadow-xs">
                    <FiUsers size={38} className="mb-4 text-dark-light/50" />
                    <h4 className="font-bold text-dark/75">{te('noFarmers')}</h4>
                    <p className="text-xs mt-1">{te('noFarmersDesc')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map((farmer) => (
                        <Card key={farmer.name} className="p-5 flex flex-col gap-4 hover:shadow-md transition-all duration-300 border hover:border-emerald-200">
                            {/* Farmer Header */}
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center font-extrabold text-lg border border-emerald-100 flex-shrink-0">
                                    {farmer.name.slice(0, 1).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="font-black text-slate-800 text-sm leading-tight truncate">{farmer.name}</h3>
                                    <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">
                                        {lang === 'gu' ? toGujaratiDigits(farmer.totalQueries) : farmer.totalQueries} {te('totalQueries')}
                                    </span>
                                </div>
                            </div>

                            {/* Latest Subject */}
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-dark-light uppercase tracking-wider">{te('latestTopic')}</p>
                                <p className="text-xs font-semibold text-slate-700 leading-snug line-clamp-2">{farmer.latestSubject}</p>
                            </div>

                            {/* Last Contact Date */}
                            <div className="text-[10px] text-dark-light font-semibold flex items-center gap-1.5">
                                <span className="text-emerald-500">●</span>
                                {te('lastContact')}: <strong>{formatGujaratiDate(farmer.latestDate, lang)}</strong>
                            </div>

                            {/* Action */}
                            <Link
                                to={`/expert/consultation/${farmer.latestId}`}
                                className="mt-auto w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100 py-2.5 rounded-xl text-xs font-extrabold transition"
                            >
                                {te('viewChat')} <FiChevronRight size={13} />
                            </Link>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ExpertFarmerList
