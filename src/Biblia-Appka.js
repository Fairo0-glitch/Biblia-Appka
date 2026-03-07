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

  const RANKS_CONFIG = [
    { day: 1, label: "Poszukiwacz", icon: "🔍" },
    { day: 5, label: "Słuchacz Słowa", icon: "👂" },
    { day: 10, label: "Katechumen", icon: "🕯️" },
    { day: 15, label: "Chrześcijanin", icon: "✝️" },
    { day: 20, label: "Gorliwy Wyznawca", icon: "🙏" },
    { day: 25, label: "Apostoł Codzienności", icon: "👣" },
    { day: 30, label: "Świadek Ewangelii", icon: "📣" },
    { day: 35, label: "Lektor", icon: "📖" },
    { day: 40, label: "Psalmišta", icon: "🎵" },
    { day: 45, label: "Akolita", icon: "🍷" },
    { day: 50, label: "Szafarz Słowa", icon: "📜" },
    { day: 55, label: "Ceremoniarz", icon: "🔔" },
    { day: 60, label: "Katecheta", icon: "🏫" },
    { day: 65, label: "Zelator", icon: "🔥" },
    { day: 70, label: "Członek Żywego Różańca", icon: "📿" },
    { day: 75, label: "Misjonarz", icon: "🌍" },
    { day: 80, label: "Obrońca Wiary", icon: "🛡️" },
    { day: 85, label: "Pustelnik Duchowy", icon: "🏔️" },
    { day: 90, label: "Kontemplator", icon: "🧘" },
    { day: 95, label: "Teolog Serca", icon: "🧠" },
    { day: 100, label: "Doktor Wiary", icon: "🏛️" },
    { day: 105, label: "Nowicjusz", icon: "🌿" },
    { day: 110, label: "Profes Wieczysty", icon: "⛪" },
    { day: 115, label: "Przeor", icon: "🗝️" },
    { day: 120, label: "Opat", icon: "📙" },
    { day: 125, label: "Kanonik", icon: "👔" },
    { day: 130, label: "Prałat", icon: "🎩" },
    { day: 135, label: "Sługa Pański", icon: "🙇" },
    { day: 140, label: "Rycerz Niepokalanej", icon: "🛡️" },
    { day: 145, label: "Syn Maryi", icon: "💙" },
    { day: 150, label: "Czciciel Serca Pana", icon: "❤️" },
    { day: 155, label: "Stróż Tabernakulum", icon: "🏠" },
    { day: 160, label: "Pielgrzym Jasnogórski", icon: "👣" },
    { day: 165, label: "Trubadur Boży", icon: "🪕" },
    { day: 170, label: "Mąż Sprawiedliwy", icon: "⚖️" },
    { day: 175, label: "Pokorny Wyrobnik", icon: "🧹" },
    { day: 180, label: "Męczennik Codzienności", icon: "🥀" },
    { day: 185, label: "Wędrowiec Emaus", icon: "🚶" },
    { day: 190, label: "Ogrodnik Wiary", icon: "🌱" },
    { day: 195, label: "Rybak Ludzi", icon: "🎣" },
    { day: 200, label: "Głos na Pustyni", icon: "📢" },
    { day: 205, label: "Zwiastun Dobrej Nowiny", icon: "🕊️" },
    { day: 210, label: "Strażnik Tradycji", icon: "📚" },
    { day: 215, label: "Filadelfijczyk", icon: "🤝" },
    { day: 220, label: "Wierny Sługa", icon: "👑" },
    { day: 225, label: "Mieszkaniec Syjonu", icon: "⛰️" },
    { day: 230, label: "Dziedzic Obietnicy", icon: "📜" },
    { day: 235, label: "Potomek Abrahama", icon: "🌌" },
    { day: 240, label: "Widzący Pana", icon: "👁️" },
    { day: 245, label: "Pokorny Franciszkanin", icon: "🧶" },
    { day: 250, label: "Zwiastun Pokoju", icon: "🕊️" },
    { day: 255, label: "Czciciel Eucharystii", icon: "🍞" },
    { day: 260, label: "Naczynie Wybrane", icon: "🏺" },
    { day: 265, label: "Sól Ziemi", icon: "🧂" },
    { day: 270, label: "Światłość Świata", icon: "🏙️" },
    { day: 275, label: "Latorośl Winna", icon: "🍇" },
    { day: 280, label: "Ziarno Dobrej Ziemi", icon: "🌾" },
    { day: 285, label: "Słup Ognisty", icon: "🔥" },
    { day: 290, label: "Głos Proroka", icon: "📢" },
    { day: 295, label: "Widzący Chwałę", icon: "🌈" },
    { day: 300, label: "Towarzysz Aniołów", icon: "👼" },
    { day: 305, label: "Domownik Boga", icon: "🏠" },
    { day: 310, label: "Mieszkaniec Przybytku", icon: "⛺" },
    { day: 315, label: "Współdziedzic Nieba", icon: "💎" },
    { day: 320, label: "Umiłowane Dziecko", icon: "👶" },
    { day: 325, label: "Przyjaciel Chrystusa", icon: "🤝" },
    { day: 330, label: "Umiłowany Uczeń", icon: "💓" },
    { day: 335, label: "Wybraniec Niebios", icon: "⭐" },
    { day: 340, label: "Nowy Patriarcha", icon: "👴" },
    { day: 345, label: "Strażnik Bram", icon: "🗝️" },
    { day: 350, label: "Wierny do Końca", icon: "👑" },
    { day: 355, label: "Gość Baranka", icon: "🍷" },
    { day: 360, label: "Dziedzic Królestwa", icon: "🏰" },
    { day: 365, label: "Zwycięzca w Panu", icon: "🏆" }
  ];

  const getCurrentBadge = (count) => [...RANKS_CONFIG].reverse().find(r => count >= r.day) || RANKS_CONFIG[0];
  const nextBadge = RANKS_CONFIG.find(r => r.day > streak);
  const currentBadge = getCurrentBadge(streak);

  const getSimpleDeviceInfo = useCallback(() => {
    const ua = navigator.userAgent;
    const w = window.screen.width;
    const h = window.screen.height;
    let model = "Urządzenie";
    let os = "OS";
    let browser = "Przeglądarka";
    if (/android/i.test(ua)) {
      os = "Android";
      const match = ua.match(/Android\s([0-9.]+)/);
      if (match) os += ` ${match[1]}`;
      const modelMatch = ua.match(/;\s([^;]+)\sBuild/);
      if (modelMatch) model = modelMatch[ModelMatch[1]];
    } else if (/iPhone|iPad|iPod/.test(ua)) {
      model = "iPhone";
      const match = ua.match(/OS\s([0-9_]+)/);
      if (match) os = `iOS ${match[1].replace(/_/g, '.')}`;
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
    await supabase.from('comments').insert([{ verse_id: currentVerse.id, text: newComment, author: author.trim() || "Anonimowy" }]);
    setNewComment(""); setAuthor(""); loadData(selectedDate);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans pb-20 overflow-x-hidden">
      <header className="relative pt-10 pb-28 px-4 bg-slate-900 rounded-b-[3.5rem] shadow-2xl text-center">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-amber-600 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex flex-col items-center mb-10 gap-2">
             <div className="group relative">
               <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 p-2 px-4 rounded-2xl shadow-xl backdrop-blur-md cursor-help transition-all hover:bg-white/10">
                 <span className="text-xl">🔥 {streak}</span>
                 <div className="w-[1px] h-6 bg-white/10"></div>
                 <span className="text-amber-500 font-black uppercase text-[10px] tracking-widest">{currentBadge.icon} {currentBadge.label}</span>
               </div>
               
               <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-slate-800 border border-white/10 rounded-3xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-4 text-left">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3 border-b border-white/5 pb-1">Droga Wiary 2026</p>
                  {nextBadge && (
                    <div className="mb-4">
                      <div className="flex justify-between text-[8px] font-bold text-amber-500/80 mb-1 uppercase">
                        <span>Następna: {nextBadge.label}</span>
                        <span>{streak}/{nextBadge.day}d</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 transition-all" style={{ width: `${(streak/nextBadge.day)*100}%` }}></div>
                      </div>
                    </div>
                  )}
                  <div className="max-h-56 overflow-y-auto pr-1 custom-scroll space-y-1">
                    {RANKS_CONFIG.map(r => (
                      <div key={r.day} className={`flex items-center justify-between p-1.5 rounded-lg text-[10px] ${streak >= r.day ? 'bg-amber-500/10 text-amber-400 font-bold' : 'text-slate-600'}`}>
                        <span className="flex items-center gap-2"><span>{r.icon}</span> {r.label}</span>
                        <span>{r.day}d</span>
                      </div>
                    ))}
                  </div>
               </div>
             </div>
          </div>

          <span className="px-5 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-10 inline-block tracking-widest">Słowo Życia na {selectedDate}</span>
          
          {loading ? (
            <div className="py-16 text-slate-500 italic animate-pulse">Wczytywanie...</div>
          ) : currentVerse ? (
            <div className="flex flex-col items-center animate-fadeIn">
              {currentVerse.audio_url && (
                <div className="w-full max-w-sm mb-10">
                   <p className="text-[10px] uppercase font-black text-amber-500/80 tracking-[0.2em] mb-4">Posłuchaj Słowa Życia</p>
                  <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-3 rounded-3xl shadow-xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg">
                      <span className="text-lg ml-0.5">▶️</span>
                    </div>
                    <div className="flex-1">
                       <audio controls className="w-full h-7 accent-amber-500" src={currentVerse.audio_url} style={{ filter: 'invert(1) hue-rotate(180deg) brightness(1.3)' }} />
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-6">
                <h1 className="text-3xl md:text-5xl font-serif italic text-white leading-tight px-4 tracking-tight">"{currentVerse.verse_text}"</h1>
                <cite className="text-lg font-bold text-amber-500 block uppercase tracking-widest opacity-90">— {currentVerse.reference}</cite>
              </div>
            </div>
          ) : (
            <div className="py-20 text-slate-500 italic">Czekanie na Słowo...</div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 -mt-10 relative z-20 space-y-6">
        <section className="bg-slate-800/80 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <h3 className="text-sm font-black mb-4 text-white uppercase tracking-widest">📅 Wybierz dzień roku</h3>
          <input 
            type="date" 
            min={minDate2026}
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            className="w-full p-4 rounded-2xl bg-slate-900 border border-white/10 text-white font-bold outline-none focus:border-amber-500 transition-all appearance-none" 
            style={{ boxSizing: 'border-box' }}
          />
        </section>

        <section className="bg-slate-800/40 backdrop-blur-2xl p-6 md:p-10 rounded-[3rem] border border-white/5 shadow-2xl">
          <h4 className="text-xl font-serif text-white mb-8 text-center">Refleksje</h4>
          <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scroll">
            {comments.map(c => (
              <div key={c.id} className="p-6 rounded-[2rem] bg-white/5 border border-white/5">
                <p className="text-slate-300 text-base mb-4 italic leading-relaxed">"{c.text}"</p>
                <div className="flex justify-between text-[9px] font-black tracking-widest uppercase text-slate-500 border-t border-white/5 pt-4">
                  <span className="text-amber-600">✍️ {c.author}</span>
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4 pt-6 border-t border-white/10">
            <input type="text" placeholder="Twoje imię..." value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-900 border border-white/10 text-white outline-none focus:border-amber-500 transition-all" />
            <textarea placeholder="Twoja refleksja..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="w-full p-5 rounded-2xl bg-slate-900 border border-white/10 text-white outline-none focus:border-amber-500 min-h-[120px] resize-none transition-all" />
            <button onClick={handleAddComment} className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-[10px] shadow-lg active:scale-95">Dodaj wpis do bazy</button>
          </div>
        </section>
      </main>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}

export default App;