import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import ValidationTests from '@/components/ValidationTests';

const ValidationPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Validação do Sistema | Além das Notificações</title>
        <meta
          name="description"
          content="Validação e testes finais do sistema de trilhas digitais"
        />
      </Helmet>

      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <ValidationTests />
      </main>
    </div>
  );
};

export default ValidationPage;