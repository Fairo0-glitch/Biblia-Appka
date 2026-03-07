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
    { day: 365, label: "Zwycięzca", icon: "🏆" }
  ];

  const getCurrentBadge = (count) => [...RANKS_CONFIG].reverse().find(r => count >= r.day) || RANKS_CONFIG[0];
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
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans pb-20">
      <header className="relative pt-10 pb-24 px-4 bg-slate-900 rounded-b-[3rem] shadow-2xl text-center overflow-hidden">
        <div className="max-w-2xl mx-auto relative z-10">
          
          {/* Badge i Wersja (Dla pewności odświeżenia) */}
          <div className="flex flex-col items-center mb-8 gap-2">
             <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 p-2 px-4 rounded-2xl">
               <span className="text-xl">🔥 {streak}</span>
               <div className="w-[1px] h-6 bg-white/10"></div>
               <span className="text-amber-500 font-bold uppercase text-[10px] tracking-widest">{currentBadge.icon} {currentBadge.label}</span>
             </div>
             <p className="text-[8px] text-white/20 uppercase tracking-[0.5em] font-black">V-AUDIO-TOP-STABLE</p>
          </div>

          <span className="px-5 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-10 inline-block">Słowo na {selectedDate}</span>
          
          {loading ? (
            <div className="py-20 text-slate-500 italic">Otwieranie księgi...</div>
          ) : currentVerse ? (
            /* KONTENER FLEX Z WYMUSZONĄ KOLEJNOŚCIĄ */
            <div className="flex flex-col items-center gap-8 animate-fadeIn">
              
              {/* 1. PLAYER AUDIO (ORDER: 1) */}
              {currentVerse.audio_url && (
                <div style={{ order: 1 }} className="w-full max-w-sm">
                  <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-4 rounded-[2rem] shadow-2xl flex items-center gap-4 transition-all hover:bg-white/10">
                    <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-white shadow-lg shrink-0">
                      <span className="text-xl ml-1">▶️</span>
                    </div>
                    <div className="flex-1">
                       <p className="text-[9px] uppercase font-bold text-amber-500 tracking-widest mb-1 text-left ml-1">Posłuchaj Słowa</p>
                       <audio 
                         controls 
                         className="w-full h-8 accent-amber-500" 
                         src={currentVerse.audio_url}
                         style={{ filter: 'invert(1) hue-rotate(180deg) brightness(1.5)' }}
                       />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. TEKST WERSETU (ORDER: 2) */}
              <div style={{ order: 2 }} className="space-y-6">
                <h1 className="text-3xl md:text-6xl font-serif italic text-white leading-tight px-4 tracking-tight">
                  "{currentVerse.verse_text}"
                </h1>
                <cite className="text-xl font-bold text-amber-500 block uppercase tracking-widest">— {currentVerse.reference}</cite>
              </div>

            </div>
          ) : (
            <div className="py-20 text-slate-500 italic text-xl">Brak Słowa na ten dzień.</div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 -mt-10 relative z-20 space-y-6">
        <section className="bg-slate-800/60 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <h3 className="text-xl font-bold mb-4 text-white">📅 Archiwum</h3>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            className="w-full p-4 rounded-2xl bg-slate-900 border border-white/10 text-white font-bold outline-none focus:border-amber-500 transition-all" 
          />
        </section>

        <section className="bg-slate-800/40 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-2xl">
          <h4 className="text-2xl font-bold text-white mb-10 font-serif">Refleksje wspólnoty</h4>
          <div className="space-y-6 mb-12 max-h-[400px] overflow-y-auto pr-2 custom-scroll">
            {comments.map(c => (
              <div key={c.id} className="p-6 rounded-[2rem] bg-white/5 border border-white/5">
                <p className="text-slate-300 text-lg mb-4 leading-relaxed">{c.text}</p>
                <div className="flex justify-between text-[10px] font-black tracking-widest uppercase text-slate-500 border-t border-white/5 pt-4">
                  <span className="text-amber-600">✍️ {c.author}</span>
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4 pt-8 border-t border-white/10">
            <input type="text" placeholder="Twoje imię..." value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-900 border border-white/10 text-white outline-none focus:border-amber-500" />
            <textarea placeholder="Twoja refleksja..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="w-full p-6 rounded-3xl bg-slate-900 border border-white/10 text-white outline-none focus:border-amber-500 min-h-[120px] resize-none" />
            <button onClick={handleAddComment} className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs shadow-lg active:scale-95">Udostępnij</button>
          </div>
        </section>
      </main>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out; }
      `}</style>
    </div>
  );
}

export default App;