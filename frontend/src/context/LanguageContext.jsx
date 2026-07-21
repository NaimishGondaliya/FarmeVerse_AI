import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Bilingual splitter: splits strings like "Dashboard (મુખ્ય વિભાગ)" or "રદ કરો (Cancel)"
function splitBilingual(str) {
    if (!str) return null;
    const match = str.match(/^([^(]+)\(([^)]+)\)$/) || str.match(/^([^/]+)\/([^/]+)$/);
    if (match) {
        const part1 = match[1].trim();
        const part2 = match[2].trim();
        const isPart1Guj = /[\u0A80-\u0AFF]/.test(part1);
        const isPart2Guj = /[\u0A80-\u0AFF]/.test(part2);
        if (isPart1Guj && !isPart2Guj) {
            return { gu: part1, en: part2 };
        } else if (!isPart1Guj && isPart2Guj) {
            return { en: part1, gu: part2 };
        }
    }
    return null;
}

// Global UI Translation Dictionary
const exactTranslations = [
    // Dashboard & Sidebar Links
    { matches: ["Dashboard (મુખ્ય વિભાગ)", "Dashboard (ડેશબોર્ડ)", "Dashboard", "મુખ્ય વિભાગ", "ડેશબોર્ડ"], en: "Dashboard", gu: "ડેશબોર્ડ" },
    { matches: ["My Farms (મારા ખેતરો)", "My Farms", "મારા ખેતરો"], en: "My Farms", gu: "મારા ખેતરો" },
    { matches: ["Crop Records (પાક રેકોર્ડ)", "Crop Records", "પાક રેકોર્ડ"], en: "Crop Records", gu: "પાક રેકોર્ડ" },
    { matches: ["Profit Calculator (નફાની ગણતરી)", "Profit Calculator", "નફાની ગણતરી"], en: "Profit Calculator", gu: "નફાની ગણતરી" },
    { matches: ["Market Prices (બજાર ભાવો)", "Market Prices", "બજાર ભાવો"], en: "Market Prices", gu: "બજાર ભાવો" },
    { matches: ["Weather (હવામાન)", "Weather", "હવામાન"], en: "Weather", gu: "હવામાન" },
    { matches: ["Disease Detection (રોગ નિદાન)", "Disease Detection", "રોગ નિદાન"], en: "Disease Detection", gu: "રોગ નિદાન" },
    { matches: ["Crop Recommendation (પાક ભલામણ)", "Crop Recommendation", "પાક ભલામણ"], en: "Crop Recommendation", gu: "પાક ભલામણ" },
    { matches: ["Government Schemes (સરકારી યોજનાઓ)", "Government Schemes", "સરકારી યોજનાઓ"], en: "Government Schemes", gu: "સરકારી યોજનાઓ" },
    { matches: ["Expert Consultation (નિષ્ણાત સેવ)", "Expert Consultation (નિષ્ણાત સેવા)", "Expert Consultation", "નિષ્ણાત સેવ", "નિષ્ણાત પરામર્શ", "નિષ્ણાત સેવા"], en: "Expert Consultation", gu: "નિષ્ણાત પરામર્શ" },
    { matches: ["Profile (મારી વ્યવસ્થા)", "Profile", "મારી વ્યવસ્થા", "પ્રોફાઇલ"], en: "Profile", gu: "પ્રોફાઇલ" },
    { matches: ["Logout (પ્રવેશ બંધ)", "Logout", "પ્રવેશ બંધ"], en: "Logout", gu: "પ્રવેશ બંધ" },
    { matches: ["Home (મુખ્ય પૃષ્ઠ)", "Home", "મુખ્ય પૃષ્ઠ"], en: "Home", gu: "મુખ્ય પૃષ્ઠ" },
    { matches: ["ખેડૂત સત્ર (Farmer Live)", "Farmer Live", "ખેડૂત સત્ર"], en: "Farmer Session", gu: "ખેડૂત સત્ર" },
    { matches: ["ખેડૂત હોમ પેનલ", "Farmer Home Panel"], en: "Farmer Home Panel", gu: "ખેડૂત હોમ પેનલ" },
    { matches: ["Active session in Gujarat Zone", "Active Session in Gujarat Zone", "ગુજરાત ઝોનમાં સક્રિય સત્ર"], en: "Active session in Gujarat Zone", gu: "ગુજરાત ઝોનમાં સક્રિય સત્ર" },
    { matches: ["Gujarat Ag-Decision Support", "ગુજરાત કૃષિ નિર્ણય સહાય"], en: "Gujarat Ag-Decision Support", gu: "ગુજરાત કૃષિ નિર્ણય સહાય" },
    { matches: ["System Analytics", "System Analytics (એનાલિટિક્સ)", "સિસ્ટમ એનાલિટિક્સ"], en: "System Analytics", gu: "સિસ્ટમ એનાલિટિક્સ" },
    { matches: ["Schemes Management", "Schemes Management (યોજનાઓ)", "સરકારી યોજના વ્યવસ્થાપન"], en: "Schemes Management", gu: "સરકારી યોજના વ્યવસ્થાપન" },
    { matches: ["Expert Management (નિષ્ણાત વ્યવસ્થાપન)", "Expert Management", "નિષ્ણાત વ્યવસ્થાપન"], en: "Expert Management", gu: "નિષ્ણાત વ્યવસ્થાપન" },
    { matches: ["Consultation Center", "Consultation Center (પરામર્શ)", "પરામર્શ કેન્દ્ર"], en: "Consultation Center", gu: "પરામર્શ કેન્દ્ર" },
    { matches: ["Admin Profile Control Center", "Admin Profile Control Center", "વહીવટી પ્રોફાઇલ નિયંત્રણ કેન્દ્ર"], en: "Admin Profile Control Center", gu: "વહીવટી પ્રોફાઇલ નિયંત્રણ કેન્દ્ર" },
    { matches: ["Availability (ઉપલબ્ધતા)", "Availability", "ઉપલબ્ધતા"], en: "Availability", gu: "ઉપલબ્ધતા" },
    { matches: ["Farmer List (ખેડૂતોની યાદી)", "Farmer List", "ખેડૂતોની યાદી"], en: "Farmer List", gu: "ખેડૂતોની યાદી" },
    { matches: ["Consultations (પરામર્શ)", "Consultations", "પરામર્શ"], en: "Consultations", gu: "પરામર્શ" },

    // Landing Page
    { matches: ["પાક રોગ ઓળખ (Crop Disease Detection)", "Crop Disease Detection", "પાક રોગ ઓળખ"], en: "Crop Disease Detection", gu: "પાક રોગ ઓળખ" },
    { matches: ["કૃત્રિમ બુદ્ધિમત્તા (AI) દ્વારા પાકના પાંદડાના ફોટા પરથી રોગ અને તેનો ઉપચાર તુરંત મેળવો.", "Get disease diagnosis and treatment recommendations instantly from crop leaf photos using AI."], en: "Get disease diagnosis and treatment recommendations instantly from crop leaf photos using AI.", gu: "કૃત્રિમ બુદ્ધિમત્તા (AI) દ્વારા પાકના પાંદડાના ફોટા પરથી રોગ અને તેનો ઉપચાર તુરંત મેળવો." },
    { matches: ["જમીનના પ્રકાર અને પોષક તત્વોના આધારે વાવણી માટે શ્રેષ્ઠ પાકની ભલામણ મેળવો.", "Get recommendations for the best crop to sow based on soil type and nutrients."], en: "Get recommendations for the best crop to sow based on soil type and nutrients.", gu: "જમીનના પ્રકાર અને પોષક તત્વોના આધારે વાવણી માટે શ્રેષ્ઠ પાકની ભલામણ મેળવો." },
    { matches: ["ગુજરાતની વિવિધ એ.પી.એમ.સી. (APMC) ના એગમાર્કનેટ (AGMARKNET) ના પાકના લાઈવ બજાર ભાવો.", "Live market prices of crops from AGMARKNET for various APMCs in Gujarat."], en: "Live market prices of crops from AGMARKNET for various APMCs in Gujarat.", gu: "ગુજરાતની વિવિધ એ.પી.એમ.સી. (APMC) ના એગમાર્કનેટ (AGMARKNET) ના પાકના લાઈવ બજાર ભાવો." },
    { matches: ["તાલુકા અને જિલ્લા વાર સ્થાનિક હવામાન આગાહી અને કૃષિ સલાહ પત્રકો.", "Taluka and district-wise local weather forecast and agricultural advisories."], en: "Taluka and district-wise local weather forecast and agricultural advisories.", gu: "તાલુકા અને જિલ્લા વાર સ્થાનિક હવામાન આગાહી અને કૃષિ સલાહ પત્રકો." },
    { matches: ["ગુજરાત સરકાર દ્વારા અમલમાં મુકાયેલી ખેડૂત કલ્યાણકારી યોજનાઓ અને સહાયની માહિતી.", "Information on farmer welfare schemes and assistance implemented by the Gujarat government."], en: "Information on farmer welfare schemes and assistance implemented by the Gujarat government.", gu: "ગુજરાત સરકાર દ્વારા અમલમાં મુકાયેલી ખેડૂત કલ્યાણકારી યોજનાઓ અને સહાયની માહિતી." },
    { matches: ["વાવણી ખર્ચ, ખાતર, દવા અને મજૂરી ખર્ચની સામે મળનારી આવક અને નફાની ગણતરી.", "Calculation of income and profit against sowing cost, fertilizer, medicine, and labor cost."], en: "Calculation of income and profit against sowing cost, fertilizer, medicine, and labor cost.", gu: "વાવણી ખર્ચ, ખાતર, દવા અને મજૂરી ખર્ચની સામે મળનારી આવક અને નફાની ગણતરી." },
    { matches: ["પાછલા વર્ષોના રેકોર્ડ્સ અને વાર્ષિક ઉપજના આધારે ફાર્મ પ્રગતિ અને આંકડાકીય વિશ્લેષણ.", "Farm progress and statistical analysis based on past records and annual yield."], en: "Farm progress and statistical analysis based on past records and annual yield.", gu: "પાછલા વર્ષોના રેકોર્ડ્સ અને વાર્ષિક ઉપજના આધારે ફાર્મ પ્રગતિ અને આંકડાકીય વિશ્લેષણ." },
    { matches: ["📍 ગુજરાત ખેડૂત ક્ષેત્ર (Gujarat Zone)", "📍 Gujarat Zone", "📍 ગુજરાત ખેડૂત ક્ષેત્ર"], en: "📍 Gujarat Zone", gu: "📍 ગુજરાત ખેડૂત ક્ષેત્ર" },
    { matches: ["સેકન્ડરી ફાર્મિંગ ડિસિઝન સપોર્ટ પ્લેટફોર્મ", "Secondary Farming Decision Support Platform"], en: "Secondary Farming Decision Support Platform", gu: "સેકન્ડરી ફાર્મિંગ ડિસિઝન સપોર્ટ પ્લેટફોર્મ" },
    { matches: ["ગુજરાતના ખેડૂતો માટે સ્માર્ટ એન્ડ્રોઇડ એન્ડ વેબ ડિસિઝન સપોર્ટ પ્લેટફોર્મ", "Smart Android & Web Decision Support Platform for Gujarat Farmers"], en: "Smart Android & Web Decision Support Platform for Gujarat Farmers", gu: "ગુજરાતના ખેડૂતો માટે સ્માર્ટ એન્ડ્રોઇડ એન્ડ વેબ ડિસિઝન સપોર્ટ પ્લેટફોર્મ" },
    { matches: ["FarmVerse AI - હવામાન, બજાર કિંમતો, પાકના ઇતિહાસ અને આર્ટિફિશિયલ ઇન્ટેલિજન્સ (AI) ના તાલમેલથી આપની ખેતીને વધુ સમૃદ્ધ બનાવવા માટેનું અદ્યતન પ્લેટફોર્મ.", "FarmVerse AI - An advanced platform to make your farming more prosperous by combining weather, market prices, crop history, and Artificial Intelligence (AI)."], en: "FarmVerse AI - An advanced platform to make your farming more prosperous by combining weather, market prices, crop history, and Artificial Intelligence (AI).", gu: "FarmVerse AI - હવામાન, બજાર કિંમતો, પાકના ઇતિહાસ અને આર્ટિફિશિયલ ઇન્ટેલિજન્સ (AI) ના તાલમેલથી આપની ખેતીને વધુ સમૃદ્ધ બનાવવા માટેનું અદ્યતન પ્લેટફોર્મ." },
    { matches: ["- હવામાન, બજાર કિંમતો, પાકના ઇતિહાસ અને આર્ટિફિશિયલ ઇન્ટેલિજન્સ (AI) ના તાલમેલથી આપની ખેતીને વધુ સમૃદ્ધ બનાવવા માટેનું અદ્યતન પ્લેટફોર્મ.", "- An advanced platform to make your farming more prosperous by combining weather, market prices, crop history, and Artificial Intelligence (AI)."], en: "- An advanced platform to make your farming more prosperous by combining weather, market prices, crop history, and Artificial Intelligence (AI).", gu: "- હવામાન, બજાર કિંમતો, પાકના ઇતિહાસ અને આર્ટિફિશિયલ ઇન્ટેલિજન્સ (AI) ના તાલમેલથી આપની ખેતીને વધુ સમૃદ્ધ બનાવવા માટેનું અદ્યતન પ્લેટફોર્મ." },
    { matches: ["ખેડૂત પોર્ટલ (Farmer Portal)", "Farmer Portal", "ખેડૂત પોર્ટલ"], en: "Farmer Portal", gu: "ખેડૂત પોર્ટલ" },
    { matches: ["કૃષિ નિષ્ણાત પોર્ટલ (Expert Portal)", "Expert Portal", "કૃષિ નિષ્ણાત પોર્ટલ"], en: "Expert Portal", gu: "કૃષિ નિષ્ણાત પોર્ટલ" },
    { matches: ["વહીવટી લૉગિન (Admin)", "Admin Login", "વહીવટી લૉગિન"], en: "Admin Login", gu: "વહીવટી લૉગિન" },
    { matches: ["પ્રવેશ કરો (Login)", "Login", "Login (પ્રવેશ કરો)", "પ્રવેશ કરો"], en: "Login", gu: "પ્રવેશ કરો" },
    { matches: ["અહીં લોગિન કરો (Login here)", "Login here", "અહીં લોગિન કરો"], en: "Login here", gu: "અહીં લોગિન કરો" },
    { matches: ["અહીં રજીસ્ટ્રેશન કરો (Register here)", "Register here", "અહીં રજીસ્ટ્રેશન કરો"], en: "Register here", gu: "અહીં રજીસ્ટ્રેશન કરો" },
    { matches: ["નવું ખાતું બનાવવા માટે માહિતી ભરો", "Fill info to create new account"], en: "Fill info to create new account", gu: "નવું ખાતું બનાવવા માટે માહિતી ભરો" },
    { matches: ["નવું ખાતું બનાવવું છે?", "Create a new account?", "નવું ખાતું બનાવવું છે"], en: "Create a new account?", gu: "નવું ખાતું બનાવવું છે?" },
    { matches: ["પહેલેથી જ ખાતું છે?", "Already have an account?", "પહેલેથી જ ખાતું છે"], en: "Already have an account?", gu: "પહેલેથી જ ખાતું છે?" },
    { matches: ["© 2026 FarmVerse AI. ગુજરાત, ભારત.", "© 2026 FarmVerse AI. Gujarat, India."], en: "© 2026 FarmVerse AI. Gujarat, India.", gu: "© 2026 FarmVerse AI. ગુજરાત, ભારત." },

    // auth layout labels & fields
    { matches: ["મુખ્ય પૃષ્ઠ પર પાછા જાઓ", "Back to main page"], en: "Back to main page", gu: "મુખ્ય પૃષ્ઠ પર પાછા જાઓ" },
    { matches: ["ખેડૂત લોગિન", "Farmer Login"], en: "Farmer Login", gu: "ખેડૂત લોગિન" },
    { matches: ["યાદ રાખો", "Remember Me"], en: "Remember Me", gu: "યાદ રાખો" },
    { matches: ["મોબાઈલ નંબર દાખલ કરો...", "Enter mobile number..."], en: "Enter mobile number...", gu: "મોબાઈલ નંબર દાખલ કરો..." },
    { matches: ["મોબાઈલ નંબર દાખલ કરો", "Enter mobile number"], en: "Enter mobile number", gu: "મોબાઈલ નંબર દાખલ કરો" },
    { matches: ["પાસવર્ડ દાખલ કરો", "Enter password"], en: "Enter password", gu: "પાસવર્ડ દાખલ કરો" },
    { matches: ["પાસવર્ડની ખાતરી કરો", "Confirm Password"], en: "Confirm Password", gu: "પાસવર્ડની ખાતરી કરો" },
    { matches: ["ખેડૂત રજીસ્ટ્રેશન", "Farmer Registration"], en: "Farmer Registration", gu: "ખેડૂત રજીસ્ટ્રેશન" },
    { matches: ["કૃષિ નિષ્ણાત પ્રવેશ (Expert Login)", "Expert Login", "કૃષિ નિષ્ણાત પ્રવેશ"], en: "Expert Login", gu: "કૃષિ નિષ્ણાત પ્રવેશ (Expert Login)" },
    { matches: ["કૃષિ નિષ્ણાત પ્રવેશ", "Expert Login"], en: "Expert Login", gu: "કૃષિ નિષ્ણાત પ્રવેશ" },
    { matches: ["એડમિન કંટ્રોલ પેનલ (Admin Portal)", "Admin Portal", "એડમિન કંટ્રોલ પેનલ"], en: "Admin Portal", gu: "એડમિન કંટ્રોલ પેનલ (Admin Portal)" },
    { matches: ["એડમિનિસ્ટ્રેટર આઈડી", "Administrator ID"], en: "Administrator ID", gu: "એડમિનિસ્ટ્રેટર આઈડી" },
    { matches: ["સુરક્ષિત પ્રવેશ કરો (Secure Login)", "Secure Login", "સુરક્ષિત પ્રવેશ કરો"], en: "Secure Login", gu: "સુરક્ષિત પ્રવેશ કરો (Secure Login)" },
    { matches: ["હું નિયમો અને શરતોનો સ્વીકાર કરું છું (Accept Terms & Conditions)", "I accept the Terms & Conditions", "હું નિયમો અને શરતોનો સ્વીકાર કરું છું"], en: "I accept the Terms & Conditions", gu: "હું નિયમો અને શરતોનો સ્વીકાર કરું છું (Accept Terms & Conditions)" },
    { matches: ["હું નિયમો અને શરતોનો સ્વીકાર કરું છું", "I accept the Terms & Conditions"], en: "I accept the Terms & Conditions", gu: "હું નિયમો અને શરતોનો સ્વીકાર કરું છું" },
    { matches: ["નવો ગુપ્ત કોડ લખો", "Enter new password"], en: "Enter new password", gu: "નવો ગુપ્ત કોડ લખો" },
    { matches: ["દા.ત. name@domain.com", "e.g. name@domain.com"], en: "e.g. name@domain.com", gu: "દા.ત. name@domain.com" },
    { matches: ["દા.ત. મારા ઘર પાછળનું સીમ અથવા પ્લોટ A", "e.g. farm behind my house or plot A"], en: "e.g. farm behind my house or plot A", gu: "દા.ત. મારા ઘર પાછળનું સીમ અથવા પ્લોટ A" },
    { matches: ["દા.ત. 120", "e.g. 120"], en: "e.g. 120", gu: "દા.ત. 120" },
    { matches: ["દા.ત. 150", "e.g. 150"], en: "e.g. 150", gu: "દા.ત. 150" },
    { matches: ["દા.ત. 1200", "e.g. 1200"], en: "e.g. 1200", gu: "દા.ત. 1200" },
    { matches: ["દા.ત. 3.2", "e.g. 3.2"], en: "e.g. 3.2", gu: "દા.ત. 3.2" },
    { matches: ["દા.ત. 5.5", "e.g. 5.5"], en: "e.g. 5.5", gu: "દા.ત. 5.5" },
    { matches: ["દા.ત. 23.0225", "e.g. 23.0225"], en: "e.g. 23.0225", gu: "દા.ત. 23.0225" },
    { matches: ["દા.ત. 72.5714", "e.g. 72.5714"], en: "e.g. 72.5714", gu: "દા.ત. 72.5714" },
    { matches: ["દા.ત. કાળી, લાલ અથવા ગોરાડુ જમીન", "e.g. Black, Red, or Sandy Loam soil"], en: "e.g. Black, Red, or Sandy Loam soil", gu: "દા.ત. કાળી, લાલ અથવા ગોરાડુ જમીન" },
    { matches: ["દા.ત. ગોંડલ માર્કેટ યાર્ડ", "e.g. Gondal Market Yard"], en: "e.g. Gondal Market Yard", gu: "દા.ત. ગોંડલ માર્કેટ યાર્ડ" },
    { matches: ["દા.ત. ઘઉં, કપાસ, મગફળી", "e.g. Wheat, Cotton, Groundnut"], en: "e.g. Wheat, Cotton, Groundnut", gu: "દા.ત. ઘઉં, કપાસ, મગફળી" },
    { matches: ["દા.ત. ટપક સિંચાઈ, કુવો, નહેર", "e.g. Drip, Well, Canal"], en: "e.g. Drip, Well, Canal", gu: "દા.ત. ટપક સિંચાઈ, કુવો, નહેર" },
    { matches: ["દા.ત. લોક-વન (Lok-1), GW-496", "e.g. Lok-1, GW-496"], en: "e.g. Lok-1, GW-496", gu: "દા.ત. લોક-વન (Lok-1), GW-496" },

    // common labels & states
    { matches: ["બંધ કરો (Close)", "Close", "બંધ કરો"], en: "Close", gu: "બંધ કરો" },
    { matches: ["રદ કરો (Cancel)", "Cancel", "રદ કરો"], en: "Cancel", gu: "રદ કરો" },
    { matches: ["સાચવો (Save)", "Save", "સાચવો"], en: "Save", gu: "સાચવો" },
    { matches: ["ખેતર ઉમેરો", "Add Farm"], en: "Add Farm", gu: "ખેતર ઉમેરો" },
    { matches: ["પાક વાવો", "Plant Crop"], en: "Plant Crop", gu: "પાક વાવો" },
    { matches: ["નવું ખેતર ઉમેરો (Add Farm)", "Add New Farm", "નવું ખેતર ઉમેરો"], en: "Add New Farm", gu: "નવું ખેતર ઉમેરો" },
    { matches: ["નવો પાક ઉમેરો (Add Crop)", "Add New Crop", "નવો પાક ઉમેરો"], en: "Add New Crop", gu: "નવો પાક ઉમેરો" },
    { matches: ["નવી ખેતી શારૂ કરો (Add New Farm)", "Add New Farm", "નવી ખેતી શારૂ કરો"], en: "Add New Farm", gu: "નવી ખેતી શારૂ કરો" },
    { matches: ["શોધો...", "Search..."], en: "Search...", gu: "શોધો..." },
    { matches: ["લોડ થઈ રહ્યું છે...", "Loading..."], en: "Loading...", gu: "લોડ થઈ રહ્યું છે..." },
    { matches: ["કૃપા કરીને થોડીવાર રાહ જુઓ", "Please wait a moment"], en: "Please wait a moment", gu: "કૃપા કરીને થોડીવાર રાહ જુઓ" },
    { matches: ["કૃપા કરીને રાહ જુઓ...", "Please wait..."], en: "Please wait...", gu: "કૃપા કરીને રાહ જુઓ..." },
    { matches: ["વાવણી તારીખ", "Sowing Date"], en: "Sowing Date", gu: "વાવણી તારીખ" },
    { matches: ["લણણી તારીખ", "Harvest Date"], en: "Harvest Date", gu: "લણણી તારીખ" },
    { matches: ["જમીન (એકર)", "Land (Acre)"], en: "Land (Acre)", gu: "જમીન (એકર)" },
    { matches: ["ગામ (Village)", "Village", "ગામ"], en: "Village", gu: "ગામ" },
    { matches: ["તાલુકો (Taluka)", "Taluka", "તાલુકો"], en: "Taluka", gu: "તાલુકો" },
    { matches: ["જિલ્લો (District)", "District", "જિલ્લો"], en: "District", gu: "જિલ્લો" },
    { matches: ["જમીનનો પ્રકાર (Soil Type)", "Soil Type", "જમીનનો પ્રકાર"], en: "Soil Type", gu: "જમીનનો પ્રકાર" },
    { matches: ["જમીનનું માપ (Total Area)", "Total Area", "જમીનનું માપ"], en: "Total Area", gu: "જમીનનું માપ" },
    { matches: ["સિંચાઈ પદ્ધતિ", "Irrigation Type"], en: "Irrigation Type", gu: "સિંચાઈ પદ્ધતિ" },
    { matches: ["એકમ (Unit)", "Unit", "એકમ"], en: "Unit", gu: "એકમ" },
    { matches: ["મોબાઈલ નંબર (Mobile Number)", "Mobile Number", "મોબાઈલ નંબર"], en: "Mobile Number", gu: "મોબાઈલ નંબર" },
    { matches: ["મોબાઈલ નંબર", "Mobile Number"], en: "Mobile Number", gu: "મોબાઈલ નંબર" },
    { matches: ["પાસવર્ડ (Password)", "Password", "પાસવર્ડ"], en: "Password", gu: "પાસવર્ડ" },
    { matches: ["પાસવર્ડ", "Password"], en: "Password", gu: "પાસવર્ડ" },
    { matches: ["ગુપ્ત કોડ (Password)", "Password", "ગુપ્ત કોડ"], en: "Password", gu: "ગુપ્ત કોડ" },
    { matches: ["પાસવર્ડ ખાતરી કરો", "Confirm Password"], en: "Confirm Password", gu: "પાસવર્ડ ખાતરી કરો" },
    { matches: ["પૂરું નામ", "Full Name"], en: "Full Name", gu: "પૂરું નામ" },
    { matches: ["ભૂમિકા", "Role"], en: "Role", gu: "ભૂમિકા" },
    { matches: ["ખેડૂત", "Farmer"], en: "Farmer", gu: "ખેડૂત" },
    { matches: ["નિષ્ણાત", "Expert"], en: "Expert", gu: "નિષ્ણાત" },
    { matches: ["વૈકલ્પિક", "Optional"], en: "Optional", gu: "વૈકલ્પિક" },
    { matches: ["ક્રિયાઓ", "Actions"], en: "Actions", gu: "ક્રિયાઓ" },
    { matches: ["ખાસ નોંધ (Notes)", "Notes", "ખાસ નોંધ"], en: "Notes", gu: "ખાસ નોંધ" },
    { matches: ["સ્થિતિ", "Status"], en: "Status", gu: "સ્થિતિ" },
    { matches: ["ઋતુ (Season)", "Season", "ઋતુ"], en: "Season", gu: "ઋતુ" },
    { matches: ["પાકનું નામ (Crop Name)", "Crop Name", "પાકનું નામ"], en: "Crop Name", gu: "પાકનું નામ" },
    { matches: ["પાકની જાત (Variety)", "Variety", "પાકની જાત"], en: "Variety", gu: "પાકની જાત" },
    { matches: ["પાકનો તબક્કો (Status)", "Crop Status", "પાકનો તબક્કો"], en: "Crop Status", gu: "પાકનો તબક્કો" },
    { matches: ["નફો", "Profit"], en: "Profit", gu: "નફો" },
    { matches: ["ખર્ચ", "Expense"], en: "Expense", gu: "ખર્ચ" },
    { matches: ["આવક", "Revenue"], en: "Revenue", gu: "આવક" },
    { matches: ["ચોખ્ખો નફો (Net Profit)", "Net Profit", "ચોખ્ખો નફો"], en: "Net Profit", gu: "ચોખ્ખો નફો" },
    { matches: ["કુલ રોકાણ (Total Investment)", "Total Investment", "કુલ રોકાણ"], en: "Total Investment", gu: "કુલ રોકાણ" },
    { matches: ["કુલ નફો", "Total Profit"], en: "Total Profit", gu: "કુલ નફો" },
    { matches: ["કુલ ખર્ચ", "Total Expenses"], en: "Total Expenses", gu: "કુલ ખર્ચ" },
    { matches: ["કુલ આવક", "Total Revenue"], en: "Total Revenue", gu: "કુલ આવક" },

    // Validation / Form Errors
    { matches: ["ખેતરનું નામ લખવું ફરજિયાત છે", "Farm name is required"], en: "Farm name is required", gu: "ખેતરનું નામ લખવું ફરજિયાત છે" },
    { matches: ["ગામનું નામ ફરજિયાત છે", "Village name is required"], en: "Village name is required", gu: "ગામનું નામ ફરજિયાત છે" },
    { matches: ["તાલુકો ફરજિયાત છે", "Taluka is required"], en: "Taluka is required", gu: "તાલુકો ફરજિયાત છે" },
    { matches: ["જિલ્લો પસંદ કરવો ફરજિયાત છે", "District selection is required"], en: "District selection is required", gu: "જિલ્લો પસંદ કરવો ફરજિયાત છે" },
    { matches: ["કુલ જમીનનું માપ ફરજિયાત છે", "Total land area is required"], en: "Total land area is required", gu: "કુલ જમીનનું માપ ફરજિયાત છે" },
    { matches: ["જમીનનું માપ 0 થી વધુ હોવું જોઈએ", "Land area must be greater than 0"], en: "Land area must be greater than 0", gu: "જમીનનું માપ 0 થી વધુ હોવું જોઈએ" },
    { matches: ["જમીનનો પ્રકાર ફરજિયાત છે", "Soil type is required"], en: "Soil type is required", gu: "જમીનનો પ્રકાર ફરજિયાત છે" },
    { matches: ["સિંચાઈ પદ્ધતિ ફરજિયાત છે", "Irrigation type is required"], en: "Irrigation type is required", gu: "સિંચાઈ પદ્ધતિ ફરજિયાત છે" },
    { matches: ["કૃપા કરીને માન્ય ૧૦-અંકનો મોબાઈલ નંબર દાખલ કરો", "Please enter a valid 10-digit mobile number"], en: "Please enter a valid 10-digit mobile number", gu: "કૃપા કરીને માન્ય ૧૦-અંકનો મોબાઈલ નંબર દાખલ કરો" },
    { matches: ["કૃપા કરીને યોગ્ય ઈમેલ આઈડી દાખલ કરો", "Please enter a valid email ID"], en: "Please enter a valid email ID", gu: "કૃપા કરીને યોગ્ય ઈમેલ આઈડી દાખલ કરો" },

    // Empty states
    { matches: ["આ સાઈટ પર કોઈ ખેતર મળ્યું નથી", "No farms found on this account"], en: "No farms found", gu: "આ સાઈટ પર કોઈ ખેતર મળ્યું નથી" },
    { matches: ["કોઈ પાક રેકોર્ડ મળ્યો નથી", "No crop records found"], en: "No crop records found", gu: "કોઈ પાક રેકોર્ડ મળ્યો નથી" },

    // Dynamic strings / calculations
    { matches: ["અંદાજિત ઉત્પાદન (મણ)", "Estimated Yield (Maund)"], en: "Estimated Yield (Maund)", gu: "અંદાજિત ઉત્પાદન (મણ)" },
    { matches: ["અંદાજિત લણણી તારીખ", "Estimated Harvest Date"], en: "Estimated Harvest Date", gu: "અંદાજિત લણણી તારીખ" },
    { matches: ["અટકાવવાના પગલા (Prevention)", "Prevention Measures"], en: "Prevention Measures", gu: "અટકાવવાના પગલા (Prevention)" },
    { matches: ["અદ્યતન નફા-નુકસાન ગણતરી", "Advanced Profit & Loss Calculation"], en: "Advanced Profit & Loss Calculation", gu: "અદ્યતન નફા-નુકસાન ગણતરી" },
    { matches: ["અન્ય ખર્ચ (₹)", "Other Expense (₹)"], en: "Other Expense (₹)", gu: "અન્ય ખર્ચ (₹)" },
    { matches: ["અમે દિલગીર છીએ, પણ તમે જે માહિતી અથવા પાનું શોધી રહ્યા છો તે આ પૃષ્ઠભૂમિ પર ઉપલબ્ધ નથી. કદાચ લિન્ક તૂટેલી છે અથવા પાનું ખસેડવામાં આવ્યું છે.", "We are sorry, but the page you are looking for is not available. The link might be broken or the page has been moved."], en: "We are sorry, but the page you are looking for is not available. The link might be broken or the page has been moved.", gu: "અમે દિલગીર છીએ, પણ તમે જે માહિતી અથવા પાનું શોધી રહ્યા છો તે આ પૃષ્ઠભૂમિ પર ઉપલબ્ધ નથી. કદાચ લિન્ક તૂટેલી છે અથવા પાનું ખસેડવામાં આવ્યું છે." },
    { matches: ["અહીં તમારા તાજેતરના લીધેલા ફોટોની ચકાસણી અને તપાસ પરિણામોનો એકત્રિત ઇતિહાસ સંગ્રહિત થશે.", "Your recent photo scan check history will be collected and stored here."], en: "Your recent photo scan check history will be collected and stored here.", gu: "અહીં તમારા તાજેતરના લીધેલા ફોટોની ચકાસણી અને તપાસ પરિણામોનો એકત્રિત ઇતિહાસ સંગ્રહિત થશે." },
    { matches: ["આ પ્લેટફોર્મના સર્વાધિકાર કાયદા હેઠળ આરક્ષિત છે. આ પ્લેટફોર્મ ચકાસણી હેતુ માટે ડેમો એનવાયરમેન્ટમાં ઓપરેટ થઈ રહ્યું છે.", "All rights reserved. This platform is running in a demo environment for verification purposes."], en: "All rights reserved. This platform is running in a demo environment for verification purposes.", gu: "આ પ્લેટફોર્મના સર્વાધિકાર કાયદા હેઠળ આરક્ષિત છે. આ પ્લેટફોર્મ ચકાસણી હેતુ માટે ડેમો એનવાયરમેન્ટમાં ઓપરેટ થઈ રહ્યું છે." },
    { matches: ["આ રહ્યું તમારું ફાર્મવર્સ એઆઈ (FarmVerse AI) ડેશબોર્ડ. ગુજરાતના ખેડૂતો માટે સ્માર્ટ કૃષિ નિર્ણય સહાયક સાધનો.", "Here is your FarmVerse AI Dashboard. Smart agricultural decision support tools for Gujarat farmers."], en: "Here is your FarmVerse AI Dashboard. Smart agricultural decision support tools for Gujarat farmers.", gu: "આ રહ્યું તમારું ફાર્મવર્સ એઆઈ (FarmVerse AI) ડેશબોર્ડ. ગુજરાતના ખેડૂતો માટે સ્માર્ટ કૃષિ નિર્ણય સહાયક સાધનો." },
    { matches: ["આકસ્મિક રોગ નિદાન", "Emergency Disease Detection"], en: "Emergency Disease Detection", gu: "આકસ્મિક રોગ નિદાન" },
    { matches: ["આજનું હવામાન", "Today's Weather"], en: "Today's Weather", gu: "આજનું હવામાન" },
    { matches: ["આસક્ત પાક (Target Crop) *", "Target Crop *"], en: "Target Crop *", gu: "આસક્ત પાક (Target Crop) *" },
    { matches: ["ઇતિહાસ લોડ થાય છે...", "Loading history..."], en: "Loading history...", gu: "ઇતિહાસ લોડ થાય છે..." },
    { matches: ["ઈમેલ આઈડી (Email - વૈકલ્પિક)", "Email ID (Email - Optional)"], en: "Email ID (Email - Optional)", gu: "ઈમેલ આઈડી (Email - વૈકલ્પિક)" },
    { matches: ["ઈમેલ સરનામું (Email Address)", "Email Address"], en: "Email Address", gu: "ઈમેલ સરનામું (Email Address)" },
    { matches: ["ઉગતો પાક (Growing)", "Growing Crop"], en: "Growing Crop", gu: "ઉગતો પાક (Growing)" },
    { matches: ["ઉત્પાદન વિગતો (Yield Metrics)", "Yield Metrics"], en: "Yield Metrics", gu: "ઉત્પાદન વિગતો (Yield Metrics)" },
    { matches: ["ઉનાળુ (Summer)", "Summer"], en: "Summer", gu: "ઉનાળુ (Summer)" },
    { matches: ["ઉપચાર (Treatment Measures)", "Treatment Measures"], en: "Treatment Measures", gu: "ઉપચાર (Treatment Measures)" },
    { matches: ["ઉપલબ્ધતા સમય વ્યવસ્થાપન", "Availability Time Management"], en: "Availability Time Management", gu: "ઉપલબ્ધતા સમય વ્યવસ્થાપન" },
    { matches: ["કપાસના ઉંચા ભાવો", "High Cotton Prices"], en: "High Cotton Prices", gu: "કપાસના ઉંચા ભાવો" },
    { matches: ["કૃષિ નિષ્ણાત ખાતાઓ અને પરામર્શનું સંચાલન", "Manage agricultural expert accounts and consultations"], en: "Manage agricultural expert accounts and consultations", gu: "કૃષિ નિષ્ણાત ખાતાઓ અને પરામર્શનું સંચાલન" },
    { matches: ["કૃષિ નિષ્ણાત પ્રવેશ (Expert Login)", "Expert Login"], en: "Expert Login", gu: "કૃષિ નિષ્ણાત પ્રવેશ (Expert Login)" },
    { matches: ["કૃષિ નિષ્ણાત લૉગિન (Expert Portal)", "Expert Login (Expert Portal)"], en: "Expert Login (Expert Portal)", gu: "કૃષિ નિષ્ણાત લૉગિન (Expert Portal)" },
    { matches: ["કૃષિ નિષ્ણાત સેવાઓ", "Agriculture Expert Services"], en: "Agriculture Expert Services", gu: "કૃષિ નિષ્ણાત સેવાઓ" },
    { matches: ["કૃષિ વિજ્ઞાન સલાહકાર સેવાઓ", "Agricultural Science Advisories"], en: "Agricultural Science Advisories", gu: "કૃષિ વિજ્ઞાન સલાહકાર સેવાઓ" },
    { matches: ["કેમેરાથી સીધો ફોટો પણ લઇ શકાય છે (JPEG, PNG)", "Photos can also be taken directly with the camera (JPEG, PNG)"], en: "Photos can also be taken directly with the camera (JPEG, PNG)", gu: "કેમેરાથી સીધો ફોટો પણ લઇ શકાય છે (JPEG, PNG)" },
    { matches: ["ખરીફ (Kharif)", "Kharif"], en: "Kharif", gu: "ખરીફ (Kharif)" },
    { matches: ["ખર્ચ ઉમેરો (Add Expense)", "Add Expense"], en: "Add Expense", gu: "ખર્ચ ઉમેરો (Add Expense)" },
    { matches: ["ખર્ચ તારીખ (Expense Date) *", "Expense Date *"], en: "Expense Date *", gu: "ખર્ચ તારીખ (Expense Date) *" },
    { matches: ["ખર્ચ પ્રકાર", "Expense Type"], en: "Expense Type", gu: "ખર્ચ પ્રકાર" },
    { matches: ["ખર્ચ બ્રેકડાઉન", "Expense Breakdown"], en: "Expense Breakdown", gu: "ખર્ચ બ્રેકડાઉન" },
    { matches: ["ખर्च લિસ્ટ (Expenses)", "Expenses List"], en: "Expenses List", gu: "ખર્ચ લિસ્ટ (Expenses)" },
    { matches: ["ખર્ચ વિગત શોધો...", "Search expenses..."], en: "Search expenses...", gu: "ખર્ચ વિગત શોધો..." },
    { matches: ["ખર્ચ સરવાળો", "Total Expenses"], en: "Total Expenses", gu: "ખર્ચ સરવાળો" },
    { matches: ["ખર્ચની રકમ (Amount) *", "Expense Amount *"], en: "Expense Amount *", gu: "ખર્ચની રકમ (Amount) *" },
    { matches: ["ખર્ચનો પ્રકાર (Expense Type)", "Expense Type"], en: "Expense Type", gu: "ખર્ચનો પ્રકાર (Expense Type)" },
    { matches: ["ખાસ નોંધ (Notes)", "Notes (Optional)"], en: "Notes (Optional)", gu: "ખાસ નોંધ (Notes)" },
    { matches: ["ખેડૂત પ્રોફાઇલ (Active Farmer Session)", "Farmer Profile (Active Session)"], en: "Farmer Profile (Active Session)", gu: "ખેડૂત પ્રોફાઇલ (Active Farmer Session)" },
    { matches: ["ખેડૂત વ્યવસ્થાપન પોર્ટલ પર આપનું સ્વાગત છે", "Welcome to the Farmer Management Portal"], en: "Welcome to the Farmer Management Portal", gu: "ખેડૂત વ્યવસ્થાપન પોર્ટલ પર આપનું સ્વાગત છે" },
    { matches: ["ખેડૂતના પ્રશ્નોની સમીક્ષા કરી સલાહ આપો અને વિગતો તપાસો.", "Review farmer queries, provide advice, and check details."], en: "Review farmer queries, provide advice, and check details.", gu: "ખેડૂતના પ્રશ્નોની સમીક્ષા કરી સલાહ આપો અને વિગતો તપાસો." },
    { matches: ["ખેડૂતો અને કૃષિ નિષ્ણાતોને આર્ટિફિશિયલ ઇન્ટેલિજન્સની તાકાત વડે ડિસિઝન સપોર્ટ આપતી કલ્યાણકારી પ્રણાલી.", "A welfare system providing decision support to farmers and agriculture experts with AI."], en: "A welfare system providing decision support to farmers and agriculture experts with AI.", gu: "ખેડૂતો અને કૃષિ નિષ્ણાતોને આર્ટિફિશિયલ ઇન્ટેલિજન્સની તાકાત વડે ડિસિઝન સપોર્ટ આપતી કલ્યાણકારી પ્રણાલી." },
    { matches: ["ખેડૂતો દ્વારા સબમિટ કરાયેલ કૃષિ સમસ્યાઓની સમીક્ષા કરો અને નિષ્ણાત સલાહ આપો", "Review agricultural issues submitted by farmers and provide expert advice"], en: "Review agricultural issues submitted by farmers and provide expert advice", gu: "ખેડૂતો દ્વારા સબમિટ કરાયેલ કૃષિ સમસ્યાઓની સમીક્ષા કરો અને નિષ્ણાત સલાહ આપો" },
    { matches: ["ખેડૂતોની યાદી", "Farmer List"], en: "Farmer List", gu: "ખેડૂતોની યાદી" },
    { matches: ["ખેતર (Select Farm)", "Select Farm"], en: "Select Farm", gu: "ખેતર (Select Farm)" },
    { matches: ["ખેતર પસંદ કરો", "Select Farm"], en: "Select Farm", gu: "ખેતર પસંદ કરો" },
    { matches: ["ખેતરનું નામ (Farm Name)", "Farm Name"], en: "Farm Name", gu: "ખેતરનું નામ (Farm Name)" },
    { matches: ["ખેતરનું નામ, ગામ અથવા જિલ્લો શોધો...", "Search farm name, village or district..."], en: "Search farm name, village or district...", gu: "ખેતરનું નામ, ગામ અથવા જિલ્લો શોધો..." },
    { matches: ["ખેતી નફો કેલ્ક્યુલેટર (Profit Calculator)", "Profit Calculator"], en: "Profit Calculator", gu: "ખેતી નફો કેલ્ક્યુલેટર (Profit Calculator)" },
    { matches: ["ગામનું નામ", "Village Name"], en: "Village Name", gu: "ગામનું નામ" },
    { matches: ["ગુજરાત ખેતીવાડી હવામાન માહિતી અને લાઈવ અપડેટ્સ", "Gujarat Agricultural Weather Info & Live Updates"], en: "Gujarat Agricultural Weather Info & Live Updates", gu: "ગુજરાત ખેતીવાડી હવામાન માહિતી અને લાઈવ અપડેટ્સ" },
    { matches: ["ગુજરાત માર્કેટ યાર્ડ (APMC) સરકારી એગમાર્કનેટ (AGMARKNET) લાઈવ ભાવો", "Gujarat Market Yards (APMC) Live Govt AGMARKNET Prices"], en: "Gujarat Market Yards (APMC) Live Govt AGMARKNET Prices", gu: "ગુજરાત માર્કેટ યાર્ડ (APMC) સરકારી એગમાર્કનેટ (AGMARKNET) લાઈવ ભાવો" },
    { matches: ["ગુજરાતના ખેડૂતો માટે કેન્દ્રીય અને રાજ્ય સરકારની કલ્યાણકારી યોજનાઓ", "Welfare schemes of Central and State Government for Gujarat farmers"], en: "Welfare schemes of Central and State Government for Gujarat farmers", gu: "ગુજરાતના ખેડૂતો માટે કેન્દ્રીય અને રાજ્ય સરકારની કલ્યાણકારી યોજનાઓ" },
    { matches: ["ગુજરાતના વાતાવરણ અને સોઈલ પ્રોફાઈલ સુસંગત વિકસાવવામાં આવેલી મુખ્ય ટેકનિકલ શાખાઓ", "Core technical modules developed compatible with Gujarat weather & soil profile"], en: "Core technical modules developed compatible with Gujarat weather & soil profile", gu: "ગુજરાતના વાતાવરણ અને સોઈલ પ્રોફાઈલ સુસંગત વિકસાવવામાં આવેલી મુખ્ય ટેકનિકલ શાખાઓ" },
    { matches: ["ગુપ્ત કોડ (Password)", "Password"], en: "Password", gu: "ગુપ્ત કોડ (Password)" },
    { matches: ["ગોંડલ APMC", "Gondal APMC"], en: "Gondal APMC", gu: "ગોંડલ APMC" },
    { matches: ["ચોક્કસ વિગતો (Farm Info)", "Farm Info"], en: "Farm Info", gu: "ચોક્કસ વિગતો (Farm Info)" },
    { matches: ["જંતુનાશક (Pesticide)", "Pesticide"], en: "Pesticide", gu: "જંતુનાશક (Pesticide)" },
    { matches: ["જંતુનાશક (₹)", "Pesticide (₹)"], en: "Pesticide (₹)", gu: "જંતુનાશક (₹)" },
    { matches: ["જથ્થો (kg)", "Quantity (kg)"], en: "Quantity (kg)", gu: "જથ્થો (kg)" },
    { matches: ["જમીન (એકર)", "Land (Acre)"], en: "Land (Acre)", gu: "જમીન (એકર)" },
    { matches: ["જમીન અને હવામાન આધારિત વૈજ્ઞાનિક પાકની ભલામણ", "Soil and weather based scientific crop recommendation"], en: "Soil and weather based scientific crop recommendation", gu: "જમીન અને હવામાન આધારિત વૈજ્ઞાનિક પાકની ભલામણ" },
    { matches: ["જમીનની માહિતી (Specifications)", "Soil Info (Specifications)"], en: "Soil Info (Specifications)", gu: "જમીનની માહિતી (Specifications)" },
    { matches: ["જમીનનું માપ (Total Area)", "Total Land Area"], en: "Total Land Area", gu: "જમીનનું માપ (Total Area)" },
    { matches: ["જમીનનો પ્રકાર (Soil Type)", "Soil Type"], en: "Soil Type", gu: "જમીનનો પ્રકાર (Soil Type)" },
    { matches: ["ઝડપી મદદ અને સાધનો (Quick Actions)", "Quick Actions"], en: "Quick Actions", gu: "ઝડપી મદદ અને સાધનો (Quick Actions)" },
    { matches: ["ટ્રાન્સપોર્ટ (Transportation)", "Transportation"], en: "Transportation", gu: "ટ્રાન્સપોર્ટ (Transportation)" },
    { matches: ["ડેશબોર્ડ પર ઉપલબ્ધ →", "Available on Dashboard →"], en: "Available on Dashboard →", gu: "ડેશબોર્ડ પર ઉપલબ્ધ →" },
    { matches: ["તબક્કો (Status)", "Stage (Status)"], en: "Stage (Status)", gu: "તબક્કો (Status)" },
    { matches: ["તમામ ખેડૂતો જુઓ જેમણે નિષ્ણાત પરામર્શ માટે સંપર્ક કર્યો છે.", "View all farmers who have requested expert consultation."], en: "View all farmers who have requested expert consultation.", gu: "તમામ ખેડૂતો જુઓ જેમણે નિષ્ણાત પરામર્શ માટે સંપર્ક કર્યો છે." },
    { matches: ["તમારા કૃષિ પરામર્શક ઓળખપત્રો જુઓ અને સંચાલિત કરો.", "View and manage your agricultural consultant credentials."], en: "View and manage your agricultural consultant credentials.", gu: "તમારા કૃષિ પરામર્શક ઓળખપત્રો જુઓ અને સંચાલિત કરો." },
    { matches: ["તમારા કૃષિ પ્રશ્નનું વર્ણન કરો અને નિષ્ણાતોની સલાહ મેળવવા માટે ફોટો અપલોડ કરો", "Describe your farming query and upload a photo to get expert advice"], en: "Describe your farming query and upload a photo to get expert advice", gu: "તમારા કૃષિ પ્રશ્નનું વર્ણન કરો અને નિષ્ણાતોની સલાહ મેળવવા માટે ફોટો અપલોડ કરો" },
    { matches: ["તમારા ખેતીના પ્રશ્નો અને સમસ્યાઓના ઉકેલ માટે ગુજરાતના પ્રમાણિત કૃષિ નિષ્ણાતો સાથે જોડાઓ", "Connect with certified agricultural experts in Gujarat to solve your farming queries"], en: "Connect with certified agricultural experts in Gujarat to solve your farming queries", gu: "તમારા ખેતીના પ્રશ્નો અને સમસ્યાઓના ઉકેલ માટે ગુજરાતના પ્રમાણિત કૃષિ નિષ્ણાતો સાથે જોડાઓ" },
    { matches: ["તમારા તમામ પાકની વાવણી, ખર્ચ, તબક્કા અને લણણીના રેકોર્ડનું સંચાન કરો", "Manage your crop sowing, expenses, stage, and harvest records"], en: "Manage your crop sowing, expenses, stage, and harvest records", gu: "તમારા તમામ પાકની વાવણી, ખર્ચ, તબક્કા અને લણણીના રેકોર્ડનું સંચાલન કરો" },
    { matches: ["તમારા તમામ સરવે પ્લોટ્સ અને ખેતરોનું સંચાલન અહીં કરો", "Manage all your survey plots and farms here"], en: "Manage all your survey plots and farms here", gu: "તમારા તમામ સરવે પ્લોટ્સ અને ખેતરોનું સંચાલન અહીં કરો" },
    { matches: ["તમારા પાક પાછળ થતાં કુલ ખર્ચ, વેચાણ અને ચોખ્ખો નફાનું વિશ્લેષણ મેળવો", "Get analysis of your total crop expenses, sales, and net profit"], en: "Get analysis of your total crop expenses, sales, and net profit", gu: "તમારા પાક પાછળ થતાં કુલ ખર્ચ, વેચાણ અને ચોખ્ખો નફાનું વિશ્લેષણ મેળવો" },
    { matches: ["તમારા પાકના પાંદડાનો ફોટો અપલોડ કરી અને ત્વરિત AI રોગ નિદાન મેળવો", "Upload a photo of your crop leaf and get instant AI disease diagnosis"], en: "Upload a photo of your crop leaf and get instant AI disease diagnosis", gu: "તમારા પાકના પાંદડાનો ફોટો અપલોડ કરી અને ત્વરિત AI રોગ નિદાન મેળવો" },
    { matches: ["તમારા સક્રિય પ્રશ્નો અને નિષ્ણાતો દ્વારા આપવામાં આવેલ જવાબોનો ઇતિહાસ જુઓ", "View the history of your active queries and answers from experts"], en: "View the history of your active queries and answers from experts", gu: "તમારા સક્રિય પ્રશ્નો અને નિષ્ણાતો દ્વારા આપવામાં આવેલ જવાબોનો ઇતિહાસ જુઓ" },
    { matches: ["તમારી ઓનલાઇન સ્થિતિ, કામકાજના દિવસો અને સમય સેટ કરો.", "Configure your online status, working days, and schedule."], en: "Configure your online status, working days, and schedule.", gu: "તમારી ઓનલાઇન સ્થિતિ, કામકાજના દિવસો અને સમય સેટ કરો." },
    { matches: ["તમારું પૂરું નામ દાખલ કરો", "Enter your full name"], en: "Enter your full name", gu: "તમારું પૂરું નામ દાખલ કરો" },
    { matches: ["તારીખ", "Date"], en: "Date", gu: "તારીખ" },
    { matches: ["તાલુકાનું નામ", "Taluka Name"], en: "Taluka Name", gu: "તાલુકાનું નામ" },
    { matches: ["તાલુકો", "Taluka"], en: "Taluka", gu: "તાલુકો" },
    { matches: ["નફા કેલ્ક્યુલેટર", "Profit Calculator"], en: "Profit Calculator", gu: "નફા કેલ્ક્યુલેટર" },
    { matches: ["નફાની ગણતરી (Farm Profit Calculator)", "Farm Profit Calculator"], en: "Farm Profit Calculator", gu: "નફાની ગણતરી (Farm Profit Calculator)" },
    { matches: ["નફાની ગણતરી કરો (Profit Calculator)", "Calculate Profit"], en: "Calculate Profit", gu: "નફાની ગણતરી કરો (Profit Calculator)" },
    { matches: ["નફાનો સીમાડો (Profit Margin)", "Profit Margin"], en: "Profit Margin", gu: "નફાનો સીમાડો (Profit Margin)" },
    { matches: ["નવી પ્રવૃત્તિ શરૂ કરવા માટે ઉપર આપેલા બટનોનો ઉપયોગ કરીને ખેતર અથવા નવા પાક ઉમેરો.", "Use the buttons above to add a farm or plant a new crop to start recording activity."], en: "Use the buttons above to add a farm or plant a new crop to start recording activity.", gu: "નવી પ્રવૃત્તિ શરૂ કરવા માટે ઉપર આપેલા બટનોનો ઉપયોગ કરીને ખેતર અથવા નવા પાક ઉમેરો." },
    { matches: ["નવો પ્રશ્ન પૂછો", "Ask New Question"], en: "Ask New Question", gu: "નવો પ્રશ્ન પૂછો" },
    { matches: ["ના (Cancel)", "No (Cancel)"], en: "No (Cancel)", gu: "ના (Cancel)" },
    { matches: ["નિદાન ઇતિહાસ (Diagnosis History)", "Diagnosis History"], en: "Diagnosis History", gu: "નિદાન ઇતિહાસ (Diagnosis History)" },
    { matches: ["નિષ્ણાત ડેશબોર્ડ હબ", "Expert Dashboard Hub"], en: "Expert Dashboard Hub", gu: "નિષ્ણાત ડેશબોર્ડ હબ" },
    { matches: ["નિષ્ણાત તરીકે લોગિન કરો (Login as Expert)", "Login as Expert"], en: "Login as Expert", gu: "નિષ્ણાત તરીકે લોગિન કરો (Login as Expert)" },
    { matches: ["નિષ્ણાત પરામર્શ ઇનબોક્સ", "Expert Consultation Inbox"], en: "Expert Consultation Inbox", gu: "નિષ્ણાત પરામર્શ ઇનબોક્સ" },
    { matches: ["નિષ્ણાત વ્યવસ્થાપન", "Expert Management"], en: "Expert Management", gu: "નિષ્ણાત વ્યવસ્થાપન" },
    { matches: ["નિષ્ણાત વ્યાવસાયિક પ્રોફાઇલ", "Expert Professional Profile"], en: "Expert Professional Profile", gu: "નિષ્ણાત વ્યાવસાયિક પ્રોફાઇલ" },
    { matches: ["ની નોંધ કાઢી નાખવા માંગો છો? આ નિર્ણય પાછો ખેંચી શકાશે નહીં.", "notes will be deleted. This action cannot be undone."], en: "notes will be deleted. This action cannot be undone.", gu: "ની નોંધ કાઢી નાખવા માંગો છો? આ નિર્ણય પાછો ખેંચી શકાશે નહીં." },
    { matches: ["ની વિગતો કાઢી નાખવા માંગો છો? આ નિર્ણય પાછો ખેંચી શકાશે નહીં.", "details will be deleted. This action cannot be undone."], en: "details will be deleted. This action cannot be undone.", gu: "ની વિગતો કાઢી નાખવા માંગો છો? આ નિર્ણય પાછો ખેંચી શકાશે નહીં." },
    { matches: ["નોંધ / માહિતી (Notes)", "Notes / Info"], en: "Notes / Info", gu: "નોંધ / માહિતી (Notes)" },
    { matches: ["પરામર્શ કેન્દ્ર સંચાલન", "Consultation Center Management"], en: "Consultation Center Management", gu: "પરામર્શ કેન્દ્ર સંચાલન" },
    { matches: ["પરામર્શ થ્રેડો અને ટિકિટ સ્થિતિનું નિરીક્ષણ અને સંચાલન કરો", "Monitor and manage consultation threads and ticket status"], en: "Monitor and manage consultation threads and ticket status", gu: "પરામર્શ થ્રેડો અને ટિકિટ સ્થિતિનું નિરીક્ષણ અને સંચાલન કરો" },
    { matches: ["પરિયોજના વિશે (About Project)", "About Project"], en: "About Project", gu: "પરિયોજના વિશે (About Project)" },
    { matches: ["પસંદ કરેલ પાક પર કોઈ રજિસ્ટર્ડ ખર્ચ નથી.", "No expenses registered for the selected crop."], en: "No expenses registered for the selected crop.", gu: "પસંદ કરેલ પાક પર કોઈ રજિસ્ટર્ડ ખર્ચ નથી." },
    { matches: ["પાંદડાનો ફોટો અપલોડ કરો (Leaf Photo)", "Upload Leaf Photo"], en: "Upload Leaf Photo", gu: "પાંદડાનો ફોટો અપલોડ કરો (Leaf Photo)" },
    { matches: ["પાક / જાત", "Crop / Variety"], en: "Crop / Variety", gu: "પાક / જાત" },
    { matches: ["પાક આરોગ્ય (Health)", "Crop Health"], en: "Crop Health", gu: "પાક આરોગ્ય (Health)" },
    { matches: ["પાક ઉમેરતા પહેલાં કૃપા કરીને ઓછામાં ઓછું એક ખેતર ઉમેરો.", "Please add at least one farm before adding a crop."], en: "Please add at least one farm before adding a crop.", gu: "પાક ઉમેરતા પહેલાં કૃપા કરીને ઓછામાં ઓછું એક ખેતર ઉમેરો." },
    { matches: ["પાક ખર્ચ શ્રેણી (Expense Split)", "Crop Expense Split"], en: "Crop Expense Split", gu: "પાક ખર્ચ શ્રેણી (Expense Split)" },
    { matches: ["પાક પસંદ કરો (Select Crop)", "Select Crop"], en: "Select Crop", gu: "પાક પસંદ કરો (Select Crop)" },
    { matches: ["પાક પસંદગી (Select Crop):", "Select Crop:"], en: "Select Crop:", gu: "પાક પસંદગી (Select Crop):" },
    { matches: ["પાક રોગ નિદાન (Crop Disease Diagnosis)", "Crop Disease Diagnosis"], en: "Crop Disease Diagnosis", gu: "પાક રોગ નિદાન (Crop Disease Diagnosis)" },
    { matches: ["પાક વિશે કોઈ ખાસ નોંધ ઉમેરો...", "Add any special notes about the crop..."], en: "Add any special notes about the crop...", gu: "પાક વિશે કોઈ ખાસ નોંધ ઉમેરો..." },
    { matches: ["પાકના જીવાકોની ફોટો સ્કેનિંગ", "Photo scanning of crop pests"], en: "Photo scanning of crop pests", gu: "પાકના જીવાકોની ફોટો સ્કેનિંગ" },
    { matches: ["પાકનું નામ", "Crop Name"], en: "Crop Name", gu: "પાકનું નામ" },
    { matches: ["પાકનું નામ અથવા જાત શોધો...", "Search crop name or variety..."], en: "Search crop name or variety...", gu: "પાકનું નામ અથવા જાત શોધો..." },
    { matches: ["પાકનો ફોટો (Optional Crop Image)", "Crop Photo (Optional)"], en: "Crop Photo (Optional)", gu: "પાકનો ફોટો (Optional Crop Image)" },
    { matches: ["પાનું મળ્યું નથી (Page Not Found)", "Page Not Found"], en: "Page Not Found", gu: "પાનું મળ્યું નથી (Page Not Found)" },
    { matches: ["પાસવર્ડ બદલો (Reset Password)", "Reset Password"], en: "Reset Password", gu: "પાસવર્ડ બદલો (Reset Password)" },
    { matches: ["પાસવર્ડ ભૂલી ગયા છો?", "Forgot Password?"], en: "Forgot Password?", gu: "પાસવર્ડ ભૂલી ગયા છો?" },
    { matches: ["પાસવર્ડમાં ઓછામાં ઓછો ૮ અક્ષર, ૧ કેપિટલ, ૧ સ્મોલ, નંબર અને સ્પેશિયલ કેરેક્ટર હોવો જોઈએ", "Password must have at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character"], en: "Password must have at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character", gu: "પાસવર્ડમાં ઓછામાં ઓછો ૮ અક્ષર, ૧ કેપિટલ, ૧ સ્મોલ, નંબર અને સ્પેશિયલ કેરેક્ટર હોવો જોઈએ" },
    { matches: ["પિયત (Irrigation)", "Irrigation"], en: "Irrigation", gu: "પિયત (Irrigation)" },
    { matches: ["પીન અથવા ગુપ્ત કોડ", "PIN or Password"], en: "PIN or Password", gu: "પીન અથવા ગુપ્ત કોડ" },
    { matches: ["પૂરું નામ (Full Name)", "Full Name"], en: "Full Name", gu: "પૂરું નામ (Full Name)" },
    { matches: ["પ્રતિ ક્વિન્ટલ (Per Quintal)", "Per Quintal"], en: "Per Quintal", gu: "પ્રતિ ક્વિન્ટલ (Per Quintal)" },
    { matches: ["પ્રતિ મણ (Per Man)", "Per Maund"], en: "Per Maund", gu: "પ્રતિ મણ (Per Man)" },
    { matches: ["પ્રવેશ કરો (Login)", "Login"], en: "Login", gu: "પ્રવેશ કરો" },
    { matches: ["પ્રવેશ કરો", "Login"], en: "Login", gu: "પ્રવેશ કરો" },
    { matches: ["ખેડૂત મિત્ર", "Farmer Friend"], en: "Farmer Friend", gu: "ખેડૂત મિત્ર" },
    { matches: ["ગુજરાત ખેડૂત મિત્ર", "Gujarat Farmer Friend"], en: "Gujarat Farmer Friend", gu: "ગુજરાત ખેડૂત મિત્ર" },
    { matches: ["પ્લેટફોર્મની વિશેષતાઓ (Features)", "Platform Features"], en: "Platform Features", gu: "પ્લેટફોર્મની વિશેષતાઓ (Features)" },
    { matches: ["ફરીથી OTP મોકલો (Resend OTP)", "Resend OTP"], en: "Resend OTP", gu: "ફરીથી OTP મોકલો (Resend OTP)" },
    { matches: ["ફરીથી પાસવર્ડ દાખલ કરો", "Re-enter Password"], en: "Re-enter Password", gu: "ફરીથી પાસવર્ડ દાખલ કરો" },
    { matches: ["ફીચર ટૂંક સમયમાં શરૂ થશે", "Feature starting soon"], en: "Feature starting soon", gu: "ફીચર ટૂંક સમયમાં શરૂ થશે" },
    { matches: ["ફોટો અહીં ડ્રેગ એન્ડ ડ્રોપ કરો અથવા", "Drag and drop photo here or"], en: "Drag and drop photo here or", gu: "ફોટો અહીં ડ્રેગ એન્ડ ડ્રોપ કરો અથવા" },
    { matches: ["ફોટો પસંદ કરો", "Select Photo"], en: "Select Photo", gu: "ફોટો પસંદ કરો" },
    { matches: ["બજાર / એપીએમસી (Market Yard / APMC) *", "Market Yard / APMC *"], en: "Market Yard / APMC *", gu: "બજાર / એપીએમસી (Market Yard / APMC) *" },
    { matches: ["બજાર કિંમતો (Market Prices)", "Market Prices"], en: "Market Prices", gu: "બજાર કિંમતો (Market Prices)" },
    { matches: ["બજાર ભાવો", "Market Prices"], en: "Market Prices", gu: "બજાર ભાવો" },
    { matches: ["બજાર ભાવો અપડેટ", "Market Prices Update"], en: "Market Prices Update", gu: "બજાર ભાવો અપડેટ" },
    { matches: ["બધા ખેતર", "All Farms"], en: "All Farms", gu: "બધા ખેતર" },
    { matches: ["બધા જુઓ (View All)", "View All"], en: "View All", gu: "બધા જુઓ (View All)" },
    { matches: ["બધા તબક્કા", "All Stages"], en: "All Stages", gu: "બધા તબક્કા" },
    { matches: ["બધા પ્રકાર (All Categories)", "All Categories"], en: "All Categories", gu: "બધા પ્રકાર (All Categories)" },
    { matches: ["બધા રેકોર્ડ સાફ કરો", "Clear all records"], en: "Clear all records", gu: "બધા રેકોર્ડ સાફ કરો" },
    { matches: ["બધા સક્રિય પાક (All Crops)", "All Active Crops"], en: "All Active Crops", gu: "બધા સક્રિય પાક (All Crops)" },
    { matches: ["બીજ (Seed)", "Seed"], en: "Seed", gu: "બીજ (Seed)" },
    { matches: ["બીજ ખર્ચ (₹)", "Seed Expense (₹)"], en: "Seed Expense (₹)", gu: "બીજ ખર્ચ (₹)" },
    { matches: ["બીજ:", "Seed:"], en: "Seed:", gu: "બીજ:" },
    { matches: ["બીમાર / ચેપી (Diseased)", "Diseased"], en: "Diseased", gu: "બીમાર / ચેપી (Diseased)" },
    { matches: ["બ્રાઉઝ કરો (Browse Image)", "Browse Image"], en: "Browse Image", gu: "બ્રાઉઝ કરો (Browse Image)" },
    { matches: ["ભાવ (₹/kg)", "Price (₹/kg)"], en: "Price (₹/kg)", gu: "ભાવ (₹/kg)" },
    { matches: ["ભૌગોલિક સ્થાન", "Geographical Location"], en: "Geographical Location", gu: "ભૌગોલિક સ્થાન" },
    { matches: ["મજૂરી (Labour)", "Labour"], en: "Labour", gu: "મજૂરી (Labour)" },
    { matches: ["મજૂરી ખર્ચ (₹)", "Labour Expense (₹)"], en: "Labour Expense (₹)", gu: "મજૂરી ખર્ચ (₹)" },
    { matches: ["મજૂરી:", "Labour:"], en: "Labour:", gu: "મજૂરી:" },
    { matches: ["મશીનરી (Machinery)", "Machinery"], en: "Machinery", gu: "મશીનરી (Machinery)" },
    { matches: ["મહત્વની લિંક્સ", "Important Links"], en: "Important Links", gu: "મહત્વની લિંક્સ" },
    { matches: ["માનક ઈમેલ આઈડી દાખલ કરો", "Enter valid email ID"], en: "Enter valid email ID", gu: "માનક ઈમેલ આઈડી દાખલ કરો" },
    { matches: ["મારા ખેતરો", "My Farms"], en: "My Farms", gu: "મારા ખેતરો" },
    { matches: ["મારા ખેતરો (My Farms)", "My Farms"], en: "My Farms", gu: "મારા ખેતરો (My Farms)" },
    { matches: ["મારા પ્રશ્નોનો ઇતિહાસ", "My Query History"], en: "My Query History", gu: "મારા પ્રશ્નોનો ઇતિહાસ" },
    { matches: ["માર્કેટ યાર્ડ", "Market Yard"], en: "Market Yard", gu: "માર્કેટ યાર્ડ" },
    { matches: ["માહિતી લોડ થઈ રહી છે...", "Loading info..."], en: "Loading info...", gu: "માહિતી લોડ થઈ રહી છે..." },
    { matches: ["муખ્ય પૃષ્ઠ પર જાઓ (Go to Home)", "Go to Home"], en: "Go to Home", gu: "મુખ્ય પૃષ્ઠ પર જાઓ (Go to Home)" },
    { matches: ["મુખ્ય વર્ષના પ્રોજેક્ટ તરીકે નિર્મિત,", "Built as a capstone project,"], en: "Built as a capstone project,", gu: "મુખ્ય વર્ષના પ્રોજેક્ટ તરીકે નિર્મિત," },
    { matches: ["મોબાઈલ નંબર (Mobile Number)", "Mobile Number"], en: "Mobile Number", gu: "મોબાઈલ નંબર (Mobile Number)" },
    { matches: ["મોબાઈલ નંબર (Mobile)", "Mobile Number"], en: "Mobile Number", gu: "મોબાઈલ નંબર (Mobile)" },
    { matches: ["મોબાઈલ નંબર દાખલ કરો", "Enter Mobile Number"], en: "Enter Mobile Number", gu: "મોબાઈલ નંબર દાખલ કરો" },
    { matches: ["મોબાઈલ નંબર દાખલ કરો (દા.ત. 9876543210)", "Enter mobile number (e.g. 9876543210)"], en: "Enter mobile number (e.g. 9876543210)", gu: "મોબાઈલ નંબર દાખલ કરો (દા.ત. 9876543210)" },
    { matches: ["યાદ રાખો", "Remember Me"], en: "Remember Me", gu: "યાદ રાખો" },
    { matches: ["યાર્ડ અથવા પાક શોધો...", "Search yard or crop..."], en: "Search yard or crop...", gu: "યાર્ડ અથવા પાક શોધો..." },
    { matches: ["રકમ", "Amount"], en: "Amount", gu: "રકમ" },
    { matches: ["રદ કરો (Cancel)", "Cancel"], en: "Cancel", gu: "રદ કરો (Cancel)" },
    { matches: ["રદ કરો અને કાઢી નાખો", "Cancel and Delete"], en: "Cancel and Delete", gu: "રદ કરો અને કાઢી નાખો" },
    { matches: ["રવિ (Rabi)", "Rabi"], en: "Rabi", gu: "રવિ (Rabi)" },
    { matches: ["રાજ્ય (State)", "State"], en: "State", gu: "રાજ્ય (State)" },
    { matches: ["રાજ્ય અને કેન્દ્ર સરકારની કૃષિ યોજનાઓનું સંચાલન અને અપડેટ કરો", "Manage and update state and central government schemes"], en: "Manage and update state and central government schemes", gu: "રાજ્ય અને કેન્દ્ર સરકારની કૃષિ યોજનાઓનું સંચાલન અને અપડેટ કરો" },
    { matches: ["રાજ્ય કલ્યાણકારી સ્કીમો", "State Welfare Schemes"], en: "State Welfare Schemes", gu: "રાજ્ય કલ્યાણકારી સ્કીમો" },
    { matches: ["રાજ્ય:", "State:"], en: "State:", gu: "રાજ્ય:" },
    { matches: ["રીઅલ-ટાઇમ પ્રદર્શન મોનિટરિંગ, ક્વેરી ટેલિમેટ્રી અને સિસ્ટમ-વ્યાપી પ્રવૃત્તિ લૉગ્સ", "Real-time performance monitoring, query telemetry, and system activity logs"], en: "Real-time performance monitoring, query telemetry, and system activity logs", gu: "રીઅલ-ટાઇમ પ્રદર્શન મોનિટરિંગ, ક્વેરી ટેલિમેટ્રી અને સિસ્ટમ-વ્યાપી પ્રવૃત્તિ લૉગ્સ" },
    { matches: ["રેખરેખ હેઠળ (Monitored)", "Monitored"], en: "Monitored", gu: "રેખરેખ હેઠળ (Monitored)" },
    { matches: ["રોકાણ ખર્ચ (Investments Breakdown)", "Expense Breakdown"], en: "Expense Breakdown", gu: "રોકાણ ખર્ચ (Investments Breakdown)" },
    { matches: ["રોગ નિદાન", "Disease Detection"], en: "Disease Detection", gu: "રોગ નિદાન" },
    { matches: ["રોગ શોધો (Run Diagnosis)", "Run Diagnosis"], en: "Run Diagnosis", gu: "રોગ શોધો (Run Diagnosis)" },
    { matches: ["લણણી બાદ", "Post Harvest"], en: "Post Harvest", gu: "લણણી બાદ" },
    { matches: ["લણેલો પાક (Harvested)", "Harvested"], en: "Harvested", gu: "લણેલો પાક (Harvested)" },
    { matches: ["લાલ નહિ - તંદુરસ્ત (Healthy)", "Healthy"], en: "Healthy", gu: "લાલ નહિ - તંદુરસ્ત (Healthy)" },
    { matches: ["લોડ થઈ રહ્યું છે...", "Loading..."], en: "Loading...", gu: "લોડ થઈ રહ્યું છે..." },
    { matches: ["વપરાશકર્તા નામ (Username)", "Username"], en: "Username", gu: "વપરાશકર્તા નામ (Username)" },
    { matches: ["વપરાશકર્તા લાયસન્સ", "User License"], en: "User License", gu: "વપરાશકર્તા લાયસન્સ" },
    { matches: ["વર્ગ સંભાવના વિશ્લેષણ (Model Class Probabilities)", "Model Class Probabilities"], en: "Model Class Probabilities", gu: "વર્ગ સંભાવના વિશ્લેષણ (Model Class Probabilities)" },
    { matches: ["વહીવટી લૉગિન (Admin)", "Admin Login"], en: "Admin Login", gu: "વહીવટી લૉગિન (Admin)" },
    { matches: ["વાવણી ખર્ચ, ખાતર, દવા અને મજૂરી ખર્ચની સામે મળનારી આવક અને નફાની ગણતરી.", "Calculation of income and profit against sowing cost, fertilizer, medicine, and labor cost."], en: "Calculation of income and profit against sowing cost, fertilizer, medicine, and labor cost.", gu: "વાવણી ખર્ચ, ખાતર, દવા અને મજૂરી ખર્ચની સામે મળનારી આવક અને નફાની ગણતરી." },
    { matches: ["વાવણી તારીખ", "Sowing Date"], en: "Sowing Date", gu: "વાવણી તારીખ" },
    { matches: ["વાવણી વિસ્તાર", "Sowing Area"], en: "Sowing Area", gu: "વાવણી વિસ્તાર" },
    { matches: ["વાવણી:", "Sowing Date:"], en: "Sowing Date:", gu: "વાવણી:" },
    { matches: ["વાવેતર કરેલ (Sown)", "Sown"], en: "Sown", gu: "વાવેતર કરેલ (Sown)" },
    { matches: ["વાવેતર પાક", "Sown Crops"], en: "Sown Crops", gu: "વાવેતર પાક" },
    { matches: ["વાવેતર વિસ્તાર", "Sown Area"], en: "Sown Area", gu: "વાવેતર વિસ્તાર" },
    { matches: ["વાસ્તવિક ઉત્પાદન (મણ)", "Actual Yield (Maund)"], en: "Actual Yield (Maund)", gu: "વાસ્તવિક ઉત્પાદન (મણ)" },
    { matches: ["વાસ્તવિક ઉત્પાદન:", "Actual Yield:"], en: "Actual Yield:", gu: "વાસ્તવિક ઉત્પાદન:" },
    { matches: ["વાસ્તવિક લણણી તારીખ (જો થઈ હોય)", "Actual Harvest Date (if completed)"], en: "Actual Harvest Date (if completed)", gu: "વાસ્તવિક લણણી તારીખ (જો થઈ હોય)" },
    { matches: ["વાસ્તવિક લણણી:", "Actual Harvest:"], en: "Actual Harvest:", gu: "વાસ્તવિક લણણી:" },
    { matches: ["વિશ્લેષણ પરિણામ (Diagnostic Analysis Result)", "Diagnostic Result"], en: "Diagnostic Result", gu: "વિશ્લેષણ પરિણામ (Diagnostic Analysis Result)" },
    { matches: ["વિશ્વાસ સ્તર (Confidence):", "Confidence:"], en: "Confidence:", gu: "વિશ્વાસ સ્તર (Confidence):" },
    { matches: ["Safe Delete Confirm", "Confirm Deletion"], en: "Confirm Deletion", gu: "કાઢી નાખવાની ખાતરી કરો" },
    { matches: ["વેચાણ ઉમેરો (Add Sale)", "Add Sale"], en: "Add Sale", gu: "વેચાણ ઉમેરો (Add Sale)" },
    { matches: ["વેચાણ કિંમત (₹ પ્રતિ મણ)", "Sale Price (₹ per Maund)"], en: "Sale Price (₹ per Maund)", gu: "વેચાણ કિંમત (₹ પ્રતિ મણ)" },
    { matches: ["વેચાણ કિંમત:", "Sale Price:"], en: "Sale Price:", gu: "વેચાણ કિંમત:" },
    { matches: ["વેચાણ તારીખ (Sale Date) *", "Sale Date *"], en: "Sale Date *", gu: "વેચાણ તારીખ (Sale Date) *" },
    { matches: ["... વેચાણ લિસ્ટ (Sales)", "Sales List"], en: "Sales List", gu: "વેચાણ લિસ્ટ (Sales)" },
    { matches: ["વેચાણ લિસ્ટ (Sales)", "Sales List"], en: "Sales List", gu: "વેચાણ લિસ્ટ (Sales)" },
    { matches: ["વેચાયેલ (Sold)", "Sold"], en: "Sold", gu: "વેચાયેલ (Sold)" },
    { matches: ["વેચેલ જથ્થો:", "Sold Quantity:"], en: "Sold Quantity:", gu: "વેચેલ જથ્થો:" },
    { matches: ["વેચેલો જથ્થો (Quantity in kg) *", "Sold Quantity (kg) *"], en: "Sold Quantity (kg) *", gu: "વેચેલો જથ્થો (Quantity in kg) *" },
    { matches: ["વેચેલો જથ્થો (મણ)", "Sold Quantity (Maund)"], en: "Sold Quantity (Maund)", gu: "વેચેલો જથ્થો (મણ)" },
    { matches: ["વ્યક્તિગત વિગતો, સુરક્ષા ઓળખપત્રો અને પસંદગીઓનું સંચાલન કરો.", "Manage personal details, security credentials, and preferences."], en: "Manage personal details, security credentials, and preferences.", gu: "વ્યક્તિગત વિગતો, સુરક્ષા ઓળખપત્રો અને પસંદગીઓનું સંચાલન કરો." },
    { matches: ["શા માટે ફાર્મવર્સ એ.આઈ.?", "Why FarmVerse AI?"], en: "Why FarmVerse AI?", gu: "શા માટે ફાર્મવર્સ એ.આઈ.?" },
    { matches: ["શું તમે ખરેખર ખેતર", "Are you sure you want to delete the farm"], en: "Are you sure you want to delete the farm", gu: "શું તમે ખરેખર ખેતર" },
    { matches: ["શું તમે ખરેખર પાકનો રેકોર્ડ", "Are you sure you want to delete the crop record"], en: "Are you sure you want to delete the crop record", gu: "શું તમે ખરેખર પાકનો રેકોર્ડ" },
    { matches: ["શ્રેષ્ઠ બજાર", "Best Market"], en: "Best Market", gu: "શ્રેષ્ઠ બજાર" },
    { matches: ["સક્રિય પાકો (Active Crops)", "Active Crops"], en: "Active Crops", gu: "સક્રિય પાકો (Active Crops)" },
    { matches: ["સન્ની અને સૂકી હવા", "Sunny and dry weather"], en: "Sunny and dry weather", gu: "સન્ની અને સૂકી હવા" },
    { matches: ["સમયરેખા (Timeline)", "Timeline"], en: "Timeline", gu: "સમયરેખા (Timeline)" },
    { matches: ["સરકારી યોજનાઓ (Government Schemes)", "Government Schemes"], en: "Government Schemes", gu: "સરકારી યોજનાઓ (Government Schemes)" },
    { matches: ["સરકારી યોજનાઓ વ્યવસ્થાપન", "Government Schemes Management"], en: "Government Schemes Management", gu: "સરકારી યોજનાઓ વ્યવસ્થાપન" },
    { matches: ["સાચવો (Save)", "Save"], en: "Save", gu: "સાચવો (Save)" },
    { matches: ["સિંચાઈ પદ્ધતિ", "Irrigation Type"], en: "Irrigation Type", gu: "સિંચાઈ પદ્ધતિ" },
    { matches: ["સિંચાઈ પદ્ધતિ (Irrigation Type)", "Irrigation Type"], en: "Irrigation Type", gu: "સિંચાઈ પદ્ધતિ (Irrigation Type)" },
    { matches: ["સિંચાઈ પદ્ધતિ:", "Irrigation Type:"], en: "Irrigation Type:", gu: "સિંચાઈ પદ્ધતિ:" },
    { matches: ["સિસ્ટમ ઓવરરાઇડ અને વહીવટી પ્રવેશ", "System Override & Admin Access"], en: "System Override & Admin Access", gu: "સિસ્ટમ ઓવરરાઇડ અને વહીવટી પ્રવેશ" },
    { matches: ["સિસ્ટમ ટેલિમેટ્રી અને એનાલિટિક્સ", "System Telemetry & Analytics"], en: "System Telemetry & Analytics", gu: "સિસ્ટમ ટેલિમેટ્રી અને એનાલિટિક્સ" },
    { matches: ["સિસ્ટમ વહીવટકર્તા (Admin Portal)", "Admin Portal"], en: "Admin Portal", gu: "સિસ્ટમ વહીવટકર્તા (Admin Portal)" },
    { matches: ["સુધારો કરો", "Edit"], en: "Edit", gu: "સુધારો કરો" },
    { matches: ["સુધારો કરો (Edit)", "Edit"], en: "Edit", gu: "સુધારો કરો (Edit)" },
    { matches: ["સુરક્ષિત પ્રવેશ કરો (Secure Login)", "Secure Login"], en: "Secure Login", gu: "સુરક્ષિત પ્રવેશ કરો (Secure Login)" },
    { matches: ["સૂચનાઓ (Notifications)", "Notifications"], en: "Notifications", gu: "સૂચનાઓ (Notifications)" },
    { matches: ["સેકન્ડરી ફાર્મિંગ ડિસિઝન સપોર્ટ પ્લેટફોર્મ", "Secondary Farming Decision Support Platform"], en: "Secondary Farming Decision Support Platform", gu: "સેકન્ડરી ફાર્મિંગ ડિસિઝન સપોર્ટ પ્લેટફોર્મ" },
    { matches: ["સોઈલ હેલ્થ કાર્ડ પાક ભલામણ", "Soil Health Card Crop Recommendation"], en: "Soil Health Card Crop Recommendation", gu: "સોઈલ હેલ્થ કાર્ડ પાક ભલામણ" },
    { matches: ["સ્પષ્ટીકરણ / નોંધ (Description)", "Description / Notes"], en: "Description / Notes", gu: "સ્પષ્ટીકરણ / નોંધ (Description)" },
    { matches: ["સ્વાસ્થ્ય તબક્કો (Health)", "Health Status"], en: "Health Status", gu: "સ્વાસ્થ્ય તબક્કો (Health)" },
    { matches: ["હજુ કોઈ રોગ નિદાન કરવામાં આવ્યું નથી", "No disease diagnosis has been run yet"], en: "No disease diagnosis has been run yet", gu: "હજુ કોઈ રોગ નિદાન કરવામાં આવ્યું નથી" },
    { matches: ["હવામાનની આગાહી (Weather Forecast)", "Weather Forecast"], en: "Weather Forecast", gu: "હવામાનની આગાહી (Weather Forecast)" },
    { matches: ["હા, કાઢી નાખો", "Yes, Delete"], en: "Yes, Delete", gu: "હા, કાઢી નાખો" },
    { matches: ["હા, કાઢી નાખો (Delete)", "Yes, Delete"], en: "Yes, Delete", gu: "હા, કાઢી નાખો (Delete)" },
    { matches: ["હાલની હલચલ (Recent Activities)", "Recent Activities"], en: "Recent Activities", gu: "હાલની હલચલ (Recent Activities)" },
    { matches: ["હું નિયમો અને શરતોનો સ્વીકાર કરું છું (Accept Terms & Conditions)", "I accept the Terms & Conditions"], en: "I accept the Terms & Conditions", gu: "હું નિયમો અને શરતોનો સ્વીકાર કરું છું (Accept Terms & Conditions)" },
    { matches: ["હેક્ટર (Hectare)", "Hectare"], en: "Hectare", gu: "હેક્ટર (Hectare)" },
    { matches: ["૧. નવું રોગ નિદાન વિશ્લેષણ (New Diagnosis)", "1. Run New Diagnosis"], en: "1. Run New Diagnosis", gu: "૧. નવું રોગ નિદાન વિશ્લેષણ (New Diagnosis)" },
    { matches: ["૧૦ આંકડાનો નંબર", "10-digit number"], en: "10-digit number", gu: "૧૦ આંકડાનો નંબર" },
    { matches: ["૧૦ મિનિટ પહેલા", "10 minutes ago"], en: "10 minutes ago", gu: "૧૦ મિનિટ પહેલા" },
    { matches: ["૨ કલાક પહેલા", "2 hours ago"], en: "2 hours ago", gu: "૨ કલાક પહેલા" },
    { matches: ["૩૨°C", "32°C"], en: "32°C", gu: "૩૨°C" },
    { matches: ["🌤 Weather Bulletin", "🌤 Weather Bulletin"], en: "🌤 Weather Bulletin", gu: "🌤 Weather Bulletin" },
    { matches: ["🌤 હવામાન વિભાગ (Live Weather)", "🌤 Live Weather"], en: "🌤 Live Weather", gu: "🌤 Live Weather" },
    { matches: ["🌾 Crop Recommendation Center", "🌾 Crop Recommendation Center"], en: "🌾 Crop Recommendation Center", gu: "🌾 Crop Recommendation Center" },
    { matches: ["🌾 પાક ભલામણ કેન્દ્ર (Crop Recommendation)", "🌾 Crop Recommendation Center"], en: "🌾 Crop Recommendation Center", gu: "🌾 પાક ભલામણ કેન્દ્ર (Crop Recommendation)" },
    { matches: ["🏛 Government Schemes", "🏛 Government Schemes"], en: "🏛 Government Schemes", gu: "🏛 Government Schemes" },
    { matches: ["🏛 સરકારી યોજનાઓ (Government Schemes)", "🏛 Government Schemes"], en: "🏛 Government Schemes", gu: "🏛 સરકારી યોજનાઓ (Government Schemes)" },
    { matches: ["📈 Live Market Prices", "📈 Live Market Prices"], en: "📈 Live Market Prices", gu: "📈 Live Market Prices" },
    { matches: ["📈 લાઈવ બજાર ભાવો (Live Market Prices)", "📈 Live Market Prices"], en: "📈 Live Market Prices", gu: "📈 લાઈવ બજાર ભાવો (Live Market Prices)" }
];

