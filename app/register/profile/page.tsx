"use client";

import { useAuth } from '@/features/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Footer from '@/components/layout/Footer';
import Navigation from '@/components/layout/Navigation';
import { AwardBadge } from '@/components/decorative/AwardBadge';
import { db } from '@/lib/firebase/clientApp';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, userData, loading: authLoading, updateUserProfile } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    college: "",
    phone: "",
  });
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Redirect logic
  useEffect(() => {
    if (authLoading) return;

    // Not signed in - go to sign in page
    if (!user) {
      router.push('/register');
      return;
    }

    // Already has profile - go to pass selection
    if (userData) {
      router.push('/register/pass');
    }
  }, [user, userData, authLoading, router]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimensions (e.g., 1200px)
          const MAX_DIM = 1200;
          if (width > height) {
            if (width > MAX_DIM) {
              height *= MAX_DIM / width;
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width *= MAX_DIM / height;
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress with quality 0.7
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (e) => reject(e);
      };
      reader.onerror = (e) => reject(e);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("File size must be less than 2MB");
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) {
        setError("Only JPG, PNG, WEBP and PDF files are allowed");
        return;
      }
      setError(null);
      setIdCardFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdCardPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCardFile) {
      setError("Please upload your ID card or Passport photo");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (!user) throw new Error("User not found");

      // 1. Process image locally (Compress & Base64)
      setUploadProgress(20);
      let imageData = "";

      if (idCardFile.type.startsWith('image/')) {
        imageData = await compressImage(idCardFile);
      } else {
        // For PDFs, just use Base64
        imageData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(idCardFile);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (e) => reject(e);
        });
      }
      setUploadProgress(60);

      // Verify size (Firestore doc limit is 1MB)
      // Base64 is ~33% larger than binary
      if (imageData.length > 800000) { // ~800KB limit
        throw new Error("File is too large even after compression. Please try a smaller image.");
      }

      // 2. Update Firestore profile directly
      await updateUserProfile({
        ...formData,
        idCardUrl: imageData, // Storing base64 string
      });
      setUploadProgress(100);

      router.push('/register/pass');
    } catch (error: any) {
      console.error('Profile update error:', error);
      setError(error.message || "Failed to update profile. Please try again.");
    }
    setIsLoading(false);
  };

  // Loading state
  if (authLoading) {
    return (
      <>
        <main className="page_main page_main--registration registration-loading">
          <div className="registration-loading__spinner">
            <div className="reg-spinner" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Not signed in - show redirect message
  if (!user) {
    return (
      <>
        <main className="page_main page_main--registration registration-loading">
          <div className="registration-loading__spinner">
            <div className="reg-spinner" />
            <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Redirecting to sign in...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Already has profile - go to pass selection
  if (userData) {
    return (
      <>
        <main className="page_main page_main--registration registration-loading">
          <div className="registration-loading__spinner">
            <div className="reg-spinner" />
            <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Redirecting...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Profile setup form
  return (
    <>
      <Navigation />
      <main
        id="main"
        className="min-h-screen bg-black text-white py-20 px-4"
      >
        {/* Hero */}
        <section className="max-w-2xl mx-auto text-center mb-16">
          <div className="mb-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 border border-blue-500/30 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden />
              <div className="text-[0.5rem] font-bold tracking-[0.2em] uppercase text-blue-400/70" style={{ fontFamily: '"Akira", sans-serif' }}>
                PROFILE SETUP
              </div>
            </div>
          </div>
          <h1
            className="text-5xl md:text-6xl font-extrabold mb-6 tracking-[0.04em] uppercase"
            style={{
              fontFamily: '"Akira", sans-serif',
              background: 'linear-gradient(180deg, #e0e8f0 0%, #8ab4d6 30%, #ffffff 50%, #6a9ec0 70%, #c0d8e8 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))'
            }}
          >
            Complete Your Profile
          </h1>
          <p className="text-sm tracking-[0.12em] uppercase" style={{ fontFamily: '"Trebuchet MS", sans-serif', color: 'rgba(120, 170, 210, 0.6)' }}>
            We need a few details to get you started
          </p>
        </section>

        {/* Profile Form */}
        <div className="max-w-xl mx-auto relative">
          {/* Y2K star sparkles */}
          <span
            className="absolute text-blue-400/40 text-2xl pointer-events-none animate-pulse"
            style={{ top: '-2rem', left: '10%' }}
            aria-hidden
          >
            ✦
          </span>
          <span
            className="absolute text-blue-300/30 text-3xl pointer-events-none animate-pulse"
            style={{ top: '50%', right: '-2rem', animationDelay: '0.5s' }}
            aria-hidden
          >
            ✦
          </span>
          <span
            className="absolute text-blue-500/30 text-xl pointer-events-none animate-pulse"
            style={{ bottom: '10%', left: '-1.5rem', animationDelay: '1s' }}
            aria-hidden
          >
            ✧
          </span>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="mb-6">
              <label
                className="block text-[0.55rem] font-bold uppercase tracking-[0.15em] text-blue-400/70 mb-2"
                style={{ fontFamily: '"Akira", sans-serif' }}
              >
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-6 py-3.5 text-[0.9375rem] border-2 border-blue-500/20 bg-black/40 text-white tracking-wide transition-all duration-300 focus:outline-none focus:border-blue-500/50 focus:bg-black/55 focus:shadow-[0_0_0_3px_rgba(30,109,171,0.12),0_0_12px_rgba(30,109,171,0.1)] placeholder:text-white/25"
                style={{ fontFamily: '"Trebuchet MS", sans-serif' }}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="mb-6">
              <label
                className="block text-[0.55rem] font-bold uppercase tracking-[0.15em] text-blue-400/70 mb-2"
                style={{ fontFamily: '"Akira", sans-serif' }}
              >
                College Name
              </label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) =>
                  setFormData({ ...formData, college: e.target.value })
                }
                className="w-full px-6 py-3.5 text-[0.9375rem] border-2 border-blue-500/20 bg-black/40 text-white tracking-wide transition-all duration-300 focus:outline-none focus:border-blue-500/50 focus:bg-black/55 focus:shadow-[0_0_0_3px_rgba(30,109,171,0.12),0_0_12px_rgba(30,109,171,0.1)] placeholder:text-white/25"
                style={{ fontFamily: '"Trebuchet MS", sans-serif' }}
                placeholder="Enter your college name"
                required
              />
            </div>

            <div className="mb-6">
              <label
                className="block text-[0.55rem] font-bold uppercase tracking-[0.15em] text-blue-400/70 mb-2"
                style={{ fontFamily: '"Akira", sans-serif' }}
              >
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-6 py-3.5 text-[0.9375rem] border-2 border-blue-500/20 bg-black/40 text-white tracking-wide transition-all duration-300 focus:outline-none focus:border-blue-500/50 focus:bg-black/55 focus:shadow-[0_0_0_3px_rgba(30,109,171,0.12),0_0_12px_rgba(30,109,171,0.1)] placeholder:text-white/25"
                style={{ fontFamily: '"Trebuchet MS", sans-serif' }}
                placeholder="Enter your phone number"
                required
              />
            </div>

            {/* ID Card Upload */}
            <div className="mb-8">
              <label
                className="block text-[0.55rem] font-bold uppercase tracking-[0.15em] text-blue-400/70 mb-2"
                style={{ fontFamily: '"Akira", sans-serif' }}
              >
                ID Card / Passport Photo
              </label>

              <div
                className={`relative group border-2 border-dashed transition-all duration-300 ${idCardFile ? 'border-green-500/40 bg-green-500/5' : 'border-blue-500/20 bg-black/40 hover:border-blue-500/40'
                  } rounded-sm overflow-hidden`}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  required
                />

                <div className="py-8 px-6 flex flex-col items-center justify-center text-center">
                  {idCardPreview ? (
                    <div className="relative w-full max-w-[200px] aspect-[4/3] mb-4 bg-black/60 border border-white/10 rounded-sm overflow-hidden group-hover:border-blue-400/40 transition-colors">
                      {idCardFile?.type === 'application/pdf' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-blue-500/10">
                          <FileText className="w-12 h-12 text-blue-400 mb-2" />
                          <span className="text-[0.6rem] font-bold uppercase tracking-wider text-blue-300">PDF DOCUMENT</span>
                        </div>
                      ) : (
                        <img
                          src={idCardPreview}
                          alt="ID Preview"
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      )}
                      <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[0.5rem] font-bold uppercase tracking-widest text-white bg-black/60 px-3 py-1.5 border border-white/20">CHANGE FILE</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-500/5 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 group-hover:border-blue-400/40">
                      <Upload className="w-7 h-7 text-blue-500/60 group-hover:text-blue-400" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className={`text-xs font-bold uppercase tracking-widest ${idCardFile ? 'text-green-400' : 'text-blue-400/90'}`}>
                      {idCardFile ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {idCardFile.name}
                        </span>
                      ) : 'Click or Drag to Upload'}
                    </p>
                    <p className="text-[0.55rem] uppercase tracking-wider text-white/30 font-medium">
                      JPG, PNG, WEBP or PDF (MAX 2MB)
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-3 flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-wider text-red-400 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </div>
              )}
            </div>

            <div className="flex justify-center pt-4">
              {isLoading ? (
                <div className="w-full flex flex-col items-center gap-4">
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="reg-spinner w-4 h-4 border-2 border-white/30 border-t-white" />
                    <span className="text-[0.6rem] font-bold uppercase tracking-widest text-blue-400">
                      {uploadProgress < 100 ? "Processing..." : 'Finalizing Profile...'}
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  type="submit"
                  className="login-cta-btn"
                  disabled={isLoading}
                >
                  <span className="login-cta-btn__bg" />
                  <span
                    className="login-cta-btn__glitch"
                    data-text="CONTINUE"
                  />
                  <span className="login-cta-btn__text">CONTINUE</span>
                  <span className="login-cta-btn__border" />
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
