import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | RizzInterviews',
  description: 'Terms of Service for RizzInterviews',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-brand hover:text-brand-dark mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-brand max-w-none text-gray-600">
          <p>Welcome to RizzInterviews! These terms of service ("Terms") govern your use of the RizzInterviews website (rizzinterviews.in) and services.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Use of Service</h2>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>You must provide accurate and complete information when creating an account.</li>
            <li>You are responsible for safeguarding the password that you use to access the service.</li>
            <li>The AI-generated feedback provided by RizzInterviews is for educational and practice purposes only. We do not guarantee job placement or interview success based on the use of our platform.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. AI and Third-Party Services</h2>
          <p>Our service utilizes artificial intelligence models provided by third parties (such as Google Gemini and Groq) to evaluate your responses. By using our service, you acknowledge that:</p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>AI evaluations may occasionally be inaccurate or biased.</li>
            <li>Your interview inputs (code, text) are processed by these third-party APIs.</li>
            <li>You will not submit sensitive, confidential, or proprietary information belonging to third parties during your practice interviews.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Intellectual Property</h2>
          <p>The service and its original content, features, and functionality are and will remain the exclusive property of RizzInterviews and its licensors. You may not modify, reproduce, or distribute our content without explicit permission.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Limitation of Liability</h2>
          <p>In no event shall RizzInterviews, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Changes to Terms</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any significant changes. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at contact@rizzinterviews.in.</p>
        </div>
      </div>
    </div>
  );
}
