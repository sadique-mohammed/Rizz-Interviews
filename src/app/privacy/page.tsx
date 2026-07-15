import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | RizzInterviews',
  description: 'Privacy Policy for RizzInterviews',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-brand hover:text-brand-dark mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-brand max-w-none text-gray-600">
          <p>Welcome to RizzInterviews ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect personal information that you voluntarily provide to us when you register on the Website, express an interest in obtaining information about us or our products and services, or otherwise when you contact us.</p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li><strong>Credentials:</strong> We collect passwords, password hints, and similar security information used for authentication and account access through our authentication provider (Clerk/Google OAuth).</li>
            <li><strong>Usage Data:</strong> We automatically collect information regarding your interview sessions, code submissions, and performance metrics to provide you with feedback and track your progress.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use personal information collected via our Website for a variety of business purposes described below:</p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>To facilitate account creation and logon process.</li>
            <li>To provide and manage the AI interview services.</li>
            <li>To improve our AI models and the quality of the feedback you receive.</li>
            <li>To send administrative information to you.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Sharing Your Information</h2>
          <p>We only share information with the following third parties:</p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li><strong>AI Providers:</strong> We send interview transcripts and code snippets to our AI partners (e.g., Google Gemini, Groq) to generate feedback. We do not send your personally identifiable information (PII) to these providers.</li>
            <li><strong>Authentication Providers:</strong> We use Clerk and Google OAuth to handle authentication securely.</li>
            <li><strong>Database Providers:</strong> We securely store your data using our database infrastructure (Neon/PostgreSQL).</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Data Retention</h2>
          <p>We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law. You can request to delete your account and associated data at any time.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Contact Us</h2>
          <p>If you have questions or comments about this notice, you may email us at contact@rizzinterviews.in.</p>
        </div>
      </div>
    </div>
  );
}
