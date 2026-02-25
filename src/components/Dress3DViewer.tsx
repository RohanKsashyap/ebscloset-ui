import { useMemo, useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { loadDressImage, loadDressSnapshots } from '../utils/storage';

export default function Dress3DViewer() {
  const [image, setImage] = useState<string | null>(null);
  const [angle, setAngle] = useState<number>(0);
  const [snapshots, setSnapshots] = useState<ReturnType<typeof loadDressSnapshots>>([]);
  const slices = 32;

  const radius = 140; // px depth for cylinder illusion
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImage(loadDressImage());
    setSnapshots(loadDressSnapshots());
  }, []);

  const sliceData = useMemo(() => {
    const arr = [] as Array<{ i: number; rot: number; bgPos: string }>
    for (let i = 0; i < slices; i++) {
      const rot = (360 / slices) * i;
      const posPercent = Math.round((i / (slices - 1)) * 100);
      const bgPos = `${posPercent}% 50%`;
      arr.push({ i, rot, bgPos });
    }
    return arr;
  }, [slices]);

  return (
    <section className="py-20 px-6 lg:px-12 max-w-screen-2xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* 1) Main 3D viewer */}
        <div className="lg:col-span-2 relative">
          <div className="rounded-3xl p-6 bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl">
            <div className="relative min-h-[420px] md:min-h-[520px] flex items-center justify-center">
              <button aria-label="rotate left" onClick={() => setAngle((a) => (a - 10 + 360) % 360)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/60 backdrop-blur-md border border-white/50 rounded-full p-3 shadow-md hover:bg-white ease-lux">
                <ChevronLeft className="w-5 h-5 text-hot-pink" />
              </button>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[70%] md:w-[60%]">
                <input type="range" min={0} max={359} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full accent-hot-pink" />
                <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                  <span>0°</span>
                  <span>{Math.round(angle)}°</span>
                  <span>360°</span>
                </div>
              </div>

              <button aria-label="rotate right" onClick={() => setAngle((a) => (a + 10) % 360)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/60 backdrop-blur-md border border-white/50 rounded-full p-3 shadow-md hover:bg-white ease-lux">
                <ChevronRight className="w-5 h-5 text-hot-pink" />
              </button>

              <div className="absolute inset-x-12 bottom-4 h-6 rounded-full bg-black/5 blur-sm" />

              <div ref={viewerRef} className="relative w-full max-w-lg md:max-w-2xl mx-auto" style={{ perspective: 900 }}>
                {/* ghost mannequin silhouette */}
                <div className="absolute inset-x-10 md:inset-x-24 top-10 bottom-12 rounded-[40%] bg-gradient-to-b from-white/55 via-white/10 to-transparent blur-md" />

                {/* cylinder slices */}
                <div className="relative h-[360px] md:h-[440px] mx-auto will-change-transform" style={{ transformStyle: 'preserve-3d', transform: `rotateY(${angle}deg)` }}>
                  {sliceData.map((s) => (
                    <div
                      key={s.i}
                      className="absolute top-1/2 -translate-y-1/2"
                      style={{
                        transform: `rotateY(${s.rot}deg) translateZ(${radius}px)`,
                        width: `${Math.max(4, Math.floor( (radius * Math.PI * 2) / slices / 3 ))}px`,
                        height: '80%',
                        backgroundImage: image ? `url(${image})` : 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.9), rgba(255,255,255,0.3))',
                        backgroundSize: 'cover',
                        backgroundPosition: image ? s.bgPos : '50% 50%',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.08) inset',
                        borderRadius: '16px',
                      }}
                    />
                  ))}
                </div>

                {/* soft lighting overlay */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl" style={{ background: 'radial-gradient(120px 140px at 50% 30%, rgba(255,255,255,0.35), transparent), linear-gradient(to bottom, rgba(255,255,255,0.25), transparent 40%)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 2) Right column: thumbnails only; upload moved to admin */}
        <div className="space-y-4">
          <div className="rounded-3xl p-6 bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl">
            <h3 className="font-serif text-xl text-hot-pink mb-3">3D Dress Preview</h3>
            {!image && (
              <p className="text-sm text-gray-700">No dress uploaded. Go to Admin → 3D Dress to upload a PNG.</p>
            )}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {['#fde2e4','#e9d5ff','#fff1f2','#ffedd5'].map((c, i) => (
                <div key={i} className="h-12 rounded-2xl border" style={{ background: c }} />
              ))}
            </div>
          </div>

          {/* 3) Thumbnails of saved rotations */}
          <div className="rounded-3xl p-4 bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl">
            <h4 className="font-serif text-lg text-gray-800 mb-3">Saved Rotations</h4>
            {snapshots.length === 0 ? (
              <p className="text-sm text-gray-600">No saved angles yet.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {snapshots.map((s, idx) => (
                  <button key={`${s.angle}-${idx}`} className="relative rounded-2xl overflow-hidden border hover:border-hot-pink ease-lux" onClick={() => setAngle(s.angle)}>
                    <div className="aspect-square" style={{ backgroundImage: `url(${s.image})`, backgroundSize: 'cover', backgroundPosition: '50% 50%' }} />
                    <span className="absolute bottom-1 right-2 text-xs px-2 py-1 rounded-full bg-white/80 backdrop-blur-md border text-gray-800">{s.angle}°</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
