import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, Eye, Edit, Trash2, Upload, Video, FileText, Tag, Image, Link, Calendar, Users, BarChart3, Search, Filter, MoreVertical, Youtube, File, Play, PauseCircle, X, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ContentManagementSystem = () => {
  const [activeTab, setActiveTab] = useState('content');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [contentType, setContentType] = useState('article');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  
  // Data states
  const [contents, setContents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    body: '',
    youtube_url: '',
    external_url: '',
    difficulty_level: 'iniciante',
    track_types: [],
    tags: [],
    status: 'draft',
    is_featured: false,
    is_premium: false,
    seo_title: '',
    seo_description: '',
    reading_time_minutes: 0,
    duration_minutes: 0,
    featured_image_url: ''
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setUser(session.user);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load categories
      const { data: categoriesData } = await supabase
        .from('content_categories')
        .select('*')
        .order('sort_order', { ascending: true });
      
      setCategories(categoriesData || []);

      // Load tags
      const { data: tagsData } = await supabase
        .from('content_tags')
        .select('*')
        .order('name', { ascending: true });
      
      setTags(tagsData || []);

      // Load contents with category names
      const { data: contentsData } = await supabase
        .from('contents')
        .select(`
          *,
          content_categories(name),
          content_tag_relations(content_tags(name, slug))
        `)
        .order('created_at', { ascending: false });
      
      setContents(contentsData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleFileUpload = async (event, type = 'video') => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const bucketName = type === 'image' ? 'content-images' : 'content-videos';
      
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      if (type === 'image') {
        handleInputChange('featured_image_url', publicUrl);
      } else {
        handleInputChange('video_url', publicUrl);
      }

      toast({
        title: "Upload Concluído",
        description: `${type === 'image' ? 'Imagem' : 'Vídeo'} enviado com sucesso!`,
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erro no Upload",
        description: "Erro ao enviar arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContent = async () => {
    try {
      if (!formData.title.trim()) {
        toast({
          title: "Erro",
          description: "Título é obrigatório.",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      const slug = generateSlug(formData.title);
      const contentData = {
        ...formData,
        slug,
        content_type: contentType,
        author_id: user.id,
        published_at: formData.status === 'published' ? new Date().toISOString() : null
      };

      // Insert content
      const { data: content, error: contentError } = await supabase
        .from('contents')
        .insert(contentData)
        .select()
        .single();

      if (contentError) throw contentError;

      // Insert tag relations if any tags selected
      if (formData.tags.length > 0) {
        const tagRelations = formData.tags.map(tagSlug => {
          const tag = tags.find(t => t.slug === tagSlug);
          return {
            content_id: content.id,
            tag_id: tag?.id
          };
        }).filter(rel => rel.tag_id);

        if (tagRelations.length > 0) {
          const { error: tagError } = await supabase
            .from('content_tag_relations')
            .insert(tagRelations);

          if (tagError) console.error('Error inserting tag relations:', tagError);
        }
      }

      toast({
        title: "Conteúdo Salvo!",
        description: "Conteúdo criado com sucesso.",
      });

      setShowCreateModal(false);
      resetForm();
      loadData(); // Reload data

    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar conteúdo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (!confirm('Tem certeza que deseja excluir este conteúdo?')) return;

    try {
      const { error } = await supabase
        .from('contents')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: "Conteúdo Excluído",
        description: "Conteúdo removido com sucesso.",
      });

      loadData(); // Reload data

    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir conteúdo.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', category_id: '', body: '', youtube_url: '', 
      external_url: '', difficulty_level: 'iniciante', track_types: [], tags: [], 
      status: 'draft', is_featured: false, is_premium: false, seo_title: '', 
      seo_description: '', reading_time_minutes: 0, duration_minutes: 0,
      featured_image_url: ''
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: { bg: 'bg-green-100', text: 'text-green-800', label: 'Publicado' },
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Rascunho' },
      archived: { bg: 'bg-red-100', text: 'text-red-800', label: 'Arquivado' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      case 'exercise': return <Play className="w-4 h-4" />;
      case 'audio': return <PauseCircle className="w-4 h-4" />;
      case 'quiz': return <BarChart3 className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || content.content_categories?.name === filterCategory;
    const matchesStatus = filterStatus === 'all' || content.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const CreateContentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Criar Novo Conteúdo
            </h2>
            <button 
              onClick={() => setShowCreateModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content Type Selector */}
          <div className="flex space-x-4 mt-4">
            {[
              { type: 'article', label: 'Artigo', icon: FileText },
              { type: 'video', label: 'Vídeo', icon: Video },
              { type: 'exercise', label: 'Exercício', icon: Play },
              { type: 'audio', label: 'Áudio', icon: PauseCircle },
              { type: 'quiz', label: 'Quiz', icon: BarChart3 }
            ].map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setContentType(type)}
                className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                  contentType === type 
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Digite o título do conteúdo"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Breve descrição do conteúdo"
            />
          </div>

          {/* Featured Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem Destacada
            </label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Image className="w-5 h-5 mr-2" />
                Selecionar Imagem
              </button>
              {formData.featured_image_url && (
                <img 
                  src={formData.featured_image_url} 
                  alt="Preview" 
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'image')}
              className="hidden"
            />
          </div>

          {/* Content Type Specific Fields */}
          {contentType === 'video' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL do YouTube
                </label>
                <div className="flex">
                  <div className="flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg">
                    <Youtube className="w-5 h-5 text-red-500" />
                  </div>
                  <input
                    type="url"
                    value={formData.youtube_url}
                    onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 mb-4">ou</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 transition-colors"
                >
                  <Upload className="w-6 h-6 mr-2 text-gray-400" />
                  Fazer upload de vídeo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, 'video')}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duração (minutos)
                </label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {contentType === 'article' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo do Artigo
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) => handleInputChange('body', e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-mono text-sm"
                  placeholder="Escreva o conteúdo do artigo aqui... (suporte a Markdown)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Suporte a Markdown. Use **negrito**, *itálico*, # Títulos, etc.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempo de Leitura (minutos)
                </label>
                <input
                  type="number"
                  value={formData.reading_time_minutes}
                  onChange={(e) => handleInputChange('reading_time_minutes', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {contentType === 'exercise' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instruções do Exercício
              </label>
              <textarea
                value={formData.body}
                onChange={(e) => handleInputChange('body', e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Descreva as instruções detalhadas do exercício..."
              />
            </div>
          )}

          {/* Track Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trilhas Relacionadas
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'liberdade', label: 'Trilha Liberdade', color: 'green' },
                { value: 'equilibrio', label: 'Trilha Equilíbrio', color: 'yellow' },
                { value: 'renovacao', label: 'Trilha Renovação', color: 'red' }
              ].map(track => (
                <button
                  key={track.value}
                  onClick={() => handleArrayToggle('track_types', track.value)}
                  className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                    formData.track_types.includes(track.value)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {track.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleArrayToggle('tags', tag.slug)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    formData.tags.includes(tag.slug)
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dificuldade
              </label>
              <select
                value={formData.difficulty_level}
                onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                  className="mr-2 w-4 h-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Destacar</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_premium}
                  onChange={(e) => handleInputChange('is_premium', e.target.checked)}
                  className="mr-2 w-4 h-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Conteúdo Premium</span>
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex justify-end space-x-4">
          <button
            onClick={() => setShowCreateModal(false)}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveContent}
            disabled={loading}
            className="px-6 py-3 bg-yellow-500 text-gray-800 rounded-lg hover:bg-yellow-600 transition-colors flex items-center disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Conteúdo'}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading && contents.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p>Carregando sistema de conteúdo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestão de Conteúdo Espiritual
            </h1>
            <p className="text-gray-600">
              Crie e gerencie conteúdos para as trilhas de transformação digital adventista
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-6 py-3 bg-yellow-500 text-gray-800 rounded-lg hover:bg-yellow-600 transition-colors mt-4 lg:mt-0"
          >
            <Plus className="w-5 h-5 mr-2" />
            Criar Conteúdo
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {contents.filter(c => c.content_type === 'article').length}
              </div>
              <div className="text-sm text-gray-600">Artigos</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <Video className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {contents.filter(c => c.content_type === 'video').length}
              </div>
              <div className="text-sm text-gray-600">Vídeos</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <Play className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {contents.filter(c => c.content_type === 'exercise').length}
              </div>
              <div className="text-sm text-gray-600">Exercícios</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {contents.reduce((sum, c) => sum + (c.view_count || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Visualizações</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar conteúdo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="all">Todas as categorias</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="published">Publicado</option>
            <option value="draft">Rascunho</option>
            <option value="archived">Arquivado</option>
          </select>
          
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5 mr-2" />
            Filtros Avançados
          </button>
        </div>
      </div>

      {/* Content List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredContents.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum conteúdo encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Crie seu primeiro conteúdo para começar
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-yellow-500 text-gray-800 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Conteúdo
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Conteúdo</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Tipo</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Categoria</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Métricas</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Data</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContents.map(content => (
                  <tr key={content.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-start space-x-4">
                        <img
                          src={content.featured_image_url || '/api/placeholder/64/48'}
                          alt={content.title}
                          className="w-16 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {content.title}
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            {content.content_tag_relations?.map((rel, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                #{rel.content_tags?.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        {getTypeIcon(content.content_type)}
                        <span className="ml-2 capitalize">{content.content_type}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-900">{content.content_categories?.name}</span>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(content.status)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="flex items-center text-gray-600">
                          <Eye className="w-4 h-4 mr-1" />
                          {(content.view_count || 0).toLocaleString()}
                        </div>
                        <div className="flex items-center text-gray-600 mt-1">
                          <BarChart3 className="w-4 h-4 mr-1" />
                          {content.like_count || 0} curtidas
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600">
                        {new Date(content.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteContent(content.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredContents.length > 0 && (
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-600">
            Mostrando {filteredContents.length} de {contents.length} conteúdos
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Anterior
            </button>
            <button className="px-3 py-2 bg-yellow-500 text-gray-800 rounded-lg">
              1
            </button>
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Próximo
            </button>
          </div>
        </div>
      )}

      {/* Create Content Modal */}
      {showCreateModal && <CreateContentModal />}
    </div>
  );
};

export default ContentManagementSystem;