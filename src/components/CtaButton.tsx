import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useConsultationModal } from "@/contexts/ConsultationModalContext";

interface CtaButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  onClick?: () => void;
  showSubtext?: boolean;
  dark?: boolean;
}

const CtaButton = ({ className, size = "lg", variant, onClick, showSubtext = true, dark = false }: CtaButtonProps) => {
  const { t } = useTranslation();
  const { openModal } = useConsultationModal();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    openModal();
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        size={size}
        variant={variant}
        className={cn(
          "bg-vesuviano-500 hover:bg-vesuviano-600 text-white transition-all duration-300 hover:scale-105",
          className
        )}
        onClick={handleClick}
      >
        {t('cta.getQuote')}
      </Button>
      {showSubtext && (
        <span className={cn(
          "text-xs font-medium",
          dark ? "text-white/70" : "text-muted-foreground"
        )}>
          {t('cta.getQuoteSubtext')}
        </span>
      )}
    </div>
  );
};

export default CtaButton;
