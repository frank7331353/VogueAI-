
import React, { useState, useEffect } from 'react';
import { StudioState, StudioAction, ImageData, HistoryItem } from './types';
import { GeminiService } from './services/geminiService';
import { ImageUpload } from './components/ImageUpload';

const LIGHTING_PRESETS = [
  { id: 'white-bg', name: 'Pure White (Ecommerce)', prompt: 'Pure solid white background, high-key commercial lighting, soft natural daylight feel, clean e-commerce look, no shadows on background' },
  { id: 'studio', name: 'Studio Professional', prompt: 'Professional studio lighting, high-key, clean shadows, soft rim light' },
  { id: 'indoor', name: 'Ambient Indoor', prompt: 'Soft warm indoor lighting, cozy boutique atmosphere, ambient light' },
  { id: 'outdoor', name: 'Natural Sun', prompt: 'Natural golden hour sunlight, dynamic shadows, cinematic outdoors' },
  { id: 'noir', name: 'Dramatic Noir', prompt: 'Hard contrast lighting, deep shadows, cinematic monochrome aesthetic' },
  { id: 'cyber', name: 'Cyberpunk Neon', prompt: 'Vibrant pink and blue neon lighting, urban night atmosphere, colored reflections' },
  { id: 'runway', name: 'Runway Spotlight', prompt: 'Intense top-down spotlights, high-intensity fashion show lighting, sharp shadows' },
  { id: 'misty', name: 'Misty Morning', prompt: 'Soft diffused morning light, cool tones, hazy atmospheric diffusion' },
  { id: 'sunset', name: 'Sunset Flare', prompt: 'Deep orange sunset lighting, long dramatic shadows, warm lens flares' }
];

const POSES = [
  { id: 'default', name: 'Keep Original', prompt: 'Original pose' },
  { id: 'walking', name: 'Action Walking', prompt: 'Dynamic mid-stride walking pose' },
  { id: 'sitting', name: 'Elegant Sitting', prompt: 'Relaxed yet elegant sitting pose' },
  { id: 'pockets', name: 'Casual Pockets', prompt: 'Hands in pockets, relaxed shoulders, one knee slightly bent, casual lean' },
  { id: 'boss', name: 'Confidence Boss', prompt: 'Arms crossed, confident upright posture, looking directly at the camera, authoritative' },
  { id: 'detail', name: 'Editorial Detail', prompt: 'One hand touching the collar or hair, slight head tilt, focus on accessories' },
  { id: 'lean-fwd', name: 'Engaging Lean', prompt: 'Leaning slightly forward towards the camera, intimate and engaging expression, soft gaze' },
  { id: 'strut', name: 'Street Strut', prompt: 'Dynamic runway stride, powerful movement, hair slightly blowing, high-fashion motion' },
  { id: 'looking-back', name: 'Looking Back', prompt: 'Over the shoulder look, dynamic torso rotation' },
  { id: 'confidence', name: 'Confidence Stance', prompt: 'Powerful standing pose, hands on hips, authoritative look' },
  { id: 'laugh', name: 'Candid Laugh', prompt: 'Natural laughing movement, head slightly tilted, relaxed arms' },
  { id: 'lean', name: 'Street Lean', prompt: 'Casual leaning against a metropolitan wall, one leg crossed' },
  { id: 'crouch', name: 'Artistic Crouch', prompt: 'High-fashion crouching pose, avant-garde editorial positioning' }
];

const BEAUTY_PRESETS = [
  { id: 'natural', name: 'Natural Skin', prompt: 'Natural skin texture preservation, subtle smoothing, realistic finish' },
  { id: 'gloss', name: 'High Gloss (Glass Skin)', prompt: 'High-shine dewy skin, reflective highlights on cheekbones, moisturized look' },
  { id: 'matte', name: 'Matte Perfection', prompt: 'Zero shine skin, soft-focus matte texture, velvety uniform complexion' },
  { id: 'glam', name: 'Commercial Glam', prompt: 'Flawless airbrushed retouching, enhanced eye clarity, defined lip contours' },
  { id: 'glow', name: 'Ethereal Glow', prompt: 'Soft dreamy skin lighting, light diffusion, angelic glow effect' },
  { id: 'editorial', name: 'Editorial Texture', prompt: 'High-definition skin detail, pore-perfected but textured, polished fashion look' }
];

