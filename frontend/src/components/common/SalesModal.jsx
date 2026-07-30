import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { Button } from './Button';
import { salesAPI } from '../../services/api';

export const SalesModal = ({
    isOpen,
    onClose,
    onSuccess,
    editSales,
    crops,
    initialData = null
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [salesForm, setSalesForm] = useState({
        crop: '',
        market_yard: '',
        sale_date: new Date().toISOString().substring(0, 10),
        sold_quantity: '',
        price_per_kg: ''
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setErrorMsg('');
            setFormErrors({});
            if (editSales) {
                setSalesForm({
                    crop: editSales.crop,
                    market_yard: editSales.market_yard,
                    sale_date: editSales.sale_date,
                    sold_quantity: editSales.sold_quantity,
                    price_per_kg: editSales.price_per_kg
                });
            } else if (initialData) {
                setSalesForm({
                    crop: initialData.crop || (crops.length > 0 ? crops[0].id : ''),
                    market_yard: initialData.market_yard || '',
                    sale_date: initialData.sale_date || new Date().toISOString().substring(0, 10),
                    sold_quantity: initialData.sold_quantity || '',
                    price_per_kg: initialData.price_per_kg || ''
                });
            } else {
                setSalesForm({
                    crop: crops.length > 0 ? crops[0].id : '',
                    market_yard: '',
                    sale_date: new Date().toISOString().substring(0, 10),
                    sold_quantity: '',
                    price_per_kg: ''
                });
            }
        }
    }, [isOpen, editSales, initialData, crops]);

    const validateSales = () => {
        const errors = {};
        if (!salesForm.crop) errors.crop = 'પાક પસંદ કરવો જરૂરી છે.';
        if (!salesForm.market_yard.trim()) errors.market_yard = 'માર્કેટ યાર્ડનું નામ જરૂરી છે.';

        let qty = parseFloat(salesForm.sold_quantity);
        if (!salesForm.sold_quantity || qty <= 0) {
            errors.sold_quantity = 'વેચેલો જથ્થો 0 થી વધુ હોવો જોઈશે.';
        } else if (initialData && initialData.maxYield && qty > initialData.maxYield) {
            errors.sold_quantity = `જથ્થો ઉત્પાદન (${initialData.maxYield} kg) થી વધુ ન હોઈ શકે.`;
        }

        if (!salesForm.price_per_kg || parseFloat(salesForm.price_per_kg) <= 0) {
            errors.price_per_kg = 'કિંમત (પ્રતિ કિલો) 0 થી વધુ હોવી જોઈશે.';
        }
        if (!salesForm.sale_date) errors.sale_date = 'વેચાણ તારીખ અપાયેલી હોવી જરૂરી છે.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateSales()) return;
        setIsLoading(true);
        setErrorMsg('');
        try {
            let res;
            if (editSales) {
                res = await salesAPI.update(editSales.id, salesForm);
            } else {
                res = await salesAPI.create(salesForm);
            }

            if (res.success) {
                onSuccess(res.data || {}, !!editSales);
                onClose();
            } else {
                setErrorMsg(res.message || 'માહિતી સંગ્રહ નિષ્ફળ.');
            }
        } catch (err) {
            console.error('Error saving sales:', err);
            setErrorMsg('સિસ્ટમ એરર! કૃપા રકમ વિગતો ચકાસો.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4 animate-fadeIn">
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-card shadow-2xl border border-dark/5 max-w-md w-full overflow-hidden flex flex-col animate-scaleUp text-xs font-semibold text-dark select-none"
            >
                <div className="flex justify-between items-center bg-primary px-5 py-3.5 text-white">
                    <h3 className="font-bold text-sm flex items-center gap-1">
                        {editSales ? 'વેચાણ નોંધ સુધારો (Edit Sale)' : 'નવું વેચાણ ઉમેરો (Record Sale)'}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 hover:bg-primary-dark/80 rounded"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-3.5">
                    {errorMsg && (
                        <div className="bg-red-50 text-red-650 p-2 rounded text-[11px]">
                            {errorMsg}
                        </div>
                    )}

                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-dark/75 mb-1">આસક્ત પાક (Target Crop) *</label>
                        <select
                            className={`w-full bg-white border outline-none px-3 py-2 rounded-btn focus:border-primary ${formErrors.crop ? 'border-red-500' : 'border-dark/15'}`}
                            value={salesForm.crop}
                            onChange={(e) => setSalesForm(prev => ({ ...prev, crop: e.target.value }))}
                            disabled={!!initialData?.crop}
                        >
                            <option value="">પાક પસંદ કરો</option>
                            {crops.map(c => (
                                <option key={c.id} value={c.id}>{c.crop_name} ({c.crop_variety}) - {c.farm_name}</option>
                            ))}
                        </select>
                        {formErrors.crop && <span className="text-[9px] text-red-650 mt-0.5">{formErrors.crop}</span>}
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-dark/75 mb-1">બજાર / એપીએમસી (Market Yard / APMC) *</label>
                        <input
                            type="text"
                            className={`w-full bg-white border outline-none px-3 py-2 rounded-btn focus:border-primary ${formErrors.market_yard ? 'border-red-500' : 'border-dark/15'}`}
                            placeholder="દા.ત. ગોંડલ માર્કેટ યાર્ડ"
                            value={salesForm.market_yard}
                            onChange={(e) => setSalesForm(prev => ({ ...prev, market_yard: e.target.value }))}
                        />
                        {formErrors.market_yard && <span className="text-[9px] text-red-650 mt-0.5">{formErrors.market_yard}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-dark/75 mb-1">વેચેલો જથ્થો (Quantity in kg) *</label>
                            <input
                                type="number"
                                step="0.01"
                                className={`w-full bg-white border outline-none px-3 py-2 rounded-btn focus:border-primary ${formErrors.sold_quantity ? 'border-red-500' : 'border-dark/15'}`}
                                value={salesForm.sold_quantity}
                                onChange={(e) => setSalesForm(prev => ({ ...prev, sold_quantity: e.target.value }))}
                            />
                            {formErrors.sold_quantity && <span className="text-[9px] text-red-650 mt-0.5">{formErrors.sold_quantity}</span>}
                            {initialData?.maxYield && (
                                <span className="text-[9px] text-dark-light/60 mt-0.5">Maximum: {initialData.maxYield} kg</span>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-dark/75 mb-1">કિંમત પ્રતિ કિલો (Price/kg) *</label>
                            <input
                                type="number"
                                step="0.01"
                                className={`w-full bg-white border outline-none px-3 py-2 rounded-btn focus:border-primary ${formErrors.price_per_kg ? 'border-red-500' : 'border-dark/15'}`}
                                value={salesForm.price_per_kg}
                                onChange={(e) => setSalesForm(prev => ({ ...prev, price_per_kg: e.target.value }))}
                            />
                            {formErrors.price_per_kg && <span className="text-[9px] text-red-650 mt-0.5">{formErrors.price_per_kg}</span>}
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-dark/75 mb-1">વેચાણ તારીખ (Sale Date) *</label>
                        <input
                            type="date"
                            className={`w-full bg-white border outline-none px-3 py-2 rounded-btn focus:border-primary ${formErrors.sale_date ? 'border-red-500' : 'border-dark/15'}`}
                            value={salesForm.sale_date}
                            onChange={(e) => setSalesForm(prev => ({ ...prev, sale_date: e.target.value }))}
                        />
                        {formErrors.sale_date && <span className="text-[9px] text-red-650 mt-0.5">{formErrors.sale_date}</span>}
                    </div>
                </div>

                <div className="bg-secondary-dark px-5 py-3 border-t border-dark/5 flex justify-end gap-2 text-[11px] font-bold">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 hover:bg-dark/5 text-dark-light rounded"
                    >
                        રદ કરો (Cancel)
                    </button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isLoading}
                        className="px-4 py-2 hover:opacity-90 transition-all font-bold rounded-btn"
                    >
                        Save (સાચવો)
                    </Button>
                </div>
            </form>
        </div>
    );
};
