'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
};

const BOT_RESPONSES: { keywords: string[]; response: string }[] = [
  {
    keywords: ['geo', 'generative', 'engine', 'optimization', 'score'],
    response: 'GEO (Generative Engine Optimization) scores estimate how frequently and positively your brand is cited by AI engines like ChatGPT and Gemini. You can run a detailed audit on our GEO Score Auditor page!'
  },
  {
    keywords: ['crawl', 'bot', 'gptbot', 'robots', 'allow', 'block', 'radar'],
    response: 'AI Crawl Radar checks your robots.txt file to see if AI agents (like GPTBot, OAI-SearchBot, Google-Extended) are allowed. Allowing them lets LLMs read your site and cite your brand.'
  },
  {
    keywords: ['price', 'pricing', 'plan', 'cost', 'free', 'subscription', 'buy'],
    response: 'We offer a Free plan (basic site scans), a Growth plan ($99/mo for daily tracking), and an Enterprise plan (custom search query models). Check our Pricing page for details!'
  },
  {
    keywords: ['api', 'developer', 'endpoint', 'token', 'key', 'integration'],
    response: 'Premium accounts get full API Access to query AI Share of Voice and GEO metrics programmatically. See our API Access Reference guide in the footer to learn more.'
  },
  {
    keywords: ['cited', 'index', 'sov', 'share of voice', 'mention'],
    response: 'The AI Visibility Index shows how often your brand is cited relative to your competitors across search query categories. Optimize your citations to grow your AI Share of Voice!'
  },
  {
    keywords: ['help', 'support', 'contact', 'ticket', 'email', 'phone'],
    response: 'You can contact our support team at support@aivisibility.com or submit a ticket directly on our Support Helpdesk page.'
  },
  {
    keywords: ['hello', 'hi', 'hey', 'greetings'],
    response: 'Hello! I am your AI Visibility Assistant. Ask me anything about GEO scores, crawl permissions, pricing, or API integrations!'
  }
];

export default function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hi there! 👋 I'm your AI Visibility assistant. Ask me anything about GEO scores, crawl permissions, or our optimization tools!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      let matchedResponse = "That's an interesting question! For specific troubleshooting, you can submit a support ticket in our Helpdesk. I can also answer queries regarding GEO Scores, AI Crawlers, Pricing, and API access.";
      
      const lowerText = userText.toLowerCase();
      for (const item of BOT_RESPONSES) {
        if (item.keywords.some(keyword => lowerText.includes(keyword))) {
          matchedResponse = item.response;
          break;
        }
      }

      const botMsg: Message = {
        id: Math.random().toString(),
        sender: 'bot',
        text: matchedResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-violet-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition duration-300 cursor-pointer group"
          aria-label="Open support chat"
        >
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <svg className="w-6 h-6 transform group-hover:rotate-6 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-linear-to-r from-violet-600 to-indigo-600 text-white px-5 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">🤖</div>
              <div>
                <h3 className="font-extrabold text-sm tracking-wide">Visibility Helper</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider">AI Assistant Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition cursor-pointer"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed font-semibold shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-150 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-150 rounded-2xl rounded-bl-none px-4 py-3 text-slate-400 text-xs flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-150 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-2xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition font-semibold"
            />
            <button
              type="submit"
              className="bg-indigo-650 hover:bg-indigo-750 text-white px-4 rounded-2xl flex items-center justify-center shadow-xs transition cursor-pointer"
            >
              <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
