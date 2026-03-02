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

  // Główna funkcja ładująca dane z bazy
  const loadContent = async (date) => {
    setLoading(true);
    console.log("--- Pobieranie danych dla daty:", date, "---");
    
    try {
      // 1. Pobierz cytat dla wybranej daty
      const { data: verse, error: verseError } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('date', date)
        .maybeSingle();

      if (verseError) throw verseError;
      
      setCurrentVerse(verse);

      // 2. Pobierz komentarze jeśli cytat został znaleziony
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
      console.error("Błąd komunikacji z Supabase:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Uruchom ładowanie przy starcie i przy każdej zmianie daty
  useEffect(() => {
    loadContent(selectedDate);
  }, [selectedDate]);

  // Obsługa dodawania nowego komentarza
  const handleAddComment = async () => {
    if (!newComment.trim() || !currentVerse) return;

    const { error } = await supabase.from('comments').insert([
      { verse_id: currentVerse.id, text: newComment }
    ]);

    if (error) {
      alert("Nie udało się dodać komentarza: " + error.message);
    } else {
      setNewComment("");
      loadContent(selectedDate); // Odświeżenie listy po dodaniu
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-amber-50 p-4 font-sans text-stone-900">
      <div className="max-w-5xl mx-auto mt-12 mb-20">
        
        {/* NAGŁÓWEK STRONY */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-stone-800 mb-2 tracking-tight">Słowo Życia</h1>
          <div className="h-1.5 w-16 bg-amber-600 mx-auto rounded-full shadow-sm"></div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* PANEL BOCZNY - ARCHIWUM */}
          <aside className="w-full lg:w-1/3 order-2 lg:order-1">
            <div className="bg-white/70 backdrop-blur-lg p-6 rounded-[2rem] shadow-xl shadow-stone-200/50 border border-white sticky top-10">
              <h3 className="font-bold text-xl mb-6 text-stone-700 flex items-center gap-2">
                <span role="img" aria-label="calendar">📅</span> Archiwum
              </h3>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Wybierz dzień</label>
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-4 rounded-2xl border-none shadow-inner bg-stone-100/50 focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium text-stone-600"
                />
                <p className="text-sm text-stone-500 leading-relaxed italic opacity-80">
                  Przeglądaj mądrość zapisaną w minionych dniach i wracaj do ważnych dla Ciebie słów.
                </p>
              </div>
            </div>
          </aside>

          {/* GŁÓWNA TREŚĆ - CYTAT I KOMENTARZE */}
          <main className="w-full lg:w-2/3 order-1 lg:order-2">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-stone-300/40 overflow-hidden border border-white transition-all">
              
              {loading ? (
                <div className="py-32 text-center">
                  <div className="animate-spin h-10 w-10 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-stone-400 font-serif animate-pulse text-lg">Otwieranie księgi...</p>
                </div>
              ) : currentVerse ? (
                <>
                  {/* Sekcja Cytatu */}
                  <div className="p-10 md:p-16 bg-gradient-to-b from-white to-stone-50/40">
                    <div className="flex justify-between items-start mb-8">
                      <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest">
                        {selectedDate === new Date().toISOString().split('T')[0] ? "Dzisiejsze Słowo" : "Słowo z dnia " + selectedDate}
                      </span>
                    </div>
                    
                    <div className="relative">
                      <span className="absolute -top-12 -left-8 text-[10rem] text-stone-100 font-serif leading-none select-none z-0">“</span>
                      <p className="text-3xl md:text-4xl font-serif italic text-stone-800 leading-snug relative z-10">
                        {currentVerse.verse_text}
                      </p>
                      <footer className="mt-10 text-right relative z-10">
                        <cite className="text-xl md:text-2xl font-bold text-amber-700 not-italic border-b-2 border-amber-100 pb-1">
                          — {currentVerse.reference}
                        </cite>
                      </footer>
                    </div>
                  </div>
                  
                  {/* Sekcja Komentarzy */}
                  <div className="bg-stone-50/80 p-8 md:p-12 border-t border-stone-100">
                    <h4 className="font-bold text-2xl mb-8 flex items-center gap-3 text-stone-800">
                      Refleksje
                      <span className="text-xs font-bold bg-amber-600 text-white px-2.5 py-1 rounded-full shadow-md">
                        {comments.length}
                      </span>
                    </h4>

                    <div className="space-y-6 mb-12">
                      {comments.length > 0 ? comments.map(c => (
                        <div key={c.id} className="group transition-all">
                          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 group-hover:shadow-md group-hover:-translate-y-0.5 transition-all">
                            <p className="text-stone-700 leading-relaxed text-lg">{c.text}</p>
                            <div className="mt-4 pt-4 border-t border-stone-50 flex justify-end text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                              <span>{new Date(c.created_at).toLocaleDateString('pl-PL')}</span>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-[2rem] bg-stone-50/50">
                          <p className="text-stone-400 italic font-serif">Napisz pierwszą refleksję pod tym Słowem.</p>
                        </div>
                      )}
                    </div>

                    {/* Formularz dodawania */}
                    <div className="bg-white p-3 rounded-[2.5rem] shadow-xl border border-stone-100 flex flex-col md:flex-row gap-3">
                      <textarea 
                        className="flex-grow p-6 rounded-[2rem] border-none focus:ring-0 outline-none resize-none text-stone-700 min-h-[100px] text-lg bg-stone-50/30"
                        placeholder="Co mówi do Ciebie to Słowo?..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <button 
                        onClick={handleAddComment} 
                        className="bg-amber-600 hover:bg-amber-700 text-white font-black px-10 py-5 rounded-[2rem] transition-all shadow-lg hover:shadow-amber-200 active:scale-95 uppercase text-xs tracking-widest"
                      >
                        Udostępnij
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-40 text-center">
                  <span className="text-7xl block mb-6 animate-bounce">📖</span>
                  <p className="text-stone-500 text-2xl font-serif italic mb-2">Pusta karta...</p>
                  <p className="text-stone-400 text-sm">Na ten dzień nie zapisano jeszcze żadnego Słowa w Twojej bazie.</p>
                </div>
              )}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}

export default App;