import { SessionLinksManager } from "@/components/admin/SessionLinksManager";
import { AIConversionMessageModal } from "@/components/admin/AIConversionMessageModal";
import { useState } from "react";
import Header from "@/components/Header";

const SessionsCRM = () => {
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  const handleOpenAIModal = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setAiModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <SessionLinksManager onGenerateAIMessage={handleOpenAIModal} />
      </main>
      
      <AIConversionMessageModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        sessionId={selectedSessionId}
        language="it"
      />
    </div>
  );
};

export default SessionsCRM;