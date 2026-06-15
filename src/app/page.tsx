'use client'

import { useState } from 'react'
import UserNav from '@/components/layout/user-nav'
import {
  Trophy,
  Users,
  MapPin,
  School,
  Tv,
  Globe,
  CheckCircle,
  ArrowRight,
  Volume2,
  VolumeX,
  TrendingUp,
  Zap,
  ShieldCheck,
  Sparkles,
  Search,
  ChevronRight,
  Flame,
  Award,
} from 'lucide-react'

// Mock data for upcoming tournaments
const MOCK_TOURNAMENTS = [
  {
    id: 't1',
    title: 'Free Fire Max - Gwalior College Clash',
    game: 'Free Fire Max',
    format: 'Squad (BR)',
    status: 'REGISTRATION_OPEN',
    entry_fee: 'Free',
    prize_pool: '₹5,000',
    max_teams: 48,
    registered: 32,
    city: 'Gwalior',
    state: 'MP',
    college: 'MITS Gwalior',
    date: '18 Jun 2026',
    accent: 'from-amber-500 to-orange-600',
    game_short: 'FF',
  },
  {
    id: 't2',
    title: 'BGMI - Pune Café Championship',
    game: 'Battlegrounds Mobile India',
    format: 'Squad (BR)',
    status: 'REGISTRATION_OPEN',
    entry_fee: '₹100/team',
    prize_pool: '₹25,000',
    max_teams: 64,
    registered: 51,
    city: 'Pune',
    state: 'Maharashtra',
    college: 'Pulse Gaming Lounge',
    date: '20 Jun 2026',
    accent: 'from-emerald-500 to-teal-700',
    game_short: 'BGMI',
  },
  {
    id: 't3',
    title: 'Valorant - South Bengaluru Collegiate',
    game: 'Valorant',
    format: '5v5 (Active)',
    status: 'ONGOING',
    entry_fee: '₹250/team',
    prize_pool: '₹50,000',
    max_teams: 16,
    registered: 16,
    city: 'Bengaluru',
    state: 'Karnataka',
    college: 'REVA University',
    date: '14 Jun 2026',
    accent: 'from-rose-500 to-red-700',
    game_short: 'VAL',
  },
]

// Mock leaderboards
const MOCK_LEADERBOARD = [
  {
    rank: 1,
    name: 'Aakash_FF',
    city: 'Gwalior',
    points: 2840,
    win_rate: '74%',
    badge: 'Top Fragger',
  },
  {
    rank: 2,
    name: 'Priya_Val',
    city: 'Bengaluru',
    points: 2710,
    win_rate: '68%',
    badge: 'Captain',
  },
  {
    rank: 3,
    name: 'Rajat_BGMI',
    city: 'Pune',
    points: 2650,
    win_rate: '65%',
    badge: 'Clutch King',
  },
  {
    rank: 4,
    name: 'Amit_MITS',
    city: 'Gwalior',
    points: 2480,
    win_rate: '59%',
    badge: 'Consistent',
  },
  {
    rank: 5,
    name: 'Vikram_Raj',
    city: 'Jaipur',
    points: 2410,
    win_rate: '57%',
    badge: 'Team Player',
  },
]

// Local sponsor spots demo
const MOCK_SPONSORS = [
  {
    name: 'Pulse Gaming Lounge',
    category: 'PC Gaming Cafe',
    location: 'Pune',
    bid: '₹5,000',
    logo: '🎮',
  },
  {
    name: 'Apex Coaching Classes',
    category: 'Local Education',
    location: 'Gwalior',
    bid: '₹3,500',
    logo: '📚',
  },
  {
    name: 'Hydra Peripherals',
    category: 'Gamer Gears',
    location: 'Bengaluru',
    bid: '₹6,000',
    logo: '⌨️',
  },
]

