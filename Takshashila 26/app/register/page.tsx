'use client';

import { useCallback, useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import RegistrationHero from '@/components/RegistrationHero';
import RegistrationPassesGrid from '@/components/RegistrationPassesGrid';
import RegistrationStickyCTA from '@/components/RegistrationStickyCTA';
import RegistrationFormModal from '@/components/RegistrationFormModal';
import { useAuth } from '@/contexts/AuthContext';
import { useLenis } from '@/hooks/useLenis';
import type { RegistrationPass } from '@/lib/registrationPassesData';

export default function RegisterPage() {
  useLenis();
  const { user, loading, signIn } = useAuth();
  const [modalPass, setModalPass] = useState<RegistrationPass | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelectPass = useCallback((pass: RegistrationPass) => {
    setModalPass(pass);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalPass(null);
  }, []);

  const handleRegisterClick = useCallback(
    (pass: RegistrationPass) => {
      if (user) {
        handleSelectPass(pass);
      } else {
        signIn();
      }
    },
    [user, handleSelectPass, signIn]
  );

  return (
    <>
      <Navigation />

      <main id="main" className="page_main">
        <RegistrationHero />

        {loading ? (
          <div className="u-container py-16 text-center text-white/70">Loading…</div>
        ) : (
          <section className="max-w-7xl mx-auto px-6 pb-32">
            {!user && (
              <p className="text-center text-xs text-white/50 mt-10">
                Sign in from the top-right to register for passes.
              </p>
            )}
            {user && (
              <p className="text-center text-sm text-white/60 mt-6">
                Choose your pass, then complete payment to get your entry QR.
              </p>
            )}
            <RegistrationPassesGrid onRegisterClick={handleRegisterClick} />
          </section>
        )}
      </main>

      <Footer />

      <RegistrationStickyCTA />

      <RegistrationFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        pass={modalPass}
      />
    </>
  );
}
