import { Navbar, Hero, Features, LogoMarquee, EmailSignup, Footer } from '@/components/landing/';
import InterviewPipeline from '@/components/landing/interview-pipeline';
export default function Home() {
  return (
    <main className='font-sans'>
      <Navbar />
      <Hero />
      <InterviewPipeline />
      <Features />
      <LogoMarquee />
      <EmailSignup />
      <Footer />
    </main>
  );
}
