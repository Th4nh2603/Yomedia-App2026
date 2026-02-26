
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CloudArrowUpIcon, 
  PhotoIcon, 
  XMarkIcon, 
  CheckCircleIcon,
  CpuChipIcon,
  BoltIcon,
  SignalIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import demoConfig from '../data/demoConfig.json';

interface ErrorState {
  message: string;
  type: 'validation' | 'processing' | 'system';
  action?: () => void;
  actionLabel?: string;
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  status: 'uploading' | 'success' | 'error';
  timestamp: number;
}

const BuildDemo: React.FC = () => {
  const brands = (demoConfig as any).ListBrands ?? [];
  const years = (demoConfig as any).ListYears ?? [];
  const months = (demoConfig as any).ListMonth ?? [];

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [config, setConfig] = useState({
    model: '',
    quality: years[0]?.id ?? 'standard',
    mode: months[0]?.id ?? 'standard'
  });
  const [sourceUrl, setSourceUrl] = useState('');
  const [outputLink, setOutputLink] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'recent'>('all');
  const [metrics, setMetrics] = useState({
    gpu: 12,
    ram: 2.4,
    latency: 18,
    health: 'Optimal'
  });

  // Simulate real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        gpu: Math.max(5, Math.min(95, prev.gpu + (Math.random() * 10 - 5))),
        ram: Math.max(1, Math.min(16, prev.ram + (Math.random() * 0.4 - 0.2))),
        latency: Math.max(10, Math.min(150, prev.latency + (Math.random() * 20 - 10))),
        health: prev.gpu > 85 ? 'Warning' : 'Optimal'
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    setError(null);

    const fileArray: UploadedFile[] = [];
    const errors: string[] = [];

    Array.from(newFiles).forEach((file) => {
      // Validation: Size
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name} exceeds 10MB limit.`);
        return;
      }
      // Validation: Type
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        errors.push(`${file.name} is not a supported format.`);
        return;
      }

      fileArray.push({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file),
        status: 'success' as const,
        timestamp: Date.now(),
      });
    });

    if (errors.length > 0) {
      setError({
        message: `Failed to ingest ${errors.length} assets: ${errors[0]}${errors.length > 1 ? ' ...' : ''}`,
        type: 'validation',
        actionLabel: 'View Guidelines',
        action: () => alert('Please ensure all files are PNG, JPG, or WEBP and under 10MB.')
      });
    }

    setFiles((prev) => [...prev, ...fileArray]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== id);
      // Revoke the object URL to avoid memory leaks
      const removed = prev.find((f) => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const handleProcess = () => {
    setError(null);
    setIsProcessing(true);
    setOutputLink(null);

    // Require model selection
    if (!config.model) {
      setError({
        message: 'Please select a Model Intelligence before processing.',
        type: 'validation',
      });
      setIsProcessing(false);
      return;
    }

    // Validation: Source
    if (files.length === 0 && !sourceUrl) {
      setError({
        message: "No assets detected. Please upload files or provide a remote source URL.",
        type: 'validation'
      });
      setIsProcessing(false);
      return;
    }

    // Validation: URL Format
    if (sourceUrl && !sourceUrl.startsWith('http')) {
      setError({
        message: "Invalid remote source URL. Ensure it starts with http:// or https://",
        type: 'validation'
      });
      setIsProcessing(false);
      return;
    }

    // Simulate Processing with potential random failure
    setTimeout(() => {
      const shouldFail = Math.random() > 0.9; // 10% failure rate for demo

      if (shouldFail) {
        setIsProcessing(false);
        setError({
          message: "Neural pipeline synthesis failed due to high cluster latency.",
          type: 'processing',
          actionLabel: 'Retry Synthesis',
          action: handleProcess
        });
      } else {
        setIsProcessing(false);
        setOutputLink(`https://nova-ai.io/demo/${Math.random().toString(36).substring(7)}`);
      }
    }, 2000);
  };

  return (
    <div className="max-w-full mx-auto">
      <header className="mb-8 relative">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-6 bg-[#4cceac] rounded-full" />
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Build Demo</h1>
        </div>
        <p className="text-[#a3a3a3] font-medium tracking-widest uppercase text-[9px] ml-4">
          Neural Asset Ingestion & Creative Pipeline
        </p>
        <div className="absolute -bottom-3 left-0 w-full h-px bg-gradient-to-r from-[#4cceac]/50 via-[#3d465d] to-transparent" />
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Dropzone Area */}
        <div className="xl:col-span-2">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-5 flex items-start gap-4">
                  <div className="p-2 bg-rose-500/20 rounded-xl shrink-0">
                    <ExclamationTriangleIcon className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">
                      {error.type} Error Detected
                    </h4>
                    <p className="text-xs text-rose-200/70 font-medium leading-relaxed">
                      {error.message}
                    </p>
                    {error.action && (
                      <button 
                        onClick={error.action}
                        className="mt-3 flex items-center gap-2 text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-300 transition-colors"
                      >
                        <ArrowPathIcon className="w-3 h-3" />
                        {error.actionLabel || 'Retry Action'}
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="text-rose-400/50 hover:text-rose-400 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`relative h-[420px] rounded-[3rem] border border-dashed transition-all duration-500 flex flex-col items-center justify-center p-12 text-center cursor-pointer overflow-hidden group ${
              isDragging 
                ? 'border-[#4cceac] bg-[#4cceac]/5 scale-[1.01] shadow-[0_0_50px_rgba(76,206,172,0.1)]' 
                : 'border-white/10 bg-[#1f2a40]/20 hover:border-[#4cceac]/40 hover:bg-[#1f2a40]/40'
            }`}
          >
            <input 
              type="file" 
              multiple 
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            
            {/* Scanning Line Animation */}
            {isDragging && (
              <motion.div 
                initial={{ top: 0 }}
                animate={{ top: '100%' }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-[#4cceac] to-transparent z-0 opacity-50"
              />
            )}

            <motion.div
              animate={{ 
                y: isDragging ? -15 : 0,
                scale: isDragging ? 1.1 : 1
              }}
              className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 relative ${
                isDragging ? 'bg-[#4cceac] text-[#141b2d]' : 'bg-[#141b2d] text-[#4cceac]'
              } transition-all duration-500 shadow-2xl`}
            >
              <CloudArrowUpIcon className="w-12 h-12" />
              {!isDragging && (
                <div className="absolute inset-0 rounded-[2rem] border border-[#4cceac]/20 animate-ping" />
              )}
            </motion.div>

            <h3 className="text-2xl font-black text-white mb-3 tracking-tight uppercase italic">
              {isDragging ? "Release to Ingest" : "Drop Assets Here"}
            </h3>
            <p className="text-[#a3a3a3] max-w-sm mx-auto text-xs font-medium leading-relaxed tracking-wide">
              INTELLIGENT UPLOAD SYSTEM v2.0<br/>
              <span className="opacity-60">PNG • JPG • WEBP • MAX 10MB</span>
            </p>

            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(76,206,172,0.05)_0%,transparent_70%)]" />
              <div className="absolute top-10 left-10 w-40 h-40 bg-[#4cceac] rounded-full blur-[100px] opacity-20" />
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-500 rounded-full blur-[100px] opacity-20" />
            </div>
          </motion.div>

          {/* Configuration Section */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 ml-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4cceac]" />
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#a3a3a3]">
                  Brand
                </label>
              </div>
              <div className="relative group">
                <select 
                  value={config.model}
                  onChange={(e) => setConfig({...config, model: e.target.value})}
                  className="w-full bg-[#141b2d] border border-white/5 rounded-2xl py-4 px-5 text-sm font-bold text-white outline-none focus:border-[#4cceac]/50 transition-all appearance-none cursor-pointer shadow-xl"
                >
                  <option value="" disabled>
                    Select model...
                  </option>
                  {brands.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                  <BoltIcon className="w-4 h-4 text-[#4cceac]" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 ml-1">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#a3a3a3]">
                  Year
                </label>
              </div>
              <div className="relative group">
                <select 
                  value={config.quality}
                  onChange={(e) => setConfig({...config, quality: e.target.value})}
                  className="w-full bg-[#141b2d] border border-white/5 rounded-2xl py-4 px-5 text-sm font-bold text-white outline-none focus:border-[#4cceac]/50 transition-all appearance-none cursor-pointer shadow-xl"
                >
                  {years.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                  <PhotoIcon className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 ml-1">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#a3a3a3]">
                  Month
                </label>
              </div>
              <div className="relative group">
                <select 
                  value={config.mode}
                  onChange={(e) => setConfig({...config, mode: e.target.value})}
                  className="w-full bg-[#141b2d] border border-white/5 rounded-2xl py-4 px-5 text-sm font-bold text-white outline-none focus:border-[#4cceac]/50 transition-all appearance-none cursor-pointer shadow-xl"
                >
                  {months.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                  <SignalIcon className="w-4 h-4 text-rose-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Source & Output Section */}
          <div className="mt-10 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 ml-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#a3a3a3]">
                  Remote Source URL (Optional)
                </label>
              </div>
              <div className="relative group">
                <input 
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://assets.example.com/bundle.zip"
                  className="w-full bg-[#141b2d] border border-white/5 rounded-2xl py-5 px-6 text-sm font-medium text-white outline-none focus:border-[#4cceac]/50 transition-all placeholder-white/10 shadow-xl"
                />
              </div>
            </div>

            <AnimatePresence>
              {outputLink && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-6 bg-[#4cceac]/10 border border-[#4cceac]/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#4cceac] rounded-2xl flex items-center justify-center text-[#141b2d] shadow-lg shadow-[#4cceac]/20">
                      <CheckCircleIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#e0e0e0]">Processing Complete</h4>
                      <p className="text-xs text-[#4cceac] font-medium">Your demo is ready at the link below</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-[#141b2d] p-2 pl-4 rounded-xl border border-white/5 w-full md:w-auto">
                    <span className="text-xs text-[#a3a3a3] truncate max-w-[200px]">{outputLink}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(outputLink);
                        // Optional: Show toast
                      }}
                      className="bg-[#4cceac] text-[#141b2d] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#3da58a] transition-colors"
                    >
                      Copy Link
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex gap-6">
            <button 
              onClick={handleProcess}
              disabled={!config.model || (files.length === 0 && !sourceUrl) || isProcessing}
              className="flex-1 bg-gradient-to-r from-[#4cceac] to-[#3da58a] hover:from-[#3da58a] hover:to-[#4cceac] disabled:from-[#3d465d] disabled:to-[#3d465d] disabled:cursor-not-allowed text-[#141b2d] font-black py-5 rounded-3xl transition-all shadow-[0_20px_40px_rgba(76,206,172,0.15)] flex items-center justify-center gap-3 uppercase tracking-widest text-xs italic"
            >
              {isProcessing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-[#141b2d] border-t-transparent rounded-full"
                  />
                  Synthesizing Pipeline...
                </>
              ) : (
                <>
                  <BoltIcon className="w-5 h-5" />
                  Process {files.length || (sourceUrl ? 'Remote' : '0')} Assets
                </>
              )}
            </button>
            <button 
              onClick={() => {
                setFiles([]);
                setSourceUrl('');
                setOutputLink(null);
                setError(null);
              }}
              disabled={(files.length === 0 && !sourceUrl) || isProcessing}
              className="px-10 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white font-black rounded-3xl border border-white/5 transition-all uppercase tracking-widest text-[10px] italic"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Preview Sidebar */}
        <div className="bg-[#141b2d] rounded-[3rem] border border-white/5 p-8 shadow-2xl flex flex-col h-[700px] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#4cceac]/20 to-transparent" />
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">Asset Review</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[9px] font-bold text-[#a3a3a3] uppercase tracking-[0.2em]">Staging Environment</span>
                <div className="flex items-center gap-2 bg-white/5 rounded-full px-2 py-0.5 border border-white/5">
                  <button 
                    onClick={() => setFilterType('all')}
                    className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full transition-all ${filterType === 'all' ? 'bg-[#4cceac] text-[#141b2d]' : 'text-[#a3a3a3] hover:text-white'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setFilterType('recent')}
                    className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full transition-all ${filterType === 'recent' ? 'bg-[#4cceac] text-[#141b2d]' : 'text-[#a3a3a3] hover:text-white'}`}
                  >
                    Recent
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-[#4cceac]/10 text-[#4cceac] text-[10px] font-black px-4 py-1.5 rounded-full border border-[#4cceac]/20 uppercase tracking-widest">
              {files.length} Units
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            <AnimatePresence initial={false}>
              {files.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center text-[#3d465d]"
                >
                  <PhotoIcon className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-sm font-medium">No assets uploaded yet</p>
                </motion.div>
              ) : (
                files
                  .filter(file => filterType === 'all' || (Date.now() - file.timestamp < 300000)) // Recent = last 5 minutes
                  .map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    className="group relative bg-[#141b2d] rounded-2xl p-3 border border-[#3d465d] flex items-center gap-4 hover:border-[#4cceac]/30 transition-all"
                  >
                    <div 
                      onClick={() => setSelectedImage(file.preview)}
                      className="w-16 h-16 rounded-2xl overflow-hidden bg-[#1f2a40] shrink-0 border border-white/10 cursor-zoom-in hover:scale-110 transition-all duration-500 shadow-lg"
                    >
                      <img src={file.preview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate pr-6 tracking-tight">{file.file.name}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-1 h-1 rounded-full bg-[#4cceac]" />
                        <p className="text-[9px] text-[#a3a3a3] font-black uppercase tracking-widest">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <div className="absolute top-2 right-2 flex gap-1">
                      <div className="bg-[#4cceac] text-[#141b2d] p-0.5 rounded-full">
                        <CheckCircleIcon className="w-3 h-3" />
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                        className="bg-red-500/20 text-red-400 p-0.5 rounded-full hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Image Review Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] bg-[#141b2d]/90 backdrop-blur-xl flex items-center justify-center p-10 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full max-h-full flex items-center justify-center"
            >
              <img 
                src={selectedImage} 
                alt="Review" 
                className="max-w-full max-h-[80vh] rounded-3xl shadow-2xl border border-white/10 object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-[#e0e0e0] hover:text-[#4cceac] transition-colors flex items-center gap-2 font-bold uppercase tracking-widest text-xs"
              >
                <XMarkIcon className="w-6 h-6" />
                Close Review
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuildDemo;
