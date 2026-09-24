import { useState, useEffect } from "react";
import { X, ChevronRight } from "lucide-react";

export function ProductUpdateSpotlight() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Small delay for initial appearance
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => setIsVisible(false), 300); // Wait for fade out animation
  };

  return (
    <div 
      className={`fixed bottom-6 right-6 z-[50] transition-all duration-300 ease-out ${
        isClosing ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="w-[380px] rounded-xl bg-white dark:bg-zinc-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
        {/* Media Header */}
        <div className="h-[240px] w-full relative bg-zinc-100 dark:bg-zinc-800">
          {/* Placeholder for media - using an abstract CSS gradient instead of image for now */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
             <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md shadow-lg border border-white/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
             </div>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 rounded-full p-1.5 bg-black/10 backdrop-blur-sm text-white/90 hover:bg-black/20 hover:text-white transition-colors z-10"
            aria-label="Close update"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 text-white z-10">
            <span className="inline-flex px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-[10px] font-semibold tracking-wide uppercase mb-1">
              New Feature
            </span>
            <h3 className="text-lg font-bold leading-tight shadow-black text-white">Dynamic Dashboards</h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 h-[4.5rem]">
            You can now fully customize your workspace layout. Drag and drop widgets, resize them, and create the perfect view for your daily workflow.
          </p>
          
          {/* Footer / Controls */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-zinc-400">1 of 3 updates</span>
            <div className="flex gap-2">
              <button 
                onClick={handleClose}
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Skip
              </button>
              <button 
                onClick={handleClose}
                className="flex items-center gap-1 px-4 py-1.5 text-xs font-medium text-white rounded bg-[#5D2BFF] hover:bg-[#4B22CC] shadow-[0_4px_14px_0_rgba(93,43,255,0.3)] transition-all"
              >
                Try it now
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
