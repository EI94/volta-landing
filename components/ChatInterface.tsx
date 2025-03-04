import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, UserCircle, RefreshCw } from 'lucide-react';

interface Message {
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Ciao! Sono Volta AI Assistant. Come posso aiutarti oggi con la gestione dell'energia?",
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Regola automaticamente l'altezza del textarea in base al contenuto
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Aggiungi il messaggio dell'utente
    const userMessage: Message = {
      content: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simula una risposta dall'assistente (sostituire con API reale)
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) {
        throw new Error('Errore nella risposta del server');
      }

      const data = await response.json();
      
      // Aggiungi la risposta dell'assistente
      const assistantMessage: Message = {
        content: data.message || "Mi dispiace, ho avuto un problema nell'elaborare la tua richiesta.",
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Errore nella chat:', error);
      
      // Messaggio di errore
      const errorMessage: Message = {
        content: "Mi dispiace, si è verificato un errore nella comunicazione. Riprova più tardi.",
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Formatta la data in una stringa leggibile
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-12rem)] bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white flex items-center justify-between">
        <div className="flex items-center">
          <Bot className="w-6 h-6 mr-2" />
          <h2 className="text-lg font-semibold">Volta AI Assistant</h2>
        </div>
        <button 
          className="text-white hover:bg-white/10 rounded-full p-2 transition-all"
          onClick={() => {
            setMessages([{
              content: "Ciao! Sono Volta AI Assistant. Come posso aiutarti oggi con la gestione dell'energia?",
              sender: 'assistant',
              timestamp: new Date(),
            }]);
          }}
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                message.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
              }`}
            >
              <div className="flex items-start mb-1">
                {message.sender === 'assistant' && <Bot className="w-5 h-5 mr-2 mt-1 text-blue-600" />}
                {message.sender === 'user' && <UserCircle className="w-5 h-5 mr-2 mt-1 text-white" />}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
              <div className={`text-right text-xs ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-200 max-w-[80%] md:max-w-[70%]">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-end relative rounded-lg border border-gray-300 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 bg-white overflow-hidden transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scrivi un messaggio..."
            className="flex-1 py-3 px-4 resize-none max-h-[120px] focus:outline-none text-gray-700"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-r-lg self-end ${
              input.trim() && !isLoading
                ? 'text-blue-600 hover:text-blue-700'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Volta AI Assistant è in fase sperimentale. Le informazioni fornite potrebbero non essere precise.
        </p>
      </form>
    </div>
  );
} 