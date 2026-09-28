const { useState, useEffect } = React;

const API_BASE = '/api';

// ═══════════════════════════════════════════════════════════
// 🌐 LANGUAGE SUPPORT
// ═══════════════════════════════════════════════════════════
const LANGUAGES = {
    hi: { name: 'हिंदी', code: 'hi', flag: '🇮🇳' },
    en: { name: 'English', code: 'en', flag: '🇬🇧' },
    pa: { name: 'ਪੰਜਾਬੀ', code: 'pa', flag: '🇮🇳' },
    bn: { name: 'বাংলা', code: 'bn', flag: '🇮🇳' },
    ta: { name: 'தமிழ்', code: 'ta', flag: '🇮🇳' },
    te: { name: 'తెలుగు', code: 'te', flag: '🇮🇳' },
    mr: { name: 'मराठी', code: 'mr', flag: '🇮🇳' },
};

const SPEECH_LOCALES = {
    hi: 'hi-IN', en: 'en-IN', pa: 'pa-IN', bn: 'bn-IN',
    ta: 'ta-IN', te: 'te-IN', mr: 'mr-IN'
};

// ─── FALLBACK DOCUMENTS ───
const DEFAULT_DOCUMENTS = [
    { name: 'Aadhaar Card', required_by_schemes: 65 },
    { name: 'PAN Card', required_by_schemes: 60 },
    { name: 'Bank Account Passbook', required_by_schemes: 55 },
    { name: 'Address Proof', required_by_schemes: 50 },
    { name: 'Passport Size Photograph', required_by_schemes: 48 },
    { name: 'Caste Certificate', required_by_schemes: 35 },
    { name: 'Income Certificate', required_by_schemes: 30 },
    { name: 'Business Registration / Udyam Certificate', required_by_schemes: 25 },
    { name: 'Educational Qualification Certificate', required_by_schemes: 20 },
    { name: 'GST Registration Certificate', required_by_schemes: 15 },
];

