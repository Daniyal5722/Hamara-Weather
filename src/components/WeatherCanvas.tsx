import React, { useEffect, useRef } from 'react';
import { WeatherCondition, ThemeMode } from '../types';

interface WeatherCanvasProps {
  condition: WeatherCondition;
  theme: ThemeMode;
}

export const WeatherCanvas: React.FC<WeatherCanvasProps> = ({ condition, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      radius: number;
      length?: number;
      speedY: number;
      speedX: number;
      alpha: number;
      angle?: number;
    }> = [];

    const isRain = condition.includes('Rain') || condition === 'Thunderstorm';
    const isSnow = condition === 'Snow';
    const isCloudy = condition === 'Overcast' || condition === 'Partly Cloudy';

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      const particleCount = isRain ? 120 : isSnow ? 80 : isCloudy ? 40 : 50;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: isRain ? Math.random() * 1.5 + 0.5 : isSnow ? Math.random() * 3 + 1 : Math.random() * 3 + 1,
          length: isRain ? Math.random() * 18 + 8 : undefined,
          speedY: isRain ? Math.random() * 8 + 6 : isSnow ? Math.random() * 1.2 + 0.5 : Math.random() * 0.4 + 0.1,
          speedX: isRain ? Math.random() * 0.5 - 0.25 : isSnow ? Math.sin(Math.random()) * 0.8 : Math.random() * 0.3 - 0.15,
          alpha: Math.random() * 0.6 + 0.2,
          angle: Math.random() * Math.PI * 2
        });
      }
    };

    let flashAlpha = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Random lightning flash for thunderstorm
      if (condition === 'Thunderstorm' && Math.random() < 0.005) {
        flashAlpha = 0.35;
      }

      if (flashAlpha > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        flashAlpha -= 0.03;
      }

      particles.forEach((p) => {
        if (isRain) {
          // Render Rain drops
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + (p.length || 12));
          ctx.strokeStyle = theme === 'dark' ? `rgba(56, 189, 248, ${p.alpha})` : `rgba(14, 165, 233, ${p.alpha * 0.7})`;
          ctx.lineWidth = p.radius;
          ctx.stroke();

          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y > canvas.height) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
          }
        } else if (isSnow) {
          // Render Snowflakes
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
          ctx.fill();

          p.y += p.speedY;
          p.x += Math.sin(p.y * 0.02) * 0.5;

          if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
        } else {
          // Render Atmospheric floating dust/bokeh particles
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          
          if (theme === 'dark') {
            ctx.fillStyle = condition === 'Clear Sky' 
              ? `rgba(253, 224, 71, ${p.alpha * 0.4})` 
              : `rgba(255, 255, 255, ${p.alpha * 0.4})`;
          } else {
            ctx.fillStyle = condition === 'Clear Sky' 
              ? `rgba(234, 179, 8, ${p.alpha * 0.3})` 
              : `rgba(56, 189, 248, ${p.alpha * 0.3})`;
          }
          ctx.fill();

          p.y -= p.speedY;
          p.x += p.speedX;

          if (p.y < -10) {
            p.y = canvas.height + 10;
            p.x = Math.random() * canvas.width;
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    resizeCanvas();
    createParticles();
    render();

    const handleResize = () => {
      resizeCanvas();
      createParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [condition, theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
