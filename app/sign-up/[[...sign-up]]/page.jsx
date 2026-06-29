'use client';

import { SignUp } from '@clerk/nextjs';
import EnhancedNavbar from '@/components/EnhancedNavbar';
import Footer from '@/components/Footer';

export default function SignUpPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-gray-600">
            Choose a password you will use to sign back in. After this step, you will finish your profile on the next screen.
          </p>
        </div>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/connect?step=complete"
          fallbackRedirectUrl="/connect?step=complete"
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
