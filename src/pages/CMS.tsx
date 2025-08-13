import React from 'react';
import { Helmet } from 'react-helmet-async';
import ContentManagementSystem from '@/components/ContentManagementSystem';

const CMS = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AdminPage',
    name: 'Sistema de Gestão de Conteúdo',
    description: 'Interface administrativa para criação e gestão de conteúdos das trilhas espirituais'
  };

  return (
    <>
      <Helmet>
        <title>CMS — Sistema de Gestão de Conteúdo</title>
        <meta name="description" content="Crie e gerencie conteúdos para as trilhas de transformação digital adventista" />
        <link rel="canonical" href={window.location.origin + "/cms"} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <ContentManagementSystem />
    </>
  );
};

export default CMS;