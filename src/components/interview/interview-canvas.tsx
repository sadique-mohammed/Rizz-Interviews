'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, AlertCircle, Loader2, Lightbulb, Bot, User } from 'lucide-react';
import InterviewModeHeader from '@/components/interview/interview-mode-header';
import { toast } from 'sonner';
import type { QuestionBankQuestion } from '@/types/questionBank';

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
  sessionId: string;
  domain: 'DSA' | 'Web Dev';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  question: QuestionBankQuestion;
}

interface LanguageOption {
  value: string;
  label: string;
}

interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
}

// ─── Typing Indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className='flex flex-col items-start animate-fade-in-up'>
      <div className='flex items-start gap-2'>
        <div className='mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100'>
          <Bot className='h-3 w-3 text-blue-600' />
        </div>
        <div>
          <span className='mb-1 block text-[10px] font-semibold text-blue-500'>Nexus AI</span>
          <div className='flex items-center gap-1 rounded-lg rounded-tl-none border border-blue-100 bg-blue-50 px-3 py-2.5'>
            <span className='h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce' style={{ animationDelay: '0ms' }} />
            <span className='h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce' style={{ animationDelay: '150ms' }} />
            <span className='h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce' style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Question Panel ──────────────────────────────────────────────────────────

interface QuestionPanelProps {
  question: QuestionBankQuestion;
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
                  className='rounded-xl border border-blue-100 bg-blue-50/80 p-4 font-mono text-sm leading-relaxed text-gray-900 shadow-xs'
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
        <div className='m-3 mb-0 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 animate-fade-in-up'>
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
          className='flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2 text-sm font-medium text-blue-600 transition-all hover:bg-blue-100 hover:text-blue-700 hover:scale-[1.02] active:scale-[0.98]'
        >
          <Lightbulb className='h-4 w-4' />
          Ask for hint
        </button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || timeLeft === 0}
          variant='outline'
          className='gap-2 cursor-pointer rounded-lg border border-gray-200 px-6 py-2.5 font-medium transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
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
  messages: ChatMessage[];
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
    <div className='flex flex-col h-full bg-gray-50/60 border-l border-gray-100'>
      {/* Header */}
      <div className='flex items-center gap-2 border-b border-gray-200 px-4 py-3 bg-white shrink-0'>
        <Bot className='h-4 w-4 text-blue-500' />
        <span className='text-sm font-semibold text-gray-900'>AI Interviewer</span>
        <span className='ml-auto inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse' />
          live
        </span>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto px-3 py-3 space-y-3'>
        {messages.map((msg, i) =>
          msg.role === 'ai' ? (
            <div key={i} className='flex flex-col items-start animate-fade-in-up' style={{ animationDelay: `${Math.min(i * 50, 200)}ms` }}>
              <div className='flex items-start gap-2'>
                <div className='mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100'>
                  <Bot className='h-3 w-3 text-blue-600' />
                </div>
                <div className='flex flex-col items-start flex-1 min-w-0'>
                  <span className='mb-1 block text-[10px] font-semibold text-blue-500'>Nexus AI</span>
                  <div className='w-fit max-w-full rounded-lg rounded-tl-none border border-blue-100 bg-blue-50 px-3 py-2 text-sm leading-relaxed text-gray-800 break-words'>
                    {msg.text}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div key={i} className='flex flex-col items-end animate-fade-in-up' style={{ animationDelay: `${Math.min(i * 50, 200)}ms` }}>
              <div className='flex items-start gap-2 flex-row-reverse'>
                <div className='mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200'>
                  <User className='h-3 w-3 text-gray-600' />
                </div>
                <div className='flex flex-col items-end flex-1 min-w-0'>
                  <span className='mb-1 block text-[10px] font-semibold text-gray-400'>You</span>
                  <div className='w-fit max-w-full rounded-lg rounded-tr-none border border-gray-200 bg-white px-3 py-2 text-sm leading-relaxed text-gray-800 break-words'>
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
          className='flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors'
        />
        <button
          onClick={onSend}
          disabled={!chatInput.trim()}
          aria-label='Send message'
          className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-all hover:bg-blue-700 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed'
        >
          <Send className='h-3.5 w-3.5' />
        </button>
      </div>
    </div>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InterviewCanvas({
  sessionId,
  domain,
  difficulty,
  duration,
  question,
}: InterviewCanvasProps) {
  const router = useRouter();

  const requiresCode = question.requiresCode !== false;
  const languages = domain === 'DSA' ? DSA_LANGUAGES : WEBDEV_LANGUAGES;

  // ── Editor state ──
  const [language, setLanguage] = React.useState(languages[0].value);
  const [codeMap, setCodeMap] = React.useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    languages.forEach((l) => (initial[l.value] = question.starterCode?.[l.value] ?? ''));
    return initial;
  });
  const [explanation, setExplanation] = React.useState('');
  const [timeLeft, setTimeLeft] = React.useState(duration * 60);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [validationError, setValidationError] = React.useState('');

  // ── Chat state ──
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      role: 'ai',
      text: `Let's start. Here's ${question.title} — before you code, walk me through your first instinct.`,
    },
  ]);
  const [chatInput, setChatInput] = React.useState('');
  const [isAiTyping, setIsAiTyping] = React.useState(false);
  const [hintIndex, setHintIndex] = React.useState(0);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  const currentCode = codeMap[language] ?? '';
  const starterForCurrentLang = question.starterCode?.[language] ?? '';
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

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
  }, []);

  const handleCodeChange = React.useCallback(
    (value: string | undefined) => {
      const newVal = value ?? '';
      setCodeMap((prev) => ({ ...prev, [language]: newVal }));
      setValidationError('');
    },
    [language],
  );

  const handleExplanationChange = React.useCallback((value: string) => {
    setExplanation(value);
    setValidationError('');
  }, []);

  // ── Simulated AI reply with typing indicator ──
  const simulateAiReply = React.useCallback((replyText: string, delay = 800) => {
    setIsAiTyping(true);
    setTimeout(() => {
      setIsAiTyping(false);
      setMessages((prev) => [...prev, { role: 'ai', text: replyText }]);
    }, delay);
  }, []);

  // ── Send a chat message ──
  const sendChatMessage = React.useCallback(
    (text: string) => {
      if (!text.trim()) return;
      setMessages((prev) => [...prev, { role: 'user', text: text.trim() }]);
      // Simulated AI reply — replace with real Groq/API call
      simulateAiReply('Good thinking. Keep going — can you reason about the complexity?');
    },
    [simulateAiReply],
  );

  const handleChatSend = React.useCallback(() => {
    sendChatMessage(chatInput);
    setChatInput('');
  }, [chatInput, sendChatMessage]);

  // ── Ask for hint → injects into chat ──
  const handleAskHint = React.useCallback(() => {
    setMessages((prev) => [...prev, { role: 'user', text: 'Can I get a hint?' }]);
    
    const currentHint = question.hints[hintIndex] ?? question.hints[question.hints.length - 1] ?? 'Hint: Start by stating the invariant your solution maintains.';
    simulateAiReply(currentHint, 600);
    
    if (hintIndex < question.hints.length - 1) {
      setHintIndex(prev => prev + 1);
    }
  }, [question.hints, hintIndex, simulateAiReply]);

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
        const errorData = await res.json().catch(() => null);
        toast.error(errorData?.error ?? 'Failed to end interview session.');
        return;
      }

      const data = (await res.json()) as { status?: 'completed' | 'abandoned' };
      if (data.status === 'abandoned') {
        toast.info('Interview ended before 30%, so it was marked as abandoned.');
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

      // Inject submission event into chat
      setMessages((prev) => [
        ...prev,
        { role: 'user', text: `[Submitted ${language} solution]` },
      ]);

      try {
        const response = await fetch(`/api/interviews/${sessionId}/answers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: question.sessionQuestionId,
            code: requiresCode ? currentCode : null,
            explanation: explanation.trim() || (force ? 'Auto-submitted when time expired.' : ''),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          toast.error(errorData?.error ?? 'Failed to submit answer.');
          setIsSubmitting(false);
          return;
        }

        setIsAiTyping(true);
        setTimeout(() => {
        setIsAiTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: force
              ? "Time's up — let's review what you submitted. Walk me through your approach."
              : "Got it. Walk me through your solution — what's the time and space complexity?",
          },
        ]);
        setIsSubmitting(false);
        if (force) {
          handleEnd();
        }
      }, 1000);
      } catch (error) {
        console.error('Submit answer error:', error);
        toast.error('Something went wrong while submitting your answer.');
        setIsSubmitting(false);
      }
    },
    [
      currentCode,
      explanation,
      handleEnd,
      language,
      question.sessionQuestionId,
      requiresCode,
      sessionId,
      validateSubmission,
    ],
  );

  const handleSubmitRef = React.useRef(handleSubmit);
  React.useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  const hasAutoSubmitted = React.useRef(false);
  React.useEffect(() => {
    if (timeLeft === 0 && !hasAutoSubmitted.current && !isSubmitting) {
      hasAutoSubmitted.current = true;
      setValidationError('Time is up! Auto-submitting and ending interview...');
      handleSubmitRef.current(true);
    }
  }, [timeLeft, isSubmitting]);

  const totalSeconds = duration * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div className='flex h-screen w-full flex-col overflow-hidden bg-white font-sans text-gray-900'>
      <InterviewModeHeader
        domain={domain}
        difficulty={difficulty}
        timeLeft={timeLeft}
        progressPercent={progressPercent}
        onEnd={handleEnd}
      />

      {/* Main content — fills remaining viewport */}
      <main className='flex min-h-0 flex-1'>
        <div className='flex h-full w-full flex-col overflow-hidden'>

          {/* ── DESKTOP: 3-panel resizable layout ── */}
          <div className='hidden min-h-0 flex-1 lg:block'>
            <Group orientation='horizontal' className='h-full'>

              {/* Panel 1: Question */}
              <Panel defaultSize={28} minSize={20} className='overflow-hidden bg-white/70'>
                <QuestionPanel question={question} />
              </Panel>

              <Separator className='relative z-10 w-2 cursor-col-resize items-center justify-center bg-gray-200 transition-colors hover:bg-blue-100 active:bg-blue-200'>
                <div className='h-full w-1.5 rounded-full bg-transparent shadow-sm transition-colors group-hover:bg-brand/60' />
              </Separator>

              {/* Panel 2: Code editor + explanation + submit + hint */}
              <Panel defaultSize={47} minSize={30} className='overflow-hidden'>
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
                  onSubmit={handleSubmit}
                  onAskHint={handleAskHint}
                />
              </Panel>

              <Separator className='relative z-10 w-2 cursor-col-resize items-center justify-center bg-gray-200 transition-colors hover:bg-blue-100 active:bg-blue-200'>
                <div className='h-full w-1.5 rounded-full bg-transparent shadow-sm' />
              </Separator>

              {/* Panel 3: AI Interviewer Chat */}
              <Panel defaultSize={25} minSize={18} className='overflow-hidden'>
                <AIChatPanel
                  messages={messages}
                  chatInput={chatInput}
                  onChatInputChange={setChatInput}
                  onSend={handleChatSend}
                  messagesEndRef={messagesEndRef}
                  isAiTyping={isAiTyping}
                />
              </Panel>

            </Group>
          </div>

          {/* ── MOBILE: Tabs layout (4 tabs: Problem / Code / Notes / Chat) ── */}
          <div className='min-h-0 flex-1 overflow-y-auto p-4 lg:hidden'>
            <Tabs defaultValue='problem' className='h-full'>
              <TabsList className='mb-4 grid w-full grid-cols-4'>
                <TabsTrigger value='problem'>Problem</TabsTrigger>
                <TabsTrigger value='code' disabled={!requiresCode}>
                  Code
                </TabsTrigger>
                <TabsTrigger value='notes'>Notes</TabsTrigger>
                <TabsTrigger value='chat'>Chat</TabsTrigger>
              </TabsList>

              <TabsContent value='problem' className='rounded-xl border border-gray-100'>
                <QuestionPanel question={question} />
              </TabsContent>

              <TabsContent value='code' className='space-y-3'>
                {requiresCode ? (
                  <div className='rounded-xl border border-gray-200 overflow-hidden'>
                    <div className='flex items-center gap-3 border-b border-[#3c3c3c] bg-[#252526] px-4 py-2.5'>
                      <label className='text-xs font-semibold uppercase tracking-wider text-gray-400'>
                        Language
                      </label>
                      <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className='cursor-pointer rounded-lg border border-transparent bg-[#3c3c3c] px-3 py-1.5 font-mono text-sm text-gray-300 transition-colors hover:bg-[#4d4d4d] focus:outline-none focus:ring-2 focus:ring-brand/50'
                      >
                        {languages.map((l) => (
                          <option key={l.value} value={l.value}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className='h-72 bg-[#1e1e1e]'>
                      <MonacoEditor
                        height='100%'
                        language={language}
                        value={currentCode}
                        onChange={handleCodeChange}
                        theme='vs-dark'
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          padding: { top: 16, bottom: 16 },
                          tabSize: 2,
                          wordWrap: 'on',
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className='rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600'>
                    This question does not require code. Use the Notes tab to submit your answer.
                  </p>
                )}
              </TabsContent>

              <TabsContent value='notes' className='space-y-3'>
                <div className='rounded-xl border border-gray-200'>
                  <div className='px-4 pb-2 pt-4'>
                    <label
                      htmlFor='mobile-explanation-input'
                      className='text-xs font-bold uppercase tracking-widest text-gray-500'
                    >
                      {requiresCode ? 'Approach & Complexity' : 'Your Detailed Answer'}
                    </label>
                  </div>
                  <textarea
                    id='mobile-explanation-input'
                    value={explanation}
                    onChange={(e) => handleExplanationChange(e.target.value)}
                    placeholder={
                      requiresCode
                        ? 'Explain your algorithm, complexity, and trade-offs...'
                        : 'Explain your design, endpoints, data model, and trade-offs...'
                    }
                    className='h-40 w-full resize-none bg-transparent px-4 pb-4 text-sm leading-relaxed text-gray-800 placeholder:text-gray-400 focus:outline-none'
                    spellCheck={false}
                  />
                </div>
              </TabsContent>

              {/* Mobile Chat Tab */}
              <TabsContent value='chat' className='h-[60vh]'>
                <div className='h-full rounded-xl border border-gray-200 overflow-hidden'>
                  <AIChatPanel
                    messages={messages}
                    chatInput={chatInput}
                    onChatInputChange={setChatInput}
                    onSend={handleChatSend}
                    messagesEndRef={messagesEndRef}
                    isAiTyping={isAiTyping}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Mobile: validation error + submit bar with hint */}
          {validationError && (
            <div className='mx-4 mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 lg:hidden animate-fade-in-up'>
              <AlertCircle className='h-4 w-4 shrink-0' />
              {validationError}
            </div>
          )}

          <div className='flex shrink-0 items-center justify-between border-t border-gray-200/80 bg-gray-50/50 px-5 py-3 lg:hidden'>
            <button
              onClick={handleAskHint}
              className='flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition-all hover:bg-blue-100 hover:text-blue-700 active:scale-[0.98]'
            >
              <Lightbulb className='h-4 w-4' />
              Hint
            </button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || timeLeft === 0}
              variant='outline'
              className='gap-2 cursor-pointer rounded-lg border border-gray-200 px-6 py-2.5 font-medium transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isSubmitting ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Send className='h-4 w-4' />
              )}
              {isSubmitting ? 'Evaluating...' : 'Submit Answer'}
            </Button>
          </div>

        </div>
      </main>
    </div>
  );
}