const ASPECT_RATIOS = ["Default", "9:16", "1:1", "16:9", "3:4"];

const App: React.FC = () => {
  const [state, setState] = useState<StudioState>({
    baseImage: null,
    garmentImage: null,
    action: 'TRY_ON',
    isProcessing: false,
    resultImage: null,
    history: [],
    logs: ['VogueAI Studio - Immersive engine active.'],
    settings: {
      lighting: LIGHTING_PRESETS[0].prompt,
      pose: POSES[0].prompt,
      garmentDesc: '',
      beauty: BEAUTY_PRESETS[0].prompt,
      aspectRatio: 'Default'
    }
  });

  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Close fullscreen on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreenImage(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const gemini = new GeminiService();

  const log = (msg: string) => {
    setState(prev => ({ ...prev, logs: [msg, ...prev.logs].slice(0, 10) }));
  };

  const handleBaseUpload = (data: ImageData) => {
    setState(prev => ({ ...prev, baseImage: data }));
    log('Base model image uploaded.');
  };

  const handleBaseRemove = () => {
    setState(prev => ({ ...prev, baseImage: null }));
    log('Base model image removed.');
  };

  const handleGarmentUpload = async (data: ImageData) => {
    setState(prev => ({ ...prev, garmentImage: data, isProcessing: true }));
    log('Analyzing garment features...');
    try {
      const desc = await gemini.analyzeGarment(data);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        settings: { ...prev.settings, garmentDesc: desc }
      }));
      log(`Garment analyzed: ${desc.substring(0, 30)}...`);
    } catch (err) {
      log('Garment analysis fallback active.');
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleGarmentRemove = () => {
    setState(prev => ({ ...prev, garmentImage: null, settings: { ...prev.settings, garmentDesc: '' } }));
    log('Garment image removed.');
  };

  const handleProcess = async () => {
    if (!state.baseImage) {
      log('Error: Base image required.');
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, resultImage: null }));
    log(`Initializing ${state.action} process...`);

    try {
      const result = await gemini.processFashionAction(
        state.action,
        state.baseImage,
        state.garmentImage,
        state.settings
      );
      
      const newHistoryItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        url: result,
        action: state.action,
        timestamp: Date.now()
      };

      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        resultImage: result,
        history: [newHistoryItem, ...prev.history]
      }));
      log('Generation successful.');
    } catch (err) {
      log(`Error: ${err instanceof Error ? err.message : 'Processing failed.'}`);
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const selectFromHistory = (item: HistoryItem) => {
    setState(prev => ({ ...prev, resultImage: item.url }));
    log(`Viewing ${item.action} history from ${new Date(item.timestamp).toLocaleTimeString()}`);
  };

  const setAspectRatio = (ratio: string) => {
    setState(prev => ({ ...prev, settings: { ...prev.settings, aspectRatio: ratio } }));
    log(`Aspect ratio updated to ${ratio}`);
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white overflow-hidden relative">
      {/* Fullscreen Modal Overlay */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-2xl animate-in fade-in duration-300"
          onClick={() => setFullscreenImage(null)}
        >
          <button 
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
            onClick={() => setFullscreenImage(null)}
          >
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img 
            src={fullscreenImage} 
            alt="Fullscreen Preview" 
            className="max-h-full max-w-full object-contain shadow-[0_0_100px_rgba(79,70,229,0.3)] rounded-lg animate-in zoom-in duration-500"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-8 flex gap-4">
             <a 
              href={fullscreenImage} 
              download={`vogueai-export.png`}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/40"
              onClick={(e) => e.stopPropagation()}
             >
               Download HD Version
             </a>
          </div>
        </div>
      )}

      {/* Left Sidebar: Controls */}
      <aside className="w-80 border-r border-white/5 bg-black/50 p-6 flex flex-col gap-6 custom-scrollbar overflow-y-auto shrink-0">
        <header className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-600/20">V</div>
          <h1 className="text-xl font-bold tracking-tight">VogueAI <span className="text-indigo-500">Studio</span></h1>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest">Engine Mode</h2>
          <div className="grid grid-cols-2 gap-2">
            {(['TRY_ON', 'GHOST_MANNEQUIN', 'RELIGHT', 'REPOSE', 'BEAUTY'] as StudioAction[]).map((action) => (
              <button
                key={action}
                onClick={() => setState(prev => ({ ...prev, action }))}
                className={`px-2 py-2 rounded-lg text-[10px] font-bold transition-all ${
                  state.action === action 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {action.replace('_', ' ')}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6 border-y border-white/5 py-6">
          <ImageUpload 
            id="base-model"
            label="Base Model / Scene" 
            onUpload={handleBaseUpload} 
            onRemove={handleBaseRemove}
            onPreview={() => setFullscreenImage(state.baseImage?.url || null)}
            currentImage={state.baseImage?.url || null} 
          />
          {(state.action === 'TRY_ON' || state.action === 'GHOST_MANNEQUIN') && (
            <ImageUpload 
              id="garment"
              label="Garment Reference" 
              onUpload={handleGarmentUpload} 
              onRemove={handleGarmentRemove}
              onPreview={() => setFullscreenImage(state.garmentImage?.url || null)}
              currentImage={state.garmentImage?.url || null} 
            />
          )}
        </section>

        <div className="flex flex-col gap-4">
          <section className="flex flex-col gap-2">
            <h2 className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest">Lighting Environment</h2>
            <select 
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 appearance-none"
              onChange={(e) => setState(prev => ({ ...prev, settings: { ...prev.settings, lighting: e.target.value } }))}
            >
              {LIGHTING_PRESETS.map(l => (
                <option key={l.id} value={l.prompt} className="bg-neutral-900">{l.name}</option>
              ))}
            </select>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest">Model Pose</h2>
            <select 
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 appearance-none"
              onChange={(e) => setState(prev => ({ ...prev, settings: { ...prev.settings, pose: e.target.value } }))}
            >
              {POSES.map(p => (
                <option key={p.id} value={p.prompt} className="bg-neutral-900">{p.name}</option>
              ))}
            </select>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-[10px] font-semibold text-pink-400 uppercase tracking-widest">Beauty Engine</h2>
            <select 
              className="w-full bg-pink-500/10 border border-pink-500/20 rounded-lg p-2 text-xs text-pink-200 appearance-none"
              onChange={(e) => setState(prev => ({ ...prev, settings: { ...prev.settings, beauty: e.target.value } }))}
            >
              {BEAUTY_PRESETS.map(b => (
                <option key={b.id} value={b.prompt} className="bg-neutral-900">{b.name}</option>
              ))}
            </select>
          </section>
        </div>

        <button
          onClick={handleProcess}
          disabled={state.isProcessing || !state.baseImage}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed py-4 rounded-xl font-bold tracking-wide transition-all shadow-lg shadow-indigo-600/20 mt-2"
        >
          {state.isProcessing ? 'GENERATING...' : 'START RENDERING'}
        </button>

        <div className="mt-auto p-4 rounded-lg bg-black border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Studio Logs</span>
            <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="flex flex-col gap-1 text-[10px] font-mono text-gray-500 h-20 overflow-y-auto custom-scrollbar">
            {state.logs.map((log, i) => <div key={i} className={i === 0 ? 'text-indigo-400' : ''}>{log}</div>)}
          </div>
        </div>
      </aside>

      {/* Main Preview Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-black/20">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-indigo-900/5 blur-[150px] -z-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-pink-900/5 blur-[120px] -z-10 rounded-full"></div>

        <div className="flex-1 p-6 flex flex-col items-center justify-center gap-4">
          {/* Aspect Ratio Selector */}
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-md">
            <span className="text-[9px] font-bold text-gray-500 uppercase px-4 tracking-widest">Aspect Ratio</span>
            <div className="flex gap-1">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                    state.settings.aspectRatio === ratio
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {ratio === 'Default' ? '默认输出' : ratio}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-full relative glass rounded-3xl p-4 flex items-center justify-center group overflow-hidden shadow-2xl transition-all">
            {!state.resultImage && !state.isProcessing && (
              <div className="text-center opacity-30 group-hover:opacity-50 transition-opacity">
                <svg className="mx-auto h-24 w-24 text-gray-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-light tracking-[0.2em] uppercase">Studio Display</p>
                <p className="text-xs mt-2 text-gray-400">SELECT ASSETS AND RENDER TO SEE RESULTS</p>
              </div>
            )}

            {state.isProcessing && (
              <div className="flex flex-col items-center gap-6">
                <div className="relative h-20 w-20">
                   <div className="absolute inset-0 border-2 border-indigo-600/10 rounded-full"></div>
                   <div className="absolute inset-0 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-white/90 uppercase tracking-widest animate-pulse">Rendering Scene</p>
                  <p className="text-[10px] text-gray-500 mt-2 tracking-widest">GEMINI AI IS COMPOSING YOUR IMAGE</p>
                </div>
              </div>
            )}

            {state.resultImage && (
              <img 
                src={state.resultImage} 
                alt="Studio Result" 
                className="max-h-full max-w-full rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-700 object-contain cursor-zoom-in"
                onClick={() => setFullscreenImage(state.resultImage)}
              />
            )}

            {state.resultImage && (
               <div className="absolute bottom-10 right-10 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <button 
                  onClick={() => setFullscreenImage(state.resultImage)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white p-3 rounded-full transition-all shadow-xl"
                  title="Fullscreen View"
                 >
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                   </svg>
                 </button>
                 <button 
                  onClick={() => window.open(state.resultImage!, '_blank')}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all shadow-xl"
                 >
                   Open HD
                 </button>
                 <a 
                  href={state.resultImage} 
                  download={`vogueai-export.png`}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/30"
                 >
                   Download
                 </a>
               </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="w-full flex justify-between items-center text-[10px] text-gray-600 px-10 py-4 font-bold tracking-[0.2em] uppercase shrink-0 border-t border-white/5">
          <span>SYSTEM_STATUS: NOMINAL</span>
          <div className="flex gap-8">
            <span className={state.baseImage ? 'text-indigo-400' : ''}>INPUT: {state.baseImage ? 'ACTIVE' : 'IDLE'}</span>
            <span className={state.history.length > 0 ? 'text-indigo-400' : ''}>CACHE: {state.history.length} ITEMS</span>
          </div>
        </div>
      </main>

      {/* Right Sidebar: History Records */}
      <aside className="w-64 border-l border-white/5 bg-black/60 backdrop-blur-xl flex flex-col gap-4 p-5 custom-scrollbar overflow-y-auto shrink-0">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">History</h3>
          <span className="text-[9px] text-indigo-400 font-mono bg-indigo-400/10 px-2 py-0.5 rounded">AUTO-SAVED</span>
        </div>
        
        <div className="flex flex-col gap-4">
          {state.history.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl opacity-20 text-center px-4">
              <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[10px] uppercase tracking-widest">Recent sessions will appear here</span>
            </div>
          ) : (
            state.history.map((item) => (
              <div 
                key={item.id}
                onClick={() => selectFromHistory(item)}
                className={`relative aspect-[3/4] w-full rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-[1.02] group ${
                  state.resultImage === item.url ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-xl' : 'border-white/5'
                }`}
              >
                <img src={item.url} alt="History item" className="h-full w-full object-cover" />
                
                {/* Overlay with details and download */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-bold text-white bg-indigo-600/80 px-2 py-0.5 rounded-sm uppercase tracking-tighter">
                      {item.action}
                    </span>
                    <a 
                      href={item.url} 
                      download={`vogueai-${item.action}-${item.id}.png`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 bg-white text-black rounded-full hover:bg-indigo-500 hover:text-white transition-colors shadow-lg"
                      title="Quick Download"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  </div>
                  <span className="text-[8px] text-gray-400 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Selection Indicator */}
                {state.resultImage === item.url && (
                  <div className="absolute top-2 right-2 h-2 w-2 bg-indigo-500 rounded-full animate-pulse shadow-lg shadow-indigo-500/50"></div>
                )}
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
};

export default App;
