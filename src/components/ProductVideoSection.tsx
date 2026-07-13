import rotatingVideo from '@/assets/video_vesuviano_forno_rotating.mov.asset.json';

const ProductVideoSection = () => (
  <section className="py-16 bg-stone-50">
    <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
      <video
        src={rotatingVideo.url}
        className="w-full rounded-lg shadow-lg"
        controls
        autoPlay
        loop
        playsInline
      />
    </div>
  </section>
);

export default ProductVideoSection;
