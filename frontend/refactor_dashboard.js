import fs from 'fs';
let code = fs.readFileSync('src/pages/Farmer/FarmerDashboard.jsx', 'utf8');

const replacements = [
    { target: /'નફાની ગણતરી કરો \(Profit Calculator\)'/g, rep: "t('dashboard.profitCalcTitle')" },
    { target: /'Phase 2 રોકાણ વ્યવસ્થાપક સાધન. જેના દ્વારા ખેડૂત તેના રોકાણ અને આવકની સરખામણી કરી નફો ગણી શકશે.'/g, rep: "t('dashboard.profitCalcDesc')" },
    { target: /'ફીચર ટૂંક સમયમાં શરૂ થશે'/g, rep: "t('dashboard.comingSoonTitle')" },
    { target: /'ભવિષ્યના અપડેટમાં આ આખી સુવિધા ઉપલબ્ધ બનશે.'/g, rep: "t('dashboard.comingSoonDesc')" },
    { target: />બંધ કરો \(Close\)<\/Button>/g, rep: ">{t('common.close')}</Button>" },
    { target: /ખેડૂત લાઈવ સત્ર • Active Session/g, rep: "{t('dashboard.activeSession')}" },
    { target: /આવકાર, \{farmerName\}!/g, rep: "{t('dashboard.welcome', { name: farmerName })}" },
    { target: /આ રહ્યું તમારું ફાર્મવર્સ એઆઈ \(FarmVerse AI\) ડેશબોર્ડ. ગુજરાતના ખેડૂતો માટે બનાવવામાં આવેલ અદ્યતન સ્માર્ટ કૃષિ નિર્ણય સહાયક સાધનો./g, rep: "{t('dashboard.subtitle')}" },
    { target: /📍 ગુજરાત કૃષિ ક્ષેત્ર/g, rep: "{t('dashboard.agriZone')}" },
    { target: /સરકારી ટેકાના ભાવ ચાલુ છે/g, rep: "{t('dashboard.mspActive')}" },
    { target: />મારા ખેતરો<\/p>/g, rep: ">{t('dashboard.myFarms')}</p>" },
    { target: /suffix=" ખેતરો"/g, rep: "suffix={' ' + t('dashboard.farms')}" },
    { target: /'કોઈ ખેતર નથી'/g, rep: "t('dashboard.noFarms')" },
    { target: />વાવેતર પાક<\/p>/g, rep: ">{t('dashboard.currentCrops')}</p>" },
    { target: /suffix=" પાક"/g, rep: "suffix={' ' + t('dashboard.crops')}" },
    { target: /'કોઈ પાક નથી'/g, rep: "t('dashboard.noCrops')" },
    { target: />કુલ નફો<\/p>/g, rep: ">{t('dashboard.totalProfit')}</p>" },
    { target: />રોકાણ:/g, rep: ">{t('dashboard.investment')}:" },
    { target: />આજનું હવામાન<\/p>/g, rep: ">{t('dashboard.todaysWeather')}</p>" },
    { target: />શ્રેષ્ઠ બજાર<\/p>/g, rep: ">{t('dashboard.bestMarket')}</p>" },
    { target: /આજના કૃષિ કાર્યો \(Today's Tasks\)/g, rep: "{t('dashboard.todaysTasks')}" },
    { target: /'Irrigation \(પિયત\)'/g, rep: "t('tasks.irrigation')" },
    { target: /'Spraying \(દવા છંટકાવ\)'/g, rep: "t('tasks.spraying')" },
    { target: /'Fertilizer \(ખાતર\)'/g, rep: "t('tasks.fertilizer')" },
    { target: /'Harvest \(લણણી\)'/g, rep: "t('tasks.harvest')" },
    { target: /'Disease Insp. \(નિરીક્ષણ\)'/g, rep: "t('tasks.diseaseInsp')" },
    { target: /'Do it Today'/g, rep: "t('taskStatus.doItToday')" },
    { target: /'Skip'/g, rep: "t('taskStatus.skip')" },
    { target: /'Safe'/g, rep: "t('taskStatus.safe')" },
    { target: /'Avoid'/g, rep: "t('taskStatus.avoid')" },
    { target: /'Good Day'/g, rep: "t('taskStatus.goodDay')" },
    { target: /'Delay'/g, rep: "t('taskStatus.delay')" },
    { target: /'Recommended'/g, rep: "t('taskStatus.recommended')" },
    { target: /૭ દિવસનું હવામાન \(7-Day Forecast\)/g, rep: "{t('dashboard.forecast')}" },
    { target: /નફાનો અંદાજ \(Profit Summary\)/g, rep: "{t('dashboard.profitSummary')}" },
    { target: />Total Income<\/p>/g, rep: ">{t('dashboard.totalIncome')}</p>" },
    { target: />Total Expenses<\/p>/g, rep: ">{t('dashboard.totalExpenses')}</p>" },
    { target: />Net Profit<\/p>/g, rep: ">{t('dashboard.netProfit')}</p>" },
    { target: /મારા ખેતરો \(My Farms Overview\)/g, rep: "{t('dashboard.myFarmsOverview')}" },
    { target: />Farm Name<\/th>/g, rep: ">{t('dashboard.farmName')}</th>" },
    { target: />Village<\/th>/g, rep: ">{t('dashboard.village')}</th>" },
    { target: />Area<\/th>/g, rep: ">{t('dashboard.area')}</th>" },
    { target: />Status<\/th>/g, rep: ">{t('dashboard.status')}</th>" },
    { target: />Active<\/span>/g, rep: ">{t('common.active') || 'Active'}</span>" },
    { target: />No farms registered.<\/td>/g, rep: ">{t('dashboard.noFarmsRegistered')}</td>" },
    { target: />વાવેતર પાક \(Current Crops\)/g, rep: ">{t('dashboard.currentCropsTitle')}" },
    { target: />Crop Name<\/th>/g, rep: ">{t('dashboard.cropName')}</th>" },
    { target: />Current Status<\/th>/g, rep: ">{t('dashboard.currentStatus')}</th>" },
    { target: />Days Since Sowing<\/th>/g, rep: ">{t('dashboard.daysSinceSowing')}</th>" },
    { target: />Expected Harvest Date<\/th>/g, rep: ">{t('dashboard.expectedHarvest')}</th>" },
    { target: /t\(crop.status \|\| 'Growing'\)/g, rep: "t(`cropStatus.${crop.status || 'Growing'}`)" },
    { target: />No crops registered.<\/td>/g, rep: ">{t('dashboard.noCropsRegistered')}</td>" },
    { target: /આજના બજારની તક \(Market Opportunity\)/g, rep: "{t('dashboard.marketOpportunity')}" },
    { target: /import \{ useLanguage \} from '..\/..\/context\/LanguageContext'/g, rep: "import { useLanguage } from '../../context/LanguageContext'\nimport { useTranslation } from '../../hooks/useTranslation'" },
    { target: /const \{ formatNumber, formatCurrency, formatDate, t \} = useLanguage\(\)/g, rep: "const { formatNumber, formatCurrency, formatDate } = useLanguage()\n    const { t } = useTranslation()" },
    { target: /useState\('ગુજરાત ખેડૂત મિત્ર'\)/g, rep: "useState('Farmer')" }
];

replacements.forEach(r => {
    code = code.replace(r.target, r.rep);
});

fs.writeFileSync('src/pages/Farmer/FarmerDashboard.jsx', code);
console.log('Replaced successfully');
