import { useCallback } from 'react';

export function useConfetti() {
  const fireConfetti = useCallback(() => {
    // Simple confetti implementation using DOM
    const colors = ['#00A3FF', '#00D2C4', '#10B981', '#F59E0B', '#EF4444'];
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.inset = '0';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    document.body.appendChild(container);

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'absolute';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.top = '-10px';
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      container.appendChild(confetti);

      // Animate falling
      const animation = confetti.animate([
        { top: '-10px', opacity: 1 },
        { top: '100vh', opacity: 0 }
      ], {
        duration: 2000 + Math.random() * 2000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      });

      animation.onfinish = () => confetti.remove();
    }

    // Clean up container after all animations
    setTimeout(() => container.remove(), 5000);
  }, []);

  return fireConfetti;
}