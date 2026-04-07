import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Flame, Shield, Clock, MapPin, Phone, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import LazyImage from "@/components/LazyImage";

const WHATSAPP_LINK = "https://wa.me/393773aborni";

const reviews = [
  {
    name: "James W.",
    location: "London, UK",
    text: "The team came and built our oven in just 3 days. The quality is extraordinary — nothing like what you find in the UK. Our pizzas taste like Naples now.",
    stars: 5,
  },
  {
    name: "Sophie M.",
    location: "Surrey, UK",
    text: "We chose the built-on-place option and it was the best decision. The craftsmen were incredible, and the oven is a work of art in our garden.",
    stars: 5,
  },
  {
    name: "David R.",
    location: "Manchester, UK",
    text: "From order to completion in under 4 weeks. The volcanic sand finish is stunning and the heat retention is unbelievable. Worth every penny.",
    stars: 5,
  },
];

const BuiltOnPlace = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Required fields",
        description: "Please fill in name, email and phone.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Save as website lead
      await supabase.from("website_leads").insert({
        first_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.country,
        notes: formData.message,
        form_type: "built-on-place-landing",
        oven_type: "Built on Place",
        status: "new",
      });

      // Also send email
      await supabase.functions.invoke("send-consultation-email", {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          ovenType: "Built on Place (Meta Campaign)",
          message: formData.message || "Lead from Built on Place landing page",
        },
      });

      navigate("/en/thank-you-en");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again or contact us on WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 overflow-hidden">
        <div className="absolute inset-0">
          <LazyImage
            src="/lovable-uploads/255a7344-f5ab-411b-8b37-6ed61e01d472.png"
            alt=""
            className="absolute top-6 left-6 h-10 w-auto opacity-80 z-10"
            priority
          />
          <LazyImage
            src="https://xvccwwusmraonezalabc.supabase.co/storage/v1/object/public/oven-images/gallery/built-on-site-hero.jpg"
            alt="Authentic Neapolitan oven built on site"
            className="w-full h-full object-cover opacity-40"
            priority
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-20 text-center">
          <Badge className="bg-vesuviano-500 text-white px-5 py-2 text-sm font-bold mb-6 animate-fade-in">
            <Flame className="mr-2" size={16} />
            HANDCRAFTED IN ITALY · BUILT AT YOUR HOME
          </Badge>
          <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Your Authentic Neapolitan<br />
            <span className="text-vesuviano-400">Pizza Oven</span>, Built On-Site
          </h1>
          <p className="text-lg sm:text-xl text-stone-300 max-w-2xl mx-auto mb-4">
            Our master craftsmen travel from Naples to build your oven directly at your home. 
            Made with volcanic sand from Mount Vesuvius.
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-white mb-8">
            Starting from <span className="text-vesuviano-400">£13,500</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-vesuviano-500 hover:bg-vesuviano-600 text-white text-lg px-10 py-6 shadow-2xl"
              onClick={scrollToForm}
            >
              Get Your Free Quote
            </Button>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="bg-[#25D366] hover:bg-[#1da851] text-white text-lg px-10 py-6 w-full sm:w-auto"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.325 0-4.47-.744-6.228-2.01l-.436-.328-2.848.955.955-2.848-.328-.436A9.955 9.955 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                WhatsApp Us
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-stone-100 py-6 border-b border-stone-200">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-8 text-center">
          {[
            { icon: Shield, text: "2-Year Warranty" },
            { icon: Flame, text: "Volcanic Sand Construction" },
            { icon: Clock, text: "Built in 3-5 Days" },
            { icon: MapPin, text: "UK & Europe Delivery" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-stone-700 font-medium text-sm">
              <Icon size={18} className="text-vesuviano-500" />
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* Why Built On-Site */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            Why Choose <span className="text-vesuviano-600">Built On-Site</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Fits Through Any Door",
                desc: "Our ovens are assembled on-site, piece by piece. They pass through spaces as narrow as 45 cm — doorways where no pre-built oven could ever fit.",
                img: "/lovable-uploads/fits-through-door.jpg",
              },
              {
                title: "Authentic Craftsmanship",
                desc: "Neapolitan master builders use techniques passed down through generations, with real volcanic sand from Mount Vesuvius.",
                img: "https://xvccwwusmraonezalabc.supabase.co/storage/v1/object/public/oven-images/gallery/vesuviano-traditional-2.jpg",
              },
              {
                title: "Superior Performance",
                desc: "On-site construction allows for optimal thermal mass, reaching 500°C and retaining heat for hours.",
                img: "/lovable-uploads/built-on-place-oven.png",
              },
            ].map((item) => (
              <div key={item.title} className="bg-stone-50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <LazyImage src={item.img} alt={item.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="font-playfair text-xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="bg-stone-900 py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-white mb-8">
            Watch Our Craftsmen at Work
          </h2>
          <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/VIDEO_ID_HERE"
              title="Vesuviano Oven Built On Site"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="text-stone-400 mt-6 text-sm">
            From volcanic sand to your garden — the complete journey of a Vesuviano oven
          </p>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 md:py-20 bg-vesuviano-50/30">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            What Our Customers Say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <div key={r.name} className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm mb-4 italic">"{r.text}"</p>
                <div>
                  <p className="font-bold text-foreground text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Strip */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              "https://xvccwwusmraonezalabc.supabase.co/storage/v1/object/public/oven-images/gallery/vesuviano-1.jpg",
              "https://xvccwwusmraonezalabc.supabase.co/storage/v1/object/public/oven-images/gallery/vesuviano-2.jpg",
              "https://xvccwwusmraonezalabc.supabase.co/storage/v1/object/public/oven-images/gallery/vesuviano-3.jpg",
              "https://xvccwwusmraonezalabc.supabase.co/storage/v1/object/public/oven-images/gallery/vesuviano-4.jpg",
            ].map((src, i) => (
              <LazyImage key={i} src={src} alt={`Vesuviano oven ${i + 1}`} className="w-full h-48 md:h-64 object-cover rounded-xl" />
            ))}
          </div>
        </div>
      </section>

      {/* Lead Form */}
      <section id="lead-form" className="py-16 md:py-20 bg-gradient-to-br from-stone-900 to-stone-800">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
          <div className="text-center mb-10">
            <Badge className="bg-vesuviano-500 text-white px-4 py-2 text-sm font-bold mb-4">
              <CheckCircle className="mr-2" size={16} />
              FREE CONSULTATION
            </Badge>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-white mb-3">
              Get Your Free Quote Today
            </h2>
            <p className="text-stone-300">
              Starting from <span className="text-vesuviano-400 font-bold text-xl">£13,500</span> · No obligation · Response within 24h
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl space-y-4">
            <Input
              placeholder="Your Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="h-12"
            />
            <Input
              type="email"
              placeholder="Email Address *"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="h-12"
            />
            <Input
              type="tel"
              placeholder="Phone Number *"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="h-12"
            />
            <Input
              placeholder="Country / City"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="h-12"
            />
            <Textarea
              placeholder="Tell us about your project (optional)"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-vesuviano-500 hover:bg-vesuviano-600 text-white text-lg h-14 shadow-lg"
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 animate-spin" size={20} /> Sending...</>
              ) : (
                "Get My Free Quote →"
              )}
            </Button>
            <div className="flex items-center justify-center gap-4 pt-2">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.325 0-4.47-.744-6.228-2.01l-.436-.328-2.848.955.955-2.848-.328-.436A9.955 9.955 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                Or WhatsApp us directly
              </a>
              <span className="text-stone-300">|</span>
              <div className="flex items-center gap-1 text-sm text-stone-500">
                <Phone size={14} />
                +39 377 XXX XXXX
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 bg-vesuviano-500 text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to bring Naples to your garden?
          </h2>
          <p className="text-white/80 mb-6">Starting from £13,500 · Free consultation · Handcrafted in Italy</p>
          <Button
            size="lg"
            className="bg-white text-vesuviano-600 hover:bg-stone-100 text-lg px-10 py-6 font-bold"
            onClick={scrollToForm}
          >
            Get Your Free Quote Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default BuiltOnPlace;
