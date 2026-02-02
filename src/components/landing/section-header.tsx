'use client';

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
};

export default function SectionHeader({ eyebrow, title, subtitle, center }: Props) {
  return (
    <div className={`mb-12 ${center ? 'text-center' : ''}`}>
      {eyebrow ? (
        <p
          className='text-xs font-semibold tracking-widest text-gray-500 uppercase animate-fade-in-up'
          style={{ animationDelay: '0ms' }}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className='text-3xl md:text-4xl font-bold text-gray-900 text-balance animate-fade-in-up'
        style={{ animationDelay: '50ms' }}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className='mt-3 text-gray-600 max-w-2xl mx-auto text-pretty animate-fade-in-up'
          style={{ animationDelay: '100ms' }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
