import { useState, useRef, useEffect } from 'react';
import { franc } from 'franc';

// This is the interface that defines the structure of a single message object.
// It ensures that every message in our chat has a 'sender' and a 'text'.
interface Message {
  sender: 'user' | 'ai';
  text: string;
}

function App() {
  // --- STATE MANAGEMENT ---
  // 'messages' stores the entire conversation history. It's an array of Message objects.
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "¡Hola! Soy Diane Digital. ¿Cómo te puedo ayudar hoy?" }
  ]);
  // 'input' stores the text the user is currently typing in the textarea.
  const [input, setInput] = useState('');
  // 'isLoading' is a boolean to track when we are waiting for a response from the server.
  // We use it to disable the send button to prevent multiple requests.
  const [isLoading, setIsLoading] = useState(false);

  // --- AUTO-SCROLLING LOGIC ---
  // 'useRef' creates a direct reference to a DOM element. We'll attach this to our chat container.
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 'useEffect' is a hook that runs a piece of code whenever its dependencies change.
  // In this case, it runs every single time the 'messages' array is updated.
  useEffect(() => {
    // If the chat container element exists...
    if (chatContainerRef.current) {
      // ...set its scroll position to the very bottom.
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]); // The dependency array: this effect depends on 'messages'.

  // --- CORE CHAT FUNCTIONALITY ---
  const handleSend = async () => {
    // Prevent sending empty messages or sending while the AI is thinking.
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    const currentInput = input; // Save input value before clearing it.

    // Update the UI immediately for a responsive feel.
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setMessages(prev => [...prev, { sender: 'ai', text: "..." }]); // Add "typing" indicator

    // --- LANGUAGE DETECTION & API CALL ---
    // Use 'franc' to detect the language of the user's input.
    const langCode = franc(currentInput);
    // Default to 'en' if the language isn't Spanish ('spa').
    const language = (langCode === 'spa') ? 'es' : 'en';

    try {
      // Call the backend API endpoint we created on the server.
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentInput, language: language }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Parse the JSON response which contains the AI's text and audio data.
      const { text, audio } = await response.json();

      // --- PLAY AUDIO RESPONSE ---
      // Create a playable audio source from the Base64 string sent by the server.
      const audioSrc = `data:audio/mpeg;base64,${audio}`;
      const audioPlayer = new Audio(audioSrc);
      audioPlayer.play(); // Play Diane's voice.

      // --- UPDATE CHAT WITH AI RESPONSE ---
      const aiResponseMessage: Message = { sender: 'ai', text: text };
      // Replace the "..." typing indicator with the final text response.
      setMessages(prev => [...prev.slice(0, -1), aiResponseMessage]);

    } catch (error) {
      // This block runs if the 'fetch' call fails.
      console.error("Failed to fetch response:", error);
      const errorResponse: Message = { sender: 'ai', text: "Sorry, I'm having trouble connecting." };
      setMessages(prev => [...prev.slice(0, -1), errorResponse]);
    } finally {
      // This block runs regardless of whether the API call succeeded or failed.
      setIsLoading(false); // Re-enable the send button.
    }
  };

  // --- JSX: THE VISUAL STRUCTURE OF THE APP ---
  return (
    <div className="bg-slate-900 text-slate-100 h-screen flex flex-col p-4 font-sans">
      <h1 className="text-2xl font-bold text-center border-b border-slate-700 pb-4">
        Chatea con Diane Digital
      </h1>

      {/* Message Display Area: We attach our 'ref' here for auto-scrolling. */}
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto my-4 space-y-4 pr-2">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg px-4 py-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-500' : 'bg-slate-700'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <div className="border-t border-slate-700 pt-4">
        <div className="flex space-x-2">
          <textarea
            className="flex-grow bg-slate-800 text-slate-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Escribe tu mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
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
  );
}

export default App;