// ═══════════════════════════════════════════════════════════
// 🌐 MULTILINGUAL LOCAL RAG TEMPLATES (7 languages)
// ═══════════════════════════════════════════════════════════
const LOCAL_RAG_TEMPLATES = {
    hi: {
        noData: "कृपया पहले अपनी प्रोफाइल भरें और योजनाएं खोजें।",
        topSchemes: (n) => `आपकी प्रोफाइल के लिए शीर्ष ${n} योजनाएं:`,
        schemeMatch: (name, pct) => `${name} — ${pct}% मैच`,
        bestScheme: (name, pct) => `🏆 सर्वश्रेष्ठ: "${name}" (${pct}% मैच)`,
        bestSingle: (name, pct, status) => `आपके लिए सर्वश्रेष्ठ योजना: "${name}" (${pct}% मैच, ${status})।`,
        provides: (name, a) => `"${name}" प्रदान करता है: ${a}`,
        yourMatch: (pct, status) => `✅ आपका मैच: ${pct}% (${status})`,
        documents: (name, list) => `"${name}" के लिए आवश्यक दस्तावेज़:\n${list}`,
        commonDocs: "सामान्य दस्तावेज़: आधार कार्ड, पैन कार्ड, बैंक पासबुक, पता प्रमाण, पासपोर्ट फोटो",
        applySteps: (name, steps, source) => `"${name}" के लिए आवेदन करने के चरण:\n\n${steps}${source ? `\n\n🔗 ऑनलाइन आवेदन: ${source}` : ''}`,
        applyAt: (name, source) => `"${name}" के लिए आवेदन करें: ${source || 'आधिकारिक पोर्टल'}`,
        benefits: (name, list) => `"${name}" के लाभ:\n${list}`,
        offers: (name, a) => `"${name}" प्रदान करता है: ${a}`,
        status: (name, status, pct) => `"${name}" — स्थिति: ${status} (${pct}% मैच)`,
        whyMatch: "✅ आप क्यों मैच करते हैं:",
        note: "⚠️ ध्यान दें:",
        bestForCategory: (name, pct) => `"${name}" आपकी श्रेणी के लिए सर्वश्रेष्ठ है (${pct}% मैच)।`,
        supportsCategory: (name, pct) => `"${name}" आपकी श्रेणी का समर्थन करता है। मैच: ${pct}%।`,
        aboutScheme: (name, m, pct, status, a, desc) => `"${name}"\n🏛️ ${m}\n📊 मैच: ${pct}% (${status})\n💰 ${a}\n\n${desc}`,
        default: (name, pct, a) => `"${name}" — आपका सर्वश्रेष्ठ मैच (${pct}%)\n💰 ${a}\n\nआप पूछ सकते हैं:\n• लाभ\n• दस्तावेज़\n• आवेदन कैसे करें\n• पात्रता`,
        tryThese: ["मेरे लिए सबसे अच्छी योजना?", "कितनी वित्तीय सहायता?", "कौन से दस्तावेज़ चाहिए?", "SC श्रेणी के लिए योजना?"],
        recording: "🔴 रिकॉर्डिंग... अब बोलें",
        tap: "टैप",
        typeQuestion: "अपना प्रश्न टाइप करें...",
        ask: "पूछें",
        answer: "उत्तर",
        speak: "बोलें",
        stop: "रोकें",
    },
    en: {
        noData: "Please complete your profile first and search for schemes.",
        topSchemes: (n) => `Top ${n} schemes for your profile:`,
        schemeMatch: (name, pct) => `${name} — ${pct}% match`,
        bestScheme: (name, pct) => `🏆 Best: "${name}" (${pct}% match)`,
        bestSingle: (name, pct, status) => `Best scheme for you: "${name}" (${pct}% match, ${status}).`,
        provides: (name, a) => `"${name}" provides: ${a}`,
        yourMatch: (pct, status) => `✅ Your match: ${pct}% (${status})`,
        documents: (name, list) => `Documents required for "${name}":\n${list}`,
        commonDocs: "Common documents: Aadhaar Card, PAN Card, Bank Passbook, Address Proof, Passport Photo",
        applySteps: (name, steps, source) => `Steps to apply for "${name}":\n\n${steps}${source ? `\n\n🔗 Apply Online: ${source}` : ''}`,
        applyAt: (name, source) => `Apply for "${name}" at: ${source || 'official portal'}`,
        benefits: (name, list) => `Benefits of "${name}":\n${list}`,
        offers: (name, a) => `"${name}" offers: ${a}`,
        status: (name, status, pct) => `"${name}" — Status: ${status} (${pct}% match)`,
        whyMatch: "✅ Why you match:",
        note: "⚠️ Note:",
        bestForCategory: (name, pct) => `"${name}" is best for your category (${pct}% match).`,
        supportsCategory: (name, pct) => `"${name}" supports your category. Match: ${pct}%.`,
        aboutScheme: (name, m, pct, status, a, desc) => `"${name}"\n🏛️ ${m}\n📊 Match: ${pct}% (${status})\n💰 ${a}\n\n${desc}`,
        default: (name, pct, a) => `"${name}" — Your best match (${pct}%)\n💰 ${a}\n\nYou can ask about:\n• Benefits\n• Documents\n• How to apply\n• Eligibility`,
        tryThese: ["Best scheme for me?", "How much financial help?", "What documents needed?", "SC category scheme?"],
        recording: "🔴 Recording... Speak now",
        tap: "Tap",
        typeQuestion: "Type your question...",
        ask: "Ask",
        answer: "Answer",
        speak: "Speak",
        stop: "Stop",
    },
    pa: {
        noData: "ਕਿਰਪਾ ਕਰਕੇ ਪਹਿਲਾਂ ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਭਰੋ ਅਤੇ ਸਕੀਮਾਂ ਲੱਭੋ।",
        topSchemes: (n) => `ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ ਲਈ ਚੋਟੀ ਦੀਆਂ ${n} ਸਕੀਮਾਂ:`,
        schemeMatch: (name, pct) => `${name} — ${pct}% ਮੈਚ`,
        bestScheme: (name, pct) => `🏆 ਸਭ ਤੋਂ ਵਧੀਆ: "${name}" (${pct}% ਮੈਚ)`,
        bestSingle: (name, pct, status) => `ਤੁਹਾਡੇ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਸਕੀਮ: "${name}" (${pct}% ਮੈਚ, ${status})।`,
        provides: (name, a) => `"${name}" ਪ੍ਰਦਾਨ ਕਰਦੀ ਹੈ: ${a}`,
        yourMatch: (pct, status) => `✅ ਤੁਹਾਡਾ ਮੈਚ: ${pct}% (${status})`,
        documents: (name, list) => `"${name}" ਲਈ ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼:\n${list}`,
        commonDocs: "ਆਮ ਦਸਤਾਵੇਜ਼: ਆਧਾਰ ਕਾਰਡ, ਪੈਨ ਕਾਰਡ, ਬੈਂਕ ਪਾਸਬੁੱਕ, ਪਤਾ ਪਰੂਫ, ਪਾਸਪੋਰਟ ਫੋਟੋ",
        applySteps: (name, steps, source) => `"${name}" ਲਈ ਅਰਜ਼ੀ ਦੇਣ ਦੇ ਕਦਮ:\n\n${steps}${source ? `\n\n🔗 ਆਨਲਾਈਨ ਅਰਜ਼ੀ: ${source}` : ''}`,
        applyAt: (name, source) => `"${name}" ਲਈ ਅਰਜ਼ੀ ਦਿਓ: ${source || 'ਅਧਿਕਾਰਤ ਪੋਰਟਲ'}`,
        benefits: (name, list) => `"${name}" ਦੇ ਲਾਭ:\n${list}`,
        offers: (name, a) => `"${name}" ਪ੍ਰਦਾਨ ਕਰਦੀ ਹੈ: ${a}`,
        status: (name, status, pct) => `"${name}" — ਸਥਿਤੀ: ${status} (${pct}% ਮੈਚ)`,
        whyMatch: "✅ ਤੁਸੀਂ ਕਿਉਂ ਮੈਚ ਕਰਦੇ ਹੋ:",
        note: "⚠️ ਨੋਟ:",
        bestForCategory: (name, pct) => `"${name}" ਤੁਹਾਡੀ ਸ਼੍ਰੇਣੀ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਹੈ (${pct}% ਮੈਚ)।`,
        supportsCategory: (name, pct) => `"${name}" ਤੁਹਾਡੀ ਸ਼੍ਰੇਣੀ ਦਾ ਸਮਰਥਨ ਕਰਦੀ ਹੈ। ਮੈਚ: ${pct}%।`,
        aboutScheme: (name, m, pct, status, a, desc) => `"${name}"\n🏛️ ${m}\n📊 ਮੈਚ: ${pct}% (${status})\n💰 ${a}\n\n${desc}`,
        default: (name, pct, a) => `"${name}" — ਤੁਹਾਡਾ ਸਭ ਤੋਂ ਵਧੀਆ ਮੈਚ (${pct}%)\n💰 ${a}\n\nਤੁਸੀਂ ਪੁੱਛ ਸਕਦੇ ਹੋ:\n• ਲਾਭ\n• ਦਸਤਾਵੇਜ਼\n• ਅਰਜ਼ੀ ਕਿਵੇਂ ਦੇਣੀ ਹੈ\n• ਯੋਗਤਾ`,
        tryThese: ["ਮੇਰੇ ਲਈ ਵਧੀਆ ਸਕੀਮ?", "ਕਿੰਨੀ ਵਿੱਤੀ ਸਹਾਇਤਾ?", "ਕਿਹੜੇ ਦਸਤਾਵੇਜ਼ ਚਾਹੀਦੇ?", "SC ਸ਼੍ਰੇਣੀ ਲਈ ਸਕੀਮ?"],
        recording: "🔴 ਰਿਕਾਰਡਿੰਗ... ਹੁਣ ਬੋਲੋ",
        tap: "ਟੈਪ",
        typeQuestion: "ਆਪਣਾ ਸਵਾਲ ਟਾਈਪ ਕਰੋ...",
        ask: "ਪੁੱਛੋ",
        answer: "ਜਵਾਬ",
        speak: "ਬੋਲੋ",
        stop: "ਰੋਕੋ",
    },
    bn: {
        noData: "অনুগ্রহ করে প্রথমে আপনার প্রোফাইল পূরণ করুন এবং স্কিম খুঁজুন।",
        topSchemes: (n) => `আপনার প্রোফাইলের জন্য শীর্ষ ${n}টি স্কিম:`,
        schemeMatch: (name, pct) => `${name} — ${pct}% মিল`,
        bestScheme: (name, pct) => `🏆 সেরা: "${name}" (${pct}% মিল)`,
        bestSingle: (name, pct, status) => `আপনার জন্য সেরা স্কিম: "${name}" (${pct}% মিল, ${status})।`,
        provides: (name, a) => `"${name}" প্রদান করে: ${a}`,
        yourMatch: (pct, status) => `✅ আপনার মিল: ${pct}% (${status})`,
        documents: (name, list) => `"${name}" এর জন্য প্রয়োজনীয় নথি:\n${list}`,
        commonDocs: "সাধারণ নথি: আধার কার্ড, প্যান কার্ড, ব্যাংক পাসবুক, ঠিকানা প্রমাণ, পাসপোর্ট ফটো",
        applySteps: (name, steps, source) => `"${name}" এর জন্য আবেদন করার ধাপ:\n\n${steps}${source ? `\n\n🔗 অনলাইনে আবেদন: ${source}` : ''}`,
        applyAt: (name, source) => `"${name}" এর জন্য আবেদন করুন: ${source || 'সরকারি পোর্টাল'}`,
        benefits: (name, list) => `"${name}" এর সুবিধা:\n${list}`,
        offers: (name, a) => `"${name}" প্রদান করে: ${a}`,
        status: (name, status, pct) => `"${name}" — স্থিতি: ${status} (${pct}% মিল)`,
        whyMatch: "✅ আপনি কেন মিলছেন:",
        note: "⚠️ নোট:",
        bestForCategory: (name, pct) => `"${name}" আপনার বিভাগের জন্য সেরা (${pct}% মিল)।`,
        supportsCategory: (name, pct) => `"${name}" আপনার বিভাগ সমর্থন করে। মিল: ${pct}%।`,
        aboutScheme: (name, m, pct, status, a, desc) => `"${name}"\n🏛️ ${m}\n📊 মিল: ${pct}% (${status})\n💰 ${a}\n\n${desc}`,
        default: (name, pct, a) => `"${name}" — আপনার সেরা মিল (${pct}%)\n💰 ${a}\n\nআপনি জিজ্ঞাসা করতে পারেন:\n• সুবিধা\n• নথি\n• কীভাবে আবেদন করবেন\n• যোগ্যতা`,
        tryThese: ["আমার জন্য সেরা স্কিম?", "কত আর্থিক সহায়তা?", "কী নথি প্রয়োজন?", "SC শ্রেণীর জন্য স্কিম?"],
        recording: "🔴 রেকর্ডিং... এখন বলুন",
        tap: "ট্যাপ",
        typeQuestion: "আপনার প্রশ্ন টাইপ করুন...",
        ask: "জিজ্ঞাসা",
        answer: "উত্তর",
        speak: "বলুন",
        stop: "থামুন",
    },
    ta: {
        noData: "முதலில் உங்கள் சுயவிவரத்தை நிரப்பி திட்டங்களைத் தேடவும்.",
        topSchemes: (n) => `உங்கள் சுயவிவரத்திற்கான சிறந்த ${n} திட்டங்கள்:`,
        schemeMatch: (name, pct) => `${name} — ${pct}% பொருத்தம்`,
        bestScheme: (name, pct) => `🏆 சிறந்தது: "${name}" (${pct}% பொருத்தம்)`,
        bestSingle: (name, pct, status) => `உங்களுக்கான சிறந்த திட்டம்: "${name}" (${pct}% பொருத்தம், ${status}).`,
        provides: (name, a) => `"${name}" வழங்குகிறது: ${a}`,
        yourMatch: (pct, status) => `✅ உங்கள் பொருத்தம்: ${pct}% (${status})`,
        documents: (name, list) => `"${name}" க்கு தேவையான ஆவணங்கள்:\n${list}`,
        commonDocs: "பொதுவான ஆவணங்கள்: ஆதார் அட்டை, பான் அட்டை, வங்கி புத்தகம், முகவரி சான்று, பாஸ்போர்ட் புகைப்படம்",
        applySteps: (name, steps, source) => `"${name}" க்கு விண்ணப்பிக்கும் படிகள்:\n\n${steps}${source ? `\n\n🔗 ஆன்லைனில் விண்ணப்பிக்கவும்: ${source}` : ''}`,
        applyAt: (name, source) => `"${name}" க்கு விண்ணப்பிக்கவும்: ${source || 'அதிகாரப்பூர்வ போர்ட்டல்'}`,
        benefits: (name, list) => `"${name}" இன் பலன்கள்:\n${list}`,
        offers: (name, a) => `"${name}" வழங்குகிறது: ${a}`,
        status: (name, status, pct) => `"${name}" — நிலை: ${status} (${pct}% பொருத்தம்)`,
        whyMatch: "✅ நீங்கள் ஏன் பொருந்துகிறீர்கள்:",
        note: "⚠️ குறிப்பு:",
        bestForCategory: (name, pct) => `"${name}" உங்கள் பிரிவுக்கு சிறந்தது (${pct}% பொருத்தம்).`,
        supportsCategory: (name, pct) => `"${name}" உங்கள் பிரிவை ஆதரிக்கிறது. பொருத்தம்: ${pct}%.`,
        aboutScheme: (name, m, pct, status, a, desc) => `"${name}"\n🏛️ ${m}\n📊 பொருத்தம்: ${pct}% (${status})\n💰 ${a}\n\n${desc}`,
        default: (name, pct, a) => `"${name}" — உங்கள் சிறந்த பொருத்தம் (${pct}%)\n💰 ${a}\n\nநீங்கள் கேட்கலாம்:\n• பலன்கள்\n• ஆவணங்கள்\n• எப்படி விண்ணப்பிப்பது\n• தகுதி`,
        tryThese: ["எனக்கு சிறந்த திட்டம்?", "எவ்வளவு நிதி உதவி?", "என்ன ஆவணங்கள் தேவை?", "SC பிரிவுக்கான திட்டம்?"],
        recording: "🔴 பதிவு... இப்போது பேசுங்கள்",
        tap: "தட்டு",
        typeQuestion: "உங்கள் கேள்வியை உள்ளிடவும்...",
        ask: "கேள்",
        answer: "பதில்",
        speak: "பேசு",
        stop: "நிறுத்து",
    },
    te: {
        noData: "దయచేసి మొదట మీ ప్రొఫైల్ను పూరించి పథకాలను వెతకండి.",
        topSchemes: (n) => `మీ ప్రొఫైల్ కోసం టాప్ ${n} పథకాలు:`,
        schemeMatch: (name, pct) => `${name} — ${pct}% సరిపోలిక`,
        bestScheme: (name, pct) => `🏆 ఉత్తమ: "${name}" (${pct}% సరిపోలిక)`,
        bestSingle: (name, pct, status) => `మీ కోసం ఉత్తమ పథకం: "${name}" (${pct}% సరిపోలిక, ${status}).`,
        provides: (name, a) => `"${name}" అందిస్తుంది: ${a}`,
        yourMatch: (pct, status) => `✅ మీ సరిపోలిక: ${pct}% (${status})`,
        documents: (name, list) => `"${name}" కోసం అవసరమైన పత్రాలు:\n${list}`,
        commonDocs: "సాధారణ పత్రాలు: ఆధార్ కార్డ్, పాన్ కార్డ్, బ్యాంక్ పాస్బుక్, చిరునామా రుజువు, పాస్పోర్ట్ ఫోటో",
        applySteps: (name, steps, source) => `"${name}" కోసం దరఖాస్తు చేసే దశలు:\n\n${steps}${source ? `\n\n🔗 ఆన్లైన్లో దరఖాస్తు: ${source}` : ''}`,
        applyAt: (name, source) => `"${name}" కోసం దరఖాస్తు చేయండి: ${source || 'అధికారిక పోర్టల్'}`,
        benefits: (name, list) => `"${name}" ప్రయోజనాలు:\n${list}`,
        offers: (name, a) => `"${name}" అందిస్తుంది: ${a}`,
        status: (name, status, pct) => `"${name}" — స్థితి: ${status} (${pct}% సరిపోలిక)`,
        whyMatch: "✅ మీరు ఎందుకు సరిపోతారు:",
        note: "⚠️ గమనిక:",
        bestForCategory: (name, pct) => `"${name}" మీ వర్గానికి ఉత్తమం (${pct}% సరిపోలిక).`,
        supportsCategory: (name, pct) => `"${name}" మీ వర్గానికి మద్దతు ఇస్తుంది. సరిపోలిక: ${pct}%.`,
        aboutScheme: (name, m, pct, status, a, desc) => `"${name}"\n🏛️ ${m}\n📊 సరిపోలిక: ${pct}% (${status})\n💰 ${a}\n\n${desc}`,
        default: (name, pct, a) => `"${name}" — మీ ఉత్తమ సరిపోలిక (${pct}%)\n💰 ${a}\n\nమీరు అడగవచ్చు:\n• ప్రయోజనాలు\n• పత్రాలు\n• ఎలా దరఖాస్తు చేయాలి\n• అర్హత`,
        tryThese: ["నాకు ఉత్తమ పథకం?", "ఎంత ఆర్థిక సహాయం?", "ఏ పత్రాలు అవసరం?", "SC వర్గానికి పథకం?"],
        recording: "🔴 రికార్డింగ్... ఇప్పుడు మాట్లాడండి",
        tap: "నొక్కండి",
        typeQuestion: "మీ ప్రశ్నను టైప్ చేయండి...",
        ask: "అడగండి",
        answer: "సమాధానం",
        speak: "మాట్లాడు",
        stop: "ఆపు",
    },
    mr: {
        noData: "कृपया प्रथम आपले प्रोफाइल भरा आणि योजना शोधा.",
        topSchemes: (n) => `तुमच्या प्रोफाइलसाठी शीर्ष ${n} योजना:`,
        schemeMatch: (name, pct) => `${name} — ${pct}% जुळणी`,
        bestScheme: (name, pct) => `🏆 सर्वोत्तम: "${name}" (${pct}% जुळणी)`,
        bestSingle: (name, pct, status) => `तुमच्यासाठी सर्वोत्तम योजना: "${name}" (${pct}% जुळणी, ${status}).`,
        provides: (name, a) => `"${name}" प्रदान करते: ${a}`,
        yourMatch: (pct, status) => `✅ तुमची जुळणी: ${pct}% (${status})`,
        documents: (name, list) => `"${name}" साठी आवश्यक कागदपत्रे:\n${list}`,
        commonDocs: "सामान्य कागदपत्रे: आधार कार्ड, पॅन कार्ड, बँक पासबुक, पत्ता पुरावा, पासपोर्ट फोटो",
        applySteps: (name, steps, source) => `"${name}" साठी अर्ज करण्याचे टप्पे:\n\n${steps}${source ? `\n\n🔗 ऑनलाइन अर्ज: ${source}` : ''}`,
        applyAt: (name, source) => `"${name}" साठी अर्ज करा: ${source || 'अधिकृत पोर्टल'}`,
        benefits: (name, list) => `"${name}" चे फायदे:\n${list}`,
        offers: (name, a) => `"${name}" प्रदान करते: ${a}`,
        status: (name, status, pct) => `"${name}" — स्थिती: ${status} (${pct}% जुळणी)`,
        whyMatch: "✅ तुम्ही का जुळता:",
        note: "⚠️ टीप:",
        bestForCategory: (name, pct) => `"${name}" तुमच्या श्रेणीसाठी सर्वोत्तम आहे (${pct}% जुळणी).`,
        supportsCategory: (name, pct) => `"${name}" तुमच्या श्रेणीला समर्थन देते. जुळणी: ${pct}%.`,
        aboutScheme: (name, m, pct, status, a, desc) => `"${name}"\n🏛️ ${m}\n📊 जुळणी: ${pct}% (${status})\n💰 ${a}\n\n${desc}`,
        default: (name, pct, a) => `"${name}" — तुमची सर्वोत्तम जुळणी (${pct}%)\n💰 ${a}\n\nतुम्ही विचारू शकता:\n• फायदे\n• कागदपत्रे\n• अर्ज कसा करावा\n• पात्रता`,
        tryThese: ["माझ्यासाठी सर्वोत्तम योजना?", "किती आर्थिक मदत?", "कोणती कागदपत्रे आवश्यक?", "SC वर्गासाठी योजना?"],
        recording: "🔴 रेकॉर्डिंग... आता बोला",
        tap: "टॅप",
        typeQuestion: "तुमचा प्रश्न टाइप करा...",
        ask: "विचारा",
        answer: "उत्तर",
        speak: "बोला",
        stop: "थांबा",
    },
};

