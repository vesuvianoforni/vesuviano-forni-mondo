import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ChefHat, Home, Flame, Zap, TreePine, ArrowLeft, ArrowRight, Loader2, Sparkles, CheckCircle2, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OvenFinderQuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 0 | 1 | 2 | 3 | 4 | 5; // 0..3 questions, 4 contacts, 5 result

interface Answers {
  usage: string;
  covers: string;
  style: string;
  fuel: string;
  name: string;
  email: string;
  phone: string;
}

interface Recommendation {
  model_name: string;
  explanation: string;
  diameter?: number;
  capacity?: string;
}

const OvenFinderQuizModal = ({ open, onOpenChange }: OvenFinderQuizModalProps) => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState<Step>(0);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [answers, setAnswers] = useState<Answers>({
    usage: "", covers: "", style: "", fuel: "",
    name: "", email: "", phone: "",
  });

  const totalSteps = 5;
  const progress = ((step + 1) / totalSteps) * 100;

  const reset = () => {
    setStep(0);
    setRecommendation(null);
    setAnswers({ usage: "", covers: "", style: "", fuel: "", name: "", email: "", phone: "" });
  };

  const handleClose = (o: boolean) => {
    if (!o) setTimeout(reset, 300);
    onOpenChange(o);
  };

  const next = () => setStep((s) => Math.min(5, s + 1) as Step);
  const prev = () => setStep((s) => Math.max(0, s - 1) as Step);

  const select = (key: keyof Answers, value: string) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    setTimeout(() => next(), 200);
  };

  const submit = async () => {
    if (!answers.name.trim() || !answers.email.trim() || !answers.phone.trim()) {
      toast.error(t("ovenFinder.fillAll", "Please fill all fields"));
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("oven-finder-recommend", {
        body: { ...answers, lang: i18n.language || "en" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRecommendation(data.recommendation);
      setStep(5);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || t("ovenFinder.error", "Something went wrong, please try again"));
    } finally {
      setLoading(false);
    }
  };

  const usageOptions = [
    { id: "pizzeria", icon: ChefHat, label: t("ovenFinder.q1.pizzeria", "Pizzeria / Restaurant") },
    { id: "private", icon: Home, label: t("ovenFinder.q1.private", "Private use") },
  ];
  const coversOptions = [
    { id: "0-30", label: t("ovenFinder.q2.small", "Up to 30 covers") },
    { id: "30-60", label: t("ovenFinder.q2.medium", "30 - 60 covers") },
    { id: "60-100", label: t("ovenFinder.q2.large", "60 - 100 covers") },
    { id: "100+", label: t("ovenFinder.q2.xlarge", "100+ covers") },
  ];
  const styleOptions = [
    { id: "traditional", label: t("ovenFinder.q3.traditional", "Traditional Neapolitan") },
    { id: "modern", label: t("ovenFinder.q3.modern", "Modern / Contemporary") },
    { id: "romana", label: t("ovenFinder.q3.romana", "Roman / Pinsa") },
    { id: "mixed", label: t("ovenFinder.q3.mixed", "Mixed menu") },
  ];
  const fuelOptions = [
    { id: "wood", icon: TreePine, label: t("ovenFinder.q4.wood", "Wood") },
    { id: "gas", icon: Flame, label: t("ovenFinder.q4.gas", "Gas") },
    { id: "electric", icon: Zap, label: t("ovenFinder.q4.electric", "Electric") },
    { id: "any", icon: Sparkles, label: t("ovenFinder.q4.any", "No preference") },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-gradient-to-br from-vesuviano-600 to-vesuviano-800 px-6 py-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-wider uppercase">
              {t("ovenFinder.badge", "AI Oven Finder")}
            </span>
          </div>
          <h2 className="font-playfair text-xl sm:text-2xl font-bold">
            {step < 4 && t("ovenFinder.title", "Find your perfect oven")}
            {step === 4 && t("ovenFinder.contactTitle", "Almost there! Discover our match")}
            {step === 5 && t("ovenFinder.resultTitle", "Your perfect match")}
          </h2>
          {step < 5 && (
            <Progress value={progress} className="mt-3 h-1.5 bg-white/20" />
          )}
        </div>

        <div className="p-6">
          {/* Step 0: Usage */}
          {step === 0 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm text-muted-foreground">{t("ovenFinder.q1.question", "What will you use the oven for?")}</p>
              <div className="grid grid-cols-2 gap-3">
                {usageOptions.map((o) => {
                  const Icon = o.icon;
                  return (
                    <button
                      key={o.id}
                      onClick={() => select("usage", o.id)}
                      className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-vesuviano-500 hover:bg-vesuviano-50 transition-all"
                    >
                      <Icon className="w-8 h-8 text-vesuviano-600" />
                      <span className="text-sm font-medium text-center">{o.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 1: Covers */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm text-muted-foreground">
                {answers.usage === "private"
                  ? t("ovenFinder.q2.questionPrivate", "How many people will you cook for?")
                  : t("ovenFinder.q2.question", "How many covers does your venue have?")}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {coversOptions.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => select("covers", o.id)}
                    className="p-4 rounded-xl border-2 border-border hover:border-vesuviano-500 hover:bg-vesuviano-50 transition-all text-sm font-medium"
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Style */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm text-muted-foreground">{t("ovenFinder.q3.question", "What style of pizza do you make?")}</p>
              <div className="grid grid-cols-1 gap-2">
                {styleOptions.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => select("style", o.id)}
                    className="p-4 rounded-xl border-2 border-border hover:border-vesuviano-500 hover:bg-vesuviano-50 transition-all text-sm font-medium text-left"
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Fuel */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm text-muted-foreground">{t("ovenFinder.q4.question", "Any fuel preference?")}</p>
              <div className="grid grid-cols-2 gap-3">
                {fuelOptions.map((o) => {
                  const Icon = o.icon;
                  return (
                    <button
                      key={o.id}
                      onClick={() => select("fuel", o.id)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border hover:border-vesuviano-500 hover:bg-vesuviano-50 transition-all"
                    >
                      <Icon className="w-6 h-6 text-vesuviano-600" />
                      <span className="text-xs font-medium text-center">{o.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Contacts */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm text-muted-foreground">
                {t("ovenFinder.contactSubtitle", "Leave your details to discover our personalized AI recommendation. An expert will then reach out for further details.")}
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1">{t("ovenFinder.name", "Name")}*</label>
                  <Input
                    value={answers.name}
                    onChange={(e) => setAnswers((a) => ({ ...a, name: e.target.value }))}
                    placeholder={t("ovenFinder.namePh", "Your name")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">{t("ovenFinder.email", "Email")}*</label>
                  <Input
                    type="email"
                    value={answers.email}
                    onChange={(e) => setAnswers((a) => ({ ...a, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">{t("ovenFinder.phone", "Phone")}*</label>
                  <Input
                    type="tel"
                    value={answers.phone}
                    onChange={(e) => setAnswers((a) => ({ ...a, phone: e.target.value }))}
                    placeholder="+39 333..."
                  />
                </div>
              </div>
              <Button
                onClick={submit}
                disabled={loading}
                size="lg"
                className="w-full bg-vesuviano-600 hover:bg-vesuviano-700"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("ovenFinder.analyzing", "Analyzing your needs...")}</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> {t("ovenFinder.reveal", "Reveal my perfect oven")}</>
                )}
              </Button>
            </div>
          )}

          {/* Step 5: Result */}
          {step === 5 && recommendation && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-vesuviano-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-vesuviano-600" />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  {t("ovenFinder.weRecommend", "We recommend")}
                </p>
                <h3 className="font-playfair text-2xl font-bold text-vesuviano-700">
                  {recommendation.model_name}
                </h3>
                {recommendation.diameter && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Ø {recommendation.diameter} cm
                    {recommendation.capacity && ` • ${recommendation.capacity}`}
                  </p>
                )}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed bg-vesuviano-50/50 rounded-lg p-4">
                {recommendation.explanation}
              </p>
              <div className="bg-stone-100 rounded-lg p-4 flex items-start gap-3 text-left">
                <Phone className="w-5 h-5 text-vesuviano-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  {t("ovenFinder.expertContact", "Our expert will contact you shortly to help you with all the details and a personalized quote.")}
                </p>
              </div>
              <Button onClick={() => handleClose(false)} variant="outline" className="w-full">
                {t("ovenFinder.close", "Close")}
              </Button>
            </div>
          )}

          {/* Nav buttons */}
          {step > 0 && step < 4 && (
            <div className="flex justify-between mt-6">
              <Button variant="ghost" size="sm" onClick={prev}>
                <ArrowLeft className="w-4 h-4 mr-1" /> {t("ovenFinder.back", "Back")}
              </Button>
            </div>
          )}
          {step === 4 && (
            <Button variant="ghost" size="sm" onClick={prev} className="mt-3">
              <ArrowLeft className="w-4 h-4 mr-1" /> {t("ovenFinder.back", "Back")}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OvenFinderQuizModal;