const prefixTranslations = [
    { matches: ["ખેડૂત સત્ર", "Farmer Live", "ખેડૂત પેનલ"], en: "Farmer Workspace: ", gu: "ખેડૂત સત્ર: " },
    { matches: ["ખેતરનું નામ:", "Farm Name:"], en: "Farm Name: ", gu: "ખેતરનું નામ: " },
    { matches: ["ગામ:", "Village:"], en: "Village: ", gu: "ગામ: " },
    { matches: ["તાલુકો:", "Taluka:"], en: "Taluka: ", gu: "તાલુકો: " },
    { matches: ["જિલ્લો:", "District:"], en: "District: ", gu: "જિલ્લો: " },
    { matches: ["જમીનનો પ્રકાર:", "Soil Type:"], en: "Soil Type: ", gu: "જમીનનો પ્રકાર: " },
    { matches: ["કુલ ક્ષેત્રફળ:", "Total Area:"], en: "Total Area: ", gu: "કુલ ક્ષેત્રફળ: " },
    { matches: ["ચોખ્ખો નફો:", "Net Profit:"], en: "Net Profit: ", gu: "ચોખ્ખો નફો: " },
    { matches: ["કુલ નફો:", "Total Profit:"], en: "Total Profit: ", gu: "કુલ નફો: " },
    { matches: ["કુલ ખર્ચ:", "Total Expenses:"], en: "Total Expenses: ", gu: "કુલ ખર્ચ: " },
    { matches: ["અંદાજિત લણણી:", "Estimated Harvest:"], en: "Estimated Harvest: ", gu: "અંદાજિત લણણી: " },
    { matches: ["અંદાજિત ઉત્પાદન:", "Estimated Yield:"], en: "Estimated Yield: ", gu: "અંદાજિત ઉત્પાદન: " }
];

