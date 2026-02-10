'use client';

import Font1Text from '@/components/ui/Font1Text';

export default function TestFontPage() {
    return (
        <div className="min-h-screen bg-black p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-white text-2xl mb-8">Font1Text Mobile Test</h1>
                
                <div className="mb-12">
                    <p className="text-white/60 text-sm mb-4">Desktop size (height: 60px)</p>
                    <Font1Text text="CHOOSE YOUR PASS" height={60} />
                </div>

                <div className="mb-12">
                    <p className="text-white/60 text-sm mb-4">Mobile size (height: 40px)</p>
                    <Font1Text text="CHOOSE YOUR PASS" height={40} />
                </div>

                <div className="mb-12">
                    <p className="text-white/60 text-sm mb-4">Small mobile size (height: 32px)</p>
                    <Font1Text text="CHOOSE YOUR PASS" height={32} />
                </div>

                <div className="mb-12">
                    <p className="text-white/60 text-sm mb-4">Extra small (height: 24px)</p>
                    <Font1Text text="CHOOSE YOUR PASS" height={24} />
                </div>
            </div>
        </div>
    );
}
