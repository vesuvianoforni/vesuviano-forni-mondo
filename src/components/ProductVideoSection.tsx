import { useEffect, useRef } from 'react';
import rotatingVideo from '@/assets/video_vesuviano_forno_rotating.mov.asset.json';

const ProductVideoSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch((error) => {
                if (error.name === 'NotAllowedError' && !video.muted) {
                  video.muted = true;
                  video.play().catch(() => {
                    // Browser still blocks autoplay; user can start via controls.
                  });
                }
              });
            }
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section className="py-16 bg-stone-50">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <video
          ref={videoRef}
          src={rotatingVideo.url}
          className="w-full rounded-lg shadow-lg"
          controls
          loop
          playsInline
          preload="metadata"
        />
      </div>
    </section>
  );
};

export default ProductVideoSection;
