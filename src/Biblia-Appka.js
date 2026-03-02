import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentVerse, setCurrentVerse] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [author, setAuthor] = useState(""); // Nowy stan dla autora
  const [loading, setLoading] = useState(true);

  const loadContent = async (date) => {
    setLoading(true);
    try {
      const { data: verse, error: verseError } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('date', date)
        .maybeSingle();

      if (verseError) throw verseError;
      setCurrentVerse(verse);

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
      console.error("Błąd:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent(selectedDate);
  }, [selectedDate]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentVerse) return;

    // Logika: jeśli autor jest pusty, wpisz "Anonimowy"
    const finalAuthor = author.trim() === "" ? "Anonimowy" : author.trim();

    const { error } = await supabase.from('comments').insert([
      { 
        verse_id: currentVerse.id, 
        text: newComment, 
        author: finalAuthor 
      }
    ]);

    if (error) {
      alert("Błąd: " + error.message);
    } else {
      setNewComment("");
      setAuthor(""); // Czyścimy pole autora po dodaniu
      loadContent(selectedDate);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-amber-50 p-4 font-sans text-stone-900">
      <div className="max-w-5xl mx-auto mt-12 mb-20">
        
        <header className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-stone-800 mb-2 tracking-tight">Słowo Życia</h1>
          <div className="h-1.5 w-16 bg-amber-600 mx-auto rounded-full shadow-sm"></div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          
          <aside className="w-full lg:w-1/3 order-2 lg:order-1">
            <div className="bg-white/70 backdrop-blur-lg p-6 rounded-[2rem] shadow-xl border border-white sticky top-10">
              <h3 className="font-bold text-xl mb-6 text-stone-700 flex items-center gap-2">
                <span>📅</span> Archiwum
              </h3>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Wybierz dzień</label>
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-4 rounded-2xl border-none shadow-inner bg-stone-100/50 focus:ring-2 focus:ring-amber-500 outline-none font-medium text-stone-600"
                />
              </div>
            </div>
          </aside>

          <main className="w-full lg:w-2/3 order-1 lg:order-2">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
              
              {loading ? (
                <div className="py-32 text-center animate-pulse">Otwieranie księgi...</div>
              ) : currentVerse ? (
                <>
                  <div className="p-10 md:p-16 bg-gradient-to-b from-white to-stone-50/40">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest mb-6">
                      {selectedDate}
                    </span>
                    <div className="relative">
                      <span className="absolute -top-12 -left-8 text-[10rem] text-stone-100 font-serif leading-none select-none z-0">“</span>
                      <p className="text-3xl font-serif italic text-stone-800 leading-snug relative z-10">{currentVerse.verse_text}</p>
                      <footer className="mt-10 text-right relative z-10">
                        <cite className="text-xl font-bold text-amber-700 not-italic">— {currentVerse.reference}</cite>
                      </footer>
                    </div>
                  </div>
                  
                  <div className="bg-stone-50/80 p-8 md:p-12 border-t border-stone-100">
                    <h4 className="font-bold text-2xl mb-8 flex items-center gap-3 text-stone-800">
                      Refleksje
                      <span className="text-xs font-bold bg-amber-600 text-white px-2.5 py-1 rounded-full">{comments.length}</span>
                    </h4>

                    <div className="space-y-6 mb-12">
                      {comments.map(c => (
                        <div key={c.id} className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
                          <p className="text-stone-700 leading-relaxed text-lg mb-4">{c.text}</p>
                          <div className="flex justify-between items-center text-[11px] font-bold text-stone-400 uppercase tracking-widest border-t border-stone-50 pt-4">
                            <span className="text-amber-700">✍️ {c.author || "Anonimowy"}</span>
                            <span>{new Date(c.created_at).toLocaleDateString('pl-PL')}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* FORMULARZ Z IMIENIEM */}
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-stone-100 space-y-4">
                      <input 
                        type="text"
                        placeholder="Twoje imię (opcjonalnie)"
                        className="w-full p-4 rounded-2xl bg-stone-50 border-none focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                      />
                      <textarea 
                        className="w-full p-4 rounded-2xl bg-stone-50 border-none focus:ring-2 focus:ring-amber-500 outline-none resize-none text-stone-700 min-h-[100px]"
                        placeholder="Co mówi do Ciebie to Słowo?..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <button 
                        onClick={handleAddComment} 
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg uppercase text-xs tracking-widest"
                      >
                        Udostępnij refleksję
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-40 text-center text-stone-400">📖 Brak Słowa na ten dzień.</div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;