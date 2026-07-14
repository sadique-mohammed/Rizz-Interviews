import { notFound } from 'next/navigation';
import { Navbar, Footer } from '@/components/landing/';
import Link from 'next/link';
import DemoLoginButton from '@/components/landing/demo-login-button';
import rolesData from '@/data/seo-roles.json';

export async function generateStaticParams() {
  return rolesData.map((role) => ({
    role: role.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ role: string }> }) {
  const resolvedParams = await params;
  const role = rolesData.find((r) => r.slug === resolvedParams.role);

  if (!role) {
    return { title: 'Not Found' };
  }

  return {
    title: `Free AI Mock Interview for ${role.title}s | RizzInterviews`,
    description: `Practice your ${role.title} interview with our AI. ${role.description}`,
    openGraph: {
      title: `AI Mock Interview for ${role.title}s`,
      description: `Practice your ${role.title} interview with our AI. ${role.description}`,
    },
  };
}

export default async function PracticeRolePage({ params }: { params: Promise<{ role: string }> }) {
  const resolvedParams = await params;
  const role = rolesData.find((r) => r.slug === resolvedParams.role);

  if (!role) {
    notFound();
  }

  return (
    <main className='font-sans min-h-screen bg-gray-50 flex flex-col'>
      <Navbar />

      <section className='pt-32 pb-16 px-6 md:px-12 bg-white text-center border-b'>
        <div className='max-w-4xl mx-auto'>
          <span className='inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-6'>
            Free Technical Interview Practice
          </span>
          <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-6 text-balance'>
            AI Mock Interview for <br />
            <span className='bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
              {role.title}s
            </span>
          </h1>
          <p className='text-xl text-gray-600 mb-10 text-balance max-w-2xl mx-auto'>
            {role.description} Practice answering real-world technical questions, get instant
            feedback, and ace your next interview.
          </p>

          <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
            <Link
              href='/dashboard'
              className='w-full sm:w-auto inline-flex items-center justify-center rounded-xl px-10 py-3 text-base font-semibold btn-invert hover:shadow-lg transition-all duration-200'
            >
              Sign Up & Practice
            </Link>
            <div className='w-full sm:w-auto flex'>
              <DemoLoginButton className='w-full sm:w-auto px-10 py-3 text-base' />
            </div>
          </div>
        </div>
      </section>

      <section className='py-20 px-6 md:px-12 flex-1'>
        <div className='max-w-4xl mx-auto'>
          <h2 className='text-3xl font-bold text-gray-900 mb-12 text-center'>
            Common {role.title} Interview Questions
          </h2>
          <div className='grid gap-6'>
            {role.commonQuestions.map((question, i) => (
              <div
                key={i}
                className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow'
              >
                <div className='flex gap-4'>
                  <div className='flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold'>
                    {i + 1}
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>{question}</h3>
                    <p className='text-gray-500'>
                      Our AI will evaluate your answer to this question in real-time, providing
                      feedback on technical accuracy, communication clarity, and edge cases.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='mt-16 text-center'>
            <p className='text-gray-600 mb-6'>Ready to test your knowledge?</p>
            <DemoLoginButton className='px-8 py-2' />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
