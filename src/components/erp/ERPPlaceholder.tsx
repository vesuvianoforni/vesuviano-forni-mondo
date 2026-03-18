import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

interface ERPPlaceholderProps {
  title: string;
  description: string;
}

const ERPPlaceholder = ({ title, description }: ERPPlaceholderProps) => {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-amber-100 mb-6">{title}</h1>
      <Card className="bg-[#1a1a1a] border-amber-900/20">
        <CardContent className="flex flex-col items-center justify-center py-20">
          <Construction className="w-16 h-16 text-amber-500/30 mb-4" />
          <h2 className="text-xl font-semibold text-amber-200/60">In Sviluppo</h2>
          <p className="text-gray-500 mt-2 text-center max-w-md">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ERPPlaceholder;
