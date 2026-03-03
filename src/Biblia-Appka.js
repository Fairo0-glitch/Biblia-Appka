import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Dane pobierane z Environment Variables w Vercel
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function BibliaAppka() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentVerse, setCurrentVerse] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. LOGIKA POWIADOMIEŃ PUSH
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          console.log("Powiadomienia aktywne.");
        }
      });
    }
  }, []);

  // 2. LOGIKA LICZNIKA SERII (STREAK)
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

  // 3. POBIERANIE CZYTANIA I REFLEKSJI
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
      setComments([data[0], ...comments]);
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
      {/* Tło efektowe */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full"></div>
      </div>

      <header className="relative pt-12 pb-8 px-4 text-center">
        <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full mb-8 shadow-xl">
          <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">🔥</span>
          <span className="font-black text-white uppercase tracking-widest">{streak} DNI SERII</span>
        </div>
        <h2 className="text-slate-400 uppercase tracking-[0.3em] text-xs font-bold mb-2 tracking-[0.4em]">SŁOWO NA {selectedDate}</h2>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 pb-24 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 bg-slate-800/40 backdrop-blur-2xl p-8 md:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-white/5 rounded w-3/4"></div>
              <div className="h-32 bg-white/5 rounded"></div>
            </div>
          ) : currentVerse ? (
            <>
              <h1 className="text-4xl md:text-6xl font-serif italic text-white leading-tight mb-8 tracking-tight">
                "{currentVerse.text}"
              </h1>
              <p className="text-amber-500 font-bold text-xl mb-10">— {currentVerse.reference}</p>
              
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 mb-10 shadow-inner">
                <audio key={currentVerse.audio_url} controls preload="none" className="w-full h-12">
                  <source src={currentVerse.audio_url} type="audio/mpeg" />
                </audio>
              </div>

              <button onClick={handleShare} className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-2xl transition-all shadow-lg uppercase tracking-widest text-sm">
                UDOSTĘPNIJ SŁOWO
              </button>

              <section className="mt-16 pt-16 border-t border-white/5">
                <h3 className="text-2xl font-bold text-white mb-8 tracking-tight">Refleksje Wspólnoty</h3>
                
                <form onSubmit={handleAddComment} className="space-y-4 mb-10">
                  <input 
                    type="text"
                    placeholder="Podpis..."
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full p-4 rounded-xl bg-slate-900 border border-white/10 text-white outline-none focus:border-amber-500 transition-all shadow-lg"
                  />
                  <div className="relative">
                    <textarea 
                      placeholder="Twoja myśl..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full p-5 h-32 rounded-2xl bg-slate-900 border border-white/10 text-white outline-none focus:border-amber-500 transition-all resize-none shadow-inner"
                    />
                    <button type="submit" className="absolute right-3 bottom-3 px-8 py-3 bg-amber-600 text-white font-bold rounded-xl uppercase text-xs hover:bg-amber-500 transition-all shadow-lg active:scale-95">
                      Dodaj
                    </button>
                  </div>
                </form>

                <div className="space-y-6">
                  {comments.map((c) => (
                    <div key={c.id} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                      <p className="text-slate-200 mb-4 italic text-lg leading-relaxed font-serif">"{c.content}"</p>
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span className="text-amber-500">✍️ {c.author}</span>
                        <span>{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div className="py-20 text-center text-slate-500 italic font-serif">Brak czytania na ten dzień w archiwum.</div>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="bg-slate-800/60 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl sticky top-8">
            <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-3 uppercase tracking-tighter">📅 ARCHIWUM</h3>
            <label htmlFor="date-picker" className="text-slate-500 text-[10px] font-bold uppercase mb-2 block">Zmień datę czytania:</label>
            <input 
              id="date-picker"
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              className="w-full p-4 rounded-2xl bg-slate-900 border border-white/10 text-white font-bold outline-none focus:border-amber-500 cursor-pointer shadow-inner transition-all" 
            />
          </div>
        </aside>
      </main>
    </div>
  );
}