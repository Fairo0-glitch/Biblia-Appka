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
  const [authorName, setAuthorName] = useState('');
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  // Logika licznika serii (Streak)
  useEffect(() => {
    const lastVisit = localStorage.getItem('lastVisit');
    const currentStreak = parseInt(localStorage.getItem('streak') || '0');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastVisit === yesterdayStr) {
      const newStreak = currentStreak + 1;
      setStreak(newStreak);
      localStorage.setItem('streak', newStreak.toString());
      localStorage.setItem('lastVisit', today);
    } else if (lastVisit !== today) {
      setStreak(1);
      localStorage.setItem('streak', '1');
      localStorage.setItem('lastVisit', today);
    } else {
      setStreak(currentStreak || 1);
    }
  }, []);

  // Pobieranie danych z bazy
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      const { data: vData } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('date', selectedDate)
        .maybeSingle();
      setCurrentVerse(vData);

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
      {/* Tło z poświatą */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full"></div>
      </div>

      <header className="relative pt-12 pb-8 px-4 text-center">
        {/* Licznik serii - STREAK */}
        <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full mb-8 shadow-2xl transition-transform hover:scale-105">
          <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">🔥</span>
          <span className="font-black text-white tracking-widest uppercase text-sm">
            {streak} {streak === 1 ? 'DZIEŃ' : 'DNI'} SERII
          </span>
          <span className="text-slate-400 font-medium ml-2 text-xs">Jesteś ze Słowem!</span>
        </div>
        <h2 className="text-slate-400 uppercase tracking-[0.4em] text-[10px] font-bold mb-2">Czytanie na {selectedDate}</h2>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 pb-24 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 bg-slate-800/40 backdrop-blur-2xl p-8 md:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl">
          {loading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-white/5 rounded-2xl w-3/4"></div>
              <div className="h-48 bg-white/5 rounded-3xl"></div>
            </div>
          ) : currentVerse ? (
            <>
              <h1 className="text-4xl md:text-6xl font-serif italic text-white leading-tight mb-8 tracking-tight">
                "{currentVerse.text}"
              </h1>
              <p className="text-amber-500 font-bold text-xl mb-10">— {currentVerse.reference}</p>
              
              <div className="bg-slate-900/60 p-6 rounded-[2rem] border border-white/5 mb-10 shadow-inner">
                <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-4 font-bold flex items-center gap-2">
                  <span>🔊</span> POSŁUCHAJ CZYTANIA
                </p>
                <audio key={currentVerse.audio_url} controls preload="none" className="w-full h-12">
                  <source src={currentVerse.audio_url} type="audio/mpeg" />
                </audio>
              </div>

              <button onClick={handleShare} className="w-full py-6 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-amber-900/20 uppercase tracking-[0.2em] text-sm">
                Udostępnij Słowo
              </button>

              <section className="mt-20 pt-16 border-t border-white/5">
                <h3 className="text-2xl font-bold text-white mb-10 tracking-tight">Refleksje Wspólnoty</h3>
                
                <form onSubmit={handleAddComment} className="space-y-4 mb-14">
                  <input 
                    type="text"
                    placeholder="Twoje imię / podpis..."
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full p-5 rounded-2xl bg-slate-900/80 border border-white/10 text-white outline-none focus:border-amber-500 transition-all text-sm"
                  />
                  <div className="relative">
                    <textarea 
                      placeholder="Podziel się tym, jak Słowo dotyka Twojego serca..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full p-6 h-40 rounded-[2rem] bg-slate-900/80 border border-white/10 text-white outline-none focus:border-amber-500 transition-all resize-none text-sm leading-relaxed"
                    />
                    <button type="submit" className="absolute right-4 bottom-4 px-10 py-4 bg-white text-slate-900 font-black rounded-xl uppercase text-[10px] hover:bg-amber-500 hover:text-white transition-all">
                      Dodaj Wpis
                    </button>
                  </div>
                </form>

                <div className="space-y-8">
                  {comments.length > 0 ? (
                    comments.map((c) => (
                      <div key={c.id} className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all group">
                        <p className="text-slate-200 mb-6 leading-relaxed text-lg italic font-serif">"{c.content}"</p>
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                          <span className="text-amber-600 bg-amber-600/10 px-3 py-1 rounded-full">✍️ {c.author}</span>
                          <span>{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-600 italic text-center py-10">Bądź pierwszą osobą, która podzieli się refleksją.</p>
                  )}
                </div>
              </section>
            </>
          ) : (
            <div className="py-24 text-center text-slate-500 italic">Brak zapisanego czytania na dzisiaj.</div>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-slate-800/60 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/10 shadow-2xl sticky top-8">
            <h3 className="text-lg font-bold mb-8 text-white flex items-center gap-3 uppercase tracking-widest">
              <span className="text-xl">📅</span> Archiwum
            </h3>
            <div className="space-y-3">
              <label htmlFor="date-picker" className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">Wybierz datę czytania</label>
              <input 
                id="date-picker"
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="w-full p-5 rounded-2xl bg-slate-950/50 border border-white/10 text-white font-bold outline-none focus:border-amber-500 transition-all cursor-pointer text-sm shadow-inner" 
              />
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}