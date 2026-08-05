const fs = require('fs');

try {
    let code = fs.readFileSync('src/pages/Farmer/ProfitCalculator.jsx', 'utf-8');

    const helperStr = `    const localizeCropName = (cropName) => {
        if (!cropName) return '';
        const cleanName = String(cropName).trim();
        if (language !== 'gu') return cleanName;
        const cropDict = {
            'groundnut': 'મગફળી',
            'cotton': 'કપાસ',
            'cumin': 'જીરું',
            'wheat': 'ઘઉં',
            'mustard': 'રાઈ',
            'castor seed': 'દિવેલા'
        };
        return cropDict[cleanName.toLowerCase()] || cleanName;
    };

    const localizeExpenseType = (type) => {
        if (!type) return '';
        const cleanType = String(type).trim();
        const typeKey = cleanType.toLowerCase();
        
        if (language !== 'gu') {
            const engDict = {
                'seed': 'Seed',
                'fertilizer': 'Fertilizer',
                'pesticide': 'Pesticide',
                'labour': 'Labour',
                'irrigation': 'Irrigation',
                'machinery': 'Machinery',
                'transportation': 'Transportation',
                'other': 'Other'
            };
            return engDict[typeKey] || cleanType;
        }
        
        const guDict = {
            'seed': 'બીજ',
            'fertilizer': 'ખાતર',
            'pesticide': 'જંતુનાશક',
            'labour': 'મજૂરી',
            'irrigation': 'પિયત',
            'machinery': 'યંત્રો',
            'transportation': 'પરિવહન',
            'other': 'અન્ય'
        };
        return guDict[typeKey] || cleanType;
    };`;

    code = code.replace(
        /    const toGuDigits = \(str, langKey\) => \{[\s\S]*?\};/m,
        match => match + '\n\n' + helperStr
    );

    code = code.replace(
        /const pieSummaryData = Object\.entries\(expenseTypeSummary\)\.map\(\(\[key, val\]\) => \(\{\s*label: key,\s*value: val,\s*color: expenseColors\[key\] \|\| '#6B7280'\s*\}\)\)\.filter\(\{?item => item\.value > 0\}?\)/m,
        `const pieSummaryData = Object.entries(expenseTypeSummary).map(([key, val]) => ({
        label: key, // original key name
        displayLabel: localizeExpenseType(key), // dynamically localized text
        value: val,
        color: expenseColors[key] || '#6B7280'
    })).filter(item => item.value > 0)`
    );

    code = code.replace(
        /<span className="truncate">\{t\(\`expenseType\.\$\{slice\.label\}\`, \{ defaultValue: slice\.label \}\)\} /g,
        `<span className="truncate">{slice.displayLabel} `
    );

    code = code.replace(
        /\{lang\(c\.crop_name === 'Groundnut' \? 'મગફળી' : .*?, c\.crop_name\)\}/g,
        `{localizeCropName(c.crop_name)}`
    );

    code = code.replace(
        /\{exp\.crop_name \? lang\(exp\.crop_name === 'Groundnut' \? 'મગફળી' : .*?, exp\.crop_name\) : \`પાક ID: \$\{exp\.crop\}\`\}/g,
        `{exp.crop_name ? localizeCropName(exp.crop_name) : \`પાક ID: \$\{exp.crop\}\`}`
    );

    code = code.replace(
        /\{t\(\`expenseType\.\$\{exp\.expense_type\}\`, \{ defaultValue: exp\.expense_type \}\)\}/,
        `{localizeExpenseType(exp.expense_type)}`
    );

    code = code.replace(
        /\{sale\.crop_name \|\| \`પાક ID: \$\{sale\.crop\}\`\}/,
        `{sale.crop_name ? localizeCropName(sale.crop_name) : \`પાક ID: \$\{sale.crop\}\`}`
    );

    code = code.replace(
        /<option value="Seed">\{t\('expenseType\.Seed', \{defaultValue: 'Seed'\}\)\}<\/option>[\s\S]*?<option value="Other">\{t\('expenseType\.Other', \{defaultValue: 'Other'\}\)\}<\/option>/m,
        `<option value="Seed">{localizeExpenseType('Seed')}</option>
                                        <option value="Fertilizer">{localizeExpenseType('Fertilizer')}</option>
                                        <option value="Pesticide">{localizeExpenseType('Pesticide')}</option>
                                        <option value="Labour">{localizeExpenseType('Labour')}</option>
                                        <option value="Irrigation">{localizeExpenseType('Irrigation')}</option>
                                        <option value="Machinery">{localizeExpenseType('Machinery')}</option>
                                        <option value="Transportation">{localizeExpenseType('Transportation')}</option>
                                        <option value="Other">{localizeExpenseType('Other')}</option>`
    );

    code = code.replace(
        /<option value="Seed">\{t\('expenseType\.Seed'\)\}<\/option>[\s\S]*?<option value="Other">\{t\('expenseType\.Other'\)\}<\/option>/m,
        `<option value="Seed">{localizeExpenseType('Seed')}</option>
                                    <option value="Fertilizer">{localizeExpenseType('Fertilizer')}</option>
                                    <option value="Pesticide">{localizeExpenseType('Pesticide')}</option>
                                    <option value="Labour">{localizeExpenseType('Labour')}</option>
                                    <option value="Irrigation">{localizeExpenseType('Irrigation')}</option>
                                    <option value="Machinery">{localizeExpenseType('Machinery')}</option>
                                    <option value="Transportation">{localizeExpenseType('Transportation')}</option>
                                    <option value="Other">{localizeExpenseType('Other')}</option>`
    );

    fs.writeFileSync('src/pages/Farmer/ProfitCalculator.jsx', code, 'utf-8');
    console.log('ProfitCalculator dynamically mapped successfully');
} catch (err) {
    console.error(err);
}
