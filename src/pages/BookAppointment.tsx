import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, Phone, MessageCircle, Video } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import LanguageSelector from "@/components/LanguageSelector";

const BookAppointment = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detect browser language on mount
  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    const supportedLanguages = ['it', 'en', 'fr', 'es', 'de'];
    
    if (supportedLanguages.includes(browserLang) && i18n.language !== browserLang) {
      i18n.changeLanguage(browserLang);
    }
  }, [i18n]);

  const formSchema = z.object({
    date: z.date({
      required_error: t("bookSlot.validation.dateRequired"),
    }),
    time: z.string().min(1, t("bookSlot.validation.timeRequired")),
    contactMethod: z.enum(["whatsapp", "phone", "googlemeet"], {
      required_error: t("bookSlot.validation.contactMethodRequired"),
    }),
    phoneNumber: z.string().min(8, t("bookSlot.validation.phoneInvalid")).max(20),
  });

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactMethod: "whatsapp",
    },
  });

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00"
  ];

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-form-data", {
        body: {
          formType: "appointment",
          data: {
            date: format(data.date, "dd/MM/yyyy"),
            time: data.time,
            contactMethod: data.contactMethod,
            phoneNumber: data.phoneNumber,
          },
        },
      });

      if (error) throw error;

      navigate('/thank-you');
    } catch (error) {
      console.error("Error submitting appointment:", error);
      toast.error(t("bookSlot.errorMessage"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Language Selector */}
        <div className="flex justify-end mb-6">
          <LanguageSelector />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t("bookSlot.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("bookSlot.subtitle")}
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-8 border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Date Picker */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-base font-semibold">
                      {t("bookSlot.dateLabel")}
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal h-12",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MMMM dd, yyyy")
                            ) : (
                              <span>{t("bookSlot.datePlaceholder")}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Time Picker */}
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      {t("bookSlot.timeLabel")}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder={t("bookSlot.timePlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {time}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contact Method */}
              <FormField
                control={form.control}
                name="contactMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-semibold">
                      {t("bookSlot.contactMethodLabel")}
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-3"
                      >
                        <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent transition-colors">
                          <RadioGroupItem value="whatsapp" id="whatsapp" />
                          <label
                            htmlFor="whatsapp"
                            className="flex items-center gap-3 cursor-pointer flex-1"
                          >
                            <MessageCircle className="h-5 w-5 text-green-600" />
                            <span className="font-medium">{t("bookSlot.whatsapp")}</span>
                          </label>
                        </div>
                        <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent transition-colors">
                          <RadioGroupItem value="phone" id="phone" />
                          <label
                            htmlFor="phone"
                            className="flex items-center gap-3 cursor-pointer flex-1"
                          >
                            <Phone className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">{t("bookSlot.phone")}</span>
                          </label>
                        </div>
                        <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent transition-colors">
                          <RadioGroupItem value="googlemeet" id="googlemeet" />
                          <label
                            htmlFor="googlemeet"
                            className="flex items-center gap-3 cursor-pointer flex-1"
                          >
                            <Video className="h-5 w-5 text-purple-600" />
                            <span className="font-medium">{t("bookSlot.googleMeet")}</span>
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      {t("bookSlot.phoneLabel")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("bookSlot.phonePlaceholder")}
                        {...field}
                        className="h-12"
                        type="tel"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("bookSlot.submittingButton") : t("bookSlot.submitButton")}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
