    import { useState, useRef, useEffect } from 'react';
    import { franc } from 'franc';

    interface Message {
      sender: 'user' | 'ai';
      text: string;
    }

    function App() {
      const [messages, setMessages] = useState<Message[]>([]); // Start with an empty message list
      const [input, setInput] = useState('');
      const [isLoading, setIsLoading] = useState(true); // Start in loading state
      const [videoUrl, setVideoUrl] = useState<string | null>(null);

      const chatContainerRef = useRef<HTMLDivElement>(null);
      const videoRef = useRef<HTMLVideoElement>(null);

      // --- NEW: useEffect hook to fetch the welcome message on load ---
      useEffect(() => {
        const fetchWelcomeMessage = async () => {
          try {
            const response = await fetch('http://localhost:3001/api/welcome');
            if (!response.ok) throw new Error('Failed to fetch welcome message');
            const { text, videoUrl } = await response.json();
            
            // Add the welcome message to the chat and set the video
            setMessages([{ sender: 'ai', text }]);
            setVideoUrl(videoUrl);

          } catch (error) {
            console.error("Welcome Error:", error);
            setMessages([{ sender: 'ai', text: "Lo siento, no me pude conectar. Por favor, intenta de nuevo más tarde." }]);
          } finally {
            setIsLoading(false); // Stop loading once welcome message is handled
          }
        };

        fetchWelcomeMessage();
      }, []); // The empty dependency array [] means this runs only ONCE when the component mounts.

      useEffect(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, [messages]);

      useEffect(() => {
        if (videoUrl && videoRef.current) {
          videoRef.current.load();
          videoRef.current.play().catch(e => console.error("Video play failed:", e));
        }
      }, [videoUrl]);

      const handleSend = async () => {
        // ... (This function remains exactly the same as before)
        if (input.trim() === '' || isLoading) return;
        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);
        try {
          const response = await fetch('http://localhost:3001/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: currentInput }),
          });
          if (!response.ok) throw new Error('Network response was not ok');
          const { text, videoUrl: newVideoUrl } = await response.json();
          const aiResponseMessage: Message = { sender: 'ai', text };
          setMessages(prev => [...prev, aiResponseMessage]);
          setVideoUrl(newVideoUrl);
        } catch (error) {
          console.error("Failed to fetch response:", error);
          const errorResponse: Message = { sender: 'ai', text: "Sorry, I'm having trouble connecting." };
          setMessages(prev => [...prev, errorResponse]);
        } finally {
          setIsLoading(false);
        }
      };

      // The JSX remains mostly the same, but the initial state will be loading.
      return (
        // ... (The JSX for the layout is the same as the previous version) ...
        <div className="bg-slate-900 w-full h-screen flex flex-row font-sans">
          {/* Left Side: Video Player */}
          <div className="w-1/2 h-full flex items-center justify-center p-8 bg-black">
            <div className="w-full max-w-md aspect-square bg-slate-800 rounded-full flex items-center justify-center overflow-hidden">
              {isLoading && !videoUrl ? (
                 <div className="text-slate-500 animate-pulse">
                    <p className="text-center mt-2">Cargando a Diane Digital...</p>
                 </div>
              ) : (
                <video
                  ref={videoRef}
                  key={videoUrl}
                  className="w-full h-full object-cover"
                  playsInline
                  autoPlay
                  muted // Autoplay with sound is often blocked; starting muted is safer
                >
                  <source src={videoUrl || ''} type="video/mp4" />
                </video>
              )}
            </div>
          </div>

          {/* Right Side: Chat Interface */}
          <div className="w-1/2 h-full flex flex-col p-4 bg-slate-800 border-l-4 border-slate-900">
             {/* ... (The rest of the chat JSX is identical to the previous version) ... */}
            <h1 className="text-xl font-bold text-slate-100 text-center border-b border-slate-700 pb-4 shrink-0">
              Chatea con Diane Digital
            </h1>
            <div ref={chatContainerRef} className="flex-grow overflow-y-auto my-4 space-y-4 pr-2">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-lg px-4 py-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-500' : 'bg-slate-700'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-700 pt-4 shrink-0">
              <div className="flex space-x-2">
                <textarea
                  className="flex-grow bg-slate-700 text-slate-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Escribe tu mensaje..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  onClick={handleSend}
                  disabled={isLoading}
                >
                  {isLoading ? '...' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    export default App;
