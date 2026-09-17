import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';

export const TraceActivity = ({ content = {}, onComplete }) => {
  const targetChar = content.target_character || 'A';
  const hintWord = content.hint_word || 'Apple 🍎';
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw large light grey guide character
    ctx.font = 'bold 160px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#E2E8F0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(targetChar, canvas.width / 2, canvas.height / 2);
  }, [targetChar]);

  const startDraw = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setStrokeCount((prev) => prev + 1);
  };

  const endDraw = () => {
    setIsDrawing(false);
    if (strokeCount > 25) {
      setTimeout(() => {
        onComplete({ correct_count: 1, total_count: 1 });
      }, 1000);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 160px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#E2E8F0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(targetChar, canvas.width / 2, canvas.height / 2);
    setStrokeCount(0);
  };

  return (
    <div className="text-center space-y-6 max-w-lg mx-auto py-2">
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>{content.instruction || 'Trace the letter with your finger!'}</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          Letter {targetChar} is for {hintWord}
        </h2>
      </div>

      <div className="relative inline-block border-4 border-dashed border-sky-300 rounded-3xl bg-white shadow-inner p-2 touch-none">
        <canvas
          ref={canvasRef}
          width={300}
          height={240}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          className="cursor-crosshair rounded-2xl bg-slate-50"
        />
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={clearCanvas}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Erase & Try Again</span>
        </button>

        <button
          onClick={() => onComplete({ correct_count: 1, total_count: 1 })}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm transition-all hover:scale-105"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Done Tracing! ⭐</span>
        </button>
      </div>
    </div>
  );
};
