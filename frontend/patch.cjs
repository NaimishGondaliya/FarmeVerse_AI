const fs = require('fs');

let code = fs.readFileSync('src/pages/Farmer/GovernmentSchemes.jsx', 'utf8');

const importsToAdd = `import { SCHEME_TRANSLATIONS } from './schemeTranslations'

const DOC_TRANSLATIONS = {
    'Aadhaar Card': 'આધાર કાર્ડ',
    'Voter ID': 'મતદાર ઓળખપત્ર',
    'Bank Passbook': 'બેંક પાસબુક',
    'Land Records': 'જમીનના દસ્તાવેજો',
    'Sowing Details': 'વાવણીની વિગતો',
    'Identity Proof': 'ઓળખનો પુરાવો',
    'Passport Size Photographs': 'પાસપોર્ટ સાઇઝના ફોટા',
    'Address Proof': 'સરનામાનો પુરાવો',
    'Income Certificate': 'આવકનું પ્રમાણપત્ર',
    'Caste Certificate': 'જાતિનું પ્રમાણપત્ર',
    'Ration Card': 'રેશન કાર્ડ',
    '7/12 & 8-A Details': '૭/૧૨ અને ૮-અ ના ઉતારા',
    '7/12 and 8-A Extract': '૭/૧૨ અને ૮-અ ના ઉતારા',
    'Bank Account Details': 'બેંક ખાતાની વિગતો'
};

const translateDocsText = (docString, langCode) => {
    if (!docString || langCode !== 'GUJ') return docString;
    let res = docString;
    for (const [eng, guj] of Object.entries(DOC_TRANSLATIONS)) {
        res = res.replace(new RegExp(eng, 'gi'), guj);
    }
    return res;
};

const toGujaratiDigits = (str, langCode) => {
    if (langCode !== 'GUJ') return str;
    const gujDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
    return String(str).replace(/\\d/g, d => gujDigits[d]);
};

const getLocalizedScheme = (scheme, langCode) => {
    if (langCode !== 'GUJ') return { ...scheme, display_name: scheme.scheme_name, display_subtitle: scheme.gujarati_name };
    const tr = SCHEME_TRANSLATIONS[scheme.scheme_name];
    if (tr) {
        return { ...scheme, display_name: tr.title, display_subtitle: scheme.scheme_name, description: tr.description, benefits: toGujaratiDigits(tr.benefits, langCode), eligibility: tr.eligibility, farmer_category: tr.farmer_category, crop_category: tr.crop_category };
    }
    return { ...scheme, display_name: scheme.gujarati_name || scheme.scheme_name, display_subtitle: scheme.scheme_name };
};
`;

code = code.replace("import { farmerSchemesAPI } from '../../services/api'", "import { farmerSchemesAPI } from '../../services/api'\n\n" + importsToAdd);
code = code.replace("// Client side search and chip filtering", "const activeLocalized = activeDetailScheme ? getLocalizedScheme(activeDetailScheme, lang) : null;\n\n    // Client side search and chip filtering");
code = code.replace("const showName = lang === 'GUJ' ? scheme.gujarati_name || scheme.scheme_name : scheme.scheme_name\n                        const nameSubtitle = lang === 'GUJ' ? scheme.scheme_name : scheme.gujarati_name\n                        const isCentral = scheme.scheme_type === 'Central'", "const localizedScheme = getLocalizedScheme(scheme, lang)\n                        const showName = localizedScheme.display_name\n                        const nameSubtitle = localizedScheme.display_subtitle\n                        const isCentral = scheme.scheme_type === 'Central'");

code = code.replace(/{scheme\.description/g, "{localizedScheme.description");
code = code.replace(/: scheme\.description}/g, ": localizedScheme.description}");
code = code.replace(/>{scheme\.eligibility}<\/span>/g, ">{localizedScheme.eligibility}</span>");
code = code.replace(/>{scheme\.benefits}<\/span>/g, ">{localizedScheme.benefits}</span>");

let parts = code.split('// Scheme Details Modal');
if (parts.length > 1) {
    let modalCode = parts[1];
    modalCode = modalCode.replace(/activeDetailScheme/g, 'activeLocalized');
    modalCode = modalCode.replace(/setActiveLocalized/g, 'setActiveDetailScheme');
    modalCode = modalCode.replace(/activeLocalized\.required_documents\.split/g, 'translateDocsText(activeLocalized.required_documents, lang).split');
    code = parts[0] + '// Scheme Details Modal' + modalCode;
}

fs.writeFileSync('src/pages/Farmer/GovernmentSchemes.jsx', code);
console.log('PATCH_APPLIED');
