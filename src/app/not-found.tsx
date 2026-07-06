import Link from 'next/link';
import { Navbar, Footer } from '@/components/landing/';

export default function NotFound() {
  return (
    <main className="font-sans min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">404 - Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md">Could not find the requested resource.</p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center rounded-xl px-6 py-2 text-sm font-semibold btn-invert hover:shadow-lg transition-all"
        >
          Return Home
        </Link>
      </div>
      <Footer />
    </main>
  );
}
