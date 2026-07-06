'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, AlertCircle, Loader2, Lightbulb, Bot, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import InterviewModeHeader from '@/components/interview/interview-mode-header';
import { toast } from 'sonner';
import type { RedisInterviewState, RedisQuestionSlot, RedisChatMessage } from '@/types/interviewRedis';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className='m-2 flex h-full items-center justify-center rounded-xl border border-gray-800 bg-[#1e1e1e]'>
      <div className='flex items-center gap-3 text-sm text-gray-400'>
        <div className='h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-gray-300' />
        Loading editor...
      </div>
    </div>
  ),
});

const DSA_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
];

const WEBDEV_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface InterviewCanvasProps {
  state: RedisInterviewState;
}

interface LanguageOption {
  value: string;
  label: string;
}

// ─── Typing Indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className='flex flex-col items-start animate-fade-in-up'>
      <div className='flex items-start gap-2'>
        <div className='mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/12'>
          <Bot className='h-3 w-3 text-brand' />
        </div>
        <div>
          <span className='mb-1 block text-[10px] font-semibold text-brand'>Nexus AI</span>
          <div className='flex items-center gap-1 rounded-lg rounded-tl-none border border-brand/15 bg-brand/8 px-3 py-2.5'>
            <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-brand/70' style={{ animationDelay: '0ms' }} />
            <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-brand/70' style={{ animationDelay: '150ms' }} />
            <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-brand/70' style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Question Panel ──────────────────────────────────────────────────────────

interface QuestionPanelProps {
  question: RedisQuestionSlot;
}

