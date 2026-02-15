import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/AuthModal';

export function Home() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6">
      <Logo size="lg" className="mb-6" />
      
      <h1 className="text-4xl sm:text-5xl font-semibold text-stone-900 mb-4 text-center">
        Esencelab
      </h1>
      
      <p className="text-lg text-stone-600 max-w-md mx-auto mb-8 text-center leading-relaxed">
        AI-powered campus recruitment.<br/>
        Upload your resume. Get matched. Close the gap.
      </p>
      
      <Button 
        onClick={() => setAuthOpen(true)}
        className="bg-stone-900 hover:bg-stone-800 text-white rounded-lg px-8 py-6 text-lg"
      >
        Get started
      </Button>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
