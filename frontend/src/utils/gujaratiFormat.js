/**
 * gujaratiFormat.js
 * 
 * Reusable helpers for converting numbers, dates, times and currency
 * into Gujarati digit format when the app language is Gujarati ('gu').
 * 
 * All functions are safe for English — when lang !== 'gu' the value is
 * returned in the standard English format.
 */

const GU_DIGITS = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯']

/**
 * Convert a number/string of digits to Gujarati digits.
 * e.g. 29 → "૨૯"
 * @param {number|string} value
 * @returns {string}
 */
export const toGujaratiDigits = (value) => {
    return String(value).replace(/[0-9]/g, (d) => GU_DIGITS[+d])
}

/**
 * Format a number for display.
 * In Gujarati mode: converts digits to Gujarati script.
 * In English mode: returns the value as-is.
 * @param {number|string} value
 * @param {string} lang - 'en' or 'gu'
 * @param {number} [decimals=0] - decimal places
 * @returns {string}
 */
export const formatGujaratiNumber = (value, lang, decimals = 0) => {
    const num = parseFloat(value)
    if (isNaN(num)) return lang === 'gu' ? '—' : String(value)
    const formatted = decimals > 0 ? num.toFixed(decimals) : String(Math.round(num))
    return lang === 'gu' ? toGujaratiDigits(formatted) : formatted
}

/**
 * Format a date string for display.
 * English:  localeDateString (e.g. 07/29/2026)
 * Gujarati: DD/MM/YYYY with Gujarati digits (e.g. ૨૯/૦૭/૨૦૨૬)
 * @param {string|Date} dateValue
 * @param {string} lang - 'en' or 'gu'
 * @returns {string}
 */
export const formatGujaratiDate = (dateValue, lang) => {
    if (!dateValue) return lang === 'gu' ? '—' : 'N/A'
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return lang === 'gu' ? '—' : 'N/A'

    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = String(d.getFullYear())

    const formatted = `${day}/${month}/${year}`
    return lang === 'gu' ? toGujaratiDigits(formatted) : formatted
}

/**
 * Format a date + time string for display.
 * English:  localeString (system default)
 * Gujarati: DD/MM/YYYY HH:MM with Gujarati digits and AM/PM in Gujarati
 * @param {string|Date} dateValue
 * @param {string} lang - 'en' or 'gu'
 * @returns {string}
 */
export const formatGujaratiDateTime = (dateValue, lang) => {
    if (!dateValue) return lang === 'gu' ? '—' : 'N/A'
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return lang === 'gu' ? '—' : 'N/A'

    if (lang !== 'gu') {
        return d.toLocaleString('en-US', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = String(d.getFullYear())
    const hours = d.getHours()
    const mins = String(d.getMinutes()).padStart(2, '0')
    const hour12 = hours % 12 || 12
    const ampm = hours < 12 ? 'પૂ.મ.' : 'અ.મ.'
    const timeStr = `${String(hour12).padStart(2, '0')}:${mins} ${ampm}`

    return toGujaratiDigits(`${day}/${month}/${year} `) + timeStr
}

/**
 * Format a time string (HH:MM, from <input type="time">) for display.
 * English:  "09:30 AM"
 * Gujarati: "૦૯:૩૦ પૂ.મ."
 * @param {string} timeStr - "HH:MM"
 * @param {string} lang - 'en' or 'gu'
 * @returns {string}
 */
export const formatGujaratiTime = (timeStr, lang) => {
    if (!timeStr) return ''
    const [h, m] = timeStr.split(':').map(Number)
    if (isNaN(h) || isNaN(m)) return timeStr

    const hour12 = h % 12 || 12
    const mins = String(m).padStart(2, '0')

    if (lang !== 'gu') {
        const ampm = h < 12 ? 'AM' : 'PM'
        return `${String(hour12).padStart(2, '0')}:${mins} ${ampm}`
    }

    const ampm = h < 12 ? 'પૂ.મ.' : 'અ.મ.'
    return toGujaratiDigits(`${String(hour12).padStart(2, '0')}:${mins}`) + ` ${ampm}`
}

/**
 * Format a currency value (₹).
 * English:  ₹1,234
 * Gujarati: ₹૧,૨૩૪
 * @param {number|string} amount
 * @param {string} lang - 'en' or 'gu'
 * @returns {string}
 */
export const formatGujaratiCurrency = (amount, lang) => {
    const num = parseFloat(amount)
    if (isNaN(num)) return ''
    const formatted = num.toLocaleString('en-IN')
    return lang === 'gu' ? `₹${toGujaratiDigits(formatted)}` : `₹${formatted}`
}