export default function Home() {
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi' | 'ta' | 'te' | 'bn'>('en')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceVolume, setVoiceVolume] = useState(true)

  // Translations object for regional interface demo
  const t = {
    en: {
      heroTitle: 'District Esports Starts Here.',
      heroSub:
        "The 'district cricket league' equivalent for esports. Run professional tournaments, accept UPI payments, win cash, and get local brand sponsorships.",
      ctaExplore: 'Find Tournaments',
      ctaHost: 'Host a Tournament',
      badgeLive: 'Live Overlay',
      voiceAnnounce: 'Voice Announcement Demo',
      sponsorMin: 'Sponsorships starting at ₹2,000',
      statsTitle: 'Track Stats',
    },
    hi: {
      heroTitle: 'जिला स्तर का ई-स्पोर्ट्स यहाँ शुरू होता है।',
      heroSub:
        "ई-स्पोर्ट्स के लिए 'जिला क्रिकेट लीग' के समान। पेशेवर टूर्नामेंट आयोजित करें, UPI भुगतान स्वीकार करें, नकद जीतें और स्थानीय प्रायोजक पाएं।",
      ctaExplore: 'टूर्नामेंट खोजें',
      ctaHost: 'टूर्नामेंट आयोजित करें',
      badgeLive: 'लाइव ओवरले',
      voiceAnnounce: 'आवाज घोषणा डेमो',
      sponsorMin: '₹२,००० से शुरू होने वाले विज्ञापन स्लॉट',
      statsTitle: 'आँकड़े देखें',
    },
    ta: {
      heroTitle: 'மாவட்ட மின்-விளையாட்டு இங்கே தொடங்குகிறது.',
      heroSub:
        "மின்-விளையாட்டுக்கான 'மாவட்ட கிரிக்கெட் லீக்' போன்றது. தொழில்முறை போட்டிகளை நடத்துங்கள், UPI மூலம் பணம் பெறுங்கள், மற்றும் ஸ்பான்சர்களை ஈர்க்கவும்.",
      ctaExplore: 'போட்டிகளைத் தேடு',
      ctaHost: 'போட்டியை நடத்துக',
      badgeLive: 'நேரடி மேலடுக்கு',
      voiceAnnounce: 'குரல் அறிவிப்பு டெமோ',
      sponsorMin: '₹2,000 முதல் ஸ்பான்சர்ஷிப்',
      statsTitle: 'புள்ளிவிவரங்கள்',
    },
    te: {
      heroTitle: 'డిస్ట్రిక్ట్ ఈ-స్పోర్ట్స్ ఇక్కడ ప్రారంభమవుతుంది.',
      heroSub:
        "ఈ-స్పోర్ట్స్ కోసం 'డిస్ట్రిక్ట్ క్రికెట్ లీగ్' లాంటిది. ప్రొఫెషనల్ టోర్నమెంట్లు నిర్వహించండి, UPI చెల్లింపులు పొందండి మరియు స్పాన్సర్లను చేర్చుకోండి.",
      ctaExplore: 'టోర్నమెంట్లు కనుగొను',
      ctaHost: 'టోర్నమెంట్ నిర్వహించు',
      badgeLive: 'లైవ్ ఓవర్లే',
      voiceAnnounce: 'వాయిస్ అనౌన్స్మెంట్ డెమో',
      sponsorMin: '₹2,000 నుండి స్పాన్సర్‌షిప్స్',
      statsTitle: 'గణాంకాలు చూడు',
    },
    bn: {
      heroTitle: 'জেলা স্তরের ই-স্পোর্টস এখানে শুরু হয়।',
      heroSub:
        "ই-স্পোর্টসের জন্য 'জেলা ক্রিকেট লীগ'-এর সমতুল্য। পেশাদার টুর্নামেন্ট চালান, UPI পেমেন্ট গ্রহণ করুন, নগদ জিতুন এবং স্থানীয় স্পনসর পান।",
      ctaExplore: 'টুর্নামেন্ট খুঁজুন',
      ctaHost: 'টুর্নামেন্ট হোস্ট করুন',
      badgeLive: 'লাইভ ওভারলে',
      voiceAnnounce: 'ভয়েস ঘোষণা ডেমো',
      sponsorMin: '₹২,০০০ থেকে স্পনসরশিপ শুরু',
      statsTitle: 'পরিসংখ্যান ট্র্যাক',
    },
  }

  // Browser speech synthesis winner announcement trigger
  const handleAnnounceSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    let speechText = ''
    let langCode = ''

    switch (selectedLang) {
      case 'hi':
        speechText =
          'पुणे सिटी बी जी एम आई कप की विजेता टीम है, टीम गॉड लाइक! सभी खिलाड़ियों को बधाई!'
        langCode = 'hi-IN'
        break
      case 'ta':
        speechText =
          'புனே சிட்டி பி ஜி எம் ஐ கோப்பை வெற்றி பெற்ற அணி, டீம் காட் லைக்! வாழ்த்துக்கள்!'
        langCode = 'ta-IN'
        break
      case 'te':
        speechText = 'పూణే సిటీ బి జి ఎం ఐ కప్ విజేత జట్టు, టీమ్ గాడ్ లైక్! అభినందనలు!'
        langCode = 'te-IN'
        break
      case 'bn':
        speechText = 'পুনে সিটি বি জি এম আই কাপ এর বিজয়ী দল হলো, টিম গড লাইক! অভিনন্দন!'
        langCode = 'bn-IN'
        break
      default:
        speechText =
          'Winner of Pune City B G M I Cup is: Team GodLike! Congratulations to the players!'
        langCode = 'en-IN'
    }

    const utterance = new SpeechSynthesisUtterance(speechText)
    utterance.lang = langCode
    utterance.rate = 0.85 // Natural pacing
    utterance.volume = voiceVolume ? 1 : 0

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
    }

    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="min-h-screen bg-[#07070A] text-[#f8fafc] font-sans selection:bg-[#ff6b00] selection:text-white">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-[#07070A]/85 backdrop-blur-md border-b border-[#1e1e2f] px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-heading font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-orange-500 to-amber-400">
              FFARENA
              <span className="text-white text-xs font-sans font-bold bg-[#ff6b00] px-1.5 py-0.5 rounded ml-1">
                LIVE
              </span>
            </span>
          </div>

          {/* Lang quick switcher */}
          <div className="flex items-center gap-1.5 md:gap-3 bg-[#0D0D14] p-1 rounded-full border border-[#1e1e2f]">
            {(['en', 'hi', 'ta', 'te', 'bn'] as const).map((lang) => (
              <button
                key={lang}
                id={`lang-btn-${lang}`}
                onClick={() => setSelectedLang(lang)}
                className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase transition-all ${
                  selectedLang === lang
                    ? 'bg-[#0ea5e9] text-white shadow-md shadow-sky-500/25'
                    : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#151522]'
                }`}
              >
                {lang === 'en'
                  ? 'EN'
                  : lang === 'hi'
                    ? 'हिं'
                    : lang === 'ta'
                      ? 'தமிழ்'
                      : lang === 'te'
                        ? 'తెలు'
                        : 'বাংলা'}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a
              href="#tournaments"
              className="text-sm font-semibold text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
            >
              Tournaments
            </a>
            <a
              href="#sponsor-portal"
              className="text-sm font-semibold text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
            >
              Sponsor Slots
            </a>
            <a
              href="#leaderboards"
              className="text-sm font-semibold text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
            >
              Leaderboards
            </a>
            <UserNav />
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32 px-4 border-b border-[#1e1e2f]">
        {/* Glow backdrop items */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0ea5e9]/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-[#ff6b00]/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#151522] border border-[#1e1e2f] mb-6 text-xs text-[#0ea5e9] font-bold tracking-wide uppercase">
            <Sparkles
              className="w-3.5 h-3.5 text-[#ff6b00] animate-spin"
              style={{ animationDuration: '3s' }}
            />
            <span>Grassroots Esports India</span>
          </div>

          {/* Dynamic language-linked heading */}
          <h1 className="text-4xl sm:text-6xl font-heading font-black tracking-tight leading-none mb-6 max-w-4xl text-transparent bg-clip-text bg-gradient-to-b from-[#f8fafc] via-[#f8fafc] to-[#94a3b8]">
            {t[selectedLang].heroTitle}
          </h1>

          <p className="text-base sm:text-xl text-[#94a3b8] leading-relaxed max-w-2xl mb-10">
            {t[selectedLang].heroSub}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <a
              href="#tournaments"
              id="hero-explore-btn"
              className="w-full sm:w-auto px-8 py-4 font-bold rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white shadow-lg shadow-sky-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all text-center"
            >
              {t[selectedLang].ctaExplore}
            </a>
            <button
              id="hero-host-btn"
              className="w-full sm:w-auto px-8 py-4 font-bold rounded-xl bg-[#0D0D14] hover:bg-[#151522] text-white border border-[#1e1e2f] hover:border-[#94a3b8] transition-all text-center"
            >
              {t[selectedLang].ctaHost}
            </button>
          </div>

          {/* Interactive Speech Synthesis Announcer Box */}
          <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-[#0D0D14]/80 backdrop-blur border border-[#1e1e2f] max-w-lg w-full flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl bg-[#151522] ${isSpeaking ? 'text-[#ff6b00] border border-[#ff6b00] animate-pulse' : 'text-[#0ea5e9]'}`}
              >
                <Volume2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-[#ff6b00]">
                  Vernacular Announcement
                </span>
                <p className="text-xs text-[#94a3b8]">Listen to results in regional voices</p>
              </div>
            </div>

            <button
              id="speech-announce-btn"
              onClick={handleAnnounceSpeech}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                isSpeaking
                  ? 'bg-red-500/25 hover:bg-red-500/40 text-red-400 border border-red-500/30'
                  : 'bg-[#151522] hover:bg-[#1a1a2e] text-[#f8fafc] border border-[#1e1e2f] hover:border-[#0ea5e9]'
              }`}
            >
              {isSpeaking ? 'Stop Voice' : t[selectedLang].voiceAnnounce}
            </button>
          </div>
        </div>
      </section>

      {/* ── CORE FEATURE GRID ── */}
      <section className="py-20 px-4 max-w-7xl mx-auto border-b border-[#1e1e2f]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#ff6b00] uppercase tracking-wider">
            Features Built For India
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-black mt-2">
            Replace Fragmented WhatsApp Groups
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: UPI Payments */}
          <div className="p-6 rounded-2xl bg-[#0D0D14] border border-[#1e1e2f] hover:border-[#0ea5e9]/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#151522] flex items-center justify-center text-[#0ea5e9] mb-6 border border-[#1e1e2f] group-hover:border-[#0ea5e9]/40 transition-all">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-heading font-bold mb-3">UPI-Native Ledger & Escrow</h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
              Gather registration entry fees via UPI seamlessly. Locked in secure escrow and
              distributed instantly upon tournament completion with automated TDS deductions.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#0ea5e9] font-bold group-hover:gap-3 transition-all">
              <span>View transaction ledgers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Sponsor Marketplace */}
          <div className="p-6 rounded-2xl bg-[#0D0D14] border border-[#1e1e2f] hover:border-[#0ea5e9]/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#151522] flex items-center justify-center text-[#ff6b00] mb-6 border border-[#1e1e2f] group-hover:border-[#ff6b00]/40 transition-all">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-heading font-bold mb-3">₹2,000 Sponsor Marketplace</h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
              Local brands (PC cafes, coaching centers, peripherals) sponsor local tournaments.
              Auto-inject banners onto brackets and stream overlays with post-event report
              analytics.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#ff6b00] font-bold group-hover:gap-3 transition-all">
              <span>Explore sponsored deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: RTMP & Stream Overlay */}
          <div className="p-6 rounded-2xl bg-[#0D0D14] border border-[#1e1e2f] hover:border-[#0ea5e9]/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#151522] flex items-center justify-center text-amber-500 mb-6 border border-[#1e1e2f] group-hover:border-amber-500/40 transition-all">
              <Tv className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-heading font-bold mb-3">Dynamic Overlay Stream</h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
              One-click RTMP forwarding to Twitch or YouTube. Dynamically overlay tournament titles,
              match score tickers, and sponsor banners onto the video feed automatically.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-500 font-bold group-hover:gap-3 transition-all">
              <span>Overlay specifications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* ── TOURNAMENTS SECTION ── */}
      <section id="tournaments" className="py-20 px-4 max-w-7xl mx-auto border-b border-[#1e1e2f]">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-bold text-[#ff6b00] uppercase tracking-wider">
              Join Active Matches
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black mt-2">
              Grassroots Tournament lobbies
            </h2>
          </div>
          <button
            id="view-all-tournaments-btn"
            className="flex items-center gap-2 text-xs font-bold text-[#0ea5e9] hover:underline"
          >
            <span>View All Tournaments</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {MOCK_TOURNAMENTS.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl bg-[#0D0D14] border border-[#1e1e2f] overflow-hidden hover:border-[#0ea5e9]/40 transition-all group flex flex-col justify-between"
            >
              {/* Card Header Color Stripe */}
              <div className={`h-2 bg-gradient-to-r ${t.accent}`} />

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#151522] border border-[#1e1e2f] text-[#94a3b8]">
                      {t.game}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-black tracking-wide ${
                        t.status === 'ONGOING'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {t.status === 'ONGOING' ? 'LIVE' : 'OPEN'}
                    </span>
                  </div>

                  <h3 className="text-lg font-heading font-bold mb-3 leading-snug group-hover:text-[#0ea5e9] transition-colors">
                    {t.title}
                  </h3>

                  {/* Metadata */}
                  <div className="space-y-2 mb-6 text-xs text-[#94a3b8]">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#ff6b00]" />
                      <span>
                        {t.city}, {t.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <School className="w-3.5 h-3.5 text-[#0ea5e9]" />
                      <span>{t.college}</span>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Stats Footer inside Card */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#151522] border border-[#1e1e2f] text-center mb-4 text-xs">
                    <div>
                      <span className="block text-[10px] text-[#94a3b8] uppercase mb-0.5">
                        Prize
                      </span>
                      <span className="font-bold text-[#f8fafc]">{t.prize_pool}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#94a3b8] uppercase mb-0.5">
                        Entry
                      </span>
                      <span className="font-bold text-[#f8fafc]">{t.entry_fee}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#94a3b8] uppercase mb-0.5">
                        Slots
                      </span>
                      <span className="font-bold text-[#f8fafc]">
                        {t.registered}/{t.max_teams}
                      </span>
                    </div>
                  </div>

                  <button
                    id={`register-btn-${t.id}`}
                    className="w-full py-2.5 font-bold rounded-lg text-xs transition-all bg-[#151522] hover:bg-[#0ea5e9] border border-[#1e1e2f] hover:border-[#0ea5e9] text-white"
                  >
                    {t.status === 'ONGOING' ? 'Watch Live Bracket' : 'Register Team'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LEADERBOARD & STATS SECTION ── */}
      <section id="leaderboards" className="py-20 px-4 max-w-7xl mx-auto border-b border-[#1e1e2f]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-[#ff6b00] uppercase tracking-wider">
              Persistent ELO Rankings
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black mt-2 mb-6">
              Rise from City to National Standings
            </h2>
            <p className="text-[#94a3b8] leading-relaxed mb-6 text-sm sm:text-base">
              Every match won on FFArena is counted towards your ELO ranking. Scouts and pro
              organizations scan our city and college leaderboards to find Tier-2/3 players. Build
              your verified esports CV.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="p-2 rounded bg-[#151522] text-[#0ea5e9]">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold">Verified Character UIDs</h4>
                  <p className="text-xs text-[#94a3b8]">
                    Players link Free Fire/BGMI UIDs ensuring anti-smurf integrity.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="p-2 rounded bg-[#151522] text-[#ff6b00]">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold">District Pride Badges</h4>
                  <p className="text-xs text-[#94a3b8]">
                    Claim badges representing your high placements in your local cities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Leaderboard Component */}
          <div className="p-5 rounded-2xl bg-[#0D0D14] border border-[#1e1e2f]">
            <div className="flex items-center justify-between mb-4 border-b border-[#1e1e2f] pb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="font-heading font-bold text-sm">Gwalior, MP Leaderboard</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#151522] text-[#94a3b8] border border-[#1e1e2f]">
                Season 1
              </span>
            </div>

            <div className="space-y-2">
              {MOCK_LEADERBOARD.map((p) => (
                <div
                  key={p.rank}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#07070A] border border-[#1e1e2f] hover:border-[#0ea5e9]/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold w-5 text-center ${
                        p.rank === 1
                          ? 'text-amber-400'
                          : p.rank === 2
                            ? 'text-slate-300'
                            : p.rank === 3
                              ? 'text-amber-600'
                              : 'text-[#94a3b8]'
                      }`}
                    >
                      #{p.rank}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white">{p.name}</p>
                      <p className="text-[10px] text-[#94a3b8]">{p.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-[10px] text-[#94a3b8] block">ELO</span>
                      <span className="text-xs font-bold text-white">{p.points}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#94a3b8] block">Badge</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-[#151522] rounded text-[#0ea5e9] border border-[#1e1e2f]">
                        {p.badge}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SPONSOR MARKETPLACE SECTION ── */}
      <section id="sponsor-portal" className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#ff6b00] uppercase tracking-wider">
            Monetize Your Audience
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-black mt-2">
            Sponsorships Starting at ₹2,000
          </h2>
          <p className="text-[#94a3b8] mt-4 text-sm sm:text-base leading-relaxed">
            Local cafes, peripheral shops, and businesses can purchase dynamic placements. Logos are
            auto-injected onto bracket grids and livestreams. Organizers get funded; sponsors get
            trackable eye-impressions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {MOCK_SPONSORS.map((s, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#0D0D14] border border-[#1e1e2f] hover:border-[#ff6b00]/40 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{s.logo}</span>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{s.name}</h4>
                  <p className="text-[10px] text-[#94a3b8]">
                    {s.category} · {s.location}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#94a3b8] block">Camp. Bid</span>
                <span className="text-xs font-black text-[#ff6b00]">{s.bid}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Live Overlay placement mock */}
        <div className="p-4 sm:p-8 rounded-2xl bg-[#0D0D14] border border-[#1e1e2f] overflow-hidden relative">
          <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded bg-[#ff6b00]/10 border border-[#ff6b00]/30 text-[10px] font-black text-[#ff6b00]">
            OVERLAY LIVE PREVIEW
          </div>

          <div className="border border-[#1e1e2f] rounded-xl bg-[#07070A] p-4 flex flex-col justify-between min-h-[200px]">
            {/* Mock overlay top strip */}
            <div className="flex items-center justify-between border-b border-[#1e1e2f] pb-3 text-xs">
              <div className="flex items-center gap-2">
                <Tv className="w-3.5 h-3.5 text-[#0ea5e9]" />
                <span className="font-heading font-bold">VALORANT PUNE CUP</span>
              </div>
              {/* Auto placement logo mock */}
              <div className="bg-[#151522] border border-[#1e1e2f] px-3 py-1 rounded flex items-center gap-1.5">
                <span className="text-[10px] text-[#94a3b8]">Sponsored by:</span>
                <span className="font-bold text-white text-xs">🎮 Pulse Gaming</span>
              </div>
            </div>

            {/* Mock Bracket Node inside stream overlay */}
            <div className="flex flex-col items-center justify-center py-6">
              <div className="flex items-center gap-3">
                <div className="bg-[#151522] border border-[#1e1e2f] px-3 py-1.5 rounded-lg text-center min-w-[100px]">
                  <span className="text-[10px] text-[#94a3b8] block">Team 1</span>
                  <span className="text-xs font-bold text-white">Velocity</span>
                </div>
                <span className="text-xs font-bold text-[#ff6b00]">VS</span>
                <div className="bg-[#151522] border border-[#1e1e2f] px-3 py-1.5 rounded-lg text-center min-w-[100px]">
                  <span className="text-[10px] text-[#94a3b8] block">Team 2</span>
                  <span className="text-xs font-bold text-white">GodLike</span>
                </div>
              </div>
            </div>

            {/* Mock overlay stats bottom footer */}
            <div className="flex items-center justify-between text-[10px] text-[#94a3b8] pt-2 border-t border-[#1e1e2f]">
              <span>Live stream resolution: 1080p @ 60fps</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                <span>2.4K viewers</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0D0D14] border-t border-[#1e1e2f] py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="text-xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-orange-500">
              FFARENA
            </span>
            <p className="text-xs text-[#94a3b8] mt-2">
              &copy; 2026 FFArena. live. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-[#94a3b8]">
            <a href="#tournaments" className="hover:text-white transition-colors">
              Tournaments
            </a>
            <a href="#sponsor-portal" className="hover:text-white transition-colors">
              Sponsorships
            </a>
            <a href="#leaderboards" className="hover:text-white transition-colors">
              Leaderboards
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Use
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
export const runtime = 'edge';
