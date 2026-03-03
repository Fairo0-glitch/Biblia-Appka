import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lmjcsqddmffibtsxndhu.supabase.co';
const supabaseKey = 'sb_publishable_XJp-j0PPDGNxUXD_MomXFA_j0-suB2r';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function BibliaAppka() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentVerse, setCurrentVerse] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState(''); // PRZYWRÓCONO: Stan dla podpisu
  const [loading, setLoading] = useState(true);

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

      // 2. Pobierz WSZYSTKIE refleksje (nie jedną, ale wszystkie)
      const { data: cData, error } = await supabase
        .from('comments')
        .select('*')
        .eq('verse_date', selectedDate)
        .order('created_at', { ascending: false });
      
      if (error) console.error("Błąd pobierania refleksji:", error.message);
      setComments(cData || []);
      setLoading(false);
    }
    fetchData();
  }, [selectedDate]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // Wysyłamy treść ORAZ autora (jeśli pusty, wpisze Anonim)
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
    } else {
      console.error("Błąd zapisu:", error?.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-4">
      <header className="max-w-2xl mx-auto py-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Słowo Życia</h1>
        <p className="text-amber-500 font-medium tracking-widest">{selectedDate}</p>
      </header>

      <main className="max-w-2xl mx-auto space-y-8">
        {/* Sekcja czytania */}
        <div className="bg-slate-800/50 p-8 rounded-[2rem] border border-white/10">
          {loading ? <p>Ładowanie...</p> : currentVerse ? (
            <>
              <h2 className="text-4xl font-serif italic text-white mb-6">"{currentVerse.text}"</h2>
              <p className="text-amber-500 font-bold mb-6">— {currentVerse.reference}</p>
              <audio key={currentVerse.audio_url} controls preload="none" className="w-full">
                <source src={currentVerse.audio_url} type="audio/mpeg" />
              </audio>
            </>
          ) : <p>Brak czytania na dziś.</p>}
        </div>

        {/* Sekcja refleksji */}
        <div className="bg-slate-800/50 p-8 rounded-[2rem] border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-6">Refleksje wspólnoty</h3>
          
          <form onSubmit={handleAddComment} className="space-y-3 mb-10">
            <input 
              type="text"
              placeholder="Twoje imię / podpis..."
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full p-4 rounded-xl bg-slate-900 border border-white/10 text-white outline-none focus:border-amber-500"
            />
            <textarea 
              placeholder="Twoja refleksja..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-4 h-32 rounded-xl bg-slate-900 border border-white/10 text-white outline-none focus:border-amber-500"
            />
            <button type="submit" className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl uppercase">
              Dodaj refleksję
            </button>
          </form>

          <div className="space-y-6">
            {comments.map((c) => (
              <div key={c.id} className="border-b border-white/5 pb-4">
                <p className="text-slate-200 mb-2 text-lg">"{c.content}"</p>
                <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                  <span className="text-amber-500">✍️ {c.author}</span>
                  <span className="text-slate-500">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kalendarz */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-white/5">
          <label className="text-sm text-slate-500 block mb-2 text-center uppercase tracking-widest">Szukaj w archiwum:</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-transparent text-white text-center font-bold outline-none cursor-pointer"
          />
        </div>
      </main>
    </div>
  );
}