import React, { useState } from 'react';
import { Film, Sparkles } from 'lucide-react';

export default function FrameForge() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    
    setTimeout(() => {
      setIsGenerating(false);
      // Simulate generated video - replace with your actual API response
      setGeneratedVideo({
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        prompt: prompt
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-black text-cyan-400">
      {/* Header */}
      <header className="border-b border-cyan-900/30">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-3">
            <Film className="w-8 h-8" />
            <h1 className="text-3xl font-bold">FrameForge</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">Transform Text to Video</h2>
          <p className="text-cyan-600 text-lg">
            Describe your vision and let AI create stunning videos
          </p>
        </div>

        {/* Generation Box */}
        <div className="bg-zinc-900 border border-cyan-900/30 rounded-lg p-8">
          <label className="block text-sm font-medium mb-3">
            Enter Your Prompt
          </label>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A serene mountain landscape at sunset..."
            className="w-full h-40 bg-black border border-cyan-900/50 rounded-lg px-4 py-3 text-cyan-400 placeholder-cyan-900 focus:outline-none focus:border-cyan-600 resize-none"
          />

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={`w-full mt-6 py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all ${
              !prompt.trim() || isGenerating
                ? 'bg-zinc-800 text-cyan-900 cursor-not-allowed'
                : 'bg-cyan-600 text-black hover:bg-cyan-500'
            }`}
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span>Generating...</span>
              </>
            ) : (
              <span>Generate Video</span>
            )}
          </button>
        </div>

        {/* Video Output Section */}
        {generatedVideo && (
          <div className="mt-8 bg-zinc-900 border border-cyan-900/30 rounded-lg p-8">
            <h3 className="text-xl font-semibold mb-4">Generated Video</h3>
            
            <div className="bg-black rounded-lg overflow-hidden">
              <video
                src={generatedVideo.url}
                controls
                className="w-full"
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="mt-4 p-4 bg-black/50 rounded-lg">
              <p className="text-sm text-cyan-600 mb-1">Prompt Used:</p>
              <p className="text-cyan-400">{generatedVideo.prompt}</p>
            </div>

            <button
              onClick={() => setGeneratedVideo(null)}
              className="mt-4 px-6 py-2 bg-zinc-800 text-cyan-400 rounded-lg hover:bg-zinc-700 transition-all"
            >
              Generate Another Video
            </button>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-16 text-center text-cyan-800 text-sm">
          <p>Powered by AI • Professional Quality • Fast Generation</p>
        </div>
      </main>
    </div>
  );
}
