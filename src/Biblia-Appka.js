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

  const RANKS_CONFIG = [
    { day: 1, label: "Poszukiwacz", icon: "🔍" },
    { day: 5, label: "Słuchacz", icon: "👂" },
    { day: 10, label: "Uczeń", icon: "📖" },
    { day: 15, label: "Pielgrzym", icon: "🥾" },
    { day: 20, label: "Świadek", icon: "🕊️" },
    { day: 25, label: "Gorliwy", icon: "🔥" },
    { day: 30, label: "Wojownik Światła", icon: "⚔️" },
    { day: 35, label: "Lektor", icon: "🎙️" },
    { day: 40, label: "Akolita", icon: "🕯️" },
    { day: 45, label: "Katechista", icon: "📜" },
    { day: 50, label: "Ewangelizator", icon: "📣" },
    { day: 55, label: "Pasterz Serca", icon: "🐑" },
    { day: 60, label: "Obrońca Wiary", icon: "🛡️" },
    { day: 65, label: "Kontemplator", icon: "🧘" },
    { day: 70, label: "Mistyk", icon: "✨" },
    { day: 75, label: "Misjonarz", icon: "🌍" },
    { day: 80, label: "Pustelnik", icon: "🏔️" },
    { day: 85, label: "Wyznawca", icon: "🙏" },
    { day: 90, label: "Mędrzec Duchowy", icon: "👴" },
    { day: 95, label: "Teolog", icon: "🧠" },
    { day: 100, label: "Doktor Kościoła", icon: "🏛️" },
    { day: 105, label: "Nowicjusz", icon: "🌿" },
    { day: 110, label: "Zakonnik", icon: "⛪" },
    { day: 115, label: "Opat", icon: "🗝️" },
    { day: 120, label: "Kanonik", icon: "📙" },
    { day: 125, label: "Pustelnik Karmelu", icon: "🌋" },
    { day: 130, label: "Rycerz Niepokalanej", icon: "🛡️" },
    { day: 135, label: "Sługa Boży", icon: "🙇" },
    { day: 140, label: "Czciciel Słowa", icon: "💖" },
    { day: 145, label: "Głos na Pustyni", icon: "🌵" },
    { day: 150, label: "Syn Światłości", icon: "☀️" },
    { day: 155, label: "Stróż Poranka", icon: "🌅" },
    { day: 160, label: "Niosący Nadzieję", icon: "⚓" },
    { day: 165, label: "Budowniczy Arki", icon: "🔨" },
    { day: 170, label: "Przyjaciel Oblubieńca", icon: "💍" },
    { day: 175, label: "Szafarz Łaski", icon: "🍷" },
    { day: 180, label: "Męczennik Codzienności", icon: "🥀" },
    { day: 185, label: "Wędrowiec Pański", icon: "🚶" },
    { day: 190, label: "Ogrodnik Wiary", icon: "🌱" },
    { day: 195, label: "Rybak Ludzi", icon: "🎣" },
    { day: 200, label: "Apostoł Narodów", icon: "🚢" },
    { day: 205, label: "Świadek Nadziei", icon: "🌅" },
    { day: 210, label: "Strażnik Tradycji", icon: "📚" },
    { day: 215, label: "Filadelfijczyk", icon: "🤝" },
    { day: 220, label: "Wierny Efezczyk", icon: "🏰" },
    { day: 225, label: "Mieszkaniec Syjonu", icon: "⛰️" },
    { day: 230, label: "Dziedzic Obietnicy", icon: "📜" },
    { day: 235, label: "Potomek Abrahama", icon: "🌌" },
    { day: 240, label: "Widzący Boga", icon: "👁️" },
    { day: 245, label: "Pokorny Sługa", icon: "🧹" },
    { day: 250, label: "Zwiastun Pokoju", icon: "🕊️" },
    { day: 255, label: "Mąż Sprawiedliwy", icon: "⚖️" },
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
    { day: 315, label: "Współdziedzic", icon: "💎" },
    { day: 320, label: "Dziecko Boże", icon: "👶" },
    { day: 325, label: "Przyjaciel Jezusa", icon: "🤝" },
    { day: 330, label: "Umiłowany Uczeń", icon: "💓" },
    { day: 335, label: "Wybraniec Niebios", icon: "⭐" },
    { day: 340, label: "Patriarcha Nowy", icon: "👴" },
    { day: 345, label: "Strażnik Bram", icon: "🗝️" },
    { day: 350, label: "Sługa Wierny", icon: "👑" },
    { day: 355, label: "Gość Baranka", icon: "🍷" },
    { day: 360, label: "Dziedzic Królestwa", icon: "🏰" },
    { day: 365, label: "Zwycięzca w Panu", icon: "🏆" }
  ];

  const getCurrentBadge = (count) => [...RANKS_CONFIG].reverse().find(r => count >= r.day) || RANKS_CONFIG[0];
  const nextBadge = RANKS_CONFIG.find(r => r.day > streak) || null;
  const currentBadge = getCurrentBadge(streak);

  const getCleanDeviceInfo = useCallback(() => {
    return `${navigator.userAgent} | ${window.screen.width}x${window.screen.height}`;
  }, []);

  const updateStreak = useCallback(async () => {
    const today = new Date().toLocaleDateString('sv-SE');
    let deviceId = localStorage.getItem('deviceId');
    const deviceInfo = getCleanDeviceInfo();
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
  }, [streak, getCleanDeviceInfo]);

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
      <header className="relative pt-12 pb-32 px-4 bg-slate-900 rounded-b-[4rem] shadow-2xl text-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-600 blur-[120px] rounded-full"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          
          <div className="flex flex-col items-center mb-12 gap-2">
             <div className="group relative">
               <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 p-3 px-6 rounded-3xl shadow-xl backdrop-blur-md cursor-help transition-all hover:bg-white/10">
                 <span className="text-2xl">🔥 {streak}</span>
                 <div className="w-[1px] h-8 bg-white/10"></div>
                 <span className="text-amber-500 font-black uppercase text-xs tracking-widest">{currentBadge.icon} {currentBadge.label}</span>
               </div>
               
               {/* LISTA RANG */}
               <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-72 bg-slate-800 border border-white/10 rounded-[2rem] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 pb-2 border-b border-white/5">Twoja Droga Wiary</p>
                  
                  {/* PROGRESS BAR DO NASTĘPNEJ RANGI */}
                  {nextBadge && (
                    <div className="mb-4">
                      <div className="flex justify-between text-[9px] uppercase font-bold text-amber-500/80 mb-1">
                        <span>Następna: {nextBadge.label}</span>
                        <span>{streak} / {nextBadge.day} d</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 transition-all duration-1000" 
                          style={{ width: `${(streak / nextBadge.day) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="max-h-64 overflow-y-auto pr-2 custom-scroll space-y-2">
                    {RANKS_CONFIG.map(r => (
                      <div key={r.day} className={`flex items-center justify-between p-2 rounded-xl text-xs ${streak >= r.day ? 'bg-amber-500/10 text-amber-400 font-bold' : 'text-slate-600'}`}>
                        <span className="flex items-center gap-2"><span>{r.icon}</span> {r.label}</span>
                        <span className="text-[10px] opacity-60">{r.day}d</span>
                      </div>
                    ))}
                  </div>
               </div>
             </div>
          </div>

          <span className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.5em] mb-12 inline-block">Słowo na {selectedDate}</span>
          
          {loading ? (
            <div className="py-20 text-slate-500 italic text-xl animate-pulse">Otwieranie księgi...</div>
          ) : currentVerse ? (
            <div className="flex flex-col items-center gap-10 animate-fadeIn w-full">
              
              {currentVerse.audio_url && (
                <div style={{ order: 1 }} className="w-full max-w-lg">
                  <div className="bg-white/5 border border-white/10 backdrop-blur-2xl p-5 rounded-[2.5rem] shadow-2xl flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white shadow-lg shrink-0">
                      <span className="text-2xl ml-1">▶️</span>
                    </div>
                    <div className="flex-1 text-left">
                       <p className="text-[10px] uppercase font-black text-amber-500 tracking-[0.2em] mb-1 ml-1">Posłuchaj Słowa</p>
                       <audio 
                         controls 
                         className="w-full h-10 accent-amber-500" 
                         src={currentVerse.audio_url}
                         style={{ filter: 'invert(1) hue-rotate(180deg) brightness(1.5)' }}
                       />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ order: 2 }} className="w-full px-2 space-y-8">
                <h1 className="text-4xl md:text-7xl font-serif italic text-white leading-[1.15] tracking-tight">
                  "{currentVerse.verse_text}"
                </h1>
                <cite className="text-xl md:text-2xl font-bold text-amber-500 block uppercase tracking-[0.3em]">— {currentVerse.reference}</cite>
              </div>
            </div>
          ) : (
            <div className="py-24 text-slate-500 italic text-2xl">Brak Słowa na ten dzień.</div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 -mt-12 relative z-20 space-y-8">
        {/* POPRAWIONY KALENDARZ */}
        <section className="bg-slate-800/70 backdrop-blur-3xl p-6 md:p-8 rounded-[3rem] border border-white/10 shadow-2xl box-border">
          <h3 className="text-xl font-black mb-6 text-white text-center md:text-left">📅 Archiwum Słowa</h3>
          <div className="w-full">
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              className="w-full box-border p-4 md:p-5 rounded-2xl bg-slate-900 border border-white/10 text-white font-bold outline-none focus:border-amber-500 transition-all text-base md:text-lg appearance-none" 
              style={{ minWidth: '0' }}
            />
          </div>
        </section>

        <section className="bg-slate-800/40 backdrop-blur-2xl p-8 md:p-14 rounded-[4rem] border border-white/5 shadow-2xl">
          <h4 className="text-3xl font-serif text-white mb-12">Refleksje wspólnoty</h4>
          <div className="grid grid-cols-1 gap-6 mb-12 max-h-[500px] overflow-y-auto pr-4 custom-scroll">
            {comments.map(c => (
              <div key={c.id} className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5">
                <p className="text-slate-200 text-xl mb-6 leading-relaxed font-light italic">"{c.text}"</p>
                <div className="flex justify-between text-[11px] font-black tracking-widest uppercase text-slate-500 border-t border-white/5 pt-6">
                  <span className="text-amber-600">✍️ {c.author}</span>
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-5 pt-10 border-t border-white/10">
            <input type="text" placeholder="Twoje imię..." value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full p-5 rounded-2xl bg-slate-900 border border-white/10 text-white text-lg outline-none focus:border-amber-500" />
            <textarea placeholder="Twoja refleksja..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="w-full p-7 rounded-3xl bg-slate-900 border border-white/10 text-white text-lg outline-none focus:border-amber-500 min-h-[150px] resize-none" />
            <button onClick={handleAddComment} className="w-full py-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black rounded-3xl transition-all uppercase tracking-[0.2em] text-sm shadow-xl active:scale-95">Udostępnij Słowo</button>
          </div>
        </section>
      </main>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default App;