import { Navbar, Hero, Features, LogoMarquee, EmailSignup, Footer } from '@/components/landing/';
import InterviewPipeline from '@/components/landing/interview-pipeline';
export default function Home() {
  return (
    <main className='font-sans'>
      <Navbar />
      <Hero />
      <div className="flex justify-center w-full pb-10">
        <a href="https://www.producthunt.com/products/rizzinterviews?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-rizzinterviews" target="_blank" rel="noopener noreferrer">
          <img 
            alt="RizzInterviews - AI Powered Technical Interview Prep Platform | Product Hunt" 
            width={250} 
            height={54} 
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1215933&amp;theme=light&amp;t=1785990804327" 
          />
        </a>
      </div>
      <InterviewPipeline />
      <Features />
      <LogoMarquee />
      <EmailSignup />
      <Footer />
    </main>
  );
}
