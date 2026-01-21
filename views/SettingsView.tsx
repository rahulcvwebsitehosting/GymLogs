
import React from 'react';
import { useStore } from '../store';
import { 
  ChevronLeft, 
  Volume2, 
  Timer, 
  Smartphone, 
  Zap, 
  Ruler, 
  Sun, 
  ChevronRight,
  Bell,
  Vibrate,
  Moon,
  Monitor
} from 'lucide-react';

interface SettingsViewProps {
  onBack: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const settings = useStore(state => state.settings);
  const updateSettings = useStore(state => state.updateSettings);

  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        // Only request if permission policy allows
        await (navigator as any).wakeLock.request('screen');
        console.log('Wake Lock is active');
      } catch (err: any) {
        console.warn(`${err.name}, ${err.message}`);
        // If it fails due to permission policy, we just log it
      }
    }
  };

  const SettingGroup = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <div className="space-y-3">
      <h3 className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] px-1">{title}</h3>
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-sm theme-transition">
        {children}
      </div>
    </div>
  );

  const SettingRow = ({ 
    icon: Icon, 
    label, 
    value, 
    onClick, 
    color = "text-blue-500",
    description
  }: { 
    icon: any, 
    label: string, 
    value?: React.ReactNode, 
    onClick?: () => void,
    color?: string,
    description?: string
  }) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-5 hover:bg-gray-50 dark:hover:bg-zinc-800/50 active:bg-gray-100 dark:active:bg-zinc-800 transition-colors text-left border-b border-gray-50 dark:border-zinc-800 last:border-0"
    >
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('500', '50')} dark:${color.replace('text-', 'bg-').replace('500', '900/30')} ${color}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <p className="font-bold text-gray-800 dark:text-gray-200">{label}</p>
        {description && <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm font-black text-blue-600 dark:text-blue-400">{value}</span>}
        <ChevronRight size={16} className="text-gray-300 dark:text-zinc-600" />
      </div>
    </button>
  );

  const ToggleRow = ({ 
    icon: Icon, 
    label, 
    checked, 
    onChange,
    color = "text-blue-500",
    description
  }: { 
    icon: any, 
    label: string, 
    checked: boolean, 
    onChange: (v: boolean) => void,
    color?: string,
    description?: string
  }) => (
    <div className="flex items-center gap-4 px-5 py-5 border-b border-gray-50 dark:border-zinc-800 last:border-0">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('500', '50')} dark:${color.replace('text-', 'bg-').replace('500', '900/30')} ${color}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <p className="font-bold text-gray-800 dark:text-gray-200">{label}</p>
        {description && <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">{description}</p>}
      </div>
      <button 
        onClick={() => {
          if (navigator.vibrate) navigator.vibrate(5);
          onChange(!checked);
        }}
        className={`w-12 h-6 rounded-full transition-all relative ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-zinc-800'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${checked ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-right duration-300 pb-24">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 text-gray-400 dark:text-zinc-500">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Settings</h2>
          <p className="text-gray-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest">Preferences & Behavior</p>
        </div>
      </header>

      <SettingGroup title="Audio & Feedback">
        <SettingRow 
          icon={Bell} 
          label="Rest Timer Sound" 
          value={settings.restTimerSound.toUpperCase()} 
          description="Sound played when rest ends"
          onClick={() => {
            const sounds: typeof settings.restTimerSound[] = ['beep', 'chime', 'alarm', 'vibrate', 'silent'];
            const next = sounds[(sounds.indexOf(settings.restTimerSound) + 1) % sounds.length];
            updateSettings({ restTimerSound: next });
          }}
        />
        <div className="px-5 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Volume2 size={16} className="text-gray-400 dark:text-zinc-500" />
               <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Timer Volume</span>
            </div>
            <span className="text-xs font-black text-blue-600 dark:text-blue-400">{settings.restTimerVolume}%</span>
          </div>
          <input 
            type="range" 
            min="0" max="100" 
            value={settings.restTimerVolume}
            onChange={(e) => updateSettings({ restTimerVolume: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
        <ToggleRow 
          icon={Vibrate} 
          label="Haptic Feedback" 
          checked={settings.hapticFeedback} 
          onChange={(v) => updateSettings({ hapticFeedback: v })}
          color="text-emerald-500"
          description="Vibrate on set complete"
        />
      </SettingGroup>

      <SettingGroup title="Workout Behavior">
        <SettingRow 
          icon={Timer} 
          label="Default Rest Time" 
          value={`${Math.floor(settings.defaultRestTime / 60)}m`} 
          onClick={() => {
            const times = [120, 180, 240, 300];
            const next = times[(times.indexOf(settings.defaultRestTime) + 1) % times.length];
            updateSettings({ defaultRestTime: next });
          }}
          description="Countdown for new exercises"
        />
        <ToggleRow 
          icon={Zap} 
          label="Auto-start Timer" 
          checked={settings.autoStartTimer} 
          onChange={(v) => updateSettings({ autoStartTimer: v })}
          color="text-orange-500"
          description="Start timer after logging a set"
        />
        <ToggleRow 
          icon={Smartphone} 
          label="Keep Screen Awake" 
          checked={settings.keepScreenAwake} 
          onChange={(v) => {
            updateSettings({ keepScreenAwake: v });
            if (v) requestWakeLock();
          }}
          color="text-purple-500"
          description="Prevent phone from dimming"
        />
      </SettingGroup>

      <SettingGroup title="App Appearance">
        <SettingRow 
          icon={settings.theme === 'light' ? Sun : settings.theme === 'dark' ? Moon : Monitor} 
          label="Theme" 
          value={settings.theme.toUpperCase()} 
          onClick={() => {
            const themes: typeof settings.theme[] = ['light', 'dark', 'auto'];
            const next = themes[(themes.indexOf(settings.theme) + 1) % themes.length];
            updateSettings({ theme: next });
          }}
          color="text-zinc-800 dark:text-zinc-200"
        />
        <SettingRow 
          icon={Ruler} 
          label="Unit System" 
          value={settings.unitSystem === 'metric' ? 'Metric (kg)' : 'Imperial (lbs)'} 
          onClick={() => updateSettings({ unitSystem: settings.unitSystem === 'metric' ? 'imperial' : 'metric' })}
          color="text-indigo-500"
        />
      </SettingGroup>

      <div className="pt-4 px-2 space-y-4">
        <p className="text-[10px] text-gray-400 dark:text-zinc-600 font-medium text-center uppercase tracking-widest">IronLog v1.4.1 • Privacy First</p>
        <button 
          className="w-full py-4 text-xs font-black text-red-500 dark:text-red-400 uppercase tracking-widest hover:text-red-700 transition-colors"
          onClick={() => {
            if (confirm("ERASE ALL DATA? This cannot be undone.")) {
               localStorage.clear();
               window.location.reload();
            }
          }}
        >
          Factory Reset Data
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
