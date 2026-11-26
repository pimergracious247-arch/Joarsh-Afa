import { useEffect, useState } from 'react';

interface ViewportMetrics {
  isMdUp: boolean;
  isLgUp: boolean;
  isShortViewport: boolean;
}

function readViewportMetrics(): ViewportMetrics {
  if (typeof window === 'undefined') {
    return { isMdUp: false, isLgUp: false, isShortViewport: false };
  }
  return {
    isMdUp: window.innerWidth >= 768,
    isLgUp: window.innerWidth >= 1024,
    isShortViewport: window.innerHeight < 740,
  };
}

export function useViewportMetrics(): ViewportMetrics {
  const [metrics, setMetrics] = useState<ViewportMetrics>(readViewportMetrics);

  useEffect(() => {
    const onResize = () => {
      setMetrics(readViewportMetrics());
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return metrics;
}
