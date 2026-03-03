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

  useEffect(() => { loadData(selectedDate); }, [selectedDate]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentVerse) return;
    const { error } = await supabase.from('comments').insert([
      { verse_id: currentVerse.id, text: newComment, author: author.trim() || "Anonimowy" }
    ]);
    if (error) alert("Błąd bazy: " + error.message);
    else { setNewComment(""); setAuthor(""); loadData(selectedDate); }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-amber-500/30">
      
      {/* NAGŁÓWEK / HERO */}
      <header className="relative pt-20 pb-32 px-4 overflow-hidden">
        {/* Efektowne tło Mesh Gradient */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-600/20 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-blue-600/20 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <span className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8 inline-block">
            Światło na dziś
          </span>
          
          {loading ? (
            <div className="h-40 flex items-center justify-center italic text-slate-500">Odsłanianie Słowa...</div>
          ) : currentVerse ? (
            <div className="space-y-10">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif italic text-white leading-tight tracking-tight">
                "{currentVerse.verse_text}"
              </h1>
              <div className="flex justify-center items-center gap-6">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-500/50"></div>
                <cite className="text-2xl font-bold text-amber-500 not-italic tracking-widest uppercase text-sm">
                  {currentVerse.reference}
                </cite>
                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-500/50"></div>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xl font-serif py-20">W tej dacie panuje jeszcze cisza...</div>
          )}
        </div>
      </header>

      {/* SEKCJA INTERAKTYWNA */}
      <main className="max-w-6xl mx-auto px-4 -mt-16 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEWO: ARCHIWUM */}
          <div className="lg:col-span-4">
            <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                <span className="text-amber-500 text-2xl">📅</span> Kalendarz
              </h3>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-900/50 border border-white/10 focus:border-amber-500 outline-none transition-all text-white font-bold"
              />
            </div>
          </div>

          {/* PRAWO: KOMENTARZE */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-800/40 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <h4 className="text-2xl font-bold text-white mb-10 flex items-center justify-between">
                Refleksje
                <span className="text-xs bg-white/5 px-4 py-2 rounded-full text-slate-400 border border-white/5">
                  {comments.length} wpisów
                </span>
              </h4>

              {/* LISTA WPISÓW */}
              <div className="space-y-6 mb-12 max-h-[400px] overflow-y-auto pr-4 scrollbar-hide">
                {comments.map(c => (
                  <div key={c.id} className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-all">
                    <p className="text-slate-300 text-lg leading-relaxed mb-4">{c.text}</p>
                    <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase border-t border-white/5 pt-4">
                      <span className="text-amber-500">✍️ {c.author}</span>
                      <span className="text-slate-500">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* FORMULARZ */}
              <div className="space-y-4 pt-8 border-t border-white/5">
                <input 
                  type="text"
                  placeholder="Twoje imię (opcjonalnie)"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-900/50 border border-white/10 focus:border-amber-500 outline-none text-white font-medium"
                />
                <textarea 
                  placeholder="Co mówi do Ciebie to Słowo?..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-6 rounded-3xl bg-slate-900/50 border border-white/10 focus:border-amber-500 outline-none min-h-[120px] resize-none text-white"
                />
                <button 
                  onClick={handleAddComment}
                  className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-amber-900/20 uppercase tracking-[0.2em] text-xs"
                >
                  Dodaj moją refleksję
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;