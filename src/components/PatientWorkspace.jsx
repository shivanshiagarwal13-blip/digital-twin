import React, { useState } from 'react';
import { 
  Heart, Activity, CheckCircle2, Check, ChevronDown, 
  Calendar, Phone, AlertCircle, ArrowRight, ShieldCheck, 
  Smile, UserCheck, Stethoscope, Users
} from 'lucide-react';
import { PATIENTS } from '../data/patients';

export function PatientWorkspace({ 
  onExitPortal, 
  selectedPatientId, 
  onSelectPatientId 
}) {
  const [language, setLanguage] = useState('en');
  const [tabletTaken, setTabletTaken] = useState(false);
  const [careModalOpen, setCareModalOpen] = useState(false);

  // Active patient object
  const currentPatient = PATIENTS.find(p => p.id === selectedPatientId) || PATIENTS[0];
  const isHighRisk = currentPatient.riskLevel === 'High';
  const firstName = currentPatient.name.split(' ')[0];

  // Translations for English, Hindi, Tamil, Telugu with dynamic response condition
  const t = {
    en: {
      navTitle: "My health",
      breadcrumb: "My health journey",
      dayTag: `DAY ${currentPatient.enrolledDays || 14} OF YOUR RECOVERY`,
      greeting: `Hello, ${firstName}`,
      subGreeting: "Here is your simple health update for today.",
      treatmentStatusTag: "YOUR TREATMENT STATUS",
      treatmentStatus: isHighRisk ? "Absorption is slower than expected" : "You're getting better",
      treatmentDesc: isHighRisk 
        ? "Your body is having trouble absorbing oral iron tablets. Your doctor has been alerted to review IV iron options."
        : "Your iron level is rising as expected. Keep taking your tablet every day.",
      hbTag: "HEMOGLOBIN",
      hbVal: currentPatient.vitals.hemoglobin.value,
      hbUnit: "g/dL",
      hbSub: currentPatient.vitals.hemoglobin.delta || "+1.4 since start",
      hrTitle: "Heart rate",
      hrVal: `${currentPatient.vitals.heartRate.value} bpm`,
      hrSub: isHighRisk ? "Persistent tachycardia (O2 deficit)" : "Back in a healthy range",
      stepsTitle: "Daily movement",
      stepsVal: `${currentPatient.vitals.activity.value} steps`,
      stepsSub: isHighRisk ? "Fatigue index elevated" : "More active than last week",
      tabletsTitle: "Tablets taken",
      tabletsVal: currentPatient.vitals.adherence.sub || "12 of 14",
      tabletsSub: isHighRisk ? "Good pill consistency" : "Excellent consistency",
      todaysPlan: "TODAY'S PLAN",
      todaysDate: "Tuesday, 14 May",
      oneSmallThing: "One small thing to do",
      ironTabletTag: "YOUR IRON TABLET",
      takeAfterLunch: isHighRisk ? "Discuss with PHC Doctor" : "Take after lunch",
      tabletDesc: isHighRisk 
        ? "Continue tablets for now with water. Do not stop without doctor's order."
        : "Have it with water or citrus fruit—not tea, coffee, or milk.",
      markTaken: "Mark taken",
      takenSuccess: "Taken today",
      nextCheckInTag: "NEXT CHECK-IN",
      nextCheckInTitle: isHighRisk ? "PHC Doctor Clinical Consultation" : "Week 4 hemoglobin check",
      nextCheckInDesc: isHighRisk
        ? "Your ASHA worker is scheduling a clinic visit for possible IV iron FCM."
        : "Your ASHA worker will help arrange this at the PHC.",
      in14Days: isHighRisk ? "Prompt Follow-up" : "In 14 days",
      unwellPrompt: "Feeling unwell? Get help for fainting, chest pain, trouble breathing, or bleeding.",
      contactCareTeam: "Contact care team"
    },
    hi: {
      navTitle: "मेरी सेहत",
      breadcrumb: "मेरी स्वास्थ्य यात्रा",
      dayTag: `आपके सुधार का ${currentPatient.enrolledDays || 14}वां दिन`,
      greeting: `नमस्ते, ${firstName}`,
      subGreeting: "आज के लिए आपका आसान स्वास्थ्य विवरण।",
      treatmentStatusTag: "आपकी सेहत की स्थिति",
      treatmentStatus: isHighRisk ? "सुधार अपेक्षा से धीमा है" : "आपकी सेहत सुधर रही है",
      treatmentDesc: isHighRisk 
        ? "आपके शरीर में आयरन की गोलियां ठीक से अवशोषित नहीं हो पा रही हैं। डॉक्टर को सूचित कर दिया गया है।"
        : "आपका आयरन स्तर अपेक्षा के अनुसार बढ़ रहा है। अपनी गोली रोज़ाना लेते रहें।",
      hbTag: "हीमोग्लोबिन",
      hbVal: currentPatient.vitals.hemoglobin.value,
      hbUnit: "g/dL",
      hbSub: currentPatient.vitals.hemoglobin.delta || "शुरुआत से वृद्धि",
      hrTitle: "हृदय गति",
      hrVal: `${currentPatient.vitals.heartRate.value} bpm`,
      hrSub: isHighRisk ? "हृदय गति अभी भी अधिक है" : "सामान्य और स्वस्थ दायरे में",
      stepsTitle: "दैनिक चलना-फिरना",
      stepsVal: `${currentPatient.vitals.activity.value} कदम`,
      stepsSub: isHighRisk ? "कमज़ोरी व थकान के लक्षण" : "पिछले हफ्ते से अधिक सक्रिय",
      tabletsTitle: "ली गई गोलियां",
      tabletsVal: currentPatient.vitals.adherence.sub || "14 में से 12",
      tabletsSub: "नियमितता अच्छी है",
      todaysPlan: "आज की योजना",
      todaysDate: "मंगलवार, 14 मई",
      oneSmallThing: "आज का एक ज़रूरी काम",
      ironTabletTag: "आपकी आयरन की गोली",
      takeAfterLunch: isHighRisk ? "डॉक्टर से सलाह लें" : "दोपहर के खाने के बाद लें",
      tabletDesc: "इसे पानी या नींबू के रस के साथ लें—चाय, कॉफी या दूध के साथ नहीं।",
      markTaken: "ली गई दर्ज करें",
      takenSuccess: "आज ले ली गई",
      nextCheckInTag: "अगली जांच",
      nextCheckInTitle: isHighRisk ? "पीएचसी (PHC) डॉक्टर परामर्श" : "सप्ताह 4 हीमोग्लोबिन जांच",
      nextCheckInDesc: "आपकी आशा दीदी पीएचसी में डॉक्टर से जांच की व्यवस्था करेंगी।",
      in14Days: isHighRisk ? "तत्काल" : "14 दिनों में",
      unwellPrompt: "अस्वस्थ महसूस कर रही हैं? चक्कर, सीने में दर्द, सांस लेने में तकलीफ पर तुरंत मदद लें।",
      contactCareTeam: "स्वास्थ्य टीम से संपर्क करें"
    },
    ta: {
      navTitle: "என் உடல்நலம்",
      breadcrumb: "என் நலப்பயணம்",
      dayTag: `உங்கள் குணமடைதலின் ${currentPatient.enrolledDays || 14}வது நாள்`,
      greeting: `வணக்கம், ${firstName}`,
      subGreeting: "இன்றைய உங்கள் எளிய உடல்நல விவரம்.",
      treatmentStatusTag: "சிகிச்சை நிலை",
      treatmentStatus: isHighRisk ? "குணமடைதல் சற்று மெதுவாக உள்ளது" : "நீங்கள் நலமடைந்து வருகிறீர்கள்",
      treatmentDesc: isHighRisk 
        ? "இரும்புச்சத்து மாத்திரைகள் சரியாக உறிஞ்சப்படவில்லை. மருத்துவர் மாற்று ஊசி மருந்தை பரிசீலிக்கிறார்."
        : "உங்கள் இரும்புச்சத்து எதிர்பார்த்தபடி உயர்கிறது. தினமும் மாத்திரையைத் தவறாமல் உட்கொள்ளுங்கள்.",
      hbTag: "ஹீமோகுளோபின்",
      hbVal: currentPatient.vitals.hemoglobin.value,
      hbUnit: "g/dL",
      hbSub: currentPatient.vitals.hemoglobin.delta || "+1.4 உயர்வு",
      hrTitle: "இதயத் துடிப்பு",
      hrVal: `${currentPatient.vitals.heartRate.value} bpm`,
      hrSub: isHighRisk ? "இதயத் துடிப்பு அதிகமாக உள்ளது" : "ஆரோக்கியமான நிலைக்குத் திரும்பியது",
      stepsTitle: "தினசரி நடை",
      stepsVal: `${currentPatient.vitals.activity.value} அடிகள்`,
      stepsSub: isHighRisk ? "சோர்வு அதிகமாக உள்ளது" : "சென்ற வாரத்தை விட சுறுசுறுப்பு",
      tabletsTitle: "எடுத்துக்கொண்ட மாத்திரைகள்",
      tabletsVal: currentPatient.vitals.adherence.sub || "14 இல் 12",
      tabletsSub: "சிறந்த ஒழுங்கு",
      todaysPlan: "இன்றைய திட்டம்",
      todaysDate: "செவ்வாய், 14 மே",
      oneSmallThing: "இன்று செய்ய வேண்டிய ஒன்று",
      ironTabletTag: "இரும்புச்சத்து மாத்திரை",
      takeAfterLunch: "மதிய உணவுக்குப் பின் உட்கொள்ளவும்",
      tabletDesc: "தண்ணீர் அல்லது எலுமிச்சை சாற்றுடன் குடிக்கவும்—டீ, காபி, பாலுடன் வேண்டாம்.",
      markTaken: "எடுத்துக்கொண்டேன்",
      takenSuccess: "இன்று உட்கொண்டாச்சு",
      nextCheckInTag: "அடுத்த பரிசோதனை",
      nextCheckInTitle: isHighRisk ? "PHC மருத்துவ பரிசோதனை" : "4வது வார ஹீமோகுளோபின் பரிசோதனை",
      nextCheckInDesc: "உங்கள் ஆஷா பணியாளர் ஆரம்ப சுகாதார நிலையத்தில் ஏற்பாடு செய்வார்.",
      in14Days: isHighRisk ? "விரைவில்" : "14 நாட்களில்",
      unwellPrompt: "உடல் சோர்வா? மயக்கம், நெஞ்சு வலி, மூச்சுத்திணறல் அல்லது இரத்தப்போக்கு இருந்தால் தொடர்பு கொள்ளவும்.",
      contactCareTeam: "மருத்துவக் குழுவைத் தொடர்பு கொள்ள"
    },
    te: {
      navTitle: "నా ఆరోగ్యం",
      breadcrumb: "నా ఆరోగ్య ప్రయాణం",
      dayTag: `మీ రికవరీలో ${currentPatient.enrolledDays || 14}వ రోజు`,
      greeting: `నమస్తే, ${firstName}`,
      subGreeting: "ఈరోజు మీ సులభమైన ఆరోగ్య సమాచారం.",
      treatmentStatusTag: "చికిత్స స్థితి",
      treatmentStatus: isHighRisk ? "స్పందన నెమ్మదిగా ఉంది" : "మీ ఆరోగ్యం మెరుగవుతోంది",
      treatmentDesc: isHighRisk 
        ? "మీ శరీరంలో ఐరన్ మాత్రలు సరిగ్గా శోషించబడటం లేదు. తదుపరి చికిత్స కోసం వైద్యుడిని సంప్రదించండి."
        : "మీ ఐరన్ స్థాయి ఊహించిన విధంగా పెరుగుతోంది. రోజూ మాత్రను తప్పకుండా వేసుకోండి.",
      hbTag: "హిమోగ్లోబిన్",
      hbVal: currentPatient.vitals.hemoglobin.value,
      hbUnit: "g/dL",
      hbSub: currentPatient.vitals.hemoglobin.delta || "+1.4",
      hrTitle: "గుండె వేగం",
      hrVal: `${currentPatient.vitals.heartRate.value} bpm`,
      hrSub: isHighRisk ? "గుండె వేగం అధికంగా ఉంది" : "ఆరోగ్యకరమైన స్థాయిలో ఉంది",
      stepsTitle: "దైనందిన నడక",
      stepsVal: `${currentPatient.vitals.activity.value} అడుగులు`,
      stepsSub: isHighRisk ? "నీరసం ఎక్కువగా ఉంది" : "గత వారం కంటే మెరుగైంది",
      tabletsTitle: "వేసుకున్న మాత్రలు",
      tabletsVal: currentPatient.vitals.adherence.sub || "14 లో 12",
      tabletsSub: "మంచి అలవాటు",
      todaysPlan: "ఈరోజు ప్రణాళిక",
      todaysDate: "మంగళవారం, 14 మే",
      oneSmallThing: "చేయవలసిన ఒక ముఖ్యమైన పని",
      ironTabletTag: "మీ ఐరన్ మాత్ర",
      takeAfterLunch: "మధ్యాహ్న భోజనం తర్వాత వేసుకోండి",
      tabletDesc: "నీటితో లేదా నిమ్మరసంతో వేసుకోండి—టీ, కాఫీ లేదా పాలతో వద్దు.",
      markTaken: "వేసుకున్నాను",
      takenSuccess: "ఈరోజు వేసుకున్నాను",
      nextCheckInTag: "తదుపరి పరీక్ష",
      nextCheckInTitle: isHighRisk ? "పీహెచ్‌సీ (PHC) డాక్టర్ సంప్రదింపు" : "4వ వారం హిమోగ్లోబిన్ పరీక్ష",
      nextCheckInDesc: "మీ ఆశా కార్యకర్త పీహెచ్‌సీ (PHC) లో ఏర్పాటు చేస్తారు.",
      in14Days: isHighRisk ? "త్వరలో" : "14 రోజుల్లో",
      unwellPrompt: "అనారోగ్యంగా ఉందా? కళ్ళు తిరగడం, ఛాతీ నొప్పి, శ్వాస తీసుకోవడంలో ఇబ్బంది లేదా రక్తస్రావం ఉంటే వెంటనే సంప్రదించండి.",
      contactCareTeam: "ఆరోగ్య బృందాన్ని సంప్రదించండి"
    }
  };

  const currentT = t[language] || t.en;

  return (
    <div className="min-h-screen bg-[#f5eee5] text-[#221613] flex flex-col font-sans select-none">
      {/* 1. Top Navbar */}
      <nav className="bg-[#211714] text-[#fbf7f2] px-6 py-3.5 flex items-center justify-between border-b border-[#352620]">
        {/* Left branding */}
        <div 
          onClick={onExitPortal}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img 
            src="/hemalyx-logo.png" 
            alt="Hemalyx" 
            className="w-8 h-8 object-contain select-none group-hover:scale-105 transition-transform" 
          />
          <div>
            <div className="font-bold text-sm tracking-tight text-[#faf6f1] leading-none">Hemalyx</div>
            <div className="text-[10px] text-[#a59385] tracking-wide mt-0.5">Oral iron response intelligence</div>
          </div>
        </div>

        {/* Center Pill Button */}
        <div className="bg-[#2d1e1a] p-1 rounded-full flex items-center border border-[#3e2b24]">
          <div className="flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-semibold bg-[#efe5d8] text-[#211714] shadow-sm">
            <Heart className="w-3.5 h-3.5 text-[#5a3a2d]" />
            <span>{currentT.navTitle}</span>
          </div>
        </div>

        {/* Right Exit & Patient Switcher */}
        <div className="flex items-center gap-3">
          {/* Patient Selector */}
          <div className="relative">
            <select
              value={currentPatient.id}
              onChange={(e) => onSelectPatientId && onSelectPatientId(e.target.value)}
              className="appearance-none bg-[#382620] hover:bg-[#473229] border border-[#523c31] text-[11px] font-semibold text-[#f5eee5] py-1.5 pl-3 pr-7 rounded-full cursor-pointer focus:outline-none"
            >
              {PATIENTS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.riskLevel})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#baa797] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <button 
            onClick={onExitPortal}
            className="text-xs text-[#a99789] hover:text-[#faf6f0] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Exit portal</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#d8c7b5] text-[#2a1b16] font-bold text-xs flex items-center justify-center border border-[#baa794]">
            {currentPatient.avatar}
          </div>
        </div>
      </nav>

      {/* 2. Sub-header Breadcrumb */}
      <div className="bg-[#ede4d7] px-6 py-2.5 flex items-center justify-between text-xs text-[#6e5d52] border-b border-[#e0d3c2]">
        <div className="font-medium">
          {currentT.breadcrumb} · Viewing {currentPatient.name} ({currentPatient.id})
        </div>
        <div className="text-[11px] text-[#7a695d]">
          Last sync: today, 09:42
        </div>
      </div>

      {/* 3. Main Patient Body */}
      <main className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Header with language selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-[#796456] uppercase">
              {currentT.dayTag}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#211512] mt-1">
              {currentT.greeting}
            </h1>
            <p className="text-xs text-[#715c4f] mt-1">
              {currentT.subGreeting}
            </p>
          </div>

          {/* Multilingual Selector */}
          <div className="relative shrink-0">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="appearance-none bg-[#ebdcd0] hover:bg-[#e4d3c5] border border-[#d5c3b1] text-xs font-semibold text-[#3b271d] py-2 pl-4 pr-9 rounded-full shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#7b4f3c] cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6c5547] absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Hero Treatment Status Card */}
        <div className={`rounded-3xl p-6 border flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm ${
          isHighRisk 
            ? 'bg-[#edd9d4] border-[#d8beba]'
            : 'bg-[#dfd0be] border-[#cebda9]'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-0.5 ${
              isHighRisk ? 'bg-[#7a3424] text-white' : 'bg-[#3d271e] text-[#f7eee5]'
            }`}>
              {isHighRisk ? <AlertCircle className="w-6 h-6 stroke-[2.5]" /> : <Check className="w-6 h-6 stroke-[2.5]" />}
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest text-[#695244] uppercase">
                {currentT.treatmentStatusTag}
              </div>
              <h2 className="text-2xl font-bold text-[#201511] mt-0.5">
                {currentT.treatmentStatus}
              </h2>
              <p className="text-xs text-[#523d31] mt-1.5 leading-relaxed max-w-lg">
                {currentT.treatmentDesc}
              </p>
            </div>
          </div>

          <div className="md:text-right shrink-0 bg-white/40 md:bg-transparent p-4 md:p-0 rounded-2xl">
            <div className="text-[10px] font-bold tracking-wider text-[#695244] uppercase">
              {currentT.hbTag}
            </div>
            <div className="text-4xl font-serif font-bold text-[#201511] leading-none mt-1">
              {currentT.hbVal} <span className="text-xs font-sans font-normal text-[#6b5648]">{currentT.hbUnit}</span>
            </div>
            <div className="text-[11px] text-[#554034] mt-1 font-medium">
              {currentT.hbSub}
            </div>
          </div>
        </div>

        {/* 3 Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Heart rate */}
          <div className="bg-[#faf6f0] p-5 rounded-3xl border border-[#ded1c2] shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs text-[#735e51]">
              <Heart className="w-4 h-4 text-[#884737]" />
              <span className="font-medium">{currentT.hrTitle}</span>
            </div>
            <div className="my-3">
              <div className="text-2xl font-serif font-bold text-[#201511]">{currentT.hrVal}</div>
              <div className="text-[11px] text-[#6d574b] mt-0.5">{currentT.hrSub}</div>
            </div>
          </div>

          {/* Daily movement */}
          <div className="bg-[#faf6f0] p-5 rounded-3xl border border-[#ded1c2] shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs text-[#735e51]">
              <Activity className="w-4 h-4 text-[#9b6238]" />
              <span className="font-medium">{currentT.stepsTitle}</span>
            </div>
            <div className="my-3">
              <div className="text-2xl font-serif font-bold text-[#201511]">{currentT.stepsVal}</div>
              <div className="text-[11px] text-[#6d574b] mt-0.5">{currentT.stepsSub}</div>
            </div>
          </div>

          {/* Tablets taken */}
          <div className="bg-[#faf6f0] p-5 rounded-3xl border border-[#ded1c2] shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs text-[#735e51]">
              <CheckCircle2 className="w-4 h-4 text-[#5c3e30]" />
              <span className="font-medium">{currentT.tabletsTitle}</span>
            </div>
            <div className="my-3">
              <div className="text-2xl font-serif font-bold text-[#201511]">{currentT.tabletsVal}</div>
              <div className="text-[11px] text-[#6d574b] mt-0.5">{currentT.tabletsSub}</div>
            </div>
          </div>
        </div>

        {/* Today's Action Plan */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#796456]">
            <span>{currentT.todaysPlan}</span>
            <span>{currentT.todaysDate}</span>
          </div>

          {/* Action Card 1: Tablet routine */}
          <div className="bg-[#faf6f0] rounded-3xl p-5 border border-[#ded1c2] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#ede0d2] text-[#4d3629] flex items-center justify-center shrink-0 mt-0.5">
                <Smile className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-wider text-[#796456] uppercase">
                  {currentT.ironTabletTag}
                </div>
                <h4 className="font-bold text-base text-[#211512] mt-0.5">
                  {currentT.takeAfterLunch}
                </h4>
                <p className="text-xs text-[#6e584b] mt-1 leading-relaxed max-w-md">
                  {currentT.tabletDesc}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <button
                onClick={() => setTabletTaken(!tabletTaken)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                  tabletTaken
                    ? 'bg-[#3b251d] text-[#faf6f0] flex items-center gap-1.5'
                    : 'bg-white hover:bg-[#faf4ee] text-[#221613] border border-[#d8c5b2]'
                }`}
              >
                {tabletTaken ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{currentT.takenSuccess}</span>
                  </>
                ) : (
                  <span>{currentT.markTaken}</span>
                )}
              </button>
            </div>
          </div>

          {/* Action Card 2: Next check-in */}
          <div className="bg-[#faf6f0] rounded-3xl p-5 border border-[#ded1c2] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#ede0d2] text-[#4d3629] flex items-center justify-center shrink-0 mt-0.5">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-wider text-[#796456] uppercase">
                  {currentT.nextCheckInTag}
                </div>
                <h4 className="font-bold text-base text-[#211512] mt-0.5">
                  {currentT.nextCheckInTitle}
                </h4>
                <p className="text-xs text-[#6e584b] mt-1">
                  {currentT.nextCheckInDesc}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <span className="text-xs font-semibold text-[#665042] bg-[#eee4d6] px-3.5 py-1.5 rounded-full border border-[#ded0c0]">
                {currentT.in14Days}
              </span>
            </div>
          </div>
        </div>

        {/* Emergency & Care Team Banner */}
        <div className="bg-[#ede4d7] rounded-2xl p-4 border border-[#ddd0c0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#5a4538]">
          <div className="flex items-center gap-2.5">
            <Heart className="w-4 h-4 text-[#8a4a39] shrink-0" />
            <span>{currentT.unwellPrompt}</span>
          </div>

          <button
            onClick={() => setCareModalOpen(true)}
            className="px-4 py-2 rounded-full bg-[#fcf9f5] hover:bg-white text-xs font-semibold text-[#251813] border border-[#cfbeb0] shrink-0 shadow-2xs transition-colors cursor-pointer"
          >
            {currentT.contactCareTeam}
          </button>
        </div>
      </main>

      {/* Care team contact popup */}
      {careModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#faf6f0] text-[#241814] w-full max-w-md rounded-3xl shadow-2xl border border-[#ded1c2] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#211512]">Contact Your Health Support Team</h3>
              <button 
                onClick={() => setCareModalOpen(false)}
                className="text-[#846f61] hover:text-[#211512] text-sm"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-white rounded-xl border border-[#e1d2c1] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#221613]">Sunita Devi (ASHA Worker)</div>
                  <div className="text-[11px] text-[#786457]">Assigned Village Community Worker</div>
                </div>
                <a 
                  href="tel:108"
                  className="px-3 py-1.5 bg-[#251713] text-white rounded-full text-xs font-semibold flex items-center gap-1.5"
                >
                  <Phone className="w-3 h-3" />
                  Call
                </a>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-[#e1d2c1] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#221613]">Rural Primary Health Centre (PHC)</div>
                  <div className="text-[11px] text-[#786457]">Medical Officer on Duty</div>
                </div>
                <a 
                  href="tel:108"
                  className="px-3 py-1.5 bg-[#251713] text-white rounded-full text-xs font-semibold flex items-center gap-1.5"
                >
                  <Phone className="w-3 h-3" />
                  Call
                </a>
              </div>
              <div className="p-3 bg-[#f3e9dc] rounded-xl text-[11px] text-[#61493c]">
                <strong>Emergency:</strong> In case of severe fainting, chest pain, or bleeding, dial 108 immediately.
              </div>
            </div>
            <button
              onClick={() => setCareModalOpen(false)}
              className="w-full py-2.5 rounded-full bg-[#251713] text-[#f7eee5] text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
