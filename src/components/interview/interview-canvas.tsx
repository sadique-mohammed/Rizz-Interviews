'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getQuestion, type Question } from '@/lib/questions';
import { Send, AlertCircle, Loader2 } from 'lucide-react';
import InterviewModeHeader from '@/components/interview/interview-mode-header';

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

interface InterviewCanvasProps {
  sessionId: string;
  domain: 'DSA' | 'Web Dev';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
}

interface LanguageOption {
  value: string;
  label: string;
}

interface QuestionPanelProps {
  question: Question;
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
}: EditorPaneProps) {
  return (
    <div className='h-full flex flex-col'>
      {validationError && (
        <div className='m-3 mb-0 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700'>
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
    </div>
  );
});

export default function InterviewCanvas({
  sessionId,
  domain,
  difficulty,
  duration,
}: InterviewCanvasProps) {
  const router = useRouter();
  const question: Question = React.useMemo(
    () => getQuestion(domain, difficulty, 0),
    [domain, difficulty],
  );

  const requiresCode = question.requiresCode !== false;
  const languages = domain === 'DSA' ? DSA_LANGUAGES : WEBDEV_LANGUAGES;

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

  const currentCode = codeMap[language] ?? '';
  const starterForCurrentLang = question.starterCode?.[language] ?? '';
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

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

  const handleEnd = React.useCallback(() => {
    //ToDO: DB call marking interview as completed, then redirect to history page
    router.push('/history');
  }, [router]);

  const handleSubmit = React.useCallback(
    async (forceOrEvent?: boolean | React.MouseEvent) => {
      const force = forceOrEvent === true;
      if (!force && !validateSubmission()) return;
      setIsSubmitting(true);
      console.log('Submit:', { sessionId, code: currentCode, language, explanation, force });

      setTimeout(() => {
        setIsSubmitting(false);
        if (force) {
          handleEnd();
        }
      }, 1000);
    },
    [sessionId, currentCode, language, explanation, validateSubmission, handleEnd],
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
          <div className='hidden min-h-0 flex-1 lg:block'>
            <Group orientation='horizontal' className='h-full'>
              <Panel defaultSize={35} minSize={25} className='overflow-hidden bg-white/70'>
                <QuestionPanel question={question} />
              </Panel>

              <Separator className='relative z-10 w-2 cursor-col-resize items-center justify-center bg-gray-300 transition-colors hover:bg-brand/5 active:bg-brand/10'>
                <div className='h-full w-1.5 rounded-full bg-transparent shadow-sm transition-colors group-hover:bg-brand/60' />
              </Separator>

              <Panel defaultSize={65} minSize={30} className='overflow-hidden'>
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
                />
              </Panel>
            </Group>
          </div>

          <div className='min-h-0 flex-1 overflow-y-auto p-4 lg:hidden'>
            <Tabs defaultValue='problem' className='h-full'>
              <TabsList className='mb-4 grid w-full grid-cols-3'>
                <TabsTrigger value='problem'>Problem</TabsTrigger>
                <TabsTrigger value='code' disabled={!requiresCode}>
                  Code
                </TabsTrigger>
                <TabsTrigger value='notes'>Notes</TabsTrigger>
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
            </Tabs>
          </div>

          {validationError && (
            <div className='mx-4 mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 lg:hidden'>
              <AlertCircle className='h-4 w-4 shrink-0' />
              {validationError}
            </div>
          )}

          <div className='flex shrink-0 items-center justify-between border-t border-gray-200/80 bg-gray-50/50 px-5 py-3'>
            <span className='text-xs text-gray-400 hidden sm:inline'></span>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || timeLeft === 0}
              variant='outline'
              className='gap-2 cursor-pointer rounded-lg border border-gray-200 px-6 py-2.5 font-medium transition-colors hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
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