const QuestionPanel = React.memo(function QuestionPanel({ question }: QuestionPanelProps) {
  return (
    <div className='h-full overflow-y-auto border-r border-gray-100 p-6 lg:p-8'>
      <div className='max-w-prose space-y-8'>
        <header>
          <h2 className='mb-4 text-2xl font-semibold tracking-tight text-gray-900 lg:text-3xl'>
            {question.title}
          </h2>
          <div className='text-base leading-relaxed text-gray-700'>{question.description}</div>
        </header>

        {question.examples.length > 0 && (
          <section>
            <h3 className='mb-3 text-sm font-semibold uppercase tracking-wide text-gray-900'>
              Examples
            </h3>
            <div className='space-y-4'>
              {question.examples.map((example, i) => (
                <div
                  key={i}
                  className='rounded-xl border border-brand/15 bg-brand/8 p-4 font-mono text-sm leading-relaxed text-gray-900 shadow-xs'
                >
                  {example}
                </div>
              ))}
            </div>
          </section>
        )}

        {question.constraints.length > 0 && (
          <section>
            <h3 className='mb-3 text-sm font-semibold uppercase tracking-wide text-gray-900'>
              Constraints
            </h3>
            <ul className='space-y-2 rounded-xl border border-slate-200/80 bg-slate-50 p-4 shadow-xs'>
              {question.constraints.map((c, i) => (
                <li key={i} className='flex items-start gap-3 text-sm font-medium text-slate-700'>
                  <span className='mt-0.5 text-brand'>•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
});

// ─── Editor Pane ─────────────────────────────────────────────────────────────

interface EditorPaneProps {
  requiresCode: boolean;
  languages: LanguageOption[];
  language: string;
  onLanguageChange: (newLang: string) => void;
  code: string;
  onCodeChange: (value: string | undefined) => void;
  explanation: string;
  onExplanationChange: (value: string) => void;
  validationError: string;
  isSubmitting: boolean;
  timeLeft: number;
  onSubmit: () => void;
  onAskHint: () => void;
}

const EditorPane = React.memo(function EditorPane({
  requiresCode,
  languages,
  language,
  onLanguageChange,
  code,
  onCodeChange,
  explanation,
  onExplanationChange,
  validationError,
  isSubmitting,
  timeLeft,
  onSubmit,
  onAskHint,
}: EditorPaneProps) {
  return (
    <div className='h-full flex flex-col'>
      {validationError && (
        <div className='m-3 mb-0 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive animate-fade-in-up'>
          <AlertCircle className='h-4 w-4 shrink-0' />
          {validationError}
        </div>
      )}

      {requiresCode && (
        <div className='flex min-h-0 flex-1 flex-col bg-[#1e1e1e]'>
          <div className='flex items-center gap-3 border-b border-[#3c3c3c] bg-[#252526] px-4 py-2.5'>
            <label className='text-xs font-semibold uppercase tracking-wider text-gray-400'>
              Language
            </label>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className='cursor-pointer rounded-lg border border-transparent bg-[#3c3c3c] px-3 py-1.5 font-mono text-sm text-gray-300 transition-colors hover:bg-[#4d4d4d] focus:outline-none focus:ring-2 focus:ring-brand/50'
            >
              {languages.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className='flex-1 min-h-0'>
            <MonacoEditor
              height='100%'
              language={language}
              value={code}
              onChange={onCodeChange}
              theme='vs-dark'
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                roundedSelection: false,
                tabSize: 2,
                wordWrap: 'on',
                cursorBlinking: 'smooth',
              }}
            />
          </div>
        </div>
      )}

      <div
        className='flex flex-col border-t border-gray-200 bg-white'
        style={{ flex: '0 0 180px' }}
      >
        <div className='flex items-center justify-between px-5 pb-2 pt-4 shrink-0'>
          <label
            htmlFor='explanation-input'
            className='text-xs font-bold uppercase tracking-widest text-gray-500'
          >
            {requiresCode ? 'Approach & Complexity' : 'Your Detailed Answer'}
          </label>
        </div>
        <textarea
          id='explanation-input'
          value={explanation}
          onChange={(e) => onExplanationChange(e.target.value)}
          placeholder={
            requiresCode
              ? 'Explain your algorithm, time complexity, space complexity, and trade-offs...'
              : 'Explain your design, endpoints, data model, error handling, and trade-offs...'
          }
          className='flex-1 resize-none bg-transparent px-5 pb-4 text-sm leading-relaxed text-gray-800 placeholder:text-gray-400 focus:outline-none'
          spellCheck={false}
        />
      </div>

      {/* Submit bar — hint button + submit button side by side */}
      <div className='flex shrink-0 items-center justify-between border-t border-gray-200/80 bg-gray-50/50 px-5 py-3'>
        <button
          onClick={onAskHint}
          className='btn-brand-soft flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium hover:scale-[1.02] active:scale-[0.98]'
        >
          <Lightbulb className='h-4 w-4' />
          Ask for hint
        </button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || timeLeft === 0}
          className='btn-brand gap-2 cursor-pointer rounded-lg px-6 py-2.5 font-medium disabled:opacity-50'
        >
          {isSubmitting ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Send className='h-4 w-4' />
          )}
          {isSubmitting ? 'Evaluating...' : 'Submit Code'}
        </Button>
      </div>
    </div>
  );
});

// ─── AI Chat Panel ────────────────────────────────────────────────────────────

interface AIChatPanelProps {
  messages: RedisChatMessage[];
  chatInput: string;
  onChatInputChange: (val: string) => void;
  onSend: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  isAiTyping: boolean;
}

const AIChatPanel = React.memo(function AIChatPanel({
  messages,
  chatInput,
  onChatInputChange,
  onSend,
  messagesEndRef,
  isAiTyping,
}: AIChatPanelProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className='flex flex-col h-full surface-muted border-l border-gray-100'>
      {/* Header */}
      <div className='flex items-center gap-2 border-b border-gray-200 px-4 py-3 bg-white shrink-0'>
        <Bot className='h-4 w-4 text-brand' />
        <span className='text-sm font-semibold text-gray-900'>AI Interviewer</span>
        <span className='ml-auto inline-flex items-center gap-1.5 rounded-full bg-brand-light/20 px-2 py-0.5 micro-label-brand'>
          <span className='h-1.5 w-1.5 rounded-full bg-brand-light animate-pulse' />
          live
        </span>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto px-3 py-3 space-y-3'>
        {messages.map((msg, i) =>
          msg.role === 'ai' ? (
            <div key={msg.id} className='flex flex-col items-start animate-fade-in-up'>
              <div className='flex items-start gap-2'>
                <div className='mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/12'>
                  <Bot className='h-3 w-3 text-brand' />
                </div>
                <div className='flex flex-col items-start flex-1 min-w-0'>
                  <span className='mb-1 block text-[10px] font-semibold text-brand'>Nexus AI</span>
                  <div className='w-fit max-w-full rounded-lg rounded-tl-none border border-brand/15 bg-brand/8 px-3 py-2 text-sm leading-relaxed text-gray-800 break-words whitespace-pre-wrap'>
                    {msg.text}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div key={msg.id} className='flex flex-col items-end animate-fade-in-up'>
              <div className='flex items-start gap-2 flex-row-reverse'>
                <div className='mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200'>
                  <User className='h-3 w-3 text-gray-600' />
                </div>
                <div className='flex flex-col items-end flex-1 min-w-0'>
                  <span className='mb-1 block text-[10px] font-semibold text-gray-400'>You</span>
                  <div className='w-fit max-w-full rounded-lg rounded-tr-none border border-gray-200 bg-white px-3 py-2 text-sm leading-relaxed text-gray-800 break-words whitespace-pre-wrap'>
                    {msg.text}
                  </div>
                </div>
              </div>
            </div>
          ),
        )}
        {isAiTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className='border-t border-gray-200 bg-white px-3 py-2.5 flex items-center gap-2 shrink-0'>
        <input
          type='text'
          value={chatInput}
          onChange={(e) => onChatInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Reply to interviewer…'
          className='flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 transition-colors placeholder:text-gray-400 focus:border-brand/35 focus:outline-none focus:ring-2 focus:ring-brand/10'
        />
        <button
          onClick={onSend}
          disabled={!chatInput.trim()}
          aria-label='Send message'
          className='btn-brand flex h-8 w-8 shrink-0 items-center justify-center rounded-lg disabled:opacity-40'
        >
          <Send className='h-3.5 w-3.5' />
        </button>
      </div>
    </div>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InterviewCanvas({ state }: InterviewCanvasProps) {
  const router = useRouter();

  const { sessionId, domain, difficulty, duration, questionSlots, currentQuestionIndex } = state;
  const question = questionSlots[currentQuestionIndex];
  
  const requiresCode = true; // Web Dev and DSA both expect code in our simplified model
  const languages = domain === 'DSA' ? DSA_LANGUAGES : WEBDEV_LANGUAGES;

  // ── Editor state (hydrated from localStorage on refresh) ──
  const storageKeyBase = `nexus_draft_${sessionId}_${currentQuestionIndex}`;
  
  const [language, setLanguage] = React.useState(() => {
    const saved = state.activeQuestionState.draftLanguage;
    if (saved && languages.some((l) => l.value === saved)) return saved;
    return languages[0].value;
  });

  const [codeMap, setCodeMap] = React.useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (question) {
      languages.forEach((l) => (initial[l.value] = question.starterCode?.[l.value] ?? ''));
    }

    // Overlay saved draft code if present from server fallback
    const savedCode = state.activeQuestionState.draftCode;
    const savedLang = state.activeQuestionState.draftLanguage;
    if (savedCode !== null && savedCode !== undefined && savedLang) {
      initial[savedLang] = savedCode;
    }
    return initial;
  });

  const [explanation, setExplanation] = React.useState(() => {
    return state.activeQuestionState.draftExplanation ?? '';
  });

  const [isHydrated, setIsHydrated] = React.useState(false);

  // Hydrate from localStorage after SSR
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const localLang = localStorage.getItem(`${storageKeyBase}_lang`) || localStorage.getItem(`nexus_preferred_lang_${sessionId}`);
      const localMap = localStorage.getItem(`${storageKeyBase}_codeMap`);
      const localExpl = localStorage.getItem(`${storageKeyBase}_expl`);
      
      if (localLang && languages.some((l) => l.value === localLang)) {
        setLanguage(localLang);
      }
      
      if (localMap) {
        try {
          const parsed = JSON.parse(localMap);
          setCodeMap(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      if (localExpl !== null) {
        setExplanation(localExpl);
      }
    }
    setIsHydrated(true);
  }, [storageKeyBase, languages]);
  
  // Initialize timer relative to session startedAt + duration
  const [timeLeft, setTimeLeft] = React.useState(() => {
    const expires = new Date(state.expiresAt).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((expires - now) / 1000));
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [validationError, setValidationError] = React.useState('');

  // ── Chat state ──
  const [messages, setMessages] = React.useState<RedisChatMessage[]>(state.chatMessages);
  const [chatInput, setChatInput] = React.useState('');
  const [isAiTyping, setIsAiTyping] = React.useState(false);
  const [hintIndex, setHintIndex] = React.useState(state.activeQuestionState.hintIndex);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  // ── Transition state (shown after answer evaluation) ──
  const [hasSubmitted, setHasSubmitted] = React.useState(false);
  const [hasNextQuestion, setHasNextQuestion] = React.useState(false);
  const [lastAttemptId, setLastAttemptId] = React.useState<string | null>(null);
  const [isAdvancing, setIsAdvancing] = React.useState(false);
  const [lastScore, setLastScore] = React.useState<number | null>(null);
  const [hasAttemptedAutoSubmit, setHasAttemptedAutoSubmit] = React.useState(false);

  const currentCode = codeMap[language] ?? '';
  const starterForCurrentLang = question?.starterCode?.[language] ?? '';
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const draftTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Debounced server draft save ──
  React.useEffect(() => {
    if (hasSubmitted) return;

    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      fetch(`/api/interviews/${sessionId}/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeMap[language] ?? '',
          language,
          explanation,
        }),
      }).catch(() => {});
    }, 1500);

    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [codeMap, language, explanation, sessionId, hasSubmitted, storageKeyBase]);

  // ── Sync messages from server on refresh ──
  React.useEffect(() => {
    setMessages(state.chatMessages);
    setHintIndex(state.activeQuestionState.hintIndex);
  }, [state.chatMessages, state.activeQuestionState.hintIndex]);

  // ── Timer ──
  React.useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ── Scroll chat to bottom on new message or typing state change ──
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  // ── Handlers ──
  const handleLanguageChange = React.useCallback((newLang: string) => {
    setLanguage(newLang);
    setValidationError('');
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${storageKeyBase}_lang`, newLang);
      localStorage.setItem(`nexus_preferred_lang_${sessionId}`, newLang);
    }
  }, [storageKeyBase, sessionId]);

  const handleCodeChange = React.useCallback(
    (value: string | undefined) => {
      const newVal = value ?? '';
      setCodeMap((prev) => {
        const nextMap = { ...prev, [language]: newVal };
        if (typeof window !== 'undefined') {
          localStorage.setItem(`${storageKeyBase}_codeMap`, JSON.stringify(nextMap));
        }
        return nextMap;
      });
      setValidationError('');
    },
    [language, storageKeyBase],
  );

  const handleExplanationChange = React.useCallback((value: string) => {
    setExplanation(value);
    setValidationError('');
    if (typeof window !== 'undefined') localStorage.setItem(`${storageKeyBase}_expl`, value);
  }, [storageKeyBase]);

  // ── Send a chat message ──
  const sendChatMessage = React.useCallback(
    async (text: string, isHintRequest = false) => {
      if (!text.trim() && !isHintRequest) return;
      
      const newMsgId = crypto.randomUUID();
      const userMsg: RedisChatMessage = {
        id: newMsgId,
        role: 'user',
        text: isHintRequest ? 'Can I get a hint?' : text.trim(),
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, userMsg]);
      setIsAiTyping(true);
      
      try {
        const res = await fetch(`/api/interviews/${sessionId}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMsg.text, isHintRequest }),
        });
        
        if (!res.ok) {
           toast.error('Failed to send message');
           setIsAiTyping(false);
           return;
        }
        
        const data = await res.json();
        
        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(),
          role: 'ai',
          text: data.reply,
          timestamp: new Date().toISOString()
        }]);
        
        if (data.newHintIndex !== undefined) {
           setHintIndex(data.newHintIndex);
        }
      } catch (err) {
         toast.error('Error sending message');
      } finally {
         setIsAiTyping(false);
      }
    },
    [sessionId],
  );

  const handleChatSend = React.useCallback(() => {
    sendChatMessage(chatInput);
    setChatInput('');
  }, [chatInput, sendChatMessage]);

  // ── Ask for hint → injects into chat ──
  const handleAskHint = React.useCallback(() => {
    sendChatMessage('', true);
  }, [sendChatMessage]);

  const validateSubmission = React.useCallback((): boolean => {
    if (requiresCode) {
      const codeIsEmpty =
        !currentCode.trim() || currentCode.trim() === starterForCurrentLang.trim();

      if (codeIsEmpty && !explanation.trim()) {
        setValidationError('Please write your code and explain your approach before submitting.');
        return false;
      }
      if (codeIsEmpty) {
        setValidationError('Please write your solution code before submitting.');
        return false;
      }
      if (!explanation.trim()) {
        setValidationError('Please explain your approach before submitting.');
        return false;
      }
    } else if (!explanation.trim()) {
      setValidationError('Please write your answer before submitting.');
      return false;
    }

    setValidationError('');
    return true;
  }, [requiresCode, currentCode, explanation, starterForCurrentLang]);

  const handleEnd = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/interviews/${sessionId}/complete`, {
        method: 'PATCH',
      });

      if (!res.ok) {
        if (res.status === 409) {
          // Already ended (e.g. by auto-expiry in DB)
          router.push('/history');
          return;
        }
        const errorData = await res.json().catch(() => null);
        toast.error(errorData?.error ?? 'Failed to end interview session.');
        return;
      }

      const data = (await res.json()) as { status?: 'completed' | 'abandoned' };
      if (data.status === 'abandoned') {
        toast.info('Interview abandoned (no questions answered).');
      } else {
        toast.success('Interview marked as completed.');
      }

      router.push('/history');
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Something went wrong while ending the interview.');
    }
  }, [router, sessionId]);

  const handleSubmit = React.useCallback(
    async (forceOrEvent?: boolean | React.MouseEvent) => {
      const force = forceOrEvent === true;
      if (!force && !validateSubmission()) return;
      setIsSubmitting(true);

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'user', text: `[Submitted ${language} solution]\n\nExplanation: ${explanation}`, timestamp: new Date().toISOString() },
      ]);

      try {
        const response = await fetch(`/api/interviews/${sessionId}/answers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: currentCode,
            language,
            explanation: explanation.trim() || (force ? 'Auto-submitted when time expired.' : ''),
            timeSpentSeconds: duration * 60 - timeLeft
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          if (!force) {
            toast.error(errorData?.error ?? 'Failed to submit answer.');
          }
          setIsSubmitting(false);
          if (force) {
            handleEnd();
          }
          return;
        }

        const data = await response.json();
        
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'ai',
            text: data.interviewerReply,
            timestamp: new Date().toISOString()
          },
        ]);
        
        setIsSubmitting(false);
        
        // Track the evaluation result for the transition UI
        setHasSubmitted(true);
        setHasNextQuestion(data.hasNextQuestion ?? false);
        setLastAttemptId(data.attemptId ?? null);
        setLastScore(data.score ?? null);

        if (force) {
          handleEnd();
        }
      } catch (error) {
        console.error('Submit answer error:', error);
        toast.error('Something went wrong while submitting your answer.');
        setIsSubmitting(false);
      }
    },
    [currentCode, explanation, language, duration, timeLeft, sessionId, validateSubmission, handleEnd],
  );

  // ── Auto-End/Submit when time runs out ──
  React.useEffect(() => {
    if (timeLeft === 0) {
      if (!hasSubmitted && !isSubmitting && !hasAttemptedAutoSubmit) {
        setHasAttemptedAutoSubmit(true);
        // Not submitted yet — force submit which will then auto-end
        const t = setTimeout(() => {
          handleSubmit(true);
        }, 0);
        return () => clearTimeout(t);
      } else if (hasSubmitted || (hasAttemptedAutoSubmit && !isSubmitting)) {
        // Already submitted (or attempted to submit and failed) — just end the interview
        const t = setTimeout(() => {
          handleEnd();
        }, 0);
        return () => clearTimeout(t);
      }
    }
  }, [timeLeft, hasSubmitted, isSubmitting, handleSubmit, handleEnd, hasAttemptedAutoSubmit]);

  // ── Advance to the next question ──
  const handleNextQuestion = React.useCallback(async () => {
    setIsAdvancing(true);
    try {
      const res = await fetch(`/api/interviews/${sessionId}/next-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId: lastAttemptId }),
      });

      if (!res.ok) {
        toast.error('Failed to advance to next question.');
        setIsAdvancing(false);
        return;
      }

      const data = await res.json();

      if (!data.hasNext) {
        if (data.reason === 'time_limit') {
          toast.success('Not enough time for next question. Ending interview...');
        } else {
          toast.success('All questions completed!');
        }
        handleEnd();
        return;
      }

      // Reset local state for the new question
      setHasSubmitted(false);
      setHasNextQuestion(false);
      setLastAttemptId(null);
      setLastScore(null);
      setExplanation('');
      setValidationError('');
      setIsAdvancing(false);

      // Refresh the page to get the new question from Redis
      router.refresh();
    } catch (error) {
      console.error('Next question error:', error);
      toast.error('Something went wrong.');
      setIsAdvancing(false);
    }
  }, [sessionId, lastAttemptId, handleEnd, router]);



  if (!question) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#fafafa]">
        <h2 className="text-2xl font-bold mb-4">No active question</h2>
        <Button onClick={handleEnd}>Complete Interview</Button>
      </div>
    );
  }

  return (
    <div className='flex h-[100dvh] flex-col overflow-hidden bg-white'>
      <InterviewModeHeader
        domain={domain}
        difficulty={difficulty}
        timeLeft={timeLeft}
        progressPercent={(timeLeft / (duration * 60)) * 100}
        onEnd={handleEnd}
      />

      <div className='flex-1 min-h-0 relative'>
        <Group orientation='horizontal' className='h-full w-full'>
          <Panel defaultSize={30} minSize={20} id='question-pane'>
            <div className={`h-full w-full transition-all duration-500 bg-white ${hasSubmitted ? 'opacity-40 blur-sm pointer-events-none' : ''}`}>
              <QuestionPanel question={question} />
            </div>
          </Panel>

          <Separator className='group relative flex w-1.5 cursor-col-resize items-center justify-center bg-gray-100 transition-colors hover:bg-brand active:bg-brand-dark'>
            <div className='h-8 w-0.5 rounded-full bg-gray-300 transition-colors group-hover:bg-white group-active:bg-white' />
          </Separator>

          <Panel defaultSize={35} minSize={20} id='chat-pane'>
            <AIChatPanel
              messages={messages}
              chatInput={chatInput}
              onChatInputChange={setChatInput}
              onSend={handleChatSend}
              messagesEndRef={messagesEndRef}
              isAiTyping={isAiTyping}
            />
          </Panel>

          <Separator className='group relative flex w-1.5 cursor-col-resize items-center justify-center bg-gray-100 transition-colors hover:bg-brand active:bg-brand-dark'>
            <div className='h-8 w-0.5 rounded-full bg-gray-300 transition-colors group-hover:bg-white group-active:bg-white' />
          </Separator>

          <Panel defaultSize={35} minSize={30} id='editor-pane'>
            <div className={`h-full w-full transition-all duration-500 bg-white ${hasSubmitted ? 'opacity-40 blur-sm pointer-events-none' : ''}`}>
              <EditorPane
                requiresCode={requiresCode}
                languages={languages}
                language={language}
                onLanguageChange={handleLanguageChange}
                code={currentCode}
                onCodeChange={handleCodeChange}
                explanation={explanation}
                onExplanationChange={handleExplanationChange}
                validationError={validationError}
                isSubmitting={isSubmitting}
                timeLeft={timeLeft}
                onSubmit={() => handleSubmit(false)}
                onAskHint={handleAskHint}
              />
            </div>
          </Panel>
        </Group>

        {/* Transition glassmorphism overlay */}
        {hasSubmitted && (
          <div className='absolute inset-0 z-20 flex items-center justify-center p-8 bg-black/5 backdrop-blur-sm pointer-events-auto'>
            <div className='max-w-md w-full surface-brand rounded-3xl p-8 text-center space-y-6 animate-fade-in-up'>
              <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/12 shadow-inner'>
                <CheckCircle2 className='h-8 w-8 text-brand' />
              </div>

              <div>
                <h2 className='text-2xl font-bold text-gray-900 mb-2 tracking-tight'>
                  Answer Submitted!
                </h2>
              </div>

              <p className='text-sm text-gray-600 leading-relaxed font-medium'>
                You can continue chatting with the AI interviewer to discuss your approach, ask follow-up questions, or explore edge cases.
              </p>

              <div className='pt-2'>
                {hasNextQuestion ? (
                  <button
                    onClick={handleNextQuestion}
                    disabled={isAdvancing}
                    className='btn-brand inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    {isAdvancing ? 'Loading next question…' : 'Next Question'}
                    {isAdvancing ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <ArrowRight className='h-4 w-4' />
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleEnd}
                    className='btn-brand inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold'
                  >
                    <CheckCircle2 className='h-4 w-4' />
                    Complete Interview
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

