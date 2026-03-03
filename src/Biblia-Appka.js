import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Konfiguracja połączenia z Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentVerse, setCurrentVerse] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. ŁADOWANIE DANYCH PRZYPISANYCH DO DNIA
  const loadContent = async (date) => {
    setLoading(true);
    try {
      // Pobierz cytat dla wybranej daty
      const { data: verse, error: verseError } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('date', date)
        .maybeSingle();

      if (verseError) throw verseError;
      
      setCurrentVerse(verse);

      // POBIERAJ KOMENTARZE TYLKO DLA TEGO KONKRETNEGO CYTATU (verse.id)
      if (verse) {
        const { data: comms, error: commsError } = await supabase
          .from('comments')
          .select('*')
          .eq('verse_id', verse.id) // To zapewnia, że komentarze są przypisane do dnia
          .order('created_at', { ascending: true });

        if (commsError) throw commsError;
        setComments(comms || []);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error("Błąd ładowania:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent(selectedDate);
  }, [selectedDate]);

  // 2. DODAWANIE KOMENTARZA Z PRZYPISANIEM DO ID DNIA
  const handleAddComment = async () => {
    if (!newComment.trim() || !currentVerse) return;

    const finalAuthor = author.trim() === "" ? "Anonimowy" : author.trim();

    try {
      const { error } = await supabase.from('comments').insert([
        { 
          verse_id: currentVerse.id, // Łączymy komentarz z ID aktualnego cytatu
          text: newComment, 
          author: finalAuthor 
        }
      ]);

      if (error) throw error;

      setNewComment("");
      setAuthor("");
      // Odświeżamy listę, aby zobaczyć nowy wpis
      await loadContent(selectedDate);

    } catch (err) {
      alert("Błąd: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-amber-500/30">
      
      {/* NAGŁÓWEK / HERO - SEKCJA CYTATU */}
      <header className="relative pt-20 pb-32 px-4 overflow-hidden rounded-b-[4rem] bg-slate-900 shadow-2xl">
        <div className="absolute inset-0 z-0 opacity-50">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-600/20 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[50%] h-[50%] bg-blue-600/20 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <span className="px-5 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-10 inline-block">
            Słowo na {selectedDate}
          </span>
          
          {loading ? (
            <div className="h-40 flex items-center justify-center italic text-slate-500 animate-pulse">Czekaj...</div>
          ) : currentVerse ? (
            <div className="space-y-10">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif italic text-white leading-tight tracking-tight px-4">
                "{currentVerse.verse_text}"
              </h1>
              <div className="flex justify-center items-center gap-6">
                <div className="h-[1px] w-12 bg-amber-500/30"></div>
                <cite className="text-xl md:text-2xl font-bold text-amber-500 not-italic tracking-widest uppercase">
                  — {currentVerse.reference}
                </cite>
                <div className="h-[1px] w-12 bg-amber-500/30"></div>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xl font-serif py-20">Brak zapisanego Słowa na ten dzień.</div>
          )}
        </div>
      </header>

      {/* SEKCJA INTERAKTYWNA */}
      <main className="max-w-6xl mx-auto px-4 -mt-16 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEWO: KALENDARZ */}
          <aside className="lg:col-span-4">
            <div className="bg-slate-800/60 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl sticky top-10">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                <span className="text-amber-500 text-2xl">📅</span> Archiwum
              </h3>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-900/80 border border-white/10 focus:border-amber-500 outline-none transition-all text-white font-bold shadow-inner"
              />
              <p className="mt-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold text-center">Wybierz inny dzień</p>
            </div>
          </aside>

          {/* PRAWO: REFLEKSJE */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-slate-800/40 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-2xl">
              <h4 className="text-2xl font-bold text-white mb-10 flex items-center justify-between">
                Twoje refleksje
                <span className="text-xs bg-white/5 px-4 py-2 rounded-full text-amber-500 border border-amber-500/20 font-black">
                  {comments.length} WPISÓW
                </span>
              </h4>

              {/* LISTA WPISÓW PRZYPISANYCH DO DNIA */}
              <div className="space-y-6 mb-12 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                {comments.length > 0 ? comments.map(c => (
                  <div key={c.id} className="p-7 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all duration-300">
                    <p className="text-slate-300 text-lg leading-relaxed mb-5">{c.text}</p>
                    <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase border-t border-white/5 pt-4">
                      <span className="text-amber-500 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> {c.author}
                      </span>
                      <span className="text-slate-500">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-[2rem]">
                    <p className="text-slate-500 italic font-serif text-lg text-balance px-4">
                      Jeszcze nikt nie podzielił się refleksją pod tym Słowem. Bądź pierwszy!
                    </p>
                  </div>
                )}
              </div>

              {/* FORMULARZ DODAWANIA */}
              <div className="space-y-4 pt-10 border-t border-white/10">
                <input 
                  type="text"
                  placeholder="Podpisz się (opcjonalnie)"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full p-5 rounded-2xl bg-slate-900/60 border border-white/10 focus:border-amber-500 outline-none text-white font-medium placeholder:text-slate-600 transition-all shadow-inner"
                />
                <textarea 
                  placeholder="Napisz, co czujesz czytając to Słowo..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-6 rounded-[2rem] bg-slate-900/60 border border-white/10 focus:border-amber-500 outline-none min-h-[140px] resize-none text-white placeholder:text-slate-600 transition-all shadow-inner"
                />
                <button 
                  onClick={handleAddComment}
                  className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-amber-900/20 uppercase tracking-[0.2em] text-xs active:scale-[0.97]"
                >
                  Dodaj moją refleksję
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* STYL DLA SCROLLBARA (OPCJONALNIE) */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245, 158, 11, 0.5); }
      `}} />
    </div>
  );
}

export default App;