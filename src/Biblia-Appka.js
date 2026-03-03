import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// PODSTAW SWOJE DANE!
const supabaseUrl = 'TWOJA_URL_Z_SUPABASE';
const supabaseKey = 'TWÓJ_KLUCZ_Z_SUPABASE';
const supabase = createClient(supabaseUrl, supabaseKey);

function BibliaAppka() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentVerse, setCurrentVerse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('daily_verses')
          .select('*')
          .eq('date', selectedDate)
          .maybeSingle();
        
        if (error) console.error(error);
        setCurrentVerse(data);
      } catch (err) {
        console.error(err);
      }
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
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full"></div>
      </div>

      <header className="relative pt-12 pb-8 px-4 text-center">
        <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full mb-8">
          <span className="text-2xl">🔥</span>
          <span className="font-black text-white uppercase tracking-wider">1 DNI SERII</span>
        </div>
        <h2 className="text-slate-400 uppercase tracking-[0.2em] text-xs font-bold">Słowo na {selectedDate}</h2>
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
              <h1 className="text-4xl md:text-5xl font-serif italic text-white leading-tight mb-8">
                "{currentVerse.text}"
              </h1>
              <p className="text-amber-500 font-bold text-xl mb-10">— {currentVerse.reference}</p>
              
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                <p className="text-slate-300 font-medium mb-4 text-xs uppercase tracking-widest">Posłuchaj Słowa:</p>
                <audio key={currentVerse.audio_url} controls preload="none" className="w-full">
                  <source src={currentVerse.audio_url} type="audio/mpeg" />
                </audio>
              </div>

              <button onClick={handleShare} className="mt-10 w-full py-5 bg-amber-600 text-white font-black rounded-2xl uppercase tracking-widest">
                Udostępnij Słowo
              </button>
            </>
          ) : (
            <p className="text-center py-20 text-slate-400 italic">Brak czytania na ten dzień.</p>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="bg-slate-800/60 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-3">📅 Archiwum</h3>
            <div className="flex flex-col gap-2">
              <label htmlFor="date-picker" className="text-slate-400 text-sm">Wybierz datę:</label>
              <input 
                id="date-picker"
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="w-full p-4 rounded-2xl bg-slate-900 border border-white/10 text-white font-bold outline-none focus:border-amber-500" 
              />
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default BibliaAppka;