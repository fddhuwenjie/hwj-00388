import { X, AlertTriangle, Sparkles, Info } from 'lucide-react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { BASE_DATE } from '@/data/planets';
import { useEffect, useState } from 'react';

export function EventNotifications() {
  const { activeEvents, dismissEvent, showEventNotifications, eclipseIntensity } = useSimulationStore();
  const [displayedEvents, setDisplayedEvents] = useState<typeof activeEvents>([]);

  useEffect(() => {
    setDisplayedEvents(activeEvents.slice(-3));
  }, [activeEvents]);

  if (!showEventNotifications) return null;

  return (
    <>
      {eclipseIntensity > 0 && (
        <div
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-1000"
          style={{
            background: `radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, ${eclipseIntensity * 0.8}) 100%)`,
            opacity: eclipseIntensity,
          }}
        />
      )}

      <div className="absolute bottom-24 right-4 z-40 flex flex-col gap-2 pointer-events-auto">
        {displayedEvents.map((event) => (
          <div
            key={event.id}
            className={`relative w-80 overflow-hidden rounded-xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-right duration-500 ${
              event.type === 'solar_eclipse'
                ? 'border-amber-500/30 bg-amber-500/10'
                : event.type === 'planetary_alignment'
                ? 'border-violet-500/30 bg-violet-500/10'
                : 'border-white/10 bg-black/60'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {event.type === 'solar_eclipse' ? (
                    <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
                  ) : event.type === 'planetary_alignment' ? (
                    <Sparkles size={18} className="text-violet-400 flex-shrink-0" />
                  ) : (
                    <Info size={18} className="text-cyan-400 flex-shrink-0" />
                  )}
                  <h3 className={`text-sm font-bold ${
                    event.type === 'solar_eclipse'
                      ? 'text-amber-300'
                      : event.type === 'planetary_alignment'
                      ? 'text-violet-300'
                      : 'text-white'
                  }`}>
                    {event.title}
                  </h3>
                </div>
                <button
                  onClick={() => dismissEvent(event.id)}
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60 transition-all hover:bg-white/20 hover:text-white"
                >
                  <X size={12} />
                </button>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-white/70">
                {event.description}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-white/40 font-mono">
                  {new Date(BASE_DATE + event.timestamp).toLocaleDateString('zh-CN')}
                </span>
                <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                  event.type === 'solar_eclipse'
                    ? 'bg-amber-400'
                    : 'bg-violet-400'
                }`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
