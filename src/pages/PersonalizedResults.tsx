import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Share2, Download, Heart, AlertTriangle, CheckCircle, Target, Users, Sparkles, TrendingUp, Smartphone, Clock, ArrowRight, Star, Gift, MessageCircle, Facebook, Twitter, Instagram, Copy, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';

const PersonalizedResultsPage = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Dados de exemplo - em produção viriam da URL ou contexto
  const userData = {
    name: "Maria Silva",
    email: "maria@email.com",
    totalScore: 58,
    categoryScores: {
      comportamento: 16,
      vida_cotidiana: 14,
      relacoes: 15,
      espiritual: 13
    },
    trackType: "equilibrio",
    completedAt: new Date().toISOString()
  };

  const getTrackInfo = () => {
    const tracks = {
      liberdade: {
        name: "Trilha Liberdade",
        color: "#4CAF50",
        duration: 7,
        title: "Uso Consciente",
        description: "Você demonstra uma relação equilibrada com a tecnologia! Continue fortalecendo seus bons hábitos através da espiritualidade.",
        icon: CheckCircle,
        level: "Iniciante",
        urgency: "Baixa",
        message: "Parabéns! Deus tem abençoado sua consciência digital.",
        recommendations: [
          "Continue praticando a presença divina também no mundo digital",
          "Compartilhe suas boas práticas com irmãos na fé",
          "Aprofunde momentos de oração e reflexão",
          "Mantenha rituais espirituais livres de distrações digitais"
        ]
      },
      equilibrio: {
        name: "Trilha Equilíbrio", 
        color: "#FFC107",
        duration: 21,
        title: "Uso em Alerta",
        description: "Identificamos sinais de dependência que merecem atenção. Com a graça de Deus e as estratégias certas, você pode recuperar o controle!",
        icon: Target,
        level: "Intermediário",
        urgency: "Moderada",
        message: "Hora de buscar a Deus! Ele tem um plano de restauração para sua vida digital.",
        recommendations: [
          "Busque a Deus em oração para superar a ansiedade digital",
          "Crie momentos sagrados livres de tecnologia",
          "Fortaleça conexões espirituais e familiares",
          "Pratique meditação bíblica e contemplação diariamente"
        ]
      },
      renovacao: {
        name: "Trilha Renovação",
        color: "#F44336", 
        duration: 40,
        title: "Uso Problemático",
        description: "Sua relação com a tecnologia está impactando significativamente sua vida espiritual. Mas Deus vê seu coração disposto à mudança!",
        icon: Sparkles,
        level: "Avançado",
        urgency: "Alta",
        message: "Coragem! Deus tem um plano de renovação total para sua vida.",
        recommendations: [
          "Inicie um jejum digital com propósito espiritual",
          "Busque apoio da comunidade de fé e liderança espiritual",
          "Reconecte-se com práticas espirituais tradicionais",
          "Desenvolva rotinas de adoração livres de tecnologia"
        ]
      }
    };
    return tracks[userData.trackType];
  };

  const trackInfo = getTrackInfo();

  // Dados para gráficos
  const radarData = [
    { subject: 'Comportamento', A: (userData.categoryScores.comportamento / 25) * 100, fullMark: 100 },
    { subject: 'Vida Cotidiana', A: (userData.categoryScores.vida_cotidiana / 25) * 100, fullMark: 100 },
    { subject: 'Relacionamentos', A: (userData.categoryScores.relacoes / 25) * 100, fullMark: 100 },
    { subject: 'Vida Espiritual', A: (userData.categoryScores.espiritual / 25) * 100, fullMark: 100 }
  ];

  const comparisonData = [
    { name: 'Sua pontuação', valor: userData.totalScore, color: trackInfo.color },
    { name: 'Média adventista', valor: 52, color: '#E0E0E0' }
  ];

  const categoryData = [
    { name: 'Comportamento', value: userData.categoryScores.comportamento, color: '#2196F3' },
    { name: 'Vida Cotidiana', value: userData.categoryScores.vida_cotidiana, color: '#4CAF50' },
    { name: 'Relacionamentos', value: userData.categoryScores.relacoes, color: '#FF9800' },
    { name: 'Vida Espiritual', value: userData.categoryScores.espiritual, color: '#9C27B0' }
  ];

  const insights = [
    {
      category: "Comportamento",
      score: userData.categoryScores.comportamento,
      max: 25,
      level: userData.categoryScores.comportamento > 18 ? "alto" : userData.categoryScores.comportamento > 12 ? "moderado" : "baixo",
      insight: userData.categoryScores.comportamento > 18 
        ? "Seus hábitos com o smartphone mostram sinais de dependência física. Deus deseja sua liberdade total."
        : userData.categoryScores.comportamento > 12
        ? "Alguns comportamentos merecem atenção. Com oração e consciência, a vitória é possível."
        : "Glória a Deus! Você demonstra bom controle comportamental sendo templo do Espírito Santo."
    },
    {
      category: "Vida Cotidiana", 
      score: userData.categoryScores.vida_cotidiana,
      max: 25,
      level: userData.categoryScores.vida_cotidiana > 18 ? "alto" : userData.categoryScores.vida_cotidiana > 12 ? "moderado" : "baixo",
      insight: userData.categoryScores.vida_cotidiana > 18
        ? "O uso excessivo está prejudicando sua mordomia do tempo. Deus tem propósitos maiores para seus dias."
        : userData.categoryScores.vida_cotidiana > 12
        ? "Há oportunidades de ser mais fiel na mordomia do tempo e responsabilidades."
        : "Você mantém um bom equilíbrio sendo fiel mordomo do tempo que Deus lhe concedeu."
    },
    {
      category: "Relacionamentos",
      score: userData.categoryScores.relacoes, 
      max: 25,
      level: userData.categoryScores.relacoes > 18 ? "alto" : userData.categoryScores.relacoes > 12 ? "moderado" : "baixo",
      insight: userData.categoryScores.relacoes > 18
        ? "Suas conexões familiares e fraternas estão sendo impactadas. Deus valoriza os relacionamentos."
        : userData.categoryScores.relacoes > 12
        ? "Há espaço para fortalecer seus laços familiares e fraternais com mais presença."
        : "Suas relações refletem o amor de Cristo. Continue priorizando as pessoas acima da tecnologia."
    },
    {
      category: "Vida Espiritual",
      score: userData.categoryScores.espiritual,
      max: 25, 
      level: userData.categoryScores.espiritual > 18 ? "alto" : userData.categoryScores.espiritual > 12 ? "moderado" : "baixo",
      insight: userData.categoryScores.espiritual > 18
        ? "A tecnologia está interferindo em sua comunhão com Deus. Ele deseja intimidade com você."
        : userData.categoryScores.espiritual > 12
        ? "Pequenos ajustes podem criar mais espaço para crescimento espiritual e comunhão com Deus."
        : "Você consegue manter sua vida espiritual forte mesmo na era digital. Isso glorifica a Deus!"
    }
  ];

  const shareUrl = `https://alemdasnotificacoes.com.br/resultado/${userData.trackType}`;
  
  const shareData = {
    title: `Descobri meu nível de dependência digital como adventista!`,
    text: `Fiz o teste "Além das Notificações" e descobri que preciso da ${trackInfo.name} para viver com mais propósito. Que tal você fazer também?`,
    url: shareUrl
  };

  const handleShare = async (platform) => {
    const text = encodeURIComponent(shareData.text);
    const url = encodeURIComponent(shareData.url);
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${text} ${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      instagram: shareData.url // Instagram doesn't support direct sharing
    };

    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.log('Error copying:', error);
    }
  };

  const startTrack = () => {
    // Redirecionar para início da trilha
    window.location.href = `/onboarding?track=${userData.trackType}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 bg-gray-50">
        {/* Hero Section */}
        <div 
          className="relative text-white py-16"
          style={{ backgroundColor: trackInfo.color }}
        >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
            <trackInfo.icon className="w-12 h-12" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Olá, {userData.name.split(' ')[0]}!
          </h1>
          
          <div className="text-6xl md:text-8xl font-bold mb-4 opacity-90">
            {userData.totalScore}
          </div>
          
          <p className="text-xl md:text-2xl mb-2 opacity-90">
            pontos de 100
          </p>
          
          <div 
            className="inline-block px-6 py-3 rounded-full text-lg font-semibold mb-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            {trackInfo.title}
          </div>
          
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
            {trackInfo.description}
          </p>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={startTrack}
              className="flex items-center justify-center px-8 py-4 text-white font-bold rounded-xl text-lg transition-all transform hover:scale-105"
              style={{ backgroundColor: trackInfo.color }}
            >
              Começar Minha {trackInfo.name}
              <ArrowRight className="ml-2 w-6 h-6" />
            </button>
            
            <button 
              onClick={() => setShowShareModal(true)}
              className="flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl text-lg hover:bg-gray-50 transition-all"
            >
              <Share2 className="mr-2 w-6 h-6" />
              Compartilhar Resultado
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${trackInfo.color}20` }}>
              <Target className="w-8 h-8" style={{ color: trackInfo.color }} />
            </div>
            <h3 className="text-xl font-bold mb-2">{trackInfo.name}</h3>
            <p className="text-gray-600 mb-4">{trackInfo.duration} dias de transformação espiritual</p>
            <div className="text-sm text-gray-500">Nível {trackInfo.level}</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Seu Ranking</h3>
            <p className="text-gray-600 mb-4">
              {userData.totalScore > 60 ? 'Top 25%' : userData.totalScore > 40 ? 'Top 50%' : 'Top 75%'} mais conscientes
            </p>
            <div className="text-sm text-gray-500">Entre adventistas participantes</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Urgência Espiritual</h3>
            <p className="text-gray-600 mb-4">Prioridade {trackInfo.urgency.toLowerCase()}</p>
            <div className="text-sm text-gray-500">Para crescimento espiritual</div>
          </div>
        </div>

        {/* Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Radar Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6 text-center">Análise por Categoria</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar 
                    name="Sua Pontuação" 
                    dataKey="A" 
                    stroke={trackInfo.color} 
                    fill={trackInfo.color} 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comparison Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6 text-center">Comparação com a Média</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="valor" fill={trackInfo.color} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-gray-600 mt-4">
              {userData.totalScore > 52 ? 'Acima' : 'Abaixo'} da média adventista (52 pontos)
            </p>
          </div>
        </div>

        {/* Detailed Insights */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6 text-center">Análise Detalhada</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight, index) => (
              <div key={index} className="border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">{insight.category}</h4>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold mr-2">{insight.score}</span>
                    <span className="text-gray-500">/{insight.max}</span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div 
                    className="h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(insight.score / insight.max) * 100}%`,
                      backgroundColor: insight.level === 'alto' ? '#F44336' : insight.level === 'moderado' ? '#FFC107' : '#4CAF50'
                    }}
                  />
                </div>
                
                <div className="flex items-center mb-3">
                  {insight.level === 'alto' ? (
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  ) : insight.level === 'moderado' ? (
                    <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  )}
                  <span className={`font-medium ${
                    insight.level === 'alto' ? 'text-red-600' : 
                    insight.level === 'moderado' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {insight.level === 'alto' ? 'Oração e Ação Necessárias' : 
                     insight.level === 'moderado' ? 'Pode Crescer com Deus' : 'Glória a Deus!'}
                  </span>
                </div>
                
                <p className="text-gray-700">{insight.insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6 text-center">Orientações Espirituais Personalizadas</h3>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Sparkles className="w-6 h-6 mr-2" style={{ color: trackInfo.color }} />
              {trackInfo.message}
            </h4>
            <p className="text-gray-700 text-lg">{trackInfo.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trackInfo.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0"
                  style={{ backgroundColor: trackInfo.color }}
                >
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
                <span className="text-gray-700">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div 
          className="rounded-xl p-8 text-white text-center"
          style={{ backgroundColor: trackInfo.color }}
        >
          <h3 className="text-2xl font-bold mb-4">Pronto para Viver com Mais Propósito?</h3>
          <p className="text-lg mb-6 opacity-90">
            Sua jornada espiritual de {trackInfo.duration} dias na {trackInfo.name} te aguarda!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={startTrack}
              className="bg-white text-gray-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              🙏 Começar com Deus
            </button>
            
            <button 
              onClick={() => setShowShareModal(true)}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
            >
              📤 Compartilhar Testemunho
            </button>
          </div>
          
          <p className="text-sm mt-4 opacity-75">
            ⏰ Apenas 15-30 minutos por dia • 🙏 Baseado em princípios bíblicos • 💚 Comunidade adventista de apoio
          </p>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-center">Compartilhar Testemunho</h3>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 text-center mb-6">
                Inspire outros irmãos a descobrirem uma vida digital mais próxima de Deus!
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button 
                  onClick={() => handleShare('whatsapp')}
                  className="flex items-center justify-center p-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-6 h-6 mr-2" />
                  WhatsApp
                </button>
                
                <button 
                  onClick={() => handleShare('facebook')}
                  className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="w-6 h-6 mr-2" />
                  Facebook
                </button>
                
                <button 
                  onClick={() => handleShare('twitter')}
                  className="flex items-center justify-center p-4 bg-blue-400 text-white rounded-xl hover:bg-blue-500 transition-colors"
                >
                  <Twitter className="w-6 h-6 mr-2" />
                  Twitter
                </button>
                
                <button 
                  onClick={() => handleShare('instagram')}
                  className="flex items-center justify-center p-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  <Instagram className="w-6 h-6 mr-2" />
                  Instagram
                </button>
              </div>
              
              <button 
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center p-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Copy className="w-5 h-5 mr-2" />
                {copySuccess ? 'Copiado!' : 'Copiar Link'}
              </button>
            </div>
            
            <div className="p-6 border-t">
              <button 
                onClick={() => setShowShareModal(false)}
                className="w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Fechar
              </button>
             </div>
           </div>
         </div>
       )}
      </main>
    </div>
  );
};

export default PersonalizedResultsPage;