import { useEffect, useState } from 'react';
import { imageStore } from '../store/imageStore.js';

export function useImageSrc(ref) {
  const [src, setSrc] = useState(() => imageStore.peek(ref));
  useEffect(() => {
    let alive = true;
    setSrc(imageStore.peek(ref));
    imageStore.url(ref).then((url) => alive && setSrc(url));
    return () => {
      alive = false;
    };
  }, [ref]);
  return src;
}
