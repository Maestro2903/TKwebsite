'use client';

import { useState } from 'react';
import PassSelectorModal from './PassSelectorModal';

export default function RegistrationStickyCTA() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/15 p-4 md:hidden registration-sticky-cta z-50">
        <button
          type="button"
          className="registration-sticky-cta__btn button_main_wrap w-full"
          onClick={() => setModalOpen(true)}
          aria-label="Open pass selection"
        >
          <span className="button_main_text">PROCEED TO REGISTER</span>
          <span className="button_bg" aria-hidden />
        </button>
      </div>
      <PassSelectorModal isOpen={modalOpen} onCloseAction={() => setModalOpen(false)} />
    </>
  );
}

