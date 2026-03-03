import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Twoja konfiguracja Supabase
const supabaseUrl = 'https://lmjcsqddmffibtsxndhu.supabase.co';
const supabaseKey = 'sb_publishable_XJp-j0PPDGNxUXD_MomXFA_j0-suB2r';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function BibliaAppka() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentVerse, setCurrentVerse] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState(''); // Przywrócone pole autora
  const [loading, setLoading] = useState(true);

  // Pobieranie danych
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // 1. Pobierz czytanie
      const { data: vData } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('date', selectedDate)
        .maybeSingle();
      setCurrentVerse(vData);

      // 2. Pobierz WSZYSTKIE refleksje (bez limitu)
      const { data: cData } = await supabase
        .from('comments')
        .select('*')
        .eq('verse_date', selectedDate)
        .order('created_at', { ascending: false });
      
      setComments(cData || []);
      setLoading(false);
    }
    fetchData();
  }, [selectedDate]);

  // Dodawanie refleksji
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const { data, error } = await supabase
      .from('comments')
      .insert([{ 
        verse_date: selectedDate, 
        content: newComment, 
        author: authorName.trim() || 'ANONIMOWY' 
      }])
      .select();

    if (!error && data) {
      setComments(prev => [data[0], ...prev]);
      setNewComment('');
      setAuthorName('');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Słowo Życia',
        text: `"${currentVerse?.text}" — ${currentVerse?.reference}`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-amber-500/30">
      {/* Dynamiczne tło */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full"></div>
      </div>

      <header className="relative pt-12 pb-8 px-4 text-center">
        <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full mb-8 shadow-xl">
          <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">🔥</span>
          <span className="font-black text-white tracking-widest uppercase">Słowo Życia</span>
        </div>
        <h2 className="text-slate-400 uppercase tracking-[0.3em] text-xs font-bold mb-2">Czytanie na {selectedDate}</h2>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 pb-24 grid lg:grid-cols-12 gap-12">
        {/* Lewa kolumna: Czytanie i Audio */}
        <div className="lg:col-span-8 bg-slate-800/40 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-2xl">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-white/10 rounded w-3/4"></div>
              <div className="h-40 bg-white/10 rounded w-full"></div>
            </div>
          ) : currentVerse ? (
            <>
              <h1 className="text-4xl md:text-6xl font-serif italic text-white leading-tight mb-8 tracking-tight">
                "{currentVerse.text}"
              </h1>
              <p className="text-amber-500 font-bold text-xl mb-10">— {currentVerse.reference}</p>
              
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 mb-10">
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span>🔊</span> Posłuchaj czytania:
                </p>
                <audio key={currentVerse.audio_url} controls preload="none" className="w-full h-12">
                  <source src={currentVerse.audio_url} type="audio/mpeg" />
                </audio>
              </div>

              <button onClick={handleShare} className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-amber-900/20 uppercase tracking-widest">
                Udostępnij Słowo
              </button>

              {/* Sekcja Refleksji */}
              <section className="mt-16 pt-16 border-t border-white/5">
                <h3 className="text-2xl font-bold text-white mb-8 tracking-tight">Refleksje</h3>
                
                <form onSubmit={handleAddComment} className="space-y-4 mb-12">
                  <input 
                    type="text"
                    placeholder="Twoje imię / podpis..."
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full p-4 rounded-xl bg-slate-900 border border-white/10 text-white outline-none focus:border-amber-500 transition-all"
                  />
                  <div className="relative">
                    <textarea 
                      placeholder="Co czujesz po tym Słowie?..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full p-5 h-32 rounded-2xl bg-slate-900 border border-white/10 text-white outline-none focus:border-amber-500 transition-all resize-none shadow-inner"
                    />
                    <button type="submit" className="absolute right-3 bottom-3 px-8 py-3 bg-amber-600 text-white font-bold rounded-xl uppercase text-xs hover:bg-amber-500 transition-all active:scale-90">
                      Dodaj
                    </button>
                  </div>
                </form>

                <div className="space-y-6">
                  {comments.length > 0 ? (
                    comments.map((c) => (
                      <div key={c.id} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                        <p className="text-slate-200 mb-4 leading-relaxed text-lg italic">"{c.content}"</p>
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          <span className="text-amber-500">✍️ {c.author}</span>
                          <span>{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 italic text-center py-4">Brak refleksji na ten dzień. Bądź pierwszy!</p>
                  )}
                </div>
              </section>
            </>
          ) : (
            <div className="py-20 text-center text-slate-500 italic">Brak czytania w bazie na dziś.</div>
          )}
        </div>

        {/* Prawa kolumna: Archiwum */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-slate-800/60 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl sticky top-8">
            <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
              <span>📅</span> Archiwum
            </h3>
            <div className="flex flex-col gap-2">
              <label htmlFor="date-picker" className="text-slate-400 text-sm font-medium ml-1">Wybierz datę:</label>
              <input 
                id="date-picker"
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="w-full p-4 rounded-2xl bg-slate-900 border border-white/10 text-white font-bold outline-none focus:border-amber-500 transition-all cursor-pointer" 
              />
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}