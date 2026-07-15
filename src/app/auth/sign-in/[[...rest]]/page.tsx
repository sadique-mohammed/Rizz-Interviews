import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className='flex items-center justify-center h-screen bg-gradient-to-b from-brand/5 via-white to-white'>
      <SignIn 
        path="/auth/sign-in"
        signUpUrl="/auth/sign-up"
        fallbackRedirectUrl="/dashboard"
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}
