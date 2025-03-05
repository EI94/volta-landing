import React from 'react';
import BESSConfig from '@/components/BESSConfig';

export default function BESSPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Sistema di Accumulo Energetico (BESS) - 60 MW Viterbo</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <BESSConfig />
      </div>
    </div>
  );
} 