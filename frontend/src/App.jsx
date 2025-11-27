import React, { useState } from 'react';
import { Film, Sparkles, Loader2, Check } from 'lucide-react';

import {BACKEND_URL} from './config/config.js'

export default function FrameForge() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setProgress(0);

    const payload = {
      description: prompt
    };

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const res = await fetch(`${BACKEND_URL}/render`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      clearInterval(interval);
      setProgress(100);

      setTimeout(() => {
        setIsGenerating(false);
        setGeneratedVideo({
          url: data.status === "success" ? `${BACKEND_URL}/video/${data.videoLink}` : data.videoLink,
          prompt: prompt
        });
      }, 500);
    } catch (e) {
      console.error(e);
      clearInterval(interval);
      setIsGenerating(false);
      alert('Failed to generate video. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-cyan-400" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse" style={{ animationDelay: '700ms' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse" style={{ animationDelay: '1000ms' }}></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-cyan-900/30 backdrop-blur-sm bg-black/30">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Film className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">FrameForge</h1>
              <p className="text-xs text-cyan-600 font-medium">AI Video Generation</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent tracking-tight">
            Transform Text to Video
          </h2>
          <p className="text-cyan-600 text-lg max-w-2xl mx-auto font-medium">
            Describe your vision and let AI create stunning videos in seconds
          </p>
        </div>

        {/* Generation Box */}
        <div className="bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-sm border border-cyan-900/30 rounded-2xl p-8 shadow-2xl shadow-cyan-500/5">
          <label className="block text-sm font-semibold mb-3 text-cyan-300 tracking-wide">
            Enter Your Prompt
          </label>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A serene mountain landscape at sunset with clouds drifting across the sky..."
            disabled={isGenerating}
            className="w-full h-40 bg-black/80 border border-cyan-900/50 rounded-xl px-4 py-3 text-cyan-400 placeholder-cyan-900/50 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 resize-none transition-all disabled:opacity-50 font-normal"
          />

          <div className="flex items-center justify-between mt-2 text-xs text-cyan-700 font-medium">
            <span>Be descriptive for better results</span>
            <span>{prompt.length}/500</span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={`w-full mt-6 py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all shadow-lg tracking-wide ${
              !prompt.trim() || isGenerating
                ? 'bg-zinc-800 text-cyan-900 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-black hover:from-cyan-500 hover:to-cyan-400 shadow-cyan-500/30 hover:shadow-cyan-500/50'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Video...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Video</span>
              </>
            )}
          </button>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="text-cyan-400">Processing...</span>
                <span className="text-cyan-600">{progress}%</span>
              </div>
              <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center space-x-2 text-xs text-cyan-600 font-medium">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>AI is crafting your video...</span>
              </div>
            </div>
          )}
        </div>

        {/* Video Output Section */}
        {generatedVideo && (
          <div className="mt-8 bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-sm border border-cyan-900/30 rounded-2xl p-8 shadow-2xl shadow-cyan-500/5 animate-fadeIn">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-cyan-300 tracking-tight">Your Video is Ready</h3>
            </div>
            
            <div className="bg-black rounded-xl overflow-hidden border border-cyan-900/30 shadow-xl">
              <video
                src={generatedVideo?.url || ""}
                controls
                className="w-full"
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="mt-6 p-4 bg-black/50 rounded-xl border border-cyan-900/20">
              <p className="text-xs text-cyan-600 mb-2 uppercase tracking-wider font-semibold">Prompt Used:</p>
              <p className="text-cyan-400 leading-relaxed font-normal">{generatedVideo?.prompt || ""}</p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setGeneratedVideo(null);
                  setPrompt('');
                }}
                className="flex-1 px-6 py-3 bg-zinc-800 text-cyan-400 rounded-xl hover:bg-zinc-700 transition-all border border-cyan-900/30 font-semibold tracking-wide"
              >
                Create New Video
              </button>
              <button
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 text-black rounded-xl hover:from-cyan-500 hover:to-cyan-400 transition-all shadow-lg shadow-cyan-500/30 font-semibold tracking-wide"
              >
                Download Video
              </button>
            </div>
          </div>
        )}

        {/* Features Grid */}
        {!generatedVideo && !isGenerating && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Fast Generation', desc: 'Get your videos in seconds' },
              { title: 'High Quality', desc: 'Professional-grade output' },
              { title: 'AI Powered', desc: 'Advanced neural networks' }
            ].map((feature, i) => (
              <div key={i} className="bg-zinc-900/50 border border-cyan-900/20 rounded-xl p-6 text-center backdrop-blur-sm">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-cyan-500" />
                </div>
                <h4 className="font-semibold text-cyan-300 mb-2 tracking-tight">{feature.title}</h4>
                <p className="text-sm text-cyan-700 font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-16 text-center text-cyan-800 text-sm font-medium">
          <p>Powered by Advanced AI • Professional Quality • Lightning Fast</p>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}