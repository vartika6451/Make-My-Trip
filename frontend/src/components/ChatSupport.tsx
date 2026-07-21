import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

const faqs: Record<string, string> = {
  book: 'To book a flight or hotel, search using the home search box, select a card from results, fill passenger info, and complete payment via simulated wallet.',
  refund: 'Cancellations can be made on your dashboard. When you cancel, the ticket/booking status changes to CANCELLED and your purchase price is immediately refunded to your wallet.',
  wallet: 'Your wallet has a starting balance of ₹10,000. You can add more funds under your Profile page by clicking the wallet button.',
  contact: 'You can contact support via email at support@vayubook.com or call us at +91 98765 43210.',
};

export default function ChatSupport() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: 'Hi! Welcome to Vayubook support. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      let botResponse = "I'm sorry, I didn't quite catch that. You can ask about: 'book', 'refund', 'wallet', or 'contact'.";
      const normalized = text.toLowerCase();
      
      if (normalized.includes('book') || normalized.includes('ticket')) {
        botResponse = faqs.book;
      } else if (normalized.includes('refund') || normalized.includes('cancel')) {
        botResponse = faqs.refund;
      } else if (normalized.includes('wallet') || normalized.includes('money') || normalized.includes('fund')) {
        botResponse = faqs.wallet;
      } else if (normalized.includes('contact') || normalized.includes('email') || normalized.includes('number')) {
        botResponse = faqs.contact;
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-[320px] h-[400px] glass rounded-3xl shadow-2xl border border-white/20 flex flex-col justify-between overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-brand-primary p-4 text-white flex justify-between items-center rounded-t-3xl">
            <span className="text-sm font-bold flex items-center gap-1.5">
              <MessageSquare size={16} /> VayuBot Helper
            </span>
            <button onClick={() => setOpen(false)} className="hover:opacity-80"><X size={18} /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 no-scrollbar text-xs font-semibold">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[80%] ${
                  msg.sender === 'user'
                    ? 'bg-brand-primary text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-700/50 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="Ask about booking, refund, wallet..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-2.5 outline-none text-xs border border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-brand-primary"
            />
            <button
              onClick={() => handleSend(input)}
              className="bg-brand-primary hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-brand-primary hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center animate-bounce"
        >
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
}
