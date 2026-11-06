import { createFileRoute } from "@tanstack/react-router";
import LanguageRedirect from "@/pages/LanguageRedirect";

export const Route = createFileRoute("/")({
  component: LanguageRedirect,
});
