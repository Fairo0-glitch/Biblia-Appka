import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentVerse, setCurrentVerse] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastVisit = localStorage.getItem('lastVisitDate');
    const currentStreak = parseInt(localStorage.getItem('streakCount') || "0");

    if (lastVisit === today) {
      setStreak(currentStreak);
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    if (lastVisit === yesterdayStr) {
      newStreak = currentStreak + 1;
    }

    localStorage.setItem('streakCount', newStreak.toString());
    localStorage.setItem('lastVisitDate', today);
    setStreak(newStreak);
  };

  const loadData = async (date) => {
    setLoading(true);
    try {
      const { data: verse } = await supabase.from('daily_verses').select('*').eq('date', date).maybeSingle();
      setCurrentVerse(verse);
      if (verse) {
        const { data: comms } = await supabase.from('comments').select('*').eq('verse_id', verse.id).order('created_at', { ascending: true });
        setComments(comms || []);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => {
    loadData(selectedDate);
    updateStreak();
  }, [selectedDate]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentVerse) return;
    const { error } = await supabase.from('comments').insert([
      { verse_id: currentVerse.id, text: newComment, author: author.trim() || "Anonimowy" }
    ]);
    if (error) alert("Błąd bazy: " + error.message);
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
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-500 rounded-full animate-ping"></span>
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-white font-black text-2xl tracking-tighter">{streak}</span>
                  <span className="text-[9px] text-amber-500/80 uppercase font-black tracking-[0.2em]">Dni Serii</span>
                </div>
                <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
                <div className="text-[10px] text-slate-400 font-medium italic max-w-[80px] text-left leading-tight">
                  {streak > 1 ? "Wspaniała wytrwałość!" : "Zacznij nową drogę"}
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
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4">Posłuchaj czytania</p>
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
          <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-3"><span className="text-amber-500 text-2xl">📅</span> Archiwum</h3>
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