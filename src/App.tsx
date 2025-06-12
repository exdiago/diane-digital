    import { useState, useRef, useEffect } from 'react';
    import { franc } from 'franc';

    interface Message {
      sender: 'user' | 'ai';
      text: string;
    }
    
    // With the proxy, we no longer need a dynamic URL.
    // We can use a relative path for all API calls.
    const API_BASE_URL = '/api';

    function App() {
      const [messages, setMessages] = useState<Message[]>([]);
      const [input, setInput] = useState('');
      const [isLoading, setIsLoading] = useState(true);
      const [videoUrl, setVideoUrl] = useState<string | null>(null);

      const chatContainerRef = useRef<HTMLDivElement>(null);
      const videoRef = useRef<HTMLVideoElement>(null);

      useEffect(() => {
        const fetchWelcomeMessage = async () => {
          try {
            // The URL is now simple and relative.
            const response = await fetch(`${API_BASE_URL}/welcome`);
            if (!response.ok) throw new Error('Failed to fetch welcome message');
            const { text, videoUrl } = await response.json();
            
            setMessages([{ sender: 'ai', text }]);
            setVideoUrl(videoUrl);

          } catch (error) {
            console.error("Welcome Error:", error);
            setMessages([{ sender: 'ai', text: "Lo siento, no me pude conectar. Por favor, intenta de nuevo más tarde." }]);
          } finally {
            setIsLoading(false);
          }
        };

        fetchWelcomeMessage();
      }, []);

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
        if (input.trim() === '' || isLoading) return;
        const userMessage: Message = { sender: 'user', text: input };
        const currentInput = input;
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        try {
          const langCode = franc(currentInput);
          const language = (langCode === 'spa') ? 'es' : 'en';

          // The URL is now simple and relative.
          const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: currentInput, language: language }),
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

      // The JSX remains the same
      return (
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
                  muted
                >
                  <source src={videoUrl || ''} type="video/mp4" />
                </video>
              )}
            </div>
          </div>

          {/* Right Side: Chat Interface */}
          <div className="w-1/2 h-full flex flex-col p-4 bg-slate-800 border-l-4 border-slate-900">
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
