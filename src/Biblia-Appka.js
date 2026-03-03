import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// PODSTAW SWOJE DANE!
const supabaseUrl = 'https://lmjcsqddmffibtsxndhu.supabase.co';
const supabaseKey = 'sb_publishable_XJp-j0PPDGNxUXD_MomXFA_j0-suB2r';
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
        text: currentVerse ? currentVerse.text : '',
        url: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4">
      <header className="py-8 text-center">
        <h1 className="text-2xl font-bold text-white">Słowo Życia</h1>
        <p className="text-slate-400 text-sm">{selectedDate}</p>
      </header>

      <main className="max-w-2xl mx-auto bg-slate-800/50 p-6 rounded-3xl border border-white/10 shadow-xl">
        {loading ? (
          <p className="text-center py-10">Ładowanie...</p>
        ) : currentVerse ? (
          <div className="space-y-6">
            <h2 className="text-3xl font-serif italic text-white leading-tight">
              "{currentVerse.text}"
            </h2>
            <p className="text-amber-500 font-bold">— {currentVerse.reference}</p>
            
            <div className="bg-slate-900 p-4 rounded-xl">
              <audio key={currentVerse.audio_url} controls preload="none" className="w-full">
                <source src={currentVerse.audio_url} type="audio/mpeg" />
              </audio>
            </div>

            <button onClick={handleShare} className="w-full py-4 bg-amber-600 text-white font-bold rounded-xl uppercase">
              Udostępnij
            </button>
          </div>
        ) : (
          <p className="text-center py-10">Brak czytania na dziś.</p>
        )}

        <div className="mt-10 pt-6 border-t border-white/10">
          <label htmlFor="date-picker" className="block text-sm mb-2">Wybierz inną datę:</label>
          <input 
            id="date-picker"
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            className="w-full p-3 rounded-lg bg-slate-900 text-white border border-white/10"
          />
        </div>
      </main>
    </div>
  );
}

export default BibliaAppka;