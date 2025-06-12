import { useState } from 'react';

// This defines the structure of a single message object
interface Message {
  sender: 'user' | 'ai';
  text: string;
}

function App() {
  // 'useState' is a React hook to store data.
  // 'messages' will store our conversation history.
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "Hi! I'm Diane Digital. How can I help you today?" }
  ]);
  // 'input' will store the text the user is currently typing.
  const [input, setInput] = useState('');

  const handleSend = () => {
    // Don't send empty messages
    if (input.trim() === '') return;

    // Add the user's message to the chat history
    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    // --- This is a placeholder for the AI's response ---
    // For now, we'll just add a "thinking..." message and then a canned reply.
    setTimeout(() => {
      const aiTypingMessage: Message = { sender: 'ai', text: "..." };
      setMessages(prevMessages => [...prevMessages, aiTypingMessage]);

      // In the future, we will replace this with a real API call to our backend.
      setTimeout(() => {
        const aiResponseMessage: Message = { sender: 'ai', text: "This is a placeholder response from Diane." };
        // Replace the "..." message with the real response
        setMessages(prevMessages => [...prevMessages.slice(0, -1), aiResponseMessage]);
      }, 1500);
    }, 500);
    // --- End of placeholder ---


    // Clear the input box after sending
    setInput('');
  };

  return (
    <div className="bg-gray-800 text-white h-screen flex flex-col p-4">
      <h1 className="text-2xl font-bold text-center border-b border-gray-600 pb-4">
        Chat with Diane Digital
      </h1>

      {/* Message Display Area */}
      <div className="flex-grow overflow-y-auto my-4 space-y-4 pr-2">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-lg px-4 py-2 rounded-2xl ${
                msg.sender === 'user' ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-600 pt-4">
        <div className="flex space-x-2">
          <textarea
            className="flex-grow bg-gray-700 rounded-lg p-2 focus:outline-none resize-none"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;