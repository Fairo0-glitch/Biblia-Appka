import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('sv-SE'));
  const [currentVerse, setCurrentVerse] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('streakCount') || "0"));

  const minDate2026 = "2026-01-01";

  // TWOJA PEŁNA LISTA RANG (CO 5 DNI)
  const RANKS_CONFIG = [
    { day: 1, label: "Poszukiwacz", icon: "🔍" },
    { day: 5, label: "Słuchacz Słowa", icon: "👂" },
    { day: 10, label: "Katechumen", icon: "🕯️" },
    { day: 15, label: "Wierny", icon: "✝️" },
    { day: 20, label: "Gorliwy Wyznawca", icon: "🙏" },
    { day: 25, label: "Świadek Wiary", icon: "🕊️" },
    { day: 30, label: "Apostoł Codzienności", icon: "👣" },
    { day: 35, label: "Lektor", icon: "📖" },
    { day: 40, label: "Psalmišta", icon: "🎵" },
    { day: 45, label: "Akolita", icon: "🍷" },
    { day: 50, label: "Szafarz Słowa", icon: "📜" },
    { day: 55, label: "Ceremoniarz", icon: "🔔" },
    { day: 60, label: "Katecheta", icon: "🏫" },
    { day: 65, label: "Zelator", icon: "🔥" },
    { day: 70, label: "Członek Wspólnoty", icon: "🤝" },
    { day: 75, label: "Misjonarz", icon: "🌍" },
    { day: 80, label: "Obrońca Wiary", icon: "🛡️" },
    { day: 85, label: "Duchowy Pustelnik", icon: "🏔️" },
    { day: 90, label: "Kontemplator", icon: "🧘" },
    { day: 95, label: "Teolog Serca", icon: "🧠" },
    { day: 100, label: "Doktor Wiary", icon: "🏛️" },
    { day: 105, label: "Nowicjusz", icon: "🌿" },
    { day: 110, label: "Profes Wieczysty", icon: "⛪" },
    { day: 115, label: "Przeor", icon: "🗝️" },
    { day: 120, label: "Opat", icon: "📙" },
    { day: 125, label: "Kanonik", icon: "🧥" },
    { day: 130, label: "Prałat", icon: "🎩" },
    { day: 135, label: "Sługa Pański", icon: "🙇" },
    { day: 140, label: "Rycerz Niepokalanej", icon: "🛡️" },
    { day: 145, label: "Syn Maryi", icon: "💙" },
    { day: 150, label: "Czciciel Serca Jezusowego", icon: "❤️" },
    { day: 155, label: "Stróż Tabernakulum", icon: "🏠" },
    { day: 160, label: "Pielgrzym", icon: "🥾" },
    { day: 165, label: "Trubadur Pański", icon: "🪕" },
    { day: 170, label: "Mąż Sprawiedliwy", icon: "⚖️" },
    { day: 175, label: "Pokorny Sługa", icon: "🧹" },
    { day: 180, label: "Cierpliwy w Próbach", icon: "🥀" },
    { day: 185, label: "Wędrowiec do Emaus", icon: "🚶" },
    { day: 190, label: "Ogrodnik Wiary", icon: "🌱" },
    { day: 195, label: "Rybak Ludzi", icon: "🎣" },
    { day: 200, label: "Głos na Pustyni", icon: "📢" },
    { day: 205, label: "Zwiastun Nadziei", icon: "🕊️" },
    { day: 210, label: "Posłaniec Pokoju", icon: "🏳️" },
    { day: 215, label: "Strażnik Tradycji", icon: "📚" },
    { day: 220, label: "Syn Światłości", icon: "☀️" },
    { day: 225, label: "Świadek Zmartwychwstania", icon: "🌅" },
    { day: 230, label: "Wierny Dziedzic", icon: "📜" },
    { day: 235, label: "Sługa Słowa", icon: "🎙️" },
    { day: 240, label: "Potomek Abrahama", icon: "🌌" },
    { day: 245, label: "Uczeń Miłości", icon: "💖" },
    { day: 250, label: "Widzący Boga", icon: "👁️" },
    { day: 255, label: "Mąż Modlitwy", icon: "🛐" },
    { day: 260, label: "Czciciel Eucharystii", icon: "🍞" },
    { day: 265, label: "Przyjaciel Ubogich", icon: "🤲" },
    { day: 270, label: "Sól Ziemi", icon: "🧂" },
    { day: 275, label: "Budowniczy Pokoju", icon: "🕊️" },
    { day: 280, label: "Światłość Świata", icon: "🏙️" },
    { day: 285, label: "Niosący Prawdę", icon: "🕯️" },
    { day: 290, label: "Latorośl Winna", icon: "🍇" },
    { day: 295, label: "Sługa Pokorny", icon: "🙇" },
    { day: 300, label: "Ziarno Dobrej Ziemi", icon: "🌾" },
    { day: 305, label: "Współpracownik Prawdy", icon: "✍️" },
    { day: 310, label: "Słup Ognisty", icon: "🔥" },
    { day: 315, label: "Strażnik Wiary", icon: "🔑" },
    { day: 320, label: "Widzący Chwałę", icon: "🌈" },
    { day: 325, label: "Syn Obietnicy", icon: "🌠" },
    { day: 330, label: "Towarzysz Aniołów", icon: "👼" },
    { day: 335, label: "Mieszkaniec Syjonu", icon: "⛰️" },
    { day: 340, label: "Domownik Boga", icon: "🏠" },
    { day: 345, label: "Współdziedzic Nieba", icon: "💎" },
    { day: 350, label: "Dziedzic Królestwa", icon: "🏰" },
    { day: 355, label: "Przyjaciel Chrystusa", icon: "🤝" },
    { day: 360, label: "Umiłowany Uczeń", icon: "💓" },
    { day: 365, label: "Zwycięzca w Panu", icon: "🏆" }
  ];

  // SYSTEM KOLORÓW (37 PROGÓW + DODATKOWY DZIEŃ 6)
  const getTheme = (count) => {
    if (count >= 360) return { bg: "bg-amber-950", accent: "text-amber-400", border: "border-amber-500/50", aura: "bg-amber-500/30", btn: "bg-amber-600", card: "bg-amber-500/15" };
    if (count >= 350) return { bg: "bg-amber-900", accent: "text-amber-300", border: "border-amber-400/40", aura: "bg-amber-400/20", btn: "bg-amber-500", card: "bg-amber-400/10" };
    if (count >= 340) return { bg: "bg-slate-900", accent: "text-slate-100", border: "border-slate-200/50", aura: "bg-slate-100/10", btn: "bg-slate-300 text-black", card: "bg-white/10" };
    if (count >= 330) return { bg: "bg-slate-950", accent: "text-slate-300", border: "border-slate-500/40", aura: "bg-slate-500/10", btn: "bg-slate-700", card: "bg-slate-500/5" };
    if (count >= 320) return { bg: "bg-zinc-800", accent: "text-zinc-200", border: "border-zinc-400/40", aura: "bg-zinc-200/10", btn: "bg-zinc-500", card: "bg-zinc-200/5" };
    if (count >= 310) return { bg: "bg-zinc-900", accent: "text-zinc-400", border: "border-zinc-600/40", aura: "bg-zinc-400/10", btn: "bg-zinc-700", card: "bg-zinc-600/5" };
    if (count >= 300) return { bg: "bg-zinc-950", accent: "text-zinc-500", border: "border-zinc-700/40", aura: "bg-zinc-500/10", btn: "bg-zinc-800", card: "bg-zinc-700/5" };
    if (count >= 290) return { bg: "bg-[#1a0f00]", accent: "text-orange-300", border: "border-orange-800/40", aura: "bg-orange-800/20", btn: "bg-orange-700", card: "bg-orange-800/10" };
    if (count >= 280) return { bg: "bg-[#2d1a00]", accent: "text-orange-400", border: "border-orange-700/40", aura: "bg-orange-700/20", btn: "bg-orange-600", card: "bg-orange-700/10" };
    if (count >= 270) return { bg: "bg-[#452a00]", accent: "text-orange-500", border: "border-orange-600/40", aura: "bg-orange-600/20", btn: "bg-orange-500", card: "bg-orange-600/10" };
    if (count >= 260) return { bg: "bg-rose-900", accent: "text-rose-200", border: "border-rose-700/40", aura: "bg-rose-700/20", btn: "bg-rose-600", card: "bg-rose-700/10" };
    if (count >= 250) return { bg: "bg-rose-950", accent: "text-rose-400", border: "border-rose-500/40", aura: "bg-rose-500/20", btn: "bg-rose-800", card: "bg-rose-500/10" };
    if (count >= 240) return { bg: "bg-fuchsia-900", accent: "text-fuchsia-200", border: "border-fuchsia-700/40", aura: "bg-fuchsia-700/20", btn: "bg-fuchsia-600", card: "bg-fuchsia-700/10" };
    if (count >= 230) return { bg: "bg-fuchsia-950", accent: "text-fuchsia-400", border: "border-fuchsia-500/40", aura: "bg-fuchsia-500/20", btn: "bg-fuchsia-800", card: "bg-fuchsia-500/10" };
    if (count >= 220) return { bg: "bg-red-900", accent: "text-red-200", border: "border-red-700/40", aura: "bg-red-700/20", btn: "bg-red-600", card: "bg-red-700/10" };
    if (count >= 210) return { bg: "bg-red-950", accent: "text-red-400", border: "border-red-500/40", aura: "bg-red-500/20", btn: "bg-red-800", card: "bg-red-500/10" };
    if (count >= 200) return { bg: "bg-orange-900", accent: "text-orange-300", border: "border-orange-700/40", aura: "bg-orange-700/20", btn: "bg-orange-600", card: "bg-orange-700/10" };
    if (count >= 190) return { bg: "bg-orange-950", accent: "text-orange-400", border: "border-orange-500/40", aura: "bg-orange-500/20", btn: "bg-orange-800", card: "bg-orange-500/10" };
    if (count >= 180) return { bg: "bg-yellow-800", accent: "text-yellow-200", border: "border-yellow-600/40", aura: "bg-yellow-600/20", btn: "bg-yellow-500", card: "bg-yellow-600/10" };
    if (count >= 170) return { bg: "bg-yellow-900", accent: "text-yellow-300", border: "border-yellow-500/40", aura: "bg-yellow-500/20", btn: "bg-yellow-600", card: "bg-yellow-500/10" };
    if (count >= 160) return { bg: "bg-yellow-950", accent: "text-yellow-500", border: "border-yellow-400/40", aura: "bg-yellow-400/20", btn: "bg-yellow-700", card: "bg-yellow-400/10" };
    if (count >= 150) return { bg: "bg-lime-800", accent: "text-lime-200", border: "border-lime-600/40", aura: "bg-lime-600/20", btn: "bg-lime-500", card: "bg-lime-600/10" };
    if (count >= 140) return { bg: "bg-lime-900", accent: "text-lime-300", border: "border-lime-500/40", aura: "bg-lime-500/20", btn: "bg-lime-600", card: "bg-lime-500/10" };
    if (count >= 130) return { bg: "bg-lime-950", accent: "text-lime-500", border: "border-lime-400/40", aura: "bg-lime-400/20", btn: "bg-lime-800", card: "bg-lime-400/10" };
    if (count >= 120) return { bg: "bg-green-800", accent: "text-green-200", border: "border-green-600/40", aura: "bg-green-600/20", btn: "bg-green-500", card: "bg-green-600/10" };
    if (count >= 110) return { bg: "bg-green-900", accent: "text-green-300", border: "border-green-500/40", aura: "bg-green-500/20", btn: "bg-green-600", card: "bg-green-500/10" };
    if (count >= 100) return { bg: "bg-green-950", accent: "text-green-500", border: "border-green-400/40", aura: "bg-green-400/20", btn: "bg-green-800", card: "bg-green-400/10" };
    if (count >= 90) return { bg: "bg-teal-800", accent: "text-teal-200", border: "border-teal-600/40", aura: "bg-teal-600/20", btn: "bg-teal-500", card: "bg-teal-600/10" };
    if (count >= 80) return { bg: "bg-teal-900", accent: "text-teal-300", border: "border-teal-500/40", aura: "bg-teal-500/20", btn: "bg-teal-600", card: "bg-teal-500/10" };
    if (count >= 70) return { bg: "bg-teal-950", accent: "text-teal-500", border: "border-teal-400/40", aura: "bg-teal-400/20", btn: "bg-teal-800", card: "bg-teal-400/10" };
    if (count >= 60) return { bg: "bg-cyan-900", accent: "text-cyan-300", border: "border-cyan-600/40", aura: "bg-cyan-600/20", btn: "bg-cyan-500", card: "bg-cyan-600/10" };
    if (count >= 50) return { bg: "bg-cyan-950", accent: "text-cyan-500", border: "border-cyan-500/40", aura: "bg-cyan-500/20", btn: "bg-cyan-700", card: "bg-cyan-500/10" };
    if (count >= 40) return { bg: "bg-indigo-900", accent: "text-indigo-300", border: "border-indigo-600/40", aura: "bg-indigo-600/20", btn: "bg-indigo-500", card: "bg-indigo-600/10" };
    if (count >= 30) return { bg: "bg-indigo-950", accent: "text-indigo-500", border: "border-indigo-500/40", aura: "bg-indigo-500/20", btn: "bg-indigo-700", card: "bg-indigo-500/10" };
    if (count >= 20) return { bg: "bg-blue-900", accent: "text-blue-300", border: "border-blue-600/40", aura: "bg-blue-600/20", btn: "bg-blue-500", card: "bg-blue-600/10" };
    if (count >= 10) return { bg: "bg-blue-950", accent: "text-blue-500", border: "border-blue-500/40", aura: "bg-blue-500/20", btn: "bg-blue-700", card: "bg-blue-500/10" };
    // NOWY PRÓG: DZIEŃ 6 (Deep Ocean Blue)
    if (count >= 6) return { bg: "bg-slate-950", accent: "text-sky-400", border: "border-sky-800/40", aura: "bg-sky-900/20", btn: "bg-sky-800", card: "bg-sky-900/10" };
    // START (0-5 DNI - Sky Blue)
    return { bg: "bg-sky-950", accent: "text-sky-300", border: "border-sky-500/30", aura: "bg-sky-400/10", btn: "bg-sky-700", card: "bg-sky-500/5" };
  };

  const theme = getTheme(streak);
  const currentBadge = [...RANKS_CONFIG].reverse().find(r => streak >= r.day) || RANKS_CONFIG[0];
  const nextBadge = RANKS_CONFIG.find(r => r.day > streak);

  const getSimpleDeviceInfo = useCallback(() => {
    const ua = navigator.userAgent;
    const w = window.screen.width;
    const h = window.screen.height;
    let model = "Urządzenie"; let os = "OS"; let browser = "Przeglądarka";
    if (/android/i.test(ua)) {
      os = "Android";
      const match = ua.match(/Android\s([0-9.]+)/); if (match) os += ` ${match[1]}`;
      const modelMatch = ua.match(/;\s([^;]+)\sBuild/); if (modelMatch) model = modelMatch[1];
    } else if (/iPhone|iPad|iPod/.test(ua)) {
      model = "iPhone";
      const match = ua.match(/OS\s([0-9_]+)/); if (match) os = `iOS ${match[1].replace(/_/g, '.')}`;
    }
    if (/chrome|crios/i.test(ua)) browser = "Chrome";
    else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
    else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = "Safari";
    return `${model} | ${os} | ${browser} | Screen: ${w}x${h}`;
  }, []);

  const updateStreak = useCallback(async () => {
    const today = new Date().toLocaleDateString('sv-SE');
    let deviceId = localStorage.getItem('deviceId');
    const deviceInfo = getSimpleDeviceInfo();
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('deviceId', deviceId);
    }
    const { data: dbData } = await supabase.from('user_streaks').select('*').eq('device_id', deviceId).maybeSingle();
    let finalStreak = streak;
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('sv-SE');
    if (dbData) {
      const dbStreak = dbData.streak_count;
      finalStreak = dbData.last_visit_date === today ? dbStreak : (dbData.last_visit_date === yesterdayStr ? dbStreak + 1 : 1);
      await supabase.from('user_streaks').update({ streak_count: finalStreak, last_visit_date: today, device_info: deviceInfo }).eq('device_id', deviceId);
    } else {
      finalStreak = streak > 0 ? streak : 1;
      await supabase.from('user_streaks').insert([{ device_id: deviceId, streak_count: finalStreak, last_visit_date: today, device_info: deviceInfo }]);
    }
    localStorage.setItem('streakCount', finalStreak.toString());
    setStreak(finalStreak);
  }, [streak, getSimpleDeviceInfo]);

  const loadData = useCallback(async (date) => {
    setLoading(true);
    try {
      const { data: verse } = await supabase.from('daily_verses').select('*').eq('date', date).maybeSingle();
      setCurrentVerse(verse);
      if (verse) {
        const { data: comms } = await supabase.from('comments').select('*').eq('verse_id', verse.id).order('created_at', { ascending: true });
        setComments(comms || []);
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadData(selectedDate);
    updateStreak();
  }, [selectedDate, loadData, updateStreak]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentVerse) return;
    await supabase.from('comments').insert([{ 
      verse_id: currentVerse.id, 
      text: newComment, 
      author: author.trim() || "Anonimowy",
      user_streak_at_time: streak 
    }]);
    setNewComment(""); setAuthor(""); loadData(selectedDate);
  };

  return (
    <div className={`min-h-screen ${theme.bg} text-slate-200 font-sans pb-20 overflow-x-hidden relative transition-all duration-1000`}>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className={`absolute top-[-20%] left-[-10%] w-[100vw] h-[600px] ${theme.aura} blur-[120px] rounded-full transition-all duration-1000`}></div>
      </div>

      <header className="relative pt-12 pb-28 px-4 text-center z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center mb-10 gap-2">
             <div className="group relative">
               <div className={`inline-flex items-center gap-3 bg-white/5 border ${theme.border} p-2.5 px-5 rounded-2xl shadow-xl backdrop-blur-md cursor-help`}>
                 <span className="text-xl">🔥 {streak}</span>
                 <div className="w-[1px] h-6 bg-white/10"></div>
                 <span className={`${theme.accent} font-black uppercase text-[10px] tracking-widest`}>{currentBadge.icon} {currentBadge.label}</span>
               </div>
               
               <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-slate-950 border border-white/10 rounded-3xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-4 text-left">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3 border-b border-white/5 pb-1 uppercase">Droga Wiary 2026</p>
                  {nextBadge && (
                    <div className="mb-4">
                      <div className="flex justify-between text-[8px] font-bold opacity-70 mb-1 uppercase">
                        <span>Następna: {nextBadge.label}</span>
                        <span>{streak}/{nextBadge.day}d</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${theme.btn}`} style={{ width: `${(streak/nextBadge.day)*100}%` }}></div>
                      </div>
                    </div>
                  )}
                  <div className="max-h-56 overflow-y-auto pr-1 custom-scroll space-y-1">
                    {RANKS_CONFIG.map(r => (
                      <div key={r.day} className={`flex items-center justify-between p-1.5 rounded-lg text-[10px] ${streak >= r.day ? `${theme.accent} bg-white/5 font-bold` : 'text-slate-600'}`}>
                        <span className="flex items-center gap-2"><span>{r.icon}</span> {r.label}</span>
                        <span>{r.day}d</span>
                      </div>
                    ))}
                  </div>
               </div>
             </div>
          </div>

          <span className={`px-5 py-1.5 rounded-full bg-white/5 border ${theme.border} ${theme.accent} text-[10px] font-black uppercase tracking-[0.4em] mb-10 inline-block transition-all tracking-widest`}>Słowo na rok 2026</span>
          
          {loading ? (
            <div className="py-20 opacity-50 italic animate-pulse text-2xl">Otwieranie Księgi...</div>
          ) : currentVerse ? (
            <div className="flex flex-col items-center animate-fadeIn">
              {currentVerse.audio_url && (
                <div className="w-full max-w-sm mb-12">
                   <p className="text-[10px] uppercase font-black opacity-40 tracking-[0.2em] mb-4 uppercase">Głos Słowa</p>
                  <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-3 rounded-3xl shadow-xl flex items-center gap-4 transition-all">
                    <div className={`w-10 h-10 ${theme.btn} rounded-full flex items-center justify-center text-white shrink-0 shadow-lg`}>
                      <span className="text-lg ml-0.5">▶️</span>
                    </div>
                    <div className="flex-1">
                       <audio controls className="w-full h-7" src={currentVerse.audio_url} style={{ filter: 'invert(1) brightness(1.5)' }} />
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-6">
                <h1 className="text-3xl md:text-5xl font-serif italic text-white leading-tight px-4 tracking-tight drop-shadow-lg">"{currentVerse.verse_text}"</h1>
                <cite className={`text-lg font-bold ${theme.accent} block uppercase tracking-widest opacity-90 transition-colors`}>— {currentVerse.reference}</cite>
              </div>
            </div>
          ) : (
            <div className="py-20 opacity-50">Brak zapisów na ten dzień.</div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 -mt-10 relative z-20 space-y-6">
        <section className="bg-black/20 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <input type="date" min={minDate2026} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-4 rounded-2xl bg-black/40 border border-white/5 text-white font-bold outline-none focus:border-white/20 appearance-none" style={{ boxSizing: 'border-box' }} />
        </section>

        <section className="bg-black/10 backdrop-blur-2xl p-6 md:p-10 rounded-[3rem] border border-white/5 shadow-2xl">
          <h4 className="text-xl font-serif text-white mb-8 text-center uppercase tracking-widest opacity-80">Refleksje</h4>
          <div className="space-y-4 mb-8 max-h-[500px] overflow-y-auto pr-2 custom-scroll">
            {comments.map(c => {
              const commentTheme = getTheme(c.user_streak_at_time || 0);
              return (
                <div key={c.id} className={`p-6 rounded-[2rem] border transition-all ${commentTheme.card} ${commentTheme.border}`}>
                  <p className="text-slate-200 text-base mb-4 italic leading-relaxed font-light">"{c.text}"</p>
                  <div className={`flex justify-between text-[9px] font-black tracking-widest uppercase pt-4 border-t border-white/5 ${commentTheme.accent}`}>
                    <span>✍️ {c.author}</span>
                    <span className="opacity-50">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="space-y-4 pt-6 border-t border-white/5">
            <input type="text" placeholder="Twoje imię..." value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full p-4 rounded-2xl bg-black/40 border border-white/5 text-white outline-none focus:border-white/20" />
            <textarea placeholder="Twoja myśl..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="w-full p-5 rounded-2xl bg-black/40 border border-white/5 text-white outline-none focus:border-white/20 min-h-[120px] resize-none" />
            <button onClick={handleAddComment} className={`w-full py-5 ${theme.btn} text-white font-black rounded-2xl transition-all uppercase tracking-widest text-[10px] shadow-lg active:scale-95`}>Dodaj Refleksję</button>
          </div>
        </section>
      </main>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 1s ease-out forwards; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
      `}</style>
    </div>
  );
}

export default App;