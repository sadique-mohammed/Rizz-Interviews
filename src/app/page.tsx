import { Navbar, Hero, Features, LogoMarquee, EmailSignup, Footer } from "@/components/landing/";
export default function Home() {
  return (
    <main className="font-sans">
      <Navbar />
      <Hero />
      <LogoMarquee />
      <Features />
      <EmailSignup />
      <Footer />
    </main>
  );
}
