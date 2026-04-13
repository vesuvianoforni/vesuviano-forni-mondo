import { createContext, useContext, useState, ReactNode } from 'react';
import ConsultationModal from '@/components/ConsultationModal';

interface ConsultationModalContextType {
  openModal: () => void;
}

const ConsultationModalContext = createContext<ConsultationModalContextType>({
  openModal: () => {},
});

export const useConsultationModal = () => useContext(ConsultationModalContext);

export const ConsultationModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ConsultationModalContext.Provider value={{ openModal: () => setIsOpen(true) }}>
      {children}
      <ConsultationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </ConsultationModalContext.Provider>
  );
};
