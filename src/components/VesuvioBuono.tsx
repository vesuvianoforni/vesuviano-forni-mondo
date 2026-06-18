import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, Award, Flame, Shield, CheckCircle } from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import { useTranslation } from 'react-i18next';

const VesuvioBuono = () => {
  const { t } = useTranslation();

  return (
    <section id="vesuviobuono" className="py-20 bg-vesuviano-900 relative overflow-hidden">
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <Badge className="bg-vesuviano-500 text-white px-6 py-3 text-xl font-bold animate-scale-in border-none">
                <Leaf className="mr-3" size={24} />
                {t('vesuvioBuono.badges.exclusive')}
              </Badge>
              <Badge className="bg-amber-600 text-white px-6 py-3 text-xl font-bold animate-scale-in border-none" style={{ animationDelay: '0.1s' }}>
                <Shield className="mr-3" size={24} />
                {t('vesuvioBuono.badges.patented')}
              </Badge>
            </div>
            <h2 className="font-playfair text-5xl md:text-7xl font-bold text-white mb-6 animate-slide-in-left">
              Vesuvio<span className="text-vesuviano-500 drop-shadow-lg">Buono</span>
            </h2>
            <p className="font-inter text-xl text-vesuviano-200 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {t('vesuvioBuono.subtitle')}
            </p>
          </div>

          {/* Video Section */}
          <div className="mb-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="max-w-4xl mx-auto bg-stone-900 rounded-xl p-6 border-2 border-vesuviano-400 hover:border-vesuviano-300 transition-all duration-300">
              <h3 className="font-playfair text-2xl font-semibold text-vesuviano-100 mb-4 text-center">
                {t('vesuvioBuono.videoTitle')}
              </h3>
              <div className="aspect-video rounded-lg overflow-hidden relative">
                <VideoPlayer
                  src="https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/videos/ENG%20-%20VIDEO%20PRESENTAZIONE%20VESUVIO%20BUONO%20(1)%20-%20RESIZE%20-%20Videobolt.net.mp4"
                  poster="/lovable-uploads/vesuviobuono-forno-azione.webp"
                  className="w-full h-full"
                />
                {/* Overlay to hide watermark in bottom right */}
                <div className="absolute bottom-0 right-0 w-32 h-16 bg-gradient-to-l from-vesuviano-900 via-vesuviano-900/80 to-transparent pointer-events-none"></div>
              </div>
              <p className="text-vesuviano-200 text-center mt-4 text-sm">
                {t('vesuvioBuono.videoDescription')}
              </p>
            </div>
          </div>

          {/* Photo Gallery Section */}
          <div className="mb-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Photo Slot 1 */}
              <div className="bg-stone-900 rounded-xl p-4 border-2 border-vesuviano-400 hover:border-vesuviano-300 transition-all duration-300 hover:scale-105">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img 
                    src="/lovable-uploads/vesuviobuono-forno-azione.webp" 
                    alt="Forno VesuvioBuono in azione" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-vesuviano-400 text-center mt-2 text-sm">{t('vesuvioBuono.gallery.ovenInAction')}</p>
              </div>
              
              {/* Photo Slot 2 */}
              <div className="bg-stone-900 rounded-xl p-4 border-2 border-vesuviano-400 hover:border-vesuviano-300 transition-all duration-300 hover:scale-105">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img 
                    src="/lovable-uploads/vesuviobuono-zero-emissioni.webp" 
                    alt="Forno VesuvioBuono zero emissioni" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-vesuviano-400 text-center mt-2 text-sm">{t('vesuvioBuono.gallery.zeroEmissions')}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-slide-in-left" style={{ animationDelay: '0.7s' }}>
              <div className="bg-white rounded-xl shadow-2xl p-8 border border-vesuviano-200 hover:shadow-vesuviano-500/20 transition-all duration-500 hover:scale-105">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-vesuviano-500 rounded-full flex items-center justify-center mr-4">
                    <Leaf className="text-white" size={28} />
                  </div>
                  <h3 className="font-playfair text-2xl font-semibold text-charcoal-900">
                    {t('vesuvioBuono.features.zeroEmissions.title')}
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="border-l-4 border-vesuviano-500 pl-4 hover:border-l-8 transition-all duration-300 relative">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-stone-900">{t('vesuvioBuono.features.patented.title')}</h4>
                      <Badge className="bg-amber-100 text-amber-800 px-2 py-1 text-xs border-amber-200">
                        <CheckCircle className="mr-1" size={12} />
                        PATENT
                      </Badge>
                    </div>
                    <p className="text-stone-600">{t('vesuvioBuono.features.patented.description')}</p>
                  </div>

                  <div className="border-l-4 border-copper-500 pl-4 hover:border-l-8 transition-all duration-300">
                    <h4 className="font-semibold text-charcoal-900 mb-2">{t('vesuvioBuono.features.certifications.title')}</h4>
                    <p className="text-stone-600">{t('vesuvioBuono.features.certifications.description')}</p>
                  </div>

                  <div className="border-l-4 border-vesuviano-400 pl-4 hover:border-l-8 transition-all duration-300">
                    <h4 className="font-semibold text-charcoal-900 mb-2">{t('vesuvioBuono.features.dualFuel.title')}</h4>
                    <p className="text-stone-600">{t('vesuvioBuono.features.dualFuel.description')}</p>
                  </div>
                </div>

                {/* Additional Photo Slots */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-stone-100 rounded-lg p-3 hover:scale-105 transition-all duration-300">
                    <div className="aspect-square rounded overflow-hidden">
                      <img 
                        src="/lovable-uploads/vesuviobuono-forno-legna.webp" 
                        alt="Installazione VesuvioBuono" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-stone-600 text-center mt-2 text-xs">{t('vesuvioBuono.gallery.woodOven')}</p>
                  </div>
                  <div className="bg-stone-100 rounded-lg p-3 hover:scale-105 transition-all duration-300">
                    <div className="aspect-square rounded overflow-hidden">
                      <img 
                        src="/lovable-uploads/vesuviobuono-ostepizza-aperto.webp" 
                        alt="Certificazioni VesuvioBuono" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-stone-600 text-center mt-2 text-xs">{t('vesuvioBuono.gallery.smokePurifier')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="animate-slide-in-right" style={{ animationDelay: '0.9s' }}>
              <div className="bg-vesuviano-600 text-white rounded-xl p-8 shadow-2xl border border-vesuviano-400 hover:border-vesuviano-300 transition-all duration-500 hover:scale-105">
                <div className="flex items-center mb-6">
                  <Award className="mr-3" size={36} />
                  <h3 className="font-playfair text-3xl font-semibold">
                    {t('vesuvioBuono.advantages.title')}
                  </h3>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start hover:translate-x-2 transition-transform duration-300">
                    <div className="w-3 h-3 bg-vesuviano-200 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <span>{t('vesuvioBuono.advantages.list.0')}</span>
                  </li>
                  <li className="flex items-start hover:translate-x-2 transition-transform duration-300">
                    <div className="w-3 h-3 bg-vesuviano-200 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <span>{t('vesuvioBuono.advantages.list.1')}</span>
                  </li>
                  <li className="flex items-start hover:translate-x-2 transition-transform duration-300">
                    <div className="w-3 h-3 bg-vesuviano-200 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <span>{t('vesuvioBuono.advantages.list.2')}</span>
                  </li>
                  <li className="flex items-start hover:translate-x-2 transition-transform duration-300">
                    <div className="w-3 h-3 bg-vesuviano-200 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <span>{t('vesuvioBuono.advantages.list.3')}</span>
                  </li>
                  <li className="flex items-start hover:translate-x-2 transition-transform duration-300">
                    <div className="w-3 h-3 bg-vesuviano-200 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <span>{t('vesuvioBuono.advantages.list.4')}</span>
                  </li>
                </ul>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-white text-vesuviano-700 hover:bg-stone-100 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg">
                        <Download className="mr-2" size={20} />
                        {t('vesuvioBuono.downloadSheet')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="text-vesuviano-800">{t('vesuvioBuono.modal.title')}</DialogTitle>
                        <DialogDescription>
                          {t('vesuvioBuono.modal.description')}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="firstName">{t('vesuvioBuono.modal.firstName')}</Label>
                            <Input
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="lastName">{t('vesuvioBuono.modal.lastName')}</Label>
                            <Input
                              id="lastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">{t('vesuvioBuono.modal.email')}</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="city">{t('vesuvioBuono.modal.city')}</Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="phone">{t('vesuvioBuono.modal.phone')}</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          {t('vesuvioBuono.modal.cancel')}
                        </Button>
                        <Button onClick={handleDownloadPDF} className="bg-vesuviano-600 hover:bg-vesuviano-700">
                          {t('vesuvioBuono.modal.download')}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Additional Photo Slot in Right Column */}
                <div className="mt-8">
                  <div className="bg-vesuviano-700 rounded-lg p-4 hover:scale-105 transition-all duration-300">
                    <div className="aspect-video rounded overflow-hidden">
                      <img 
                        src="/lovable-uploads/artigiano-lavorazione.webp" 
                        alt="Produzione artigianale VesuvioBuono" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-vesuviano-200 text-center mt-2 text-sm">Produzione Artigianale</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Abbattitore di Fuliggine Section - PROMINENTE */}
          <div className="mt-20 mb-20 animate-fade-in" style={{ animationDelay: '1.1s' }}>
            <div className="bg-gradient-to-br from-stone-800 via-stone-900 to-vesuviano-900/30 rounded-2xl shadow-2xl p-12 md:p-16 border-4 border-vesuviano-400 hover:border-vesuviano-300 transition-all duration-500 hover:shadow-vesuviano-500/50 relative overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-vesuviano-500/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-vesuviano-400/5 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                      <div className="flex items-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-vesuviano-500 rounded-full flex items-center justify-center mr-4 shadow-lg shadow-vesuviano-500/50 animate-pulse">
                          <Leaf className="text-white" size={36} />
                        </div>
                        <h3 className="font-playfair text-3xl md:text-5xl font-bold text-white leading-tight">
                          Zero Emissioni
                        </h3>
                      </div>
                      <Badge className="bg-amber-600 text-white px-5 py-3 text-base md:text-lg font-bold border-none shadow-xl animate-pulse self-start md:self-auto">
                        <Shield className="mr-2" size={20} />
                        PATENT
                      </Badge>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-vesuviano-500/10 border-l-4 border-vesuviano-400 rounded-r-lg p-5">
                        <h4 className="font-bold text-vesuviano-200 mb-3 text-xl">Tecnologia Brevettata</h4>
                        <p className="text-vesuviano-100 text-lg leading-relaxed">
                          Sistema di combustione completa che elimina il <strong className="text-white">99,9% delle particelle di fuliggine</strong>.
                        </p>
                      </div>

                      <div className="bg-stone-700/30 border-l-4 border-vesuviano-300 rounded-r-lg p-5">
                        <h4 className="font-bold text-vesuviano-200 mb-3 text-xl">Certificazioni Ambientali</h4>
                        <p className="text-vesuviano-100 text-lg">
                          Conforme ai più rigidi standard europei e internazionali sulle emissioni.
                        </p>
                      </div>

                      <div className="bg-vesuviano-600/10 border-l-4 border-vesuviano-400 rounded-r-lg p-5">
                        <h4 className="font-bold text-vesuviano-200 mb-3 text-xl">Doppia Alimentazione</h4>
                        <p className="text-vesuviano-100 text-lg">
                          Funziona perfettamente sia a legna che in combinazione gas/legna.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-stone-800/50 rounded-xl p-6 border-2 border-vesuviano-400/40 shadow-2xl hover:scale-105 transition-all duration-300">
                    <div className="aspect-video rounded-lg overflow-hidden shadow-xl">
                      <img 
                        src="/lovable-uploads/abbattitore-fuliggine-acqua.webp" 
                        alt="Abbattitore di Fuliggine ad Acqua - Sistema interno" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-vesuviano-200 text-center mt-4 text-base font-semibold">
                      Sistema Interno Abbattitore Fuliggine
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '1.2s' }}>
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-3xl mx-auto border border-vesuviano-200 hover:shadow-vesuviano-500/30 transition-all duration-500 hover:scale-105">
              <Flame className="mx-auto text-vesuviano-600 mb-4" size={48} />
              <h4 className="font-playfair text-3xl font-semibold text-charcoal-900 mb-4">
                Vuoi essere tra i primi al mondo?
              </h4>
              <p className="text-stone-600 mb-6 text-lg">
                VesuvioBuono rappresenta il futuro della cottura a legna. 
                Contattaci per avere informazioni esclusive e priorità nella produzione.
              </p>
              <Button 
                size="lg"
                className="bg-vesuviano-500 hover:bg-vesuviano-600 text-white px-10 py-4 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Diventa Partner Esclusivo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VesuvioBuono;
