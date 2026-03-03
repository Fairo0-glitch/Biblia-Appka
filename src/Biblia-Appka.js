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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // 1. Pobierz czytanie (Tabela: daily_verses)
      const { data: verseData, error: vError } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('date', selectedDate)
        .maybeSingle();
      
      if (vError) console.error("Błąd cytatu:", vError.message);
      setCurrentVerse(verseData);

      // 2. Pobierz refleksje (Tabela: comments)
      const { data: commData, error: cError } = await supabase
        .from('comments')
        .select('*')
        .eq('verse_date', selectedDate)
        .order('created_at', { ascending: false });
      
      if (cError) console.error("Błąd refleksji:", cError.message);
      setComments(commData || []);
      
      setLoading(false);
    }
    fetchData();
  }, [selectedDate]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const { data, error } = await supabase
      .from('comments')
      .insert([{ 
        verse_date: selectedDate, 
        content: newComment, 
        author: 'ANONIMOWY' 
      }])
      .select();

    if (!error) {
      setComments([data[0], ...comments]);
      setNewComment('');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Słowo Życia',
        text: currentVerse?.text,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-600/10 blur-[120px] rounded-full"></div>
      </div>

      <header className="relative pt-12 pb-8 px-4 text-center">
        <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full mb-8 shadow-xl">
          <span className="text-2xl">🔥</span>
          <span className="font-black text-white tracking-wider uppercase">Seria: 1 Dzień</span>
        </div>
        <h2 className="text-slate-400 uppercase tracking-[0.3em] text-xs font-bold">Słowo na {selectedDate}</h2>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 pb-24 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 bg-slate-800/40 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-2xl">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-white/10 rounded w-3/4"></div>
              <div className="h-40 bg-white/10 rounded w-full"></div>
            </div>
          ) : currentVerse ? (
            <>
              <h1 className="text-4xl md:text-5xl font-serif italic text-white leading-tight mb-8">
                "{currentVerse.text}"
              </h1>
              <p className="text-amber-500 font-bold text-xl mb-10">— {currentVerse.reference}</p>
              
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 mb-10">
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-4">Posłuchaj Słowa:</p>
                <audio key={currentVerse.audio_url} controls preload="none" className="w-full h-12">
                  <source src={currentVerse.audio_url} type="audio/mpeg" />
                </audio>
              </div>

              <button onClick={handleShare} className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-2xl transition-all shadow-lg uppercase tracking-widest">
                Udostępnij Słowo
              </button>

              <section className="mt-16 pt-16 border-t border-white/5">
                <h3 className="text-2xl font-bold text-white mb-8 tracking-tight">Refleksje</h3>
                <form onSubmit={handleAddComment} className="mb-10 relative">
                  <input 
                    type="text"
                    placeholder="Twoja refleksja..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-5 pr-32 rounded-2xl bg-slate-900 border border-white/10 text-white outline-none focus:border-amber-500 transition-all shadow-inner"
                  />
                  <button type="submit" className="absolute right-2 top-2 bottom-2 px-6 bg-amber-600 text-white font-bold rounded-xl uppercase text-xs hover:bg-amber-500 transition-colors">Dodaj</button>
                </form>
                <div className="space-y-4">
                  {comments.map((c) => (
                    <div key={c.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                      <p className="text-slate-200 mb-2 leading-relaxed">{c.content}</p>
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="text-amber-500">✍️ {c.author}</span>
                        <span>{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div className="py-20 text-center text-slate-500 italic">Brak czytania w bazie na ten dzień. Dodaj je w Supabase!</div>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="bg-slate-800/60 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl sticky top-8">
            <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-3">📅 Archiwum</h3>
            <label htmlFor="date-picker" className="text-slate-400 text-sm mb-2 block font-medium">Wybierz datę:</label>
            <input 
              id="date-picker"
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              className="w-full p-4 rounded-2xl bg-slate-900 border border-white/10 text-white font-bold outline-none focus:border-amber-500 transition-all cursor-pointer" 
            />
          </div>
        </aside>
      </main>
    </div>
  );
}