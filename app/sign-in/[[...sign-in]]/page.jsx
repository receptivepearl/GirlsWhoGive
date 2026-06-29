'use client';

import { SignIn } from '@clerk/nextjs';
import EnhancedNavbar from '@/components/EnhancedNavbar';
import Footer from '@/components/Footer';

export default function SignInPage() {
  return (
    <>
      <EnhancedNavbar />
      <div
        className="relative min-h-screen flex flex-col items-center justify-center pt-16 pb-12 px-4"
        style={{
          backgroundImage: 'url(/background/BackgroundUI.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        }}
      >
        <div className="text-center mb-6 max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">
            Sign in with the email and password you used when you created your account.
          </p>
        </div>
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-lg rounded-2xl',
            },
          }}
        />
      </div>
      <Footer />
    </>
  );
}
