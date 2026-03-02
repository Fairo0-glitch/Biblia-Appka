import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentVerse, setCurrentVerse] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(true);

  const loadContent = async (date) => {
    setLoading(true);
    try {
      const { data: verse, error: verseError } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('date', date)
        .maybeSingle();

      if (verseError) throw verseError;
      setCurrentVerse(verse);

      if (verse) {
        const { data: comms, error: commsError } = await supabase
          .from('comments')
          .select('*')
          .eq('verse_id', verse.id)
          .order('created_at', { ascending: true });

        if (commsError) throw commsError;
        setComments(comms || []);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent(selectedDate);
  }, [selectedDate]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentVerse) return;
    const finalAuthor = author.trim() === "" ? "Anonimowy" : author.trim();
    const { error } = await supabase.from('comments').insert([
      { verse_id: currentVerse.id, text: newComment, author: finalAuthor }
    ]);
    if (!error) {
      setNewComment("");
      setAuthor("");
      loadContent(selectedDate);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-slate-900">
      
      {/* 1. HERO SECTION - WIELKI CYTAT Z GRADIENTEM */}
      <section className="relative overflow-hidden bg-slate-900 py-24 md:py-32 px-4">
        {/* Dynamiczne tło gradientowe w tle sekcji */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[80%] rounded-full bg-amber-500/20 blur-[120px] animate-pulse"></div>
          <div className="absolute -bottom-[40%] -right-[10%] w-[60%] h-[70%] rounded-full bg-blue-600/20 blur-[120px]"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          {loading ? (
            <div className="animate-pulse text-stone-400 text-xl font-serif">Otwieranie Słowa...</div>
          ) : currentVerse ? (
            <div className="space-y-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] border border-white/10">
                Słowo na {selectedDate}
              </span>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif italic text-white leading-[1.1] tracking-tight px-4">
                "{currentVerse.verse_text}"
              </h2>
              <div className="flex justify-center items-center gap-4">
                <div className="h-[1px] w-12 bg-amber-500/50"></div>
                <cite className="text-xl md:text-2xl font-bold text-amber-500 not-italic tracking-wide">
                  {currentVerse.reference}
                </cite>
                <div className="h-[1px] w-12 bg-amber-500/50"></div>
              </div>
            </div>
          ) : (
            <div className="text-stone-500 text-2xl font-serif">Cisza... Brak zapisanego Słowa na ten dzień.</div>
          )}
        </div>
      </section>

      {/* 2. DOLNA CZĘŚĆ - ARCHIWUM I KOMENTARZE */}
      <div className="max-w-6xl mx-auto px-4 -mt-12 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* PANEL BOCZNY */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100">
              <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
                <span className="p-2 bg-amber-100 rounded-xl text-lg">📅</span> 
                Archiwum
              </h3>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 focus:bg-white outline-none transition-all font-semibold text-slate-700 shadow-inner"
              />
            </div>
          </aside>

          {/* KOMENTARZE */}
          <main className="lg:col-span-8 space-y-8">
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100">
              <h4 className="text-2xl font-bold mb-10 flex items-center justify-between">
                Refleksje społeczności
                <span className="text-sm bg-slate-100 px-4 py-1 rounded-full text-slate-500">{comments.length} wpisów</span>
              </h4>

              {/* Lista komentarzy */}
              <div className="space-y-6 mb-12">
                {comments.map(c => (
                  <div key={c.id} className="group relative p-6 rounded-3xl bg-slate-50 hover:bg-white border-2 border-transparent hover:border-amber-100 transition-all duration-300">
                    <p className="text-slate-700 text-lg leading-relaxed mb-4">{c.text}</p>
                    <div className="flex justify-between items-center text-[11px] font-black text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-200/50">
                      <span className="flex items-center gap-2 text-amber-600">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span> {c.author}
                      </span>
                      <span>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formularz */}
              <div className="space-y-4 pt-8 border-t border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Twoje Imię</label>
                    <input 
                      type="text"
                      placeholder="Anonimowy"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 focus:bg-white outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Twoja Refleksja</label>
                  <textarea 
                    placeholder="Podziel się tym, co czujesz..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-6 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-amber-500 focus:bg-white outline-none transition-all shadow-inner min-h-[150px] resize-none"
                  />
                </div>
                <button 
                  onClick={handleAddComment}
                  className="w-full py-5 bg-slate-900 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-slate-200 hover:shadow-amber-200 active:scale-[0.98] uppercase tracking-widest text-xs"
                >
                  Opublikuj wpis
                </button>
              </div>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}

export default App;