// ─── ICONS ─────────────────────────────
const BuildingIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14" />
    </svg>
);
const MicIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);
const ArrowRightIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);
const CheckCircleIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const AlertTriangleIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);
const ChevronRightIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);
const ExternalLinkIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);
const WhatsAppIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
    </svg>
);
const XIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const Volume2Icon = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);
const StopIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
);
const LoadingSpinner = ({ className = "w-5 h-5" }) => (
    <svg className={`${className} animate-spin`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
const SparklesIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

// ═══════════════════════════════════════════════════════════
// 🌐 TTS VOICE LOADER
// ═══════════════════════════════════════════════════════════
let __ttsVoices = [];

function loadTTSVoices() {
    if (!('speechSynthesis' in window)) return;
    const load = () => {
        const v = window.speechSynthesis.getVoices();
        if (v && v.length > 0) {
            __ttsVoices = v;
        }
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
}
loadTTSVoices();

function findVoiceForLanguage(langCode) {
    const locale = SPEECH_LOCALES[langCode] || 'hi-IN';
    let voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) voices = __ttsVoices;
    
    let voice = voices.find(v => v.lang === locale);
    if (voice) return voice;
    voice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(langCode.toLowerCase() + '-'));
    if (voice) return voice;
    voice = voices.find(v => v.lang && v.lang.toLowerCase() === langCode.toLowerCase());
    if (voice) return voice;
    if (['hi', 'pa', 'bn', 'ta', 'te', 'mr'].includes(langCode)) {
        voice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('hi'));
        if (voice) return voice;
    }
    return null;
}

function speakInLanguage(text, langCode, onStart, onEnd) {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_LOCALES[langCode] || 'hi-IN';
    const voice = findVoiceForLanguage(langCode);
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => onStart && onStart();
    utterance.onend = () => onEnd && onEnd();
    utterance.onerror = () => onEnd && onEnd();
    window.speechSynthesis.speak(utterance);
}

