'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

interface ScratchCardProps {
  children: React.ReactNode;
  width: number;
  height: number;
  onReveal?: () => void;
  revealThreshold?: number;
  label?: string;
}

// Coin cursor SVG as data URL
const COIN_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='gold' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23FFD700'/%3E%3Cstop offset='50%25' style='stop-color:%23FFA500'/%3E%3Cstop offset='100%25' style='stop-color:%23FFD700'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='16' cy='16' r='14' fill='url(%23gold)' stroke='%23B8860B' stroke-width='2'/%3E%3Ccircle cx='16' cy='16' r='10' fill='none' stroke='%23B8860B' stroke-width='1' opacity='0.5'/%3E%3Ctext x='16' y='21' text-anchor='middle' font-size='14' font-weight='bold' fill='%23B8860B'%3E$%3C/text%3E%3C/svg%3E") 16 16, crosshair`;

export default function ScratchCard({ 
  children, 
  width, 
  height, 
  onReveal,
  revealThreshold = 40,
  label
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas with scratch surface
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create high-quality metallic surface
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#C0C0C0');
    gradient.addColorStop(0.2, '#E8E8E8');
    gradient.addColorStop(0.4, '#A0A0A0');
    gradient.addColorStop(0.6, '#D0D0D0');
    gradient.addColorStop(0.8, '#B0B0B0');
    gradient.addColorStop(1, '#C8C8C8');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add metallic texture with sparkles
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2 + 0.5;
      const alpha = Math.random() * 0.4 + 0.1;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add subtle noise texture
    const imageData = ctx.getImageData(0, 0, width, height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 15;
      imageData.data[i] += noise;
      imageData.data[i + 1] += noise;
      imageData.data[i + 2] += noise;
    }
    ctx.putImageData(imageData, 0, 0);

    // Add scratch instruction text
    ctx.fillStyle = 'rgba(60, 60, 60, 0.9)';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCRATCH HERE', width / 2, height / 2);
  }, [width, height, isRevealed]);

  // Calculate scratched percentage
  const calculateScratchPercent = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, width, height);
    let scratched = 0;
    const total = width * height;

    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) scratched++;
    }

    return (scratched / total) * 100;
  }, [width, height]);

  // Scratch function with smooth line drawing
  const scratch = useCallback((clientX: number, clientY: number) => {
    if (!isDrawing || isRevealed) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (width / rect.width);
    const y = (clientY - rect.top) * (height / rect.height);

    ctx.globalCompositeOperation = 'destination-out';
    
    // Draw smooth line from last point
    if (lastPoint.current) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(x, y);
      ctx.lineWidth = 22;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // Draw circle at current point
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();

    lastPoint.current = { x, y };

    // Check reveal threshold
    const percent = calculateScratchPercent();
    setScratchPercent(percent);

    if (percent > revealThreshold && !isRevealed) {
      setIsRevealed(true);
      onReveal?.();
    }
  }, [isDrawing, isRevealed, width, height, revealThreshold, onReveal, calculateScratchPercent]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    scratch(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  };

  const handleStart = (clientX: number, clientY: number) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      lastPoint.current = {
        x: (clientX - rect.left) * (width / rect.width),
        y: (clientY - rect.top) * (height / rect.height),
      };
    }
  };

  const handleEnd = () => {
    setIsDrawing(false);
    lastPoint.current = null;
  };

  return (
    <div className="relative rounded-lg overflow-hidden" style={{ width, height }}>
      {/* Content underneath */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
        isRevealed ? 'scale-105' : 'scale-100'
      }`}>
        {children}
      </div>
      
      {/* Scratch canvas overlay */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`absolute inset-0 transition-opacity duration-700 ${
          isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{ 
          touchAction: 'none',
          cursor: COIN_CURSOR,
        }}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onMouseMove={handleMouseMove}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          handleStart(touch.clientX, touch.clientY);
        }}
        onTouchEnd={handleEnd}
        onTouchMove={handleTouchMove}
      />

    </div>
  );
}
