
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../store';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Camera, 
  Trash2, 
  Scale, 
  Percent, 
  Image as ImageIcon,
  Clock,
  X,
  History,
  Info,
  Maximize2,
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { getAllPhotos, savePhoto, deletePhoto, ProgressPhoto, PhotoAngle } from '../db';

// Helper for image compression
const compressImage = (file: File, options: { maxWidth: number; quality: number }): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > options.maxWidth) {
          height *= options.maxWidth / width;
          width = options.maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          resolve(blob || file);
        }, 'image/jpeg', options.quality);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

interface BodyMetricsViewProps {
  onBack?: () => void;
}

const BodyMetricsView: React.FC<BodyMetricsViewProps> = ({ onBack }) => {
  const bodyMetrics = useStore(state => state.bodyMetrics);
  const addBodyMetric = useStore(state => state.addBodyMetric);
  const settings = useStore(state => state.settings);
  const setToastMessage = useStore(state => state.setToastMessage);

  const [weight, setWeight] = useState(bodyMetrics[0]?.weight || 55.4);
  const [bodyFat, setBodyFat] = useState(bodyMetrics[0]?.bodyFat || 18);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAngle, setUploadingAngle] = useState<PhotoAngle | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<ProgressPhoto | null>(null);
  
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    setLoadingPhotos(true);
    try {
      const all = await getAllPhotos();
      setPhotos(all);
    } catch (err) {
      console.error("Failed to load photos", err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const chartData = useMemo(() => {
    return [...bodyMetrics].reverse().map(m => ({
      date: format(m.timestamp, 'MMM d'),
      weight: m.weight,
      bodyFat: m.bodyFat
    }));
  }, [bodyMetrics]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const angle = uploadingAngle;
    if (!file || !angle) return;

    if (file.size > 5 * 1024 * 1024) {
      setToastMessage("File exceeds 5MB limit");
      return;
    }

    setToastMessage("Compressing & saving...");

    try {
      const compressedBlob = await compressImage(file, { maxWidth: 1000, quality: 0.8 });
      
      await savePhoto({
        timestamp: Date.now(),
        blob: compressedBlob,
        angle: angle,
        label: `${angle.charAt(0).toUpperCase() + angle.slice(1)} View`
      });
      
      await loadPhotos();
      setToastMessage(`${angle} view updated!`);
      setUploadingAngle(null);
    } catch (err) {
      console.error(err);
      setToastMessage("Error saving photo");
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleSaveMetric = () => {
    addBodyMetric({
      timestamp: Date.now(),
      weight,
      bodyFat: bodyFat || undefined
    });
    setToastMessage("Metrics updated");
  };

  const startUpload = (angle: PhotoAngle) => {
    setUploadingAngle(angle);
    fileInputRef.current?.click();
  };

  const handleDeletePhoto = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Permanently delete this progress photo?")) {
      try {
        await deletePhoto(id);
        await loadPhotos();
        if (viewingPhoto?.id === id) setViewingPhoto(null);
        setCompareSelection(prev => prev.filter(pId => pId !== id));
        setToastMessage("Deleted");
      } catch (err) {
        setToastMessage("Delete failed");
      }
    }
  };

  const toggleCompare = (id: string) => {
    if (compareSelection.includes(id)) {
      setCompareSelection(prev => prev.filter(pId => pId !== id));
    } else {
      if (compareSelection.length >= 2) {
        setCompareSelection([compareSelection[1], id]);
      } else {
        setCompareSelection(prev => [...prev, id]);
      }
    }
  };

  const comparedPhotos = useMemo(() => {
    // Sort by timestamp to ensure idx 0 is oldest and idx 1 is newest
    return compareSelection
      .map(id => photos.find(p => p.id === id))
      .filter(Boolean)
      .sort((a, b) => a!.timestamp - b!.timestamp) as ProgressPhoto[];
  }, [compareSelection, photos]);

  const latestByAngle = useMemo(() => {
    const result: Record<PhotoAngle, ProgressPhoto | undefined> = {
      front: undefined,
      side: undefined,
      back: undefined,
      other: undefined
    };
    photos.forEach(p => {
      if (!result[p.angle]) result[p.angle] = p;
    });
    return result;
  }, [photos]);

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-zinc-950 text-gray-800 dark:text-gray-200 animate-in fade-in duration-500 theme-transition pb-24 relative">
      
      {onBack && (
        <header className="px-6 py-4 flex items-center gap-4 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-20">
          <button onClick={onBack} className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-xl text-gray-500 dark:text-zinc-400">
            <ChevronLeft size={20} />
          </button>
          <h2 className="font-black text-lg">Body Metrics</h2>
        </header>
      )}

      {/* Comparison View Overlay */}
      {compareMode && comparedPhotos.length === 2 && (
        <div className="fixed inset-0 z-[110] bg-black flex flex-col animate-in slide-in-from-bottom duration-500">
           <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-900 bg-black/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <Maximize2 size={20} className="text-blue-500" />
                <h3 className="font-black text-white text-lg">Visual Progression</h3>
              </div>
              <button 
                onClick={() => setCompareMode(false)} 
                className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-full text-zinc-400 active:scale-90 transition-transform"
              >
                <X size={24} />
              </button>
           </header>
           <div className="flex-1 flex flex-row divide-x divide-zinc-800 overflow-hidden">
              {comparedPhotos.map((photo, idx) => {
                const url = URL.createObjectURL(photo.blob);
                return (
                  <div key={photo.id} className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden relative">
                    <img 
                      src={url} 
                      className="w-full h-full object-cover" 
                      alt="Comparison" 
                    />
                    <div className="absolute top-4 left-4 bg-blue-600 px-3 py-1.5 rounded-full shadow-lg border border-blue-400/50">
                       <p className="text-[10px] font-black text-white uppercase tracking-widest">
                         {idx === 0 ? 'Baseline' : 'Progress'}
                       </p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/40 to-transparent">
                      <p className="text-white font-black text-lg">{format(photo.timestamp, 'MMM d, yyyy')}</p>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{photo.angle} View</p>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {viewingPhoto && !compareMode && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
           <button 
             onClick={() => setViewingPhoto(null)}
             className="absolute top-6 right-6 p-3 bg-white/10 rounded-full text-white backdrop-blur-md"
           >
             <X size={24} />
           </button>
           <img 
             src={URL.createObjectURL(viewingPhoto.blob)} 
             alt="Progress" 
             className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
           />
           <div className="mt-8 text-center space-y-1">
             <p className="text-white font-black text-xl">{viewingPhoto.label}</p>
             <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
               {format(viewingPhoto.timestamp, 'EEEE, MMMM d, yyyy')}
             </p>
             <button 
               onClick={(e) => handleDeletePhoto(viewingPhoto.id, e)}
               className="mt-6 flex items-center gap-2 px-6 py-2 bg-red-600/20 text-red-500 border border-red-500/30 rounded-full text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
             >
               <Trash2 size={14} /> Delete Entry
             </button>
           </div>
        </div>
      )}

      {/* Metric Logging */}
      <section className="bg-white dark:bg-zinc-900 p-6 shadow-sm border-b border-gray-100 dark:border-zinc-800 theme-transition">
        <h2 className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-4 px-1 text-center">Update Daily Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-500 mb-1 justify-center">
              <Scale size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Weight</span>
            </div>
            <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-2xl border border-gray-100 dark:border-zinc-700">
              <input 
                type="number" step="0.1" value={weight}
                onChange={e => setWeight(parseFloat(e.target.value))}
                className="bg-transparent font-black text-2xl w-full text-center outline-none text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-500 mb-1 justify-center">
              <Percent size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Body Fat</span>
            </div>
            <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-2xl border border-gray-100 dark:border-zinc-700">
              <input 
                type="number" step="0.1" value={bodyFat}
                onChange={e => setBodyFat(parseFloat(e.target.value))}
                className="bg-transparent font-black text-2xl w-full text-center outline-none text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
        <button 
          onClick={handleSaveMetric}
          className="w-full mt-6 bg-blue-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-all shadow-xl shadow-blue-100 dark:shadow-none"
        >
          Confirm Update
        </button>
      </section>

      {/* Progress Photos Upload */}
      <section className="bg-white dark:bg-zinc-900 p-6 mt-4 shadow-sm theme-transition">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em]">📷 Quick Capture</h2>
          <span className="text-[9px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest italic">Private Storage</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {(['front', 'side', 'back'] as PhotoAngle[]).map(angle => {
            const latest = latestByAngle[angle];
            return (
              <button 
                key={angle}
                onClick={() => startUpload(angle)}
                className="flex flex-col items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800 rounded-3xl border border-gray-100 dark:border-zinc-700 active:scale-95 transition-all relative overflow-hidden group shadow-sm min-h-[110px]"
              >
                {latest ? (
                  <img src={URL.createObjectURL(latest.blob)} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity" alt="preview" />
                ) : null}
                <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-blue-500 shadow-sm z-10 border border-gray-100 dark:border-zinc-800">
                  <Camera size={22} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 z-10">
                  {angle}
                </span>
              </button>
            );
          })}
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept="image/*"
        />
      </section>

      {/* Comparison Gallery */}
      <section className="bg-white dark:bg-zinc-900 p-6 mt-4 shadow-sm theme-transition flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-1">Visual Log Book</h2>
            <p className="text-gray-900 dark:text-white font-black text-xl">Timeline Gallery</p>
          </div>
          <button 
            onClick={() => {
              if (compareSelection.length === 2) {
                setCompareMode(true);
              }
            }}
            disabled={compareSelection.length !== 2}
            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${compareSelection.length === 2 ? 'bg-blue-600 text-white shadow-xl active:scale-95' : 'bg-gray-100 dark:bg-zinc-800 text-gray-300 dark:text-zinc-700 cursor-not-allowed'}`}
          >
            Compare ({compareSelection.length}/2)
          </button>
        </div>

        {photos.length > 0 ? (
          <div className="space-y-3 pb-20">
            {photos.map(photo => {
              const isSelected = compareSelection.includes(photo.id);
              return (
                <div 
                  key={photo.id}
                  onClick={() => toggleCompare(photo.id)}
                  className={`flex items-center gap-4 p-4 rounded-[2rem] border transition-all active:scale-[0.99] ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-inner' : 'bg-gray-50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-800'}`}
                >
                  <div 
                    className="w-16 h-16 bg-gray-200 dark:bg-zinc-800 rounded-2xl overflow-hidden shrink-0 cursor-zoom-in shadow-sm"
                    onClick={(e) => { e.stopPropagation(); setViewingPhoto(photo); }}
                  >
                    <img src={URL.createObjectURL(photo.blob)} className="w-full h-full object-cover" alt="Thumbnail" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-gray-900 dark:text-white">{format(photo.timestamp, 'MMM d, yyyy')}</p>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">{photo.angle} View</p>
                  </div>
                  <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'border-gray-200 dark:border-zinc-700'}`}>
                    {isSelected ? <CheckCircle2 size={20} /> : <div className="w-4 h-4 rounded-md border border-gray-200 dark:border-zinc-700" />}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400 dark:text-zinc-600 bg-gray-50 dark:bg-zinc-900/50 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-zinc-800">
             <ImageIcon size={40} className="mx-auto mb-4 opacity-5" />
             <p className="text-[11px] font-black uppercase tracking-[0.2em]">Zero photos logged</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default BodyMetricsView;
