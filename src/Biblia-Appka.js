import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Pobieranie kluczy ze zmiennych środowiskowych Vercela
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentVerse, setCurrentVerse] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  // Funkcja ładująca dane
  const loadContent = async (date) => {
    setLoading(true);
    console.log("--- Rozpoczynam pobieranie danych dla:", date, "---");
    
    try {
      // 1. Pobierz cytat
      const { data: verse, error: verseError } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('date', date)
        .maybeSingle();

      if (verseError) throw verseError;
      
      setCurrentVerse(verse);
      console.log("Pobrany cytat:", verse);

      // 2. Pobierz komentarze jeśli cytat istnieje
      if (verse) {
        const { data: comms, error: commsError } = await supabase
          .from('comments')
          .select('*')
          .eq('verse_id', verse.id)
          .order('created_at', { ascending: true });

        if (commsError) throw commsError;
        setComments(comms || []);
        console.log("Pobrane komentarze:", comms);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error("Błąd komunikacji z Supabase:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent(selectedDate);
  }, [selectedDate]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentVerse) return;

    console.log("Wysyłam komentarz...");
    const { error } = await supabase.from('comments').insert([
      { verse_id: currentVerse.id, text: newComment }
    ]);

    if (error) {
      console.error("Nie udało się dodać komentarza:", error.message);
      alert("Błąd: " + error.message);
    } else {
      setNewComment("");
      loadContent(selectedDate); // Odśwież listę
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 mt-10">
        
        {/* PANEL BOCZNY */}
        <div className="w-full md:w-1/4 bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-fit">
          <h3 className="font-bold text-lg mb-4 text-stone-700">Archiwum</h3>
          <label className="text-xs font-semibold text-stone-500 uppercase">Wybierz datę:</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full mt-1 p-2 rounded border border-stone-300 focus:ring-2 focus:ring-amber-500 outline-none"
          />
          <p className="mt-4 text-sm text-stone-500 italic">
            Wybierz dowolny dzień, aby zobaczyć słowo i dyskusję z tamtego czasu.
          </p>
        </div>

        {/* GŁÓWNA TREŚĆ */}
        <div className="w-full md:w-3/4 bg-white shadow-2xl p-8 rounded-2xl border border-stone-100">
          {loading ? (
            <p className="text-center py-20 text-stone-400 animate-pulse">Ładowanie Słowa...</p>
          ) : currentVerse ? (
            <>
              <div className="border-b border-stone-100 pb-6 mb-8">
                <h2 className="text-amber-700 font-bold uppercase tracking-widest text-xs mb-3">
                  Ewangelia na dzień: {selectedDate}
                </h2>
                <p className="text-3xl font-serif italic text-stone-800 leading-snug">
                  "{currentVerse.verse_text}"
                </p>
                <p className="text-right mt-4 font-bold text-stone-500 text-lg">
                  — {currentVerse.reference}
                </p>
              </div>
              
              <div className="mt-10">
                <h4 className="font-bold text-xl mb-6 flex items-center gap-2">
                  Refleksje społeczności 
                  <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                    {comments.length}
                  </span>
                </h4>

                <div className="space-y-4 mb-8 max-h-96 overflow-y-auto pr-2">
                  {comments.length > 0 ? comments.map(c => (
                    <div key={c.id} className="bg-stone-50 p-4 rounded-xl border-l-4 border-amber-400 shadow-sm transition hover:shadow-md">
                      <p className="text-stone-700 leading-relaxed">{c.text}</p>
                      <span className="text-[10px] text-stone-400 uppercase mt-2 block">
                        Dodano: {new Date(c.created_at).toLocaleString('pl-PL')}
                      </span>
                    </div>
                  )) : (
                    <p className="text-stone-400 italic text-sm">Brak komentarzy. Bądź pierwszy!</p>
                  )}
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <textarea 
                    className="w-full bg-white border border-stone-300 p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none resize-none h-32"
                    placeholder="Podziel się swoim świadectwem lub przemyśleniem..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button 
                    onClick={handleAddComment} 
                    className="w-full mt-3 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95"
                  >
                    Dodaj komentarz
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <span className="text-5xl block mb-4">📖</span>
              <p className="text-stone-400 text-lg font-serif">Brak zapisanego cytatu na dzień {selectedDate}.</p>
              <p className="text-sm text-stone-300 mt-2">Zajrzyj do panelu Supabase, aby dodać treść!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;