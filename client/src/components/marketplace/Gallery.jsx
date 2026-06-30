import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ImageOff, Expand, X } from 'lucide-react';

export default function Gallery({ media = [], title = '' }) {
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const has = media.length > 0;
  const cur = has ? media[idx] : null;
  const go = (d) => setIdx((i) => (i + d + media.length) % media.length);

  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-[4/3] bg-slate-100 sm:aspect-[16/10]">
        {cur ? (
          <AnimatePresence mode="wait">
            <motion.img
              key={cur.url}
              src={cur.url}
              alt={title}
              initial={{ opacity: 0.4, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full object-cover"
            />
          </AnimatePresence>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300"><ImageOff className="h-12 w-12" /></div>
        )}

        {has && (
          <>
            <button onClick={() => setZoom(true)} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow hover:scale-105"><Expand className="h-4 w-4" /></button>
            <span className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-medium text-white">{idx + 1} / {media.length}</span>
            {media.length > 1 && (
              <>
                <button onClick={() => go(-1)} className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow hover:scale-105"><ChevronLeft className="h-5 w-5" /></button>
                <button onClick={() => go(1)} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow hover:scale-105"><ChevronRight className="h-5 w-5" /></button>
              </>
            )}
          </>
        )}
      </div>

      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-3">
          {media.map((m, i) => (
            <button key={m.url} onClick={() => setIdx(i)} className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition ${i === idx ? 'ring-brand-500' : 'ring-transparent hover:ring-brand-200'}`}>
              <img src={m.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {zoom && cur && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoom(false)}>
            <button className="absolute right-5 top-5 text-white/80 hover:text-white"><X className="h-7 w-7" /></button>
            <img src={cur.url} alt={title} className="max-h-[90vh] max-w-full rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
