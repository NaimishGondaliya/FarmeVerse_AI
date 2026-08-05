const fs = require('fs');

try {
    let code = fs.readFileSync('src/pages/Farmer/ProfitCalculator.jsx', 'utf-8');

    const langVars = `    const { formatNumber, formatCurrency, formatDate, language } = useLanguage()
    const { t } = useTranslation()

    const lang = (gu, en) => language === 'gu' ? gu : en;
    const toGuDigits = (str, langKey) => {
        if (langKey !== 'gu' || str === undefined || str === null) return String(str || '');
        const gu = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
        return String(str).replace(/[0-9]/g, d => gu[d]);
    };`;

    code = code.replace(
        /    const \{ formatNumber, formatCurrency, formatDate \} = useLanguage\(\)\r?\n    const \{ t \} = useTranslation\(\)/,
        langVars
    );

    code = code.replace(/<span>📊<\/span> \{t\('profitCalc\.titleMain'\)\}/g, `{t('profitCalc.titleMain')}`);
    code = code.replace(/<span><\/span> \{t\('profitCalc\.expenseSplit'\)\}/g, `{t('profitCalc.expenseSplit')}`);
    code = code.replace(/<span className="text-lg">🍩<\/span> <span>\{t\('profitCalc\.expenseSplit'\)\}<\/span>/g, `{t('profitCalc.expenseSplit')}`);

    code = code.replace(/formatCurrency\(totalRevenue\)/g, `toGuDigits(formatCurrency(totalRevenue), language)`);
    code = code.replace(/formatCurrency\(totalExpense\)/g, `toGuDigits(formatCurrency(totalExpense), language)`);
    code = code.replace(/formatCurrency\(Math\.abs\(netProfit\)\)/g, `toGuDigits(formatCurrency(Math.abs(netProfit)), language)`);
    code = code.replace(/profitMargin\.toFixed\(1\)/g, `toGuDigits(profitMargin.toFixed(1), language)`);
    code = code.replace(/formatCurrency\(slice\.value\)/g, `toGuDigits(formatCurrency(slice.value), language)`);

    code = code.replace(/placeholder="\{t\('profitCalc\.searchExpPlaceholder'\)\}"/g, `placeholder={t('profitCalc.searchExpPlaceholder')}`);
    code = code.replace(/placeholder="\{t\('profitCalc\.searchSalePlaceholder'\)\}"/g, `placeholder={t('profitCalc.searchSalePlaceholder')}`);

    code = code.replace(/\{t\('common\.crop'\)\}/g, `{t('profitCalc.thCrop')}`);
    code = code.replace(/\{t\('common\.date'\)\}/g, `{t('profitCalc.thDate')}`);

    code = code.replace(
        /<option key=\{c\.id\} value=\{c\.id\}>\{c\.crop_name\} \(\{c\.crop_variety\}\) - \{c\.farm_name\}<\/option>/g,
        `<option key={c.id} value={c.id}>{lang(c.crop_name === 'Groundnut' ? 'મગફળી' : (c.crop_name === 'Cotton' ? 'કપાસ' : (c.crop_name === 'Cumin' ? 'જીરું' : (c.crop_name === 'Wheat' ? 'ઘઉં' : (c.crop_name === 'Mustard' ? 'રાઈ' : (c.crop_name === 'Castor Seed' ? 'દિવેલા' : c.crop_name))))), c.crop_name)} ({c.crop_variety}) - {c.farm_name}</option>`
    );

    code = code.replace(
        /\{exp\.description && <div className="text-\[10px\] text-dark-light font-medium truncate max-w-\[150px\] mt-0\.5">\{exp\.description\}<\/div>\}/g,
        `{exp.description && <div className="text-[10px] text-dark-light font-medium truncate max-w-[150px] mt-0.5">{exp.description === "Auto-synced from crop records" ? lang("પાક રેકોર્ડમાંથી આપમેળે સમન્વયિત", exp.description) : exp.description}</div>}`
    );

    code = code.replace(/\{t\(exp\.expense_type\)\}/g, `{t(\`expenseType.\${exp.expense_type}\`, { defaultValue: exp.expense_type })}`);
    code = code.replace(/\{t\(slice\.label\)\}/g, `{t(\`expenseType.\${slice.label}\`, { defaultValue: slice.label })}`);

    code = code.replace(/\{formatDate\(exp\.expense_date\)\}/g, `{toGuDigits(formatDate(exp.expense_date), language)}`);
    code = code.replace(/\{formatDate\(sale\.sale_date\)\}/g, `{toGuDigits(formatDate(sale.sale_date), language)}`);
    code = code.replace(/\{formatNumber\(parseFloat\(sale\.sold_quantity\)\)\} kg/g, `{toGuDigits(formatNumber(parseFloat(sale.sold_quantity)), language)} {lang('કિગ્રા', 'kg')}`);
    code = code.replace(/\{formatCurrency\(parseFloat\(sale\.price_per_kg\)\)\}/g, `{toGuDigits(formatCurrency(parseFloat(sale.price_per_kg)), language)}`);
    code = code.replace(/\{formatCurrency\(parseFloat\(sale\.total_revenue\) \|\| 0\)\}/g, `{toGuDigits(formatCurrency(parseFloat(sale.total_revenue) || 0), language)}`);
    code = code.replace(/\{formatCurrency\(parseFloat\(exp\.amount\) \|\| 0\)\}/g, `{toGuDigits(formatCurrency(parseFloat(exp.amount) || 0), language)}`);

    code = code.replace(/રદ કરો \(Cancel\)/g, `{lang('રદ કરો', 'Cancel')}`);
    code = code.replace(/Save \(સાચવો\)/g, `{lang('સાચવો', 'Save')}`);
    code = code.replace(/કોઈ આઇટમ કાઢી નાખવાની ખાતરી છે\?/g, `{lang('કોઈ આઇટમ કાઢી નાખવાની ખાતરી છે?', 'Confirm Deletion')}`);
    code = code.replace(/આ ક્રિયા કાયમી છે અને પાછી લાવી શકાશે નહીં\. શું તમે ખરેખર આગળ વધવા માંગો છો\?/g, `{lang('આ ક્રિયા કાયમી છે અને પાછી લાવી શકાશે નહીં. શું તમે ખરેખર આગળ વધવા માંગો છો?', 'This action is permanent and cannot be undone. Are you sure you want to proceed?')}`);
    code = code.replace(/ના \(Cancel\)/g, `{lang('ના', 'No')}`);
    code = code.replace(/\{t\('common\.yesDelete'\)\} \(Delete\)/g, `{lang('હા, કાઢી નાખો', 'Yes, Delete')}`);

    code = code.replace(/\{t\('expenseType\.Labor'\)\}/g, `{t('expenseType.Labour', {defaultValue: 'Labour'})}`);
    code = code.replace(/\{t\('expenseType\.Other'\)\}/g, `{t('expenseType.Other', {defaultValue: 'Other'})}`);
    code = code.replace(/\{t\('expenseType\.Machinery'\)\}/g, `{t('expenseType.Machinery', {defaultValue: 'Machinery'})}`);
    code = code.replace(/\{t\('expenseType\.Seed'\)\}/g, `{t('expenseType.Seed', {defaultValue: 'Seed'})}`);
    code = code.replace(/\{t\('expenseType\.Fertilizer'\)\}/g, `{t('expenseType.Fertilizer', {defaultValue: 'Fertilizer'})}`);
    code = code.replace(/\{t\('expenseType\.Pesticide'\)\}/g, `{t('expenseType.Pesticide', {defaultValue: 'Pesticide'})}`);

    // header patch
    const header_old = `<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-card border border-dark/5 shadow-sm">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-dark flex items-center gap-2">
                        <span>📊</span> {t('profitCalc.titleMain')}
                    </h1>
                    <p className="text-xs text-dark-light">
                        {t('profitCalc.subtitleMain')}
                    </p>
                </div>`;

    const header_new = `<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-card border border-dark/5 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full shrink-0">
                        <FiTrendingUp size={24} />
                    </div>
                    <div className="flex flex-col justify-center gap-1">
                        <h1 className="text-xl font-bold text-dark">
                            {t('profitCalc.titleMain')}
                        </h1>
                        <p className="text-[11px] font-semibold text-dark-light/85 max-w-sm">
                            {t('profitCalc.subtitleMain')}
                        </p>
                    </div>
                </div>`;

    code = code.replace(header_old, header_new);

    // split exp header patch
    const split_old = `<h3 className="font-bold text-sm text-dark border-b border-dark/5 pb-2.5 mb-4 select-none flex items-center gap-2">
                        <span>🍩</span> {t('profitCalc.expenseSplit')}
                    </h3>`;
    const split_new = `<h3 className="font-bold text-sm text-dark border-b border-dark/5 pb-3 mb-4 select-none flex items-center gap-2">
                        <span className="text-lg">🍩</span> <span>{t('profitCalc.expenseSplit')}</span>
                    </h3>`;
    code = code.replace(split_old, split_new);

    fs.writeFileSync('src/pages/Farmer/ProfitCalculator.jsx', code, 'utf-8');
    console.log('ProfitCalculator successfully patched with Node script');
} catch (err) {
    console.error(err);
}
