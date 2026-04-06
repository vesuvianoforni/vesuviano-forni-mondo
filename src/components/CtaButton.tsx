import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CtaButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  onClick?: () => void;
  showSubtext?: boolean;
}

const CtaButton = ({ className, size = "lg", variant, onClick, showSubtext = true }: CtaButtonProps) => {
  const { t } = useTranslation();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' });
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
        <span className="text-xs text-muted-foreground font-medium">
          {t('cta.getQuoteSubtext')}
        </span>
      )}
    </div>
  );
};

export default CtaButton;
