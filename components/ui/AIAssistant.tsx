'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { SERVICE_CATEGORIES } from '@/lib/constants';
import { matchTexasCity } from '@/lib/texas-cities';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  action?: { label: string; category: string; location: string };
}

// Keyword → category mapping (bilingual)
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  concrete: ['concrete', 'driveway', 'patio', 'foundation', 'slab', 'concreto', 'cimentacion', 'entrada', 'cochera'],
  electrical: ['electric', 'electrical', 'wiring', 'outlet', 'panel', 'breaker', 'electricista', 'electricidad', 'tomacorriente', 'cableado'],
  plumbing: ['plumb', 'plumber', 'pipe', 'drain', 'faucet', 'water heater', 'leak', 'toilet', 'plomero', 'plomeria', 'tuberia', 'drenaje', 'fuga'],
  roofing: ['roof', 'roofing', 'shingle', 'gutter', 'techo', 'tejado', 'goteras', 'canaleta'],
  hvac: ['hvac', 'ac', 'a/c', 'air conditioning', 'heating', 'furnace', 'duct', 'aire acondicionado', 'calefaccion', 'ventilacion'],
  painting: ['paint', 'painting', 'painter', 'stain', 'pintura', 'pintor', 'pintar'],
  'general-contractor': ['general contractor', 'renovation', 'remodel', 'construction', 'build', 'contractor', 'contratista', 'remodelacion', 'construccion', 'renovacion'],
  'pool-services': ['pool', 'swimming', 'spa', 'piscina', 'alberca'],
};

function detectCategory(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return catId;
    }
  }
  return null;
}

function detectLocation(text: string): string | null {
  // First try matching a known Texas city
  const words = text.split(/[\s,]+/);
  // Try progressively longer phrases
  for (let len = 3; len >= 1; len--) {
    for (let i = 0; i <= words.length - len; i++) {
      const phrase = words.slice(i, i + len).join(' ');
      const city = matchTexasCity(phrase);
      if (city) return city.name;
    }
  }

  // Try zip code
  const zipMatch = text.match(/\b\d{5}\b/);
  if (zipMatch) return zipMatch[0];

  return null;
}

export default function AIAssistant() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Welcome message on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        { id: '0', role: 'assistant', text: t('aiWelcome') },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Update welcome message when language changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === '0') {
      setMessages([{ id: '0', role: 'assistant', text: t('aiWelcome') }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    // Simulate short delay
    await new Promise((r) => setTimeout(r, 800));

    const category = detectCategory(trimmed);
    const location = detectLocation(trimmed);

    let reply: Message;

    if (category && location) {
      const catInfo = SERVICE_CATEGORIES.find((c) => c.id === category);
      const catName = catInfo ? (lang === 'es' ? t(catInfo.id) : catInfo.name) : category;
      reply = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text:
          lang === 'es'
            ? `¡Perfecto! Encontré servicios de **${catName}** en **${location}**. ¿Quieres que busque ahora?`
            : `Great! I found **${catName}** services in **${location}**. Want me to search now?`,
        action: { label: lang === 'es' ? `Buscar ${catName}` : `Search ${catName}`, category, location },
      };
    } else if (category && !location) {
      reply = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text:
          lang === 'es'
            ? `Entendido, necesitas servicio de **${t(category)}**. ¿En qué ciudad o código postal estás? (Ej: Houston, Katy, 77024)`
            : `Got it, you need **${SERVICE_CATEGORIES.find((c) => c.id === category)?.name}** service. What city or zip code are you in? (e.g., Houston, Katy, 77024)`,
      };
    } else if (!category && location) {
      reply = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text:
          lang === 'es'
            ? `¡Conozco **${location}**! ¿Qué servicio necesitas? Ofrecemos: concreto, electricidad, plomería, techos, HVAC, pintura, contratista general y piscinas.`
            : `I know **${location}**! What service do you need? We offer: concrete, electrical, plumbing, roofing, HVAC, painting, general contractor, and pool services.`,
      };
    } else {
      reply = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text:
          lang === 'es'
            ? 'No estoy seguro de qué servicio necesitas. Intenta decirme algo como: "Necesito un plomero en Katy" o "electricista en Houston 77024".'
            : 'I\'m not sure what you need. Try telling me something like: "I need a plumber in Katy" or "electrician in Houston 77024".',
      };
    }

    setThinking(false);
    setMessages((prev) => [...prev, reply]);
  };

  const handleAction = (action: { category: string; location: string }) => {
    router.push(`/search?category=${action.category}&location=${encodeURIComponent(action.location)}`);
    setOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-primary-600 to-primary-800 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
          aria-label="Open AI Assistant"
        >
          <Sparkles size={24} />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-h-[520px] bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden animate-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-700 to-primary-900 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-semibold text-sm">{t('aiTitle')}</span>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-primary-700" />
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white rounded-br-sm'
                        : 'bg-neutral-100 text-neutral-800 rounded-bl-sm'
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: msg.text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'),
                    }}
                  />
                  {msg.action && (
                    <button
                      onClick={() => handleAction(msg.action!)}
                      className="mt-1.5 bg-accent-500 hover:bg-accent-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors cursor-pointer"
                    >
                      {msg.action.label} →
                    </button>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={14} className="text-white" />
                  </div>
                )}
              </div>
            ))}
            {thinking && (
              <div className="flex items-center gap-2 text-neutral-400 text-xs">
                <Loader2 size={14} className="animate-spin" />
                {t('aiThinking')}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-neutral-100 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('aiPlaceholder')}
                className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 text-white p-2 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
