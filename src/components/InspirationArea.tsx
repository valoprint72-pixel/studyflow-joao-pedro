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

  useEffect(() => {
    fetchContent();
    fetchPlaylists();
    loadFavorites();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('inspirational_content')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
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
        <p className="text-gray-600">
          Conteúdo inspirador e motivacional atualizado pela IA
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="mobile-card text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalContent}</div>
          <div className="text-sm text-gray-600">Conteúdos</div>
        </div>
        <div className="mobile-card text-center">
          <div className="text-2xl font-bold text-pink-600">{stats.quotes}</div>
          <div className="text-sm text-gray-600">Frases</div>
        </div>
        <div className="mobile-card text-center">
          <div className="text-2xl font-bold text-green-600">{stats.articles}</div>
          <div className="text-sm text-gray-600">Artigos</div>
        </div>
        <div className="mobile-card text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.playlists}</div>
          <div className="text-sm text-gray-600">Playlists</div>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field text-sm"
            >
              <option value="all">Todas as categorias</option>
              <option value="motivation">Motivação</option>
              <option value="study">Estudos</option>
              <option value="success">Sucesso</option>
              <option value="focus">Foco</option>
              <option value="politics">Política</option>
              <option value="entrepreneurship">Empreendedorismo</option>
            </select>
          </div>

          <button
            onClick={refreshContent}
            disabled={refreshing}
            className="btn-primary flex items-center px-4 py-2"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Atualizando...' : 'Atualizar Conteúdo'}
          </button>
        </div>
      </div>

      {/* Quotes Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center">
          <Quote className="h-6 w-6 mr-2 text-blue-600" />
          Frases Motivacionais
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContent.filter(c => c.type === 'quote').slice(0, 4).map((item) => (
            <div key={item.id} className="glass-card p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                  {getCategoryName(item.category)}
                </span>
                <button
                  onClick={() => toggleFavorite(item.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    favorites.includes(item.id)
                      ? 'text-red-500 bg-red-50'
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(item.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <blockquote className="text-lg font-medium text-gray-800 mb-3">
                "{item.content}"
              </blockquote>
              
              {item.author && (
                <cite className="text-sm text-gray-600">— {item.author}</cite>
              )}
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Bookmark className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Articles Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center">
          <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
          Artigos e Resumos
        </h2>
        
        <div className="space-y-4">
          {filteredContent.filter(c => c.type === 'article').slice(0, 3).map((item) => (
            <div key={item.id} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getCategoryIcon(item.category)}
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                    {getCategoryName(item.category)}
                  </span>
                </div>
                <button
                  onClick={() => toggleFavorite(item.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    favorites.includes(item.id)
                      ? 'text-red-500 bg-red-50'
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(item.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <p className="text-gray-700 mb-4 line-clamp-3">{item.content}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-4 text-sm text-gray-500">
                  <span>{item.tags.slice(0, 3).join(', ')}</span>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Bookmark className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Playlists Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center">
          <Music className="h-6 w-6 mr-2 text-blue-600" />
          Playlists para Foco e Treino
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{playlist.title}</h3>
                  <p className="text-gray-600 text-sm">{playlist.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  playlist.category === 'focus' ? 'bg-blue-100 text-blue-600' :
                  playlist.category === 'workout' ? 'bg-green-100 text-green-600' :
                  playlist.category === 'study' ? 'bg-purple-100 text-purple-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {playlist.category === 'focus' ? 'Foco' :
                   playlist.category === 'workout' ? 'Treino' :
                   playlist.category === 'study' ? 'Estudo' : 'Relaxamento'}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                {playlist.tracks.slice(0, 3).map((track, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{track.title}</div>
                      <div className="text-xs text-gray-600">{track.artist}</div>
                    </div>
                    <div className="text-xs text-gray-500">{track.duration}</div>
                  </div>
                ))}
              </div>
              
              <button className="btn-primary w-full">
                Ouvir Playlist
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center">
            <Heart className="h-6 w-6 mr-2 text-red-500" />
            Seus Favoritos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.filter(c => favorites.includes(c.id)).slice(0, 2).map((item) => (
              <div key={item.id} className="glass-card p-4 border-2 border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                    {getCategoryName(item.category)}
                  </span>
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>
                
                <p className="text-sm text-gray-700">
                  {item.type === 'quote' ? `"${item.content}"` : item.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