// Helper to translate single text node or attribute value
export function translateText(text, targetLang) {
    if (!text) return text;
    const trimmed = text.trim();
    if (!trimmed) return text;

    // 1. Direct match in dictionary
    for (const entry of exactTranslations) {
        if (entry.matches.some(m => m.toLowerCase() === trimmed.toLowerCase())) {
            return targetLang === 'en' ? entry.en : entry.gu;
        }
    }

    // 2. Dynamic bilingual split match (e.g. "Dashboard (મુખ્ય વિભાગ)")
    const split = splitBilingual(trimmed);
    if (split) {
        return targetLang === 'en' ? split.en : split.gu;
    }

    // 3. Prefix/Substring replacements
    for (const entry of prefixTranslations) {
        for (const matchStr of entry.matches) {
            if (trimmed.toLowerCase().startsWith(matchStr.toLowerCase())) {
                const replacement = targetLang === 'en' ? entry.en : entry.gu;
                const rest = trimmed.slice(matchStr.length);
                return replacement + rest;
            }
        }
    }

    return text;
}

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'gu'; // Default to gu (Gujarati)
    });

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    // Run dynamic DOM translation whenever the language state changes or new elements render
    useEffect(() => {
        let isTranslating = false;
        let observer = null;

        const walkAndTranslate = () => {
            if (isTranslating) return;
            isTranslating = true;

            try {
                if (observer) {
                    observer.disconnect();
                }

                const walk = document.createTreeWalker(
                    document.getElementById('root') || document.body,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                );

                let node;
                while ((node = walk.nextNode())) {
                    const val = node.nodeValue;
                    if (val) {
                        const trimmed = val.trim();
                        if (trimmed) {
                            const translated = translateText(trimmed, language);
                            if (translated !== trimmed) {
                                const leading = val.match(/^\s*/)[0];
                                const trailing = val.match(/\s*$/)[0];
                                node.nodeValue = leading + translated + trailing;
                            }
                        }
                    }
                }

                // Translate placeholders & titles
                const elementsToTranslate = [
                    { selector: 'input[placeholder], textarea[placeholder]', attr: 'placeholder' },
                    { selector: '[title]', attr: 'title' },
                    { selector: 'input[type="submit"], input[type="button"]', attr: 'value' }
                ];

                elementsToTranslate.forEach(({ selector, attr }) => {
                    document.querySelectorAll(selector).forEach(el => {
                        const val = el.getAttribute(attr);
                        if (val) {
                            const trimmed = val.trim();
                            const translated = translateText(trimmed, language);
                            if (translated !== trimmed) {
                                el.setAttribute(attr, translated);
                            }
                        }
                    });
                });
            } catch (err) {
                console.error("DOM translation error:", err);
            } finally {
                isTranslating = false;
                if (observer) {
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true,
                        characterData: true
                    });
                }
            }
        };

        // Setup MutationObserver to watch for dynamic DOM updates (React renders, API loads, modals, etc.)
        observer = new MutationObserver((mutations) => {
            let shouldTranslate = false;
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    shouldTranslate = true;
                    break;
                }
                if (mutation.type === 'characterData') {
                    // Check if node value actually changed to something untranslated
                    const node = mutation.target;
                    const val = node.nodeValue;
                    if (val) {
                        const trimmed = val.trim();
                        const expected = translateText(trimmed, language);
                        if (expected !== trimmed) {
                            shouldTranslate = true;
                            break;
                        }
                    }
                }
            }
            if (shouldTranslate) {
                walkAndTranslate();
            }
        });

        // Initial translation
        walkAndTranslate();

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        return () => {
            if (observer) {
                observer.disconnect();
            }
        };
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t: (txt) => translateText(txt, language) }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
