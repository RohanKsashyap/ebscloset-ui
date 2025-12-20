import { useState } from 'react';

interface Item {
  title: string;
  content: React.ReactNode;
}

export default function Accordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y border mt-10">
      {items.map((it, i) => (
        <div key={i}>
          <button className="w-full text-left px-4 py-4 font-semibold text-gray-800 flex justify-between" onClick={() => setOpen(open===i ? null : i)}>
            <span>{it.title}</span>
            <span>{open===i ? '−' : '+'}</span>
          </button>
          {open===i && (
            <div className="px-4 pb-4 text-gray-700">
              {it.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

