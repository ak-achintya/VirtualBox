import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';

export const BackgroundCanvas = () => {
  const { genreTheme } = useApp();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Approved Prismatic Glass Light Colors based on theme
    const getThemeColor = () => {
      switch (genreTheme) {
        case 'horror': return ['rgba(251, 113, 133, 0.16)', 'rgba(136, 19, 55, 0.25)', 'rgba(225, 29, 72, 0.14)'];
        case 'scifi': return ['rgba(200, 182, 255, 0.22)', 'rgba(124, 58, 237, 0.20)', 'rgba(232, 121, 249, 0.16)'];
        case 'action': return ['rgba(253, 186, 116, 0.22)', 'rgba(249, 115, 22, 0.18)', 'rgba(239, 68, 68, 0.16)'];
        case 'romance': return ['rgba(244, 114, 182, 0.22)', 'rgba(251, 113, 133, 0.18)', 'rgba(200, 182, 255, 0.18)'];
        case 'fantasy': return ['rgba(168, 85, 247, 0.22)', 'rgba(200, 182, 255, 0.18)', 'rgba(16, 185, 129, 0.14)'];
        case 'mystery': return ['rgba(139, 92, 246, 0.20)', 'rgba(109, 40, 217, 0.22)', 'rgba(200, 182, 255, 0.14)'];
        case 'comedy': return ['rgba(253, 186, 116, 0.22)', 'rgba(244, 114, 182, 0.18)', 'rgba(200, 182, 255, 0.16)'];
        default: return ['rgba(200, 182, 255, 0.22)', 'rgba(124, 58, 237, 0.18)', 'rgba(244, 114, 182, 0.18)'];
      }
    };

    const colors = getThemeColor();
    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 90 + 40,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulseSpeed: Math.random() * 0.015 + 0.005,
      pulseFactor: Math.random() * Math.PI,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -p.radius) p.x = canvas.width + p.radius;
        if (p.x > canvas.width + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = canvas.height + p.radius;
        if (p.y > canvas.height + p.radius) p.y = -p.radius;

        p.pulseFactor += p.pulseSpeed;
        const currentRadius = p.radius + Math.sin(p.pulseFactor) * 12;

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentRadius);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [genreTheme]);

  return (
    <>
      <div className="ambient-glow-bg" />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 opacity-70"
      />
    </>
  );
};
