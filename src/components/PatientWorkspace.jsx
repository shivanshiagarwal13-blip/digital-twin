import React, { useState } from 'react';
import { 
  Heart, Activity, CheckCircle2, Check, ChevronDown, 
  Calendar, Phone, AlertCircle, ArrowRight, ShieldCheck, 
  Smile, UserCheck, Stethoscope
} from 'lucide-react';

export function PatientWorkspace({ onExitPortal }) {
  const [language, setLanguage] = useState('en');
  const [tabletTaken, setTabletTaken] = useState(false);
  const [careModalOpen, setCareModalOpen] = useState(false);

  // Translations for English, Hindi, Tamil, Telugu
  const t = {
    en: {
      navTitle: "My health",
      breadcrumb: "My health journey",
      dayTag: "DAY 14 OF YOUR RECOVERY",
      greeting: "Hello, Priya",
      subGreeting: "Here is your simple health update for today.",
      treatmentStatusTag: "YOUR TREATMENT STATUS",
      treatmentStatus: "You're getting better",
      treatmentDesc: "Your iron level is rising as expected. Keep taking your tablet every day.",
      hbTag: "HEMOGLOBIN",
      hbVal: "10",
      hbUnit: "g/dL",
      hbSub: "+1.4 since start",
      hrTitle: "Heart rate",
      hrVal: "78 bpm",
      hrSub: "Back in a healthy range",
      stepsTitle: "Daily movement",
      stepsVal: "6,420 steps",
      stepsSub: "More active than last week",
      tabletsTitle: "Tablets taken",
      tabletsVal: "12 of 13",
      tabletsSub: "Excellent consistency",
      todaysPlan: "TODAY'S PLAN",
      todaysDate: "Tuesday, 14 May",
      oneSmallThing: "One small thing to do",
      ironTabletTag: "YOUR IRON TABLET",
      takeAfterLunch: "Take after lunch",
      tabletDesc: "Have it with water or citrus fruit—not tea, coffee, or milk.",
      markTaken: "Mark taken",
      takenSuccess: "Taken today",
      nextCheckInTag: "NEXT CHECK-IN",
      nextCheckInTitle: "Week 4 hemoglobin check",
      nextCheckInDesc: "Your ASHA worker will help arrange this at the PHC.",
      in14Days: "In 14 days",
      unwellPrompt: "Feeling unwell? Get help for fainting, chest pain, trouble breathing, or bleeding.",
      contactCareTeam: "Contact care team"
    },
    hi: {
      navTitle: "मेरी सेहत",
      breadcrumb: "मेरी स्वास्थ्य यात्रा",
      dayTag: "आपके सुधार का 14वां दिन",
      greeting: "नमस्ते, प्रिया",
      subGreeting: "आज के लिए आपका आसान स्वास्थ्य विवरण।",
      treatmentStatusTag: "आपकी सेहत की स्थिति",
      treatmentStatus: "आपकी सेहत सुधर रही है",
      treatmentDesc: "आपका आयरन स्तर अपेक्षा के अनुसार बढ़ रहा है। अपनी गोली रोज़ाना लेते रहें।",
      hbTag: "हीमोग्लोबिन",
      hbVal: "10",
      hbUnit: "g/dL",
      hbSub: "शुरुआत से +1.4 अधिक",
      hrTitle: "हृदय गति",
      hrVal: "78 bpm",
      hrSub: "सामान्य और स्वस्थ दायरे में",
      stepsTitle: "दैनिक चलना-फिरना",
      stepsVal: "6,420 कदम",
      stepsSub: "पिछले हफ्ते से अधिक सक्रिय",
      tabletsTitle: "ली गई गोलियां",
      tabletsVal: "13 में से 12",
      tabletsSub: "बहुत अच्छा नियम",
      todaysPlan: "आज की योजना",
      todaysDate: "मंगलवार, 14 मई",
      oneSmallThing: "आज का एक ज़रूरी काम",
      ironTabletTag: "आपकी आयरन की गोली",
      takeAfterLunch: "दोपहर के खाने के बाद लें",
      tabletDesc: "इसे पानी या नींबू/संतरे के रस के साथ लें—चाय, कॉफी या दूध के साथ नहीं।",
      markTaken: "ली गई दर्ज करें",
      takenSuccess: "आज ले ली गई",
      nextCheckInTag: "अगली जांच",
      nextCheckInTitle: "सप्ताह 4 हीमोग्लोबिन जांच",
      nextCheckInDesc: "आपकी आशा दीदी पीएचसी (PHC) में इसकी व्यवस्था करेंगी।",
      in14Days: "14 दिनों में",
      unwellPrompt: "अस्वस्थ महसूस कर रही हैं? चक्कर, सीने में दर्द, सांस लेने में तकलीफ या रक्तस्राव पर तुरंत मदद लें।",
      contactCareTeam: "स्वास्थ्य टीम से संपर्क करें"
    },
    ta: {
      navTitle: "என் உடல்நலம்",
      breadcrumb: "என் நலப்பயணம்",
      dayTag: "உங்கள் குணமடைதலின் 14வது நாள்",
      greeting: "வணக்கம், பிரியா",
      subGreeting: "இன்றைய உங்கள் எளிய உடல்நல விவரம்.",
      treatmentStatusTag: "சிகிச்சை நிலை",
      treatmentStatus: "நீங்கள் நலமடைந்து வருகிறீர்கள்",
      treatmentDesc: "உங்கள் இரும்புச்சத்து எதிர்பார்த்தபடி உயர்கிறது. தினமும் மாத்திரையைத் தவறாமல் உட்கொள்ளுங்கள்.",
      hbTag: "ஹீமோகுளோபின்",
      hbVal: "10",
      hbUnit: "g/dL",
      hbSub: "துவக்கத்தை விட +1.4 உயர்வு",
      hrTitle: "இதயத் துடிப்பு",
      hrVal: "78 bpm",
      hrSub: "ஆரோக்கியமான நிலைக்குத் திரும்பியது",
      stepsTitle: "தினசரி நடை",
      stepsVal: "6,420 அடிகள்",
      stepsSub: "சென்ற வாரத்தை விட சுறுசுறுப்பு",
      tabletsTitle: "எடுத்துக்கொண்ட மாத்திரைகள்",
      tabletsVal: "13 இல் 12",
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
      nextCheckInTitle: "4வது வார ஹீமோகுளோபின் பரிசோதனை",
      nextCheckInDesc: "உங்கள் ஆஷா பணியாளர் ஆரம்ப சுகாதார நிலையத்தில் ஏற்பாடு செய்வார்.",
      in14Days: "14 நாட்களில்",
      unwellPrompt: "உடல் சோர்வா? மயக்கம், நெஞ்சு வலி, மூச்சுத்திணறல் அல்லது இரத்தப்போக்கு இருந்தால் தொடர்பு கொள்ளவும்.",
      contactCareTeam: "மருத்துவக் குழுவைத் தொடர்பு கொள்ள"
    },
    te: {
      navTitle: "నా ఆరోగ్యం",
      breadcrumb: "నా ఆరోగ్య ప్రయాణం",
      dayTag: "మీ రికవరీలో 14వ రోజు",
      greeting: "నమస్తే, ప్రియా",
      subGreeting: "ఈరోజు మీ సులభమైన ఆరోగ్య సమాచారం.",
      treatmentStatusTag: "చికిత్స స్థితి",
      treatmentStatus: "మీ ఆరోగ్యం మెరుగవుతోంది",
      treatmentDesc: "మీ ఐరన్ స్థాయి ఊహించిన విధంగా పెరుగుతోంది. రోజూ మాత్రను తప్పకుండా వేసుకోండి.",
      hbTag: "హిమోగ్లోబిన్",
      hbVal: "10",
      hbUnit: "g/dL",
      hbSub: "ప్రారంభం నుండి +1.4",
      hrTitle: "గుండె వేగం",
      hrVal: "78 bpm",
      hrSub: "ఆరోగ్యకరమైన స్థాయికి చేరింది",
      stepsTitle: "రోజువారీ నడక",
      stepsVal: "6,420 అడుగులు",
      stepsSub: "గత వారం కంటే ఎక్కువ చురుకుగా",
      tabletsTitle: "వేసుకున్న మాత్రలు",
      tabletsVal: "13 లో 12",
      tabletsSub: "చాలా మంచి క్రమశిక్షణ",
      todaysPlan: "నేటి ప్రణాళిక",
      todaysDate: "మంగళవారం, 14 మే",
      oneSmallThing: "చేయవలసిన ఒక ముఖ్యమైన పని",
      ironTabletTag: "మీ ఐరన్ మాత్ర",
      takeAfterLunch: "మధ్యాహ్న భోజనం తర్వాత వేసుకోండి",
      tabletDesc: "నీటితో లేదా నిమ్మరసంతో వేసుకోండి—టీ, కాఫీ లేదా పాలతో వద్దు.",
      markTaken: "వేసుకున్నాను",
      takenSuccess: "ఈరోజు వేసుకున్నాను",
      nextCheckInTag: "తదుపరి పరీక్ష",
      nextCheckInTitle: "4వ వారం హిమోగ్లోబిన్ పరీక్ష",
      nextCheckInDesc: "మీ ఆశా కార్యకర్త పీహెచ్‌సీ (PHC) లో ఏర్పాటు చేస్తారు.",
      in14Days: "14 రోజుల్లో",
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

        {/* Right Exit & Avatar */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onExitPortal}
            className="text-xs text-[#a99789] hover:text-[#faf6f0] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Exit portal</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#d8c7b5] text-[#2a1b16] font-bold text-xs flex items-center justify-center border border-[#baa794]">
            PS
          </div>
        </div>
      </nav>

      {/* 2. Sub-header Breadcrumb */}
      <div className="bg-[#ede4d7] px-6 py-2.5 flex items-center justify-between text-xs text-[#6e5d52] border-b border-[#e0d3c2]">
        <div className="font-medium">
          {currentT.breadcrumb}
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
        <div className="bg-[#dfd0be] rounded-3xl p-6 border border-[#cebda9] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#3d271e] text-[#f7eee5] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Check className="w-6 h-6 stroke-[2.5]" />
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
              <CheckCircle2 className="w-4 h-4 text-[#5a3e30]" />
              <span className="font-medium">{currentT.tabletsTitle}</span>
            </div>
            <div className="my-3">
              <div className="text-2xl font-serif font-bold text-[#201511]">
                {tabletTaken ? "13 of 13" : currentT.tabletsVal}
              </div>
              <div className="text-[11px] text-[#6d574b] mt-0.5">{currentT.tabletsSub}</div>
            </div>
          </div>
        </div>

        {/* TODAY'S PLAN Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold tracking-wider text-[#796456] uppercase">
              {currentT.todaysPlan}
            </span>
            <span className="text-[#786457] font-medium">{currentT.todaysDate}</span>
          </div>

          <h3 className="text-xl font-bold tracking-tight text-[#201511]">
            {currentT.oneSmallThing}
          </h3>

          {/* Action Card 1: Iron Tablet */}
          <div className="bg-[#eedecf] rounded-3xl p-5 border border-[#ddccbd] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#201511] mt-1.5 shrink-0" />
              <div>
                <div className="text-[10px] font-bold tracking-wider text-[#705648] uppercase">
                  {currentT.ironTabletTag}
                </div>
                <h4 className="font-bold text-base text-[#211512] mt-0.5">
                  {currentT.takeAfterLunch}
                </h4>
                <p className="text-xs text-[#5c4639] mt-1">
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

          {/* Action Card 2: Next check-in (Page 7) */}
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

        {/* Emergency & Care Team Banner (Page 7 bottom) */}
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
