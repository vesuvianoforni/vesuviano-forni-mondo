import { createFileRoute } from "@tanstack/react-router";
import LanguageRedirect from "@/pages/LanguageRedirect";

export const Route = createFileRoute("/")({
  // SEOHead owns page metadata, matching every localized homepage.
  component: LanguageRedirect,
});
