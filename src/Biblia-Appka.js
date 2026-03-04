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
  const [streak, setStreak] = useState(() => {
    return parseInt(localStorage.getItem('streakCount') || "0");
  });

  const RANKS_CONFIG = [
    { day: 1, label: "Poszukiwacz", icon: "🔍" },
    { day: 5, label: "Słuchacz", icon: "👂" },
    { day: 10, label: "Uczeń", icon: "📖" },
    { day: 15, label: "Pielgrzym", icon: "🥾" },
    { day: 20, label: "Świadek", icon: "🕊️" },
    { day: 25, label: "Gorliwy", icon: "🔥" },
    { day: 30, label: "Wojownik Światła", icon: "⚔️" },
    { day: 35, label: "Lektor", icon: "🎙️" },
    { day: 40, label: "Katechista", icon: "📜" },
    { day: 45, label: "Ewangelizator", icon: "📣" },
    { day: 50, label: "Pasterz Serca", icon: "🐑" },
    { day: 55, label: "Obrońca Wiary", icon: "🛡️" },
    { day: 60, label: "Kontemplator", icon: "🧘" },
    { day: 65, label: "Mistyk", icon: "✨" },
    { day: 70, label: "Misjonarz", icon: "🌍" },
    { day: 75, label: "Pustelnik", icon: "🏔️" },
    { day: 80, label: "Wyznawca", icon: "🙏" },
    { day: 85, label: "Mędrzec Duchowy", icon: "👴" },
    { day: 90, label: "Teolog", icon: "🧠" },
    { day: 95, label: "Doktor Kościoła", icon: "🏛️" },
    { day: 100, label: "Sługa Doskonały", icon: "👑" },
  ];

  const getCurrentBadge = (count) => {
    return [...RANKS_CONFIG].reverse().find(r => count >= r.day) || RANKS_CONFIG[0];
  };
  const currentBadge = getCurrentBadge(streak);

  const updateStreak = useCallback(async () => {
    const today = new Date().toLocaleDateString('sv-SE');
    let deviceId = localStorage.getItem('deviceId');
    
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('deviceId', deviceId);
    }

    const { data: dbData } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('device_id', deviceId)
      .maybeSingle();

    let finalStreak = streak;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('sv-SE');

    if (dbData) {
      const dbStreak = dbData.streak_count;
      if (dbData.last_visit_date === today) {
        finalStreak = dbStreak;
      } else if (dbData.last_visit_date === yesterdayStr) {
        finalStreak = dbStreak + 1;
      } else {
        finalStreak = 1;
      }
      
      await supabase
        .from('user_streaks')
        .update({ streak_count: finalStreak, last_visit_date: today })
        .eq('device_id', deviceId);
    } else {
      finalStreak = streak > 0 ? streak : 1;
      await supabase
        .from('user_streaks')
        .insert([{ device_id: deviceId, streak_count: finalStreak, last_visit_date: today }]);
    }

    localStorage.setItem('streakCount', finalStreak.toString());
    setStreak(finalStreak);
  }, [streak]);

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
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [selectedDate, loadData, updateStreak]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentVerse) return;
    const { error } = await supabase.from('comments').insert([
      { verse_id: currentVerse.id, text: newComment, author: author.trim() || "Anonimowy" }
    ]);
    if (error) alert("Błąd bazy");
    else { setNewComment(""); setAuthor(""); loadData(selectedDate); }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans">
      <header className="relative pt-16 pb-32 px-4 overflow-hidden rounded-b-[4rem] bg-slate-900 shadow-2xl text-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-600/20 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[50%] h-[50%] bg-blue-600/20 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex justify-center mb-10 animate-fadeIn">
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-orange-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl">
                <div className="relative">
                  <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">🔥</span>
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-white font-black text-2xl tracking-tighter">{streak}</span>
                  <span className="text-[9px] text-amber-500/80 uppercase font-black tracking-[0.2em]">Dni</span>
                </div>
                <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
                <div className="relative group/rank flex flex-col items-start leading-none cursor-help">
                  <span className="text-sm font-black uppercase text-amber-400 flex items-center gap-1">
                    {currentBadge.icon} {currentBadge.label}
                  </span>
                  <span className="text-[8px] text-slate-500 uppercase font-bold">Twoja Ranga</span>
                  <div className="absolute top-full left-0 mt-4 w-48 bg-slate-800 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/rank:opacity-100 group-hover/rank:visible transition-all z-50 p-2 max-h-60 overflow-y-auto custom-scroll">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2 p-1 border-b border-white/5">Wszystkie Rangi</p>
                    {RANKS_CONFIG.map(r => (
                      <div key={r.day} className={`flex items-center justify-between p-1.5 rounded-lg text-[10px] ${streak >= r.day ? 'bg-amber-500/10 text-amber-400' : 'text-slate-500'}`}>
                        <span>{r.icon} {r.label}</span>
                        <span className="font-bold">{r.day}d</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <span className="px-5 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-10 inline-block">Słowo na {selectedDate}</span>
          
          {loading ? (
            <div className="h-40 flex items-center justify-center italic text-slate-500">Otwieranie...</div>
          ) : currentVerse ? (
            <div className="space-y-10 animate-fadeIn">
              <h1 className="text-4xl md:text-6xl font-serif italic text-white leading-tight px-4 tracking-tight">"{currentVerse.verse_text}"</h1>
              <cite className="text-xl font-bold text-amber-500 block uppercase tracking-widest">— {currentVerse.reference}</cite>
              {currentVerse.audio_url && (
                <div className="mt-12 flex flex-col items-center">
                  <audio controls className="w-full max-w-md h-12 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl" src={currentVerse.audio_url} />
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-slate-500 text-xl italic">Brak zapisanego Słowa.</div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 -mt-16 relative z-20 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-4 bg-slate-800/60 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl h-fit">
          <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-3">📅 Archiwum</h3>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-900 border border-white/10 text-white font-bold outline-none focus:border-amber-500 transition-all" />
        </aside>

        <div className="lg:col-span-8 bg-slate-800/40 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-2xl">
          <h4 className="text-2xl font-bold text-white mb-10 flex justify-between font-serif">Refleksje <span className="text-xs bg-white/5 px-4 py-2 rounded-full text-amber-500">{comments.length} WPISÓW</span></h4>
          <div className="space-y-6 mb-12 max-h-[400px] overflow-y-auto pr-2 custom-scroll">
            {comments.map(c => (
              <div key={c.id} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                <p className="text-slate-300 text-lg mb-4">{c.text}</p>
                <div className="flex justify-between text-[10px] font-black tracking-widest uppercase text-slate-500 border-t border-white/5 pt-4">
                  <span className="text-amber-600">✍️ {c.author}</span>
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4 pt-8 border-t border-white/10">
            <input type="text" placeholder="Twoje imię..." value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-900 border border-white/10 text-white outline-none focus:border-amber-500 transition-all" />
            <textarea placeholder="Twoja refleksja..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="w-full p-6 rounded-3xl bg-slate-900 border border-white/10 text-white outline-none focus:border-amber-500 min-h-[120px] resize-none transition-all" />
            <button onClick={handleAddComment} className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs shadow-lg active:scale-95">Udostępnij</button>
          </div>
        </div>
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