// ═══════════════════════════════════════════════════════════
// 🎯 MAIN APP
// ═══════════════════════════════════════════════════════════
function App() {
    const [currentView, setCurrentView] = useState('home');
    const [formStep, setFormStep] = useState(1);
    const [selectedLanguage, setSelectedLanguage] = useState('hi');
    const [simpleLanguageMode, setSimpleLanguageMode] = useState(true);

    const [profile, setProfile] = useState({
        name: '', age: '', gender: 'Male', category: '', annual_income: '',
        state: '', district: '', education: '10th / Secondary Pass',
        employment_status: 'Self-employed', disability_status: 'No',
        minority_status: 'No', business_status: 'New business',
        business_type: 'Manufacturing', sector: '', location_type: 'Rural',
        approx_investment: '', annual_turnover: '', num_employees: '',
        experience_years: '', support_requirement: 'Business loan',
        business_description: ''
    });

    const [matches, setMatches] = useState([]);
    const [selectedScheme, setSelectedScheme] = useState(null);
    const [checkedDocs, setCheckedDocs] = useState({});
    const [commonDocuments, setCommonDocuments] = useState([]);
    const [docsLoadError, setDocsLoadError] = useState(false);
    const [savedSchemes, setSavedSchemes] = useState([]);

    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [matchingProgress, setMatchingProgress] = useState({ current: 0, total: 65, status: '' });

    const [isVoiceOpen, setIsVoiceOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [voiceQuery, setVoiceQuery] = useState('');
    const [voiceAnswer, setVoiceAnswer] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE}/documents/common?limit=10`)
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.documents) && data.documents.length > 0) {
                    setCommonDocuments(data.documents);
                } else {
                    setDocsLoadError(true);
                    setCommonDocuments(DEFAULT_DOCUMENTS);
                }
            })
            .catch(err => {
                console.error("Error fetching common documents:", err);
                setDocsLoadError(true);
                setCommonDocuments(DEFAULT_DOCUMENTS);
            });
    }, []);

    const handleRunMatching = async (profileData, docsOverride, languageOverride = selectedLanguage) => {
        setLoading(true);
        setErrorMessage('');
        setMatchingProgress({ current: 0, total: 65, status: '🔍 Searching schemes...' });
        setMatches([]);

        try {
            const docsForMatch = docsOverride !== undefined ? docsOverride : checkedDocs;
            const progressInterval = setInterval(() => {
                setMatchingProgress(prev => {
                    if (prev.current < 45) return { ...prev, current: prev.current + 1 };
                    return prev;
                });
            }, 80);

            const res = await fetch(`${API_BASE}/match`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profile: profileData,
                    checked_docs: docsForMatch,
                    language: languageOverride
                })
            });

            clearInterval(progressInterval);
            const data = await res.json();

            if (data.success) {
                setMatchingProgress({ current: 50, total: 50, status: '✅ Matching complete!' });
                const matchedResults = data.matches || [];
                if (matchedResults.length > 0) {
                    let tempMatches = [];
                    for (let i = 0; i < matchedResults.length; i++) {
                        tempMatches.push(matchedResults[i]);
                        setMatches([...tempMatches]);
                        setMatchingProgress({
                            current: 50 + Math.floor((i / matchedResults.length) * 50),
                            total: 100,
                            status: `📋 Showing ${i + 1} of ${matchedResults.length} schemes...`
                        });
                        await new Promise(resolve => setTimeout(resolve, 30));
                    }
                    setSelectedScheme(matchedResults[0]);
                    setMatchingProgress({ current: 100, total: 100, status: '✅ All schemes loaded!' });
                } else {
                    setErrorMessage('No matching schemes found. Please try different criteria.');
                }
            } else {
                setErrorMessage(data.error || 'Error matching schemes. Please try again.');
            }
        } catch (err) {
            console.error("Error matching schemes:", err);
            setErrorMessage('Network error. Please make sure the server is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!profile.name || !profile.age || !profile.category || !profile.state || !profile.approx_investment) {
            alert('Please fill in all required fields (Name, Age, Category, State, Investment)');
            return;
        }
        try {
            await fetch(`${API_BASE}/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });
            setCurrentView('recommendations');
            await handleRunMatching(profile, {});
        } catch (err) {
            console.error("Profile save error:", err);
            alert('Error saving profile. Please try again.');
        }
    };

    const handleSaveScheme = (schemeId) => {
        if (savedSchemes.includes(schemeId)) {
            setSavedSchemes(prev => prev.filter(id => id !== schemeId));
        } else {
            setSavedSchemes(prev => [...prev, schemeId]);
        }
    };

    const handleDocToggle = (docName) => {
        setCheckedDocs(prev => ({ ...prev, [docName]: !prev[docName] }));
    };

    const handleAskVoice = async (queryText) => {
        const textToAsk = queryText || voiceQuery;
        if (!textToAsk.trim()) return;
        setVoiceQuery(textToAsk);
        setVoiceAnswer("...");
        try {
            const res = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: textToAsk, user_profile: profile,
                    scheme_context: selectedScheme, matched_schemes: matches,
                    language: selectedLanguage
                })
            });
            const data = await res.json();
            if (data.success && data.answer) {
                setVoiceAnswer(data.answer);
                speakText(data.answer);
            }
        } catch (err) {
            console.log("Backend unavailable for chat");
        }
    };

    const speakText = (text) => {
        speakInLanguage(text, selectedLanguage,
            () => setIsSpeaking(true),
            () => setIsSpeaking(false));
    };

    const stopSpeech = () => {
        try {
            window.speechSynthesis.cancel();
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
            window.speechSynthesis.cancel();
        } catch (e) {}
        if (window.__udyamRecognition) {
            try { window.__udyamRecognition.stop(); } catch (e) {}
            window.__udyamRecognition = null;
        }
        setIsSpeaking(false);
        setIsRecording(false);
    };

    const startRecordingSimulation = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) { alert("Speech recognition not supported. Use Chrome/Edge."); return; }
        if (window.__udyamRecognition) { try { window.__udyamRecognition.stop(); } catch (e) {} }
        const recognition = new SpeechRecognition();
        window.__udyamRecognition = recognition;
        recognition.lang = SPEECH_LOCALES[selectedLanguage] || 'hi-IN';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 3;
        setIsRecording(true); setVoiceQuery(""); setVoiceAnswer("");
        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results).map(r => r[0].transcript).join(" ").trim();
            if (transcript) { setVoiceQuery(transcript); handleAskVoice(transcript); }
        };
        recognition.onerror = (event) => {
            console.error("Speech error:", event.error);
            setIsRecording(false);
            let message = "I couldn't hear you. Please try again.";
            if (event.error === "not-allowed") message = "Microphone permission denied.";
            if (event.error === "no-speech") message = "No speech detected.";
            setVoiceAnswer(message);
        };
        recognition.onend = () => { setIsRecording(false); window.__udyamRecognition = null; };
        try { recognition.start(); } catch (error) { console.error(error); setIsRecording(false); }
    };

    const handleShareScheme = (scheme) => {
        if (!scheme) { alert('No scheme selected to share.'); return; }
        const lines = [
            `🏛️ *UdyaMarg- Scheme Match*`, ``,
            `📌 *${scheme.name}*`,
            `📊 Match: ${scheme.match_percentage}% • ${scheme.eligibility_status || 'Eligible'}`,
            `💰 ${scheme.max_assistance_text || 'Financial assistance available'}`,
        ];
        const desc = scheme.simple_description || scheme.description;
        if (desc) lines.push(`📝 ${desc}`);
        if (scheme.official_source) lines.push(``, `🔗 Apply: ${scheme.official_source}`);
        lines.push(``, `🔗 Powered by UdyaMarg`);
        const text = lines.join('\n');
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const resetToHome = () => {
        setCurrentView('home');
        setMatches([]); setSelectedScheme(null); setSearchQuery('');
        setErrorMessage(''); setMatchingProgress({ current: 0, total: 65, status: '' });
        setProfile({
            name: '', age: '', gender: 'Male', category: '', annual_income: '',
            state: '', district: '', education: '10th / Secondary Pass',
            employment_status: 'Self-employed', disability_status: 'No',
            minority_status: 'No', business_status: 'New business',
            business_type: 'Manufacturing', sector: '', location_type: 'Rural',
            approx_investment: '', support_requirement: 'Business loan',
            business_description: ''
        });
        setCheckedDocs({}); setFormStep(1);
    };

    const handleLanguageChange = (langCode) => {
        setSelectedLanguage(langCode);
        if (currentView === "recommendations" && matches.length > 0) {
            handleRunMatching(profile, undefined, langCode);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={resetToHome}>
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md">
                            <BuildingIcon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-lg tracking-tight">UdyaMarg</span>
                            <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">65 Schemes</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 bg-slate-800 rounded-lg p-1">
                            {Object.entries(LANGUAGES).map(([code, lang]) => (
                                <button key={code} onClick={() => handleLanguageChange(code)}
                                    className={`text-xs font-medium px-2 py-1 rounded-md transition ${selectedLanguage === code ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                                    title={lang.name}>
                                    {lang.flag} {code.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        <button onClick={() => setIsVoiceOpen(true)}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium flex items-center space-x-1.5">
                            <MicIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Voice</span>
                        </button>

                        {currentView === 'recommendations' && (
                            <button onClick={resetToHome}
                                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium">
                                New Search
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {currentView === 'home' && (
                    <HomePage onStartForm={() => setCurrentView('form')} onOpenVoice={() => setIsVoiceOpen(true)} selectedLanguage={selectedLanguage} />
                )}
                {currentView === 'form' && (
                    <UserProfileForm 
                        profile={profile} setProfile={setProfile}
                        formStep={formStep} setFormStep={setFormStep}
                        onSubmit={handleFormSubmit} loading={loading}
                        commonDocuments={commonDocuments} checkedDocs={checkedDocs}
                        onDocToggle={handleDocToggle} selectedLanguage={selectedLanguage}
                        docsLoadError={docsLoadError}
                    />
                )}
                {currentView === 'recommendations' && (
                    <RecommendationsPage 
                        matches={matches} profile={profile}
                        selectedScheme={selectedScheme} setSelectedScheme={setSelectedScheme}
                        onViewDetail={(scheme) => { setSelectedScheme(scheme); setCurrentView('detail'); }}
                        onSaveScheme={handleSaveScheme} savedSchemes={savedSchemes}
                        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                        onOpenVoice={() => setIsVoiceOpen(true)}
                        onShareScheme={handleShareScheme}
                        errorMessage={errorMessage} loading={loading}
                        matchingProgress={matchingProgress}
                        onRetry={() => handleRunMatching(profile)}
                        selectedLanguage={selectedLanguage}
                    />
                )}
                {currentView === 'detail' && selectedScheme && (
                    <SchemeDetailPage 
                        scheme={selectedScheme} profile={profile}
                        simpleLanguageMode={simpleLanguageMode} setSimpleLanguageMode={setSimpleLanguageMode}
                        checkedDocs={checkedDocs} onDocToggle={handleDocToggle}
                        onBack={() => setCurrentView('recommendations')}
                        onOpenVoice={() => setIsVoiceOpen(true)}
                        onShareScheme={handleShareScheme}
                        selectedLanguage={selectedLanguage}
                    />
                )}
            </main>

            {isVoiceOpen && (
                <VoiceAssistantModal 
                    onClose={() => { stopSpeech(); setIsVoiceOpen(false); }}
                    isRecording={isRecording} startRecording={startRecordingSimulation}
                    voiceQuery={voiceQuery} voiceAnswer={voiceAnswer} onAsk={handleAskVoice}
                    isSpeaking={isSpeaking} stopSpeech={stopSpeech}
                    selectedLanguage={selectedLanguage}
                    matches={matches}
                    profile={profile}
                    selectedScheme={selectedScheme}
                />
            )}

            <footer className="bg-slate-900 text-slate-400 py-4 border-t border-slate-800 mt-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-[10px] text-slate-500">
                        Verified Database of 65 Indian Government Schemes • Preliminary eligibility only
                    </p>
                </div>
            </footer>
        </div>
    );
}

// ─── HomePage ─────────────────────────────
function HomePage({ onStartForm, onOpenVoice, selectedLanguage }) {
    const messages = {
        hi: { title: "अपने व्यवसाय के लिए सही सरकारी योजना खोजें", subtitle: "SC, ST, OBC, महिलाओं और सूक्ष्म उद्यमों के लिए केंद्रीय और राज्य योजनाएं", cta: "अपनी पात्रता जांचें" },
        en: { title: "Find the Right Government Scheme", subtitle: "Discover central and state schemes for SC, ST, OBC, Women, and Micro Enterprises", cta: "Check Your Eligibility" },
        pa: { title: "ਆਪਣੇ ਕਾਰੋਬਾਰ ਲਈ ਸਹੀ ਸਰਕਾਰੀ ਸਕੀਮ ਲੱਭੋ", subtitle: "SC, ST, OBC, ਔਰਤਾਂ ਅਤੇ ਮਾਈਕ੍ਰੋ ਉੱਦਮਾਂ ਲਈ ਸਕੀਮਾਂ", cta: "ਆਪਣੀ ਯੋਗਤਾ ਜਾਂਚੋ" },
        bn: { title: "আপনার ব্যবসার জন্য সঠিক সরকারি স্কিম খুঁজুন", subtitle: "SC, ST, OBC, মহিলা এবং মাইক্রো উদ্যোগের জন্য স্কিম", cta: "আপনার যোগ্যতা পরীক্ষা করুন" },
        ta: { title: "உங்கள் தொழிலுக்கான சரியான அரசு திட்டம்", subtitle: "SC, ST, OBC, பெண்கள் மற்றும் மைக்ரோ நிறுவனங்களுக்கான திட்டங்கள்", cta: "உங்கள் தகுதியை சரிபார்க்கவும்" },
        te: { title: "మీ వ్యాపారం కోసం సరైన ప్రభుత్వ పథకం", subtitle: "SC, ST, OBC, మహిళలు మరియు మైక్రో సంస్థల కోసం పథకాలు", cta: "మీ అర్హతను తనిఖీ చేయండి" },
        mr: { title: "आपल्या व्यवसायासाठी योग्य सरकारी योजना", subtitle: "SC, ST, OBC, महिला आणि सूक्ष्म उद्योगांसाठी योजना", cta: "आपली पात्रता तपासा" }
    };
    const msg = messages[selectedLanguage] || messages.en;

    return (
        <div className="max-w-4xl mx-auto px-4 py-16 space-y-10">
            <div className="text-center space-y-5">
                <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-full text-blue-800 font-bold text-xs">
                    <span>Smart India Hackathon SIH26092 • 65 Verified Govt Schemes</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    {msg.title}
                    <span className="block text-blue-600">for Your Business</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">{msg.subtitle}</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button onClick={onStartForm}
                        className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition flex items-center justify-center space-x-3">
                        <span>{msg.cta}</span>
                        <ArrowRightIcon className="w-5 h-5" />
                    </button>
                    <button onClick={onOpenVoice}
                        className="w-full sm:w-auto bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50 px-8 py-4 rounded-xl font-bold text-lg transition flex items-center justify-center space-x-3">
                        <MicIcon className="w-5 h-5" />
                        <span>Voice Assistant</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                <div className="bg-white p-5 rounded-xl border border-slate-200 text-center">
                    <div className="text-3xl font-black text-blue-700">65</div>
                    <div className="text-xs font-bold text-slate-500 uppercase">Verified Schemes</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 text-center">
                    <div className="text-3xl font-black text-amber-600">7</div>
                    <div className="text-xs font-bold text-slate-500 uppercase">Languages</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 text-center">
                    <div className="text-3xl font-black text-emerald-600">100%</div>
                    <div className="text-xs font-bold text-slate-500 uppercase">Official Sources</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 text-center">
                    <div className="flex justify-center mb-1">
                        <SparklesIcon className="w-7 h-7 text-purple-600" />
                    </div>
                    <div className="text-xs font-bold text-slate-500 uppercase">AI Powered</div>
                </div>
            </div>
        </div>
    );
}

// ─── UserProfileForm ─────────────────────────────
function UserProfileForm({ profile, setProfile, formStep, setFormStep, onSubmit, loading, commonDocuments, checkedDocs, onDocToggle, selectedLanguage, docsLoadError }) {
    const handleChange = (field, value) => setProfile(prev => ({ ...prev, [field]: value }));

    const labels = {
        hi: ['व्यक्तिगत', 'व्यवसाय'], en: ['Personal', 'Business'],
        pa: ['ਨਿੱਜੀ', 'ਕਾਰੋਬਾਰ'], bn: ['ব্যক্তিগত', 'ব্যবসা'],
        ta: ['தனிப்பட்ட', 'வணிகம்'], te: ['వ్యక్తిగత', 'వ్యాపారం'],
        mr: ['वैयक्तिक', 'व्यवसाय']
    };
    const label = labels[selectedLanguage] || labels.en;

    const t = {
        hi: { title: 'अपना विवरण दर्ज करें', subtitle: 'मिलान योजनाओं के लिए जानकारी भरें', name: 'पूरा नाम', age: 'आयु', gender: 'लिंग', category: 'सामाजिक श्रेणी', state: 'राज्य', district: 'जिला', income: 'वार्षिक आय (₹)', education: 'शिक्षा', disability: 'विकलांगता', business_status: 'व्यवसाय स्थिति', business_type: 'व्यवसाय प्रकार', investment: 'निवेश (₹)', support: 'सहायता', back: 'पीछे', next: 'आगे →', find: '🔍 योजनाएं खोजें', business_desc: 'अपने व्यवसाय का वर्णन करें', chars: 'अक्षर' },
        en: { title: 'Enter Your Details', subtitle: 'Fill in your information', name: 'Full Name', age: 'Age', gender: 'Gender', category: 'Social Category', state: 'State', district: 'District', income: 'Annual Income (₹)', education: 'Education', disability: 'Disability', business_status: 'Business Status', business_type: 'Business Type', investment: 'Investment (₹)', support: 'Support', back: 'Back', next: 'Next →', find: '🔍 Find Schemes', business_desc: 'Describe Your Business', chars: 'characters' },
        pa: { title: 'ਆਪਣਾ ਵੇਰਵਾ ਦਰਜ ਕਰੋ', subtitle: 'ਜਾਣਕਾਰੀ ਭਰੋ', name: 'ਪੂਰਾ ਨਾਮ', age: 'ਉਮਰ', gender: 'ਲਿੰਗ', category: 'ਸ਼੍ਰੇਣੀ', state: 'ਰਾਜ', district: 'ਜ਼ਿਲ੍ਹਾ', income: 'ਸਾਲਾਨਾ ਆਮਦਨ (₹)', education: 'ਸਿੱਖਿਆ', disability: 'ਅਯੋਗਤਾ', business_status: 'ਕਾਰੋਬਾਰ ਸਥਿਤੀ', business_type: 'ਕਾਰੋਬਾਰ ਕਿਸਮ', investment: 'ਨਿਵੇਸ਼ (₹)', support: 'ਸਹਾਇਤਾ', back: 'ਪਿੱਛੇ', next: 'ਅੱਗੇ →', find: '🔍 ਸਕੀਮਾਂ ਲੱਭੋ', business_desc: 'ਕਾਰੋਬਾਰ ਦਾ ਵਰਣਨ', chars: 'ਅੱਖਰ' },
        bn: { title: 'আপনার বিবরণ', subtitle: 'তথ্য পূরণ করুন', name: 'নাম', age: 'বয়স', gender: 'লিঙ্গ', category: 'বিভাগ', state: 'রাজ্য', district: 'জেলা', income: 'বার্ষিক আয় (₹)', education: 'শিক্ষা', disability: 'প্রতিবন্ধী', business_status: 'ব্যবসার অবস্থা', business_type: 'ব্যবসার ধরন', investment: 'বিনিয়োগ (₹)', support: 'সহায়তা', back: 'পেছনে', next: 'পরবর্তী →', find: '🔍 স্কিম খুঁজুন', business_desc: 'ব্যবসা বর্ণনা', chars: 'অক্ষর' },
        ta: { title: 'உங்கள் விவரங்கள்', subtitle: 'தகவலை நிரப்பவும்', name: 'பெயர்', age: 'வயது', gender: 'பாலினம்', category: 'வகை', state: 'மாநிலம்', district: 'மாவட்டம்', income: 'வருமானம் (₹)', education: 'கல்வி', disability: 'இயலாமை', business_status: 'வணிக நிலை', business_type: 'வணிக வகை', investment: 'முதலீடு (₹)', support: 'ஆதரவு', back: 'பின்', next: 'அடுத்து →', find: '🔍 திட்டங்கள்', business_desc: 'வணிக விவரம்', chars: 'எழுத்து' },
        te: { title: 'మీ వివరాలు', subtitle: 'సమాచారం పూరించండి', name: 'పేరు', age: 'వయస్సు', gender: 'లింగం', category: 'వర్గం', state: 'రాష్ట్రం', district: 'జిల్లా', income: 'ఆదాయం (₹)', education: 'విద్య', disability: 'వైకల్యం', business_status: 'వ్యాపార స్థితి', business_type: 'వ్యాపార రకం', investment: 'పెట్టుబడి (₹)', support: 'మద్దతు', back: 'వెనుక', next: 'తదుపరి →', find: '🔍 పథకాలు', business_desc: 'వ్యాపార వివరణ', chars: 'అక్షరాలు' },
        mr: { title: 'तुमचे तपशील', subtitle: 'माहिती भरा', name: 'नाव', age: 'वय', gender: 'लिंग', category: 'श्रेणी', state: 'राज्य', district: 'जिल्हा', income: 'उत्पन्न (₹)', education: 'शिक्षण', disability: 'अपंगत्व', business_status: 'व्यवसाय स्थिती', business_type: 'व्यवसाय प्रकार', investment: 'गुंतवणूक (₹)', support: 'सहाय्य', back: 'मागे', next: 'पुढे →', find: '🔍 योजना', business_desc: 'व्यवसाय वर्णन', chars: 'अक्षरे' }
    };
    const txt = t[selectedLanguage] || t.en;
    const steps = ['Personal', 'Business'];

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                <div className="bg-slate-800 text-white p-5">
                    <h2 className="text-xl font-bold">{txt.title}</h2>
                    <p className="text-xs text-slate-300 mt-0.5">{txt.subtitle}</p>
                    <div className="flex items-center justify-center gap-16 mt-4 max-w-xs mx-auto">
                        {steps.map((_, idx) => {
                            const stepNum = idx + 1;
                            const isActive = formStep === stepNum;
                            const isDone = formStep > stepNum;
                            return (
                                <div key={idx} className="flex flex-col items-center flex-1">
                                    <div className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center ${
                                        isActive ? 'bg-blue-600 text-white ring-4 ring-blue-600/30' :
                                        isDone ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-400'
                                    }`}>{isDone ? '✓' : stepNum}</div>
                                    <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-white' : 'text-slate-400'}`}>{label[idx]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-5">
                    {formStep === 1 && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-900 text-base">{label[0]} {txt.title}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">{txt.name} *</label>
                                    <input type="text" value={profile.name} onChange={(e) => handleChange('name', e.target.value)} 
                                        placeholder="Enter full name"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">{txt.age} *</label>
                                    <input type="number" value={profile.age} onChange={(e) => handleChange('age', e.target.value)} 
                                        placeholder="18-75"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" min="18" max="75" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">{txt.gender}</label>
                                    <select value={profile.gender} onChange={(e) => handleChange('gender', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Transgender">Transgender</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">{txt.category} *</label>
                                    <select value={profile.category} onChange={(e) => handleChange('category', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" required>
                                        <option value="">Select</option>
                                        <option value="ST">ST</option>
                                        <option value="SC">SC</option>
                                        <option value="OBC">OBC</option>
                                        <option value="Minorities">Minorities</option>
                                        <option value="EWS">EWS</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">{txt.state} *</label>
                                    <input type="text" value={profile.state} onChange={(e) => handleChange('state', e.target.value)} 
                                        placeholder="e.g. Punjab"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">{txt.district}</label>
                                    <input type="text" value={profile.district} onChange={(e) => handleChange('district', e.target.value)} 
                                        placeholder="e.g. Ludhiana"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">{txt.income}</label>
                                    <input type="number" value={profile.annual_income} onChange={(e) => handleChange('annual_income', e.target.value)} 
                                        placeholder="e.g. 180000"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">{txt.education}</label>
                                    <select value={profile.education} onChange={(e) => handleChange('education', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                                        <option value="Below 8th Pass">Below 8th</option>
                                        <option value="8th Pass">8th Pass</option>
                                        <option value="10th / Secondary Pass">10th</option>
                                        <option value="12th Pass">12th</option>
                                        <option value="Graduate / ITI / Diploma">Graduate</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">{txt.disability}</label>
                                    <select value={profile.disability_status} onChange={(e) => handleChange('disability_status', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {formStep === 2 && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-900 text-base">{label[1]} {txt.title}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">{txt.business_status}</label>
                                    <select value={profile.business_status} onChange={(e) => handleChange('business_status', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                                        <option value="New business">New business</option>
                                        <option value="Existing business">Existing business</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">{txt.business_type}</label>
                                    <select value={profile.business_type} onChange={(e) => handleChange('business_type', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                                        <option value="Manufacturing">Manufacturing</option>
                                        <option value="Artisan">Artisan / Handicraft</option>
                                        <option value="Street Vendor">Street Vendor</option>
                                        <option value="Service">Service</option>
                                        <option value="Trading">Trading / Retail</option>
                                        <option value="Agri-allied">Agriculture</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">{txt.investment} *</label>
                                    <input type="number" value={profile.approx_investment} onChange={(e) => handleChange('approx_investment', e.target.value)} 
                                        placeholder="e.g. 200000"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">{txt.support}</label>
                                    <select value={profile.support_requirement} onChange={(e) => handleChange('support_requirement', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                                        <option value="Business loan">Business Loan</option>
                                        <option value="Subsidy">Subsidy</option>
                                        <option value="Skill training">Skill Training</option>
                                        <option value="Equipment">Equipment</option>
                                        <option value="Marketing support">Marketing</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-3">
                                <label className="block text-xs font-bold text-slate-700 mb-1">{txt.business_desc}</label>
                                <textarea rows="4" value={profile.business_description || ''} onChange={(e) => handleChange('business_description', e.target.value)} maxLength={500}
                                    placeholder="Describe your business (e.g. tailoring, food processing, handicraft)..."
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none" />
                                <p className="text-[10px] text-slate-400 mt-1 text-right">
                                    {(profile.business_description || '').length}/500 {txt.chars}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        {formStep > 1 ? (
                            <button type="button" onClick={() => setFormStep(s => s - 1)} className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50">
                                {txt.back}
                            </button>
                        ) : <div />}

                        {formStep < 2 ? (
                            <button type="button" onClick={() => setFormStep(s => s + 1)} className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-bold text-sm shadow">
                                {txt.next}
                            </button>
                        ) : (
                            <button type="submit" disabled={loading} className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-2.5 rounded-lg font-bold text-sm shadow flex items-center gap-2">
                                {loading ? (<><LoadingSpinner className="w-4 h-4" /> Matching...</>) : (txt.find)}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── RecommendationsPage ─────────────────────────────
function RecommendationsPage({ matches, profile, selectedScheme, setSelectedScheme, onViewDetail, onSaveScheme, savedSchemes, searchQuery, setSearchQuery, onOpenVoice, onShareScheme, errorMessage, loading, matchingProgress, onRetry, selectedLanguage }) {
    const filteredMatches = matches.filter(scheme => {
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return (scheme.name || '').toLowerCase().includes(q) ||
                   (scheme.description || '').toLowerCase().includes(q) ||
                   (scheme.tags || []).some(t => t.toLowerCase().includes(q));
        }
        return true;
    });

    const t = {
        hi: { matched: 'मिलान योजनाएं', voice: 'आवाज', search: 'योजना खोजें...', no_results: 'कोई योजना नहीं मिली', retry: 'पुनः प्रयास करें' },
        en: { matched: 'Matched Schemes', voice: 'Voice', search: 'Search schemes...', no_results: 'No schemes found', retry: 'Retry' },
        pa: { matched: 'ਮਿਲਦੀਆਂ ਸਕੀਮਾਂ', voice: 'ਆਵਾਜ਼', search: 'ਸਕੀਮਾਂ ਲੱਭੋ...', no_results: 'ਕੋਈ ਸਕੀਮ ਨਹੀਂ ਲੱਭੀ', retry: 'ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ' },
        bn: { matched: 'মেলে এমন স্কিম', voice: 'ভয়েস', search: 'স্কিম খুঁজুন...', no_results: 'কোন স্কিম নেই', retry: 'আবার' },
        ta: { matched: 'பொருந்திய திட்டங்கள்', voice: 'குரல்', search: 'தேடுங்கள்...', no_results: 'திட்டங்கள் இல்லை', retry: 'மீண்டும்' },
        te: { matched: 'సరిపోయే పథకాలు', voice: 'వాయిస్', search: 'వెతకండి...', no_results: 'పథకాలు లేవు', retry: 'మళ్ళీ' },
        mr: { matched: 'जुळणाऱ्या योजना', voice: 'आवाज', search: 'योजना शोधा...', no_results: 'योजना नाही', retry: 'पुन्हा' }
    };
    const txt = t[selectedLanguage] || t.en;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
            <div className="bg-slate-800 text-white rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span>{txt.matched} {profile.name ? `for ${profile.name}` : ''}</span>
                        {profile.category && (
                            <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-blue-500/30">
                                {profile.category}
                            </span>
                        )}
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                        {loading ? '🔍 Matching schemes...' : `${matches.length} schemes matched`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={onOpenVoice} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow">
                        <MicIcon className="w-4 h-4" /> {txt.voice}
                    </button>
                </div>
            </div>

            {loading && (
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">{matchingProgress.status}</span>
                        <span className="text-sm font-bold text-blue-600">{Math.round((matchingProgress.current / matchingProgress.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(matchingProgress.current / matchingProgress.total) * 100}%` }} />
                    </div>
                </div>
            )}

            <div className="bg-white p-3 rounded-xl border border-slate-200">
                <input type="text" placeholder={txt.search} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>

            {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-between">
                    <span className="text-sm">{errorMessage}</span>
                    <button onClick={onRetry} className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold">{txt.retry}</button>
                </div>
            )}

            {!loading && !errorMessage && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">{filteredMatches.length} matches</span>
                        <span className="text-[10px] text-slate-400">Sorted by match %</span>
                    </div>

                    {filteredMatches.length === 0 && (
                        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
                            <p className="text-slate-500">{txt.no_results}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredMatches.map(scheme => (
                            <SchemeCard key={scheme.id} scheme={scheme}
                                onViewDetail={() => onViewDetail(scheme)}
                                onSave={() => onSaveScheme(scheme.id)}
                                onShare={() => onShareScheme(scheme)}
                                isSaved={savedSchemes.includes(scheme.id)} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── SchemeCard ─────────────────────────────
function SchemeCard({ scheme, onViewDetail, onSave, onShare, isSaved }) {
    const pct = scheme.match_percentage || 50;
    const status = scheme.eligibility_status || 'Eligible';
    const badgeColor = status === 'Eligible' ? 'bg-emerald-50 text-emerald-700' :
                       status === 'Partially Eligible' ? 'bg-blue-50 text-blue-700' :
                       'bg-amber-50 text-amber-700';
    const barColor = pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500';

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition">
            <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 block">{scheme.state_or_central || 'Central'} • {(scheme.ministry || '').slice(0, 25)}...</span>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight mt-0.5 line-clamp-2">{scheme.name}</h4>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); onShare(); }}
                            className="text-xs p-1.5 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                            <WhatsAppIcon className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onSave(); }}
                            className={`text-xs p-1.5 rounded-lg border shrink-0 ${isSaved ? 'bg-blue-50 text-blue-700 border-blue-300' : 'text-slate-400 border-slate-200'}`}>
                            {isSaved ? '★' : '☆'}
                        </button>
                    </div>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                    <span className={`px-2 py-0.5 rounded-full ${badgeColor}`}>{pct}% • {status}</span>
                    <span className="text-blue-700 truncate ml-2">{scheme.max_assistance_text || 'Financial assistance'}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{scheme.simple_description || scheme.description}</p>
                {scheme.ai_reason && (
                    <div className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-lg">
                        🤖 {scheme.ai_reason.slice(0, 80)}
                    </div>
                )}
                {(scheme.matched_reasons || []).slice(0, 2).map((r, i) => (
                    <div key={i} className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded-lg truncate">
                        ✓ {r.replace('✓ ', '').slice(0, 60)}
                    </div>
                ))}
            </div>
            <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">{(scheme.support_type || ['Scheme'])[0]}</span>
                <button onClick={onViewDetail} className="text-blue-700 font-bold text-xs flex items-center gap-1">
                    View Details <ChevronRightIcon className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}

// ─── SchemeDetailPage ─────────────────────────────
function SchemeDetailPage({ scheme, simpleLanguageMode, setSimpleLanguageMode, checkedDocs, onDocToggle, onBack, onOpenVoice, onShareScheme }) {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="text-slate-600 font-bold text-sm hover:text-slate-900">← Back</button>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => setSimpleLanguageMode(false)} className={`px-3 py-1 rounded-lg font-bold text-xs ${!simpleLanguageMode ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Official</button>
                    <button onClick={() => setSimpleLanguageMode(true)} className={`px-3 py-1 rounded-lg font-bold text-xs ${simpleLanguageMode ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Simple</button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${scheme.state_or_central === 'Central' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                            {scheme.state_or_central} Scheme
                        </span>
                        <h1 className="text-xl font-bold text-slate-900 mt-1.5">{scheme.name}</h1>
                        <p className="text-xs text-slate-500">{scheme.ministry}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => onShareScheme(scheme)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5">
                            <WhatsAppIcon className="w-4 h-4" /> Share
                        </button>
                        <div className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200 text-center">
                            <div className="text-2xl font-black text-emerald-700">{scheme.match_percentage}%</div>
                            <div className="text-[10px] font-bold text-emerald-600">{scheme.eligibility_status}</div>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                    <p>{simpleLanguageMode ? (scheme.simple_description || scheme.description) : scheme.description}</p>
                </div>

                <div className="flex border-b border-slate-200 space-x-4 overflow-x-auto">
                    {['overview', 'eligibility', 'documents', 'apply'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`pb-2 text-sm font-medium capitalize border-b-2 shrink-0 ${activeTab === tab ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500'}`}>
                            {tab === 'overview' ? 'Benefits' : tab === 'eligibility' ? 'Eligibility' : tab === 'documents' ? 'Documents' : 'How to Apply'}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-3">
                        <h3 className="font-bold text-slate-900">Benefits & Assistance</h3>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-blue-900 font-bold text-sm">{scheme.max_assistance_text}</div>
                        <div className="space-y-1.5">
                            {(simpleLanguageMode ? scheme.simple_benefits : scheme.benefits)?.map((b, i) => (
                                <div key={i} className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-lg border text-sm text-slate-700">
                                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                                    <span>{b}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'eligibility' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                            <h4 className="font-bold text-emerald-800 text-sm flex items-center gap-1.5"><CheckCircleIcon className="w-4 h-4" /> Why You Match</h4>
                            {scheme.matched_reasons?.map((r, i) => <div key={i} className="text-xs text-emerald-700 mt-1.5">• {r.replace('✓ ', '')}</div>)}
                        </div>
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                            <h4 className="font-bold text-amber-800 text-sm flex items-center gap-1.5"><AlertTriangleIcon className="w-4 h-4" /> Things to Note</h4>
                            {scheme.missing_reasons?.map((r, i) => <div key={i} className="text-xs text-amber-700 mt-1.5">• {r.replace('⚠ ', '')}</div>)}
                        </div>
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="space-y-2">
                        <h3 className="font-bold text-slate-900">Required Documents</h3>
                        <div className="space-y-1.5">
                            {scheme.required_documents?.map(doc => {
                                const isChecked = !!checkedDocs[doc];
                                return (
                                    <label key={doc} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${isChecked ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200'}`}>
                                        <div className="flex items-center space-x-2.5">
                                            <input type="checkbox" checked={isChecked} onChange={() => onDocToggle(doc)} className="w-4 h-4" />
                                            <span className="text-sm font-medium">{doc}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isChecked ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                                            {isChecked ? 'Have' : 'Need'}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'apply' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                            <h3 className="font-bold text-slate-900">Step-by-Step Application</h3>
                            {scheme.official_source && (
                                <a href={scheme.official_source} target="_blank" rel="noreferrer" className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1.5">
                                    <span>Apply Now</span>
                                    <ExternalLinkIcon className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>
                        <div className="space-y-3">
                            {scheme.application_steps?.map((s, i) => (
                                <div key={i} className="flex items-start space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold text-sm flex items-center justify-center shrink-0">{s.step || (i+1)}</div>
                                    <div className="bg-slate-50 p-3 rounded-lg border flex-1">
                                        <h4 className="font-bold text-slate-900 text-sm">{s.title}</h4>
                                        <p className="text-xs text-slate-600">{s.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Voice Assistant Modal ───────────────────────────
function VoiceAssistantModal({ onClose, isRecording, startRecording, voiceQuery, voiceAnswer, onAsk, isSpeaking, stopSpeech, selectedLanguage, matches, profile, selectedScheme }) {
    const [inputText, setInputText] = useState('');
    const [localAnswer, setLocalAnswer] = useState('');
    const [localQuery, setLocalQuery] = useState('');

    const T = LOCAL_RAG_TEMPLATES[selectedLanguage] || LOCAL_RAG_TEMPLATES.en;
    const samples = T.tryThese;

    const generateRAGAnswer = (query) => {
        const q = query.toLowerCase().trim();
        const bestScheme = selectedScheme || (matches && matches.length > 0 ? matches[0] : null);

        if (!bestScheme) return T.noData;

        const schemeName = bestScheme.name || 'This scheme';
        const matchPct = bestScheme.match_percentage || 50;
        const status = bestScheme.eligibility_status || 'Eligible';
        const assistance = bestScheme.max_assistance_text || 'Financial assistance available';
        const benefits = bestScheme.simple_benefits || bestScheme.benefits || [];
        const documents = bestScheme.required_documents || [];
        const steps = bestScheme.application_steps || [];
        const source = bestScheme.official_source || '';
        const ministry = bestScheme.ministry || 'Government of India';
        const description = bestScheme.simple_description || bestScheme.description || '';

        if (q.includes('best') || q.includes('kaunsi') || q.includes('kaun') || q.includes('अच्छी') || q.includes('top')) {
            if (matches && matches.length > 1) {
                const top3 = matches.slice(0, 3);
                const lines = [T.topSchemes(top3.length), ''];
                top3.forEach((s, i) => {
                    lines.push(`${i+1}. ${T.schemeMatch(s.name, s.match_percentage)}`);
                    if (s.max_assistance_text) lines.push(`   💰 ${s.max_assistance_text}`);
                    lines.push('');
                });
                lines.push(T.bestScheme(schemeName, matchPct));
                return lines.join('\n');
            }
            return T.bestSingle(schemeName, matchPct, status) + `\n💰 ${assistance}`;
        }

        if (q.includes('how much') || q.includes('kitni') || q.includes('kitna') || q.includes('कितनी') || q.includes('financial')) {
            return T.provides(schemeName, assistance) + '\n\n' + T.yourMatch(matchPct, status);
        }

        if (q.includes('document') || q.includes('paper') || q.includes('दस्तावेज़') || q.includes('कागद') || q.includes('required')) {
            if (documents.length > 0) {
                const docList = documents.slice(0, 6).map(d => `• ${d}`).join('\n');
                return T.documents(schemeName, docList);
            }
            return T.commonDocs;
        }

        if (q.includes('apply') || q.includes('kaise') || q.includes('how to') || q.includes('आवेदन') || q.includes('application')) {
            if (steps.length > 0) {
                const stepList = steps.slice(0, 5).map((s, i) => `${s.step || i+1}. ${s.title}\n   ${s.description || ''}`).join('\n\n');
                return T.applySteps(schemeName, stepList, source);
            }
            return T.applyAt(schemeName, source);
        }

        if (q.includes('benefit') || q.includes('फायदा') || q.includes('लाभ') || q.includes('feature')) {
            if (benefits.length > 0) {
                const benefitList = benefits.slice(0, 5).map(b => `• ${b}`).join('\n');
                return T.benefits(schemeName, benefitList);
            }
            return T.offers(schemeName, assistance);
        }

        if (q.includes('eligible') || q.includes('पात्र') || q.includes('योग्य') || q.includes('criteria')) {
            let ans = T.status(schemeName, status, matchPct) + '\n\n';
            if ((bestScheme.matched_reasons || []).length > 0) {
                ans += T.whyMatch + '\n' + bestScheme.matched_reasons.slice(0, 3).map(r => `• ${r.replace('✓ ', '')}`).join('\n') + '\n\n';
            }
            return ans;
        }

        return T.default(schemeName, matchPct, assistance);
    };

    const handleLocalAsk = async (query) => {
        if (!query || !query.trim()) return;
        setLocalQuery(query);
        setLocalAnswer('...');

        try {
            const res = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: query, user_profile: profile || {},
                    scheme_context: selectedScheme || null,
                    matched_schemes: matches || [],
                    language: selectedLanguage
                })
            });
            const data = await res.json();
            if (data.success && data.answer && data.answer.length > 20) {
                setLocalAnswer(data.answer);
                if (typeof onAsk === 'function') onAsk(query);
                return;
            }
        } catch (err) {
            console.log("Backend unavailable, using local RAG");
        }

        setLocalAnswer(generateRAGAnswer(query));
    };

    const handleSend = () => {
        if (inputText.trim()) {
            handleLocalAsk(inputText);
            setInputText('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    const handleRecordClick = () => {
        if (startRecording) startRecording();
    };

    useEffect(() => {
        if (voiceQuery && voiceQuery.trim()) handleLocalAsk(voiceQuery);
    }, [voiceQuery]);

    useEffect(() => {
        if (voiceAnswer && voiceAnswer.trim() && voiceAnswer !== '...') setLocalAnswer(voiceAnswer);
    }, [voiceAnswer]);

    const handleSpeak = () => {
        const textToSpeak = localAnswer || voiceAnswer;
        if (textToSpeak && textToSpeak !== '...') {
            speakInLanguage(textToSpeak, selectedLanguage);
        }
    };

    const handleStopSpeaking = () => {
        try {
            window.speechSynthesis.cancel();
        } catch(e) {}
        if (typeof stopSpeech === 'function') stopSpeech();
    };

    const displayQuery = localQuery || voiceQuery;
    const displayAnswer = localAnswer || voiceAnswer;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 relative shadow-2xl max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1">
                    <XIcon className="w-5 h-5" />
                </button>

                <div className="text-center space-y-1">
                    <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center mx-auto">
                        <MicIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold">Voice Assistant</h3>
                    <p className="text-xs text-slate-500">Answers from 65 verified schemes</p>
                </div>

                <div className="flex flex-col items-center py-2">
                    <button onClick={handleRecordClick} disabled={isRecording}
                        className={`w-20 h-20 rounded-full flex flex-col items-center justify-center text-white transition shadow-lg ${
                            isRecording ? 'bg-red-500 animate-pulse' : 'bg-amber-500 hover:scale-105 hover:bg-amber-600'
                        }`}>
                        <MicIcon className="w-7 h-7 mb-0.5" />
                        <span className="text-[10px] font-bold">{isRecording ? 'Listening...' : T.tap}</span>
                    </button>
                    {isRecording && <p className="text-xs text-red-500 mt-2 animate-pulse">{T.recording}</p>}
                </div>

                <div className="flex items-center gap-2">
                    <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={handleKeyPress}
                        placeholder={T.typeQuestion}
                        className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                    <button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm">
                        {T.ask}
                    </button>
                </div>

                <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Try these</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {samples.map((q, i) => (
                            <button key={i} onClick={() => handleLocalAsk(q)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-medium">
                                "{q}"
                            </button>
                        ))}
                    </div>
                </div>

                {displayQuery && (
                    <div className="bg-slate-50 border p-3 rounded-xl space-y-2 max-h-64 overflow-y-auto">
                        <div className="text-sm font-semibold text-slate-900">📝 {displayQuery}</div>
                        {displayAnswer && displayAnswer !== '...' && (
                            <div className="border-t pt-2">
                                <div className="flex items-center justify-between text-[10px] font-bold text-blue-700">
                                    <span>🤖 {T.answer}</span>
                                    <div className="flex items-center gap-2">
                                        {/* ✅ SPEAK button */}
                                        <button 
                                            onClick={handleSpeak} 
                                            className="flex items-center gap-1 hover:text-blue-900"
                                        >
                                            <Volume2Icon className="w-3 h-3" /> {T.speak}
                                        </button>

                                        {/* ✅ STOP button — only shows while speaking */}
                                        {isSpeaking && (
                                            <button 
                                                onClick={handleStopSpeaking} 
                                                className="flex items-center gap-1 text-red-600 hover:text-red-800 font-bold"
                                            >
                                                <StopIcon className="w-3 h-3" /> {T.stop || 'Stop'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-slate-800 bg-white p-2.5 rounded-lg border font-medium mt-1 whitespace-pre-wrap">
                                    {displayAnswer}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── RENDER ─────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);