import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Quote, 
  BookOpen, 
  Music, 
  RefreshCw, 
  Heart,
  Share2,
  Bookmark,
  TrendingUp,
  Target,
  Zap,
  Star
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { OpenAIService } from '../lib/openai';

interface InspirationalContent {
  id: string;
  type: 'quote' | 'article' | 'playlist';
  title: string;
  content: string;
  author?: string;
  category: 'motivation' | 'study' | 'success' | 'focus' | 'politics' | 'entrepreneurship';
  tags: string[];
  is_active: boolean;
  created_at: string;
}

interface Playlist {
  id: string;
  title: string;
  description: string;
  category: 'focus' | 'workout' | 'study' | 'relaxation';
  tracks: Array<{
    title: string;
    artist: string;
    duration: string;
    platform: 'spotify' | 'youtube' | 'apple';
  }>;
}

export default function InspirationArea() {
  const [content, setContent] = useState<InspirationalContent[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
    fetchPlaylists();
    loadFavorites();
  }, []);

  const fetchContent = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('inspirational_content')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching content:', error);
        // Se der erro, usar conteúdo padrão
        setContent(getDefaultContent());
        return;
      }
      
      // Se não há dados, usar conteúdo padrão
      if (!data || data.length === 0) {
        setContent(getDefaultContent());
      } else {
        setContent(data);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setContent(getDefaultContent());
    }
  };

  const getDefaultContent = (): InspirationalContent[] => {
    return [
      {
        id: '1',
        type: 'quote',
        title: 'Motivação Diária',
        content: 'A persistência é o caminho do êxito. Cada dia é uma nova oportunidade para ser melhor.',
        author: 'Desconhecido',
        category: 'motivation',
        tags: ['motivação', 'sucesso'],
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        type: 'article',
        title: 'Técnicas de Estudo Eficazes',
        content: 'O método Pomodoro é uma das técnicas mais eficazes para manter o foco durante os estudos. Trabalhe por 25 minutos e faça uma pausa de 5 minutos.',
        author: 'Especialista em Produtividade',
        category: 'study',
        tags: ['estudo', 'produtividade', 'pomodoro'],
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        type: 'quote',
        title: 'Foco e Determinação',
        content: 'O sucesso não é final, o fracasso não é fatal: é a coragem de continuar que conta.',
        author: 'Winston Churchill',
        category: 'success',
        tags: ['sucesso', 'determinação'],
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];
  };

  const fetchPlaylists = async () => {
    // Simular playlists por enquanto
    const mockPlaylists: Playlist[] = [
      {
        id: '1',
        title: 'Foco Total',
        description: 'Músicas para maximizar sua concentração',
        category: 'focus',
        tracks: [
          { title: 'Deep Focus', artist: 'Spotify', duration: '3:45', platform: 'spotify' },
          { title: 'Study Session', artist: 'Lo-Fi Beats', duration: '4:20', platform: 'spotify' },
          { title: 'Concentration Flow', artist: 'Brain Waves', duration: '5:15', platform: 'spotify' }
        ]
      },
      {
        id: '2',
        title: 'Energia para Treino',
        description: 'Playlist motivacional para seus exercícios',
        category: 'workout',
        tracks: [
          { title: 'Power Up', artist: 'Energy Boost', duration: '3:30', platform: 'spotify' },
          { title: 'Workout Motivation', artist: 'Fitness Flow', duration: '4:10', platform: 'spotify' },
          { title: 'Stronger', artist: 'Motivation Mix', duration: '3:55', platform: 'spotify' }
        ]
      }
    ];
    setPlaylists(mockPlaylists);
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('inspiration_favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  const toggleFavorite = (contentId: string) => {
    const newFavorites = favorites.includes(contentId)
      ? favorites.filter(id => id !== contentId)
      : [...favorites, contentId];
    
    setFavorites(newFavorites);
    localStorage.setItem('inspiration_favorites', JSON.stringify(newFavorites));
  };

  const refreshContent = async () => {
    setRefreshing(true);
    try {
      // Gerar novo conteúdo usando IA
      const newQuote = await OpenAIService.generateQuote('motivation');
      const newArticle = await OpenAIService.generateArticle('study');
      
      // Simular atualização do conteúdo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Recarregar conteúdo
      await fetchContent();
    } catch (error) {
      console.error('Error refreshing content:', error);
      // Se der erro na IA, pelo menos recarregar o conteúdo existente
      await fetchContent();
    } finally {
      setRefreshing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'motivation': return <Heart className="h-5 w-5" />;
      case 'study': return <BookOpen className="h-5 w-5" />;
      case 'success': return <Target className="h-5 w-5" />;
      case 'focus': return <Zap className="h-5 w-5" />;
      case 'politics': return <TrendingUp className="h-5 w-5" />;
      case 'entrepreneurship': return <Star className="h-5 w-5" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'motivation': return 'bg-pink-100 text-pink-600';
      case 'study': return 'bg-blue-100 text-blue-600';
      case 'success': return 'bg-green-100 text-green-600';
      case 'focus': return 'bg-purple-100 text-purple-600';
      case 'politics': return 'bg-red-100 text-red-600';
      case 'entrepreneurship': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'motivation': return 'Motivação';
      case 'study': return 'Estudos';
      case 'success': return 'Sucesso';
      case 'focus': return 'Foco';
      case 'politics': return 'Política';
      case 'entrepreneurship': return 'Empreendedorismo';
      default: return 'Geral';
    }
  };

  const filteredContent = content.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  const stats = {
    totalContent: content.length,
    quotes: content.filter(c => c.type === 'quote').length,
    articles: content.filter(c => c.type === 'article').length,
    playlists: playlists.length
  };

  // Garantir que o loading pare após um tempo máximo
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
        if (content.length === 0) {
          setContent(getDefaultContent());
        }
      }
    }, 5000); // 5 segundos máximo

    return () => clearTimeout(timer);
  }, [loading, content.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Área de Inspiração
          </h1>
        </div>
        <p className="text-gray-600 mb-4">
          Encontre motivação, conhecimento e inspiração para seus objetivos
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalContent}</div>
            <div className="text-sm text-gray-600">Conteúdos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.quotes}</div>
            <div className="text-sm text-gray-600">Frases</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.articles}</div>
            <div className="text-sm text-gray-600">Artigos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.playlists}</div>
            <div className="text-sm text-gray-600">Playlists</div>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={refreshContent}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Atualizando...' : 'Atualizar Conteúdo'}
        </button>
      </div>

      {/* Category Filter */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {['motivation', 'study', 'success', 'focus', 'politics', 'entrepreneurship'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {getCategoryIcon(category)}
              <span className="ml-1">{getCategoryName(category)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <div key={item.id} className="glass-card p-6 hover:scale-105 transition-transform">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {item.type === 'quote' ? (
                  <Quote className="h-6 w-6 text-blue-600 mr-2" />
                ) : (
                  <BookOpen className="h-6 w-6 text-green-600 mr-2" />
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                  {getCategoryName(item.category)}
                </span>
              </div>
              <button
                onClick={() => toggleFavorite(item.id)}
                className={`p-1 rounded-full transition-colors ${
                  favorites.includes(item.id)
                    ? 'text-red-500 bg-red-50'
                    : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`h-4 w-4 ${favorites.includes(item.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-3">{item.content}</p>
            
            {item.author && (
              <p className="text-sm text-gray-500 mb-4">— {item.author}</p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                  <Share2 className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                  <Bookmark className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Playlists Section */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Music className="h-6 w-6 mr-2 text-purple-600" />
          Playlists Recomendadas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="bg-white/50 rounded-lg p-4 hover:bg-white/70 transition-colors">
              <h3 className="font-semibold mb-2">{playlist.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{playlist.description}</p>
              
              <div className="space-y-2">
                {playlist.tracks.slice(0, 2).map((track, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{track.title}</div>
                      <div className="text-gray-500">{track.artist}</div>
                    </div>
                    <div className="text-gray-500">{track.duration}</div>
                  </div>
                ))}
              </div>
              
              <button className="mt-3 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Ouvir Playlist
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
