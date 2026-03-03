import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'TWOJA_URL_Z_SUPABASE';
const supabaseKey = 'TWÓJ_KLUCZ_Z_SUPABASE';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function BibliaAppka() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentVerse, setCurrentVerse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: verseData } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('date', selectedDate)
        .single();
      
      setCurrentVerse(verseData);
      setLoading(false);
    }
    fetchData();
  }, [selectedDate]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Słowo Życia',
        text: `Dzisiejsze Słowo: ${currentVerse?.text}`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-amber-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full"></div>
      </div>

      <header className="relative pt-12 pb-8 px-4 text-center">
        <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full mb-8 shadow-xl">
          <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">🔥</span>
          <span className="font-black text-white tracking-wider">1 DNI SERII</span>
          <span className="text-slate-400 font-medium ml-2">Zacznij nową drogę</span>
        </div>
        <h2 className="text-slate-400 uppercase tracking-[0.3em] text-sm font-bold mb-2">Słowo na {selectedDate}</h2>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 pb-24 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 bg-slate-800/40 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-2xl">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-white/10 rounded w-3/4"></div>
              <div className="h-32 bg-white/10 rounded"></div>
            </div>
          ) : currentVerse ? (
            <>
              <h1 className="text-4xl md:text-6xl font-serif italic text-white leading-tight mb-8 tracking-tight">
                "{currentVerse.text}"
              </h1>
              <p className="text-amber-500 font-bold text-xl mb-10">— {currentVerse.reference}</p>
              
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                <p className="text-slate-300 font-medium mb-4 flex items-center gap-2">
                  <span className="text-xl">🔊</span> Posłuchaj Słowa:
                </p>
                <audio 
                  key={currentVerse.audio_url}
                  controls 
                  preload="none" 
                  className="w-full"
                >
                  <source src={currentVerse.audio_url} type="audio/mpeg" />
                </audio>
              </div>

              <button 
                onClick={handleShare}
                className="mt-10 w-full py-5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-amber-900/20 uppercase tracking-widest"
              >
                Udostępnij Słowo
              </button>
            </>
          ) : (
            <p className="text-center text-slate-400 italic">Brak czytania na ten dzień.</p>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-slate-800/60 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
              <span className="text-2xl">📅</span> Archiwum
            </h3>
            <div className="flex flex-col gap-2">
              <label htmlFor="date-picker" className="text-slate-300 text-sm font-medium ml-1">Wybierz datę:</label>
              <input 
                id="date-picker"
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="w-full p-4 rounded-2xl bg-slate-900 border border-white/10 text-white font-bold outline-none focus:border-amber-500 transition-all" 
              />
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}