import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('TWOJ_URL', 'TWOJ_KLUCZ');

function BibleApp() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentVerse, setCurrentVerse] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // 1. Pobierz cytat dla wybranej daty
  useEffect(() => {
    async function loadContent() {
      // Pobierz cytat
      const { data: verse } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('date', selectedDate)
        .single();
      
      setCurrentVerse(verse);

      // Pobierz komentarze do tego konkretnego cytatu
      if (verse) {
        const { data: comms } = await supabase
          .from('comments')
          .select('*')
          .eq('verse_id', verse.id)
          .order('created_at', { ascending: true });
        setComments(comms || []);
      } else {
        setComments([]);
      }
    }
    loadContent();
  }, [selectedDate]);

  async function handleAddComment() {
    if (!newComment || !currentVerse) return;
    await supabase.from('comments').insert([
      { verse_id: currentVerse.id, text: newComment }
    ]);
    setNewComment("");
    // Odśwież komentarze (można to zrobić lepiej przez Realtime, ale to na początek wystarczy)
    const { data } = await supabase.from('comments').select('*').eq('verse_id', currentVerse.id);
    setComments(data);
  }

  return (
    <div className="max-w-4xl mx-auto p-4 flex gap-6">
      {/* PANEL BOCZNY - ARCHIWUM */}
      <div className="w-1/4 bg-gray-100 p-4 rounded-lg">
        <h3 className="font-bold mb-4">Archiwum</h3>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-2 rounded border mb-4"
        />
        <p className="text-xs text-gray-500">Wybierz datę, aby zobaczyć archiwalne cytaty i dyskusje.</p>
      </div>

      {/* GŁÓWNA TREŚĆ */}
      <div className="w-3/4 bg-white shadow-xl p-8 rounded-xl border">
        {currentVerse ? (
          <>
            <h2 className="text-amber-700 font-bold uppercase tracking-widest text-sm mb-2">
              Słowo na dzień: {selectedDate}
            </h2>
            <p className="text-3xl italic mb-6">"{currentVerse.verse_text}"</p>
            <p className="text-right font-bold text-gray-600">— {currentVerse.reference}</p>
            
            <div className="mt-10 border-t pt-6">
              <h4 className="font-bold mb-4">Komentarze społeczności ({comments.length})</h4>
              <div className="space-y-3 mb-6">
                {comments.map(c => (
                  <div key={c.id} className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-300">
                    {c.text}
                  </div>
                ))}
              </div>
              <textarea 
                className="w-full border p-3 rounded"
                placeholder="Podziel się swoją refleksją..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button onClick={handleAddComment} className="bg-amber-600 text-white px-4 py-2 rounded mt-2">
                Wyślij
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-400 py-20">Brak zapisanego cytatu na ten dzień.</p>
        )}
      </div>
    </div>
  );
}

export default BibleApp;