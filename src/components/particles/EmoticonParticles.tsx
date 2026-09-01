import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  char: string;
  opacity: number;
  angle: number;
  spinSpeed: number;
  swaySpeed: number;
  swayDist: number;
  initialX: number;
}

const EMOJIS = ['💖', '🌷', '🤍', '💌', '🌹', '✨', '🌸'];
const MAX_PARTICLES = 12;

export const EmoticonParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize only 10-12 lightweight particles
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const char = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      const initialX = Math.random() * canvas.width;
      particles.push({
        x: initialX,
        y: Math.random() * canvas.height,
        size: Math.random() * 8 + 14, // 14px to 22px
        speedY: Math.random() * 0.35 + 0.2, // Smooth, gentle float upwards
        char,
        opacity: Math.random() * 0.35 + 0.15, // Subtle, soft opacity
        angle: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.008,
        swaySpeed: Math.random() * 0.01 + 0.005,
        swayDist: Math.random() * 20 + 10,
        initialX
      });
    }

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speedY;
        p.x = p.initialX + Math.sin(tick * p.swaySpeed) * p.swayDist;
        p.angle += p.spinSpeed;

        // Reset if drifted above the viewport
        if (p.y < -30) {
          p.y = canvas.height + 30;
          p.initialX = Math.random() * canvas.width;
          p.x = p.initialX;
          p.char = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
          p.opacity = Math.random() * 0.35 + 0.15;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.char, 0, 0);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Subtle gentle click interaction that caps at MAX_PARTICLES
    const handleCanvasClick = (e: MouseEvent) => {
      if (particles.length >= MAX_PARTICLES + 2) return;
      const clickX = e.clientX;
      const clickY = e.clientY;
      const char = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

      particles.push({
        x: clickX,
        y: clickY,
        size: 18,
        speedY: 0.8,
        char,
        opacity: 0.7,
        angle: 0,
        spinSpeed: 0.01,
        swaySpeed: 0.02,
        swayDist: 10,
        initialX: clickX
      });

      if (particles.length > MAX_PARTICLES + 2) {
        particles.shift();
      }
    };

    window.addEventListener('click', handleCanvasClick, { passive: true });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.65 }}
    />
  );
};

