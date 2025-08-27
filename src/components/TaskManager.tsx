import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  CheckCircle, 
  Circle, 
  Clock, 
  BookOpen,
  Target,
  Trash2,
  Edit,
  Filter,
  CalendarDays,
  TrendingUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Task {
  id: string;
  title: string;
  description: string;
  category: 'study' | 'project' | 'personal' | 'work';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string;
  estimated_hours: number;
  actual_hours: number;
  created_at: string;
  user_id: string;
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'study' as const,
    priority: 'medium' as const,
    due_date: '',
    estimated_hours: 1
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingTask) {
        // Update existing task
        const { error } = await supabase
          .from('tasks')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTask.id);

        if (error) throw error;
      } else {
        // Create new task
        const { error } = await supabase
          .from('tasks')
          .insert([{
            ...formData,
            user_id: user.id,
            status: 'pending',
            actual_hours: 0
          }]);

        if (error) throw error;
      }

      setFormData({
        title: '',
        description: '',
        category: 'study',
        priority: 'medium',
        due_date: '',
        estimated_hours: 1
      });
      setShowForm(false);
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const editTask = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      due_date: task.due_date,
      estimated_hours: task.estimated_hours
    });
    setShowForm(true);
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filter === 'all' || task.status === filter;
    const categoryMatch = categoryFilter === 'all' || task.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'study': return <BookOpen className="h-4 w-4" />;
      case 'project': return <Target className="h-4 w-4" />;
      case 'personal': return <Calendar className="h-4 w-4" />;
      case 'work': return <Clock className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'study': return 'bg-blue-100 text-blue-600';
      case 'project': return 'bg-purple-100 text-purple-600';
      case 'personal': return 'bg-green-100 text-green-600';
      case 'work': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    overdue: tasks.filter(t => new Date(t.due_date) < new Date() && t.status !== 'completed').length
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
          <Calendar className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Agenda de Tarefas
          </h1>
        </div>
        <p className="text-gray-600">
          Organize seus estudos, projetos e tarefas pessoais
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="mobile-card text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="mobile-card text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Concluídas</div>
        </div>
        <div className="mobile-card text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pendentes</div>
        </div>
        <div className="mobile-card text-center">
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-sm text-gray-600">Atrasadas</div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="input-field text-sm"
            >
              <option value="all">Todas</option>
              <option value="pending">Pendentes</option>
              <option value="completed">Concluídas</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field text-sm"
            >
              <option value="all">Todas as categorias</option>
              <option value="study">Estudos</option>
              <option value="project">Projetos</option>
              <option value="personal">Pessoal</option>
              <option value="work">Trabalho</option>
            </select>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center px-4 py-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* Task Form */}
      {showForm && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Título da tarefa"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="input-field"
                required
              />
              
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                className="input-field"
                required
              >
                <option value="study">Estudos</option>
                <option value="project">Projetos</option>
                <option value="personal">Pessoal</option>
                <option value="work">Trabalho</option>
              </select>
            </div>

            <textarea
              placeholder="Descrição da tarefa"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="input-field h-24"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                className="input-field"
                required
              />
              
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                className="input-field"
                required
              >
                <option value="low">Baixa Prioridade</option>
                <option value="medium">Média Prioridade</option>
                <option value="high">Alta Prioridade</option>
              </select>
              
              <input
                type="number"
                placeholder="Horas estimadas"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({...formData, estimated_hours: parseInt(e.target.value)})}
                className="input-field"
                min="0.5"
                step="0.5"
                required
              />
            </div>

            <div className="flex space-x-2">
              <button type="submit" className="btn-primary flex-1">
                {editingTask ? 'Atualizar' : 'Criar'} Tarefa
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingTask(null);
                  setFormData({
                    title: '',
                    description: '',
                    category: 'study',
                    priority: 'medium',
                    due_date: '',
                    estimated_hours: 1
                  });
                }}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma tarefa encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' ? 'Crie sua primeira tarefa para começar!' : 'Nenhuma tarefa com esse filtro.'}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Criar Primeira Tarefa
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`glass-card p-4 transition-all duration-200 ${
                task.status === 'completed' ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <button
                    onClick={() => toggleTaskStatus(task.id, task.status)}
                    className="mt-1"
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 hover:text-green-600" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className={`font-semibold ${
                        task.status === 'completed' ? 'line-through text-gray-500' : ''
                      }`}>
                        {task.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                        {task.category === 'study' ? 'Estudos' : 
                         task.category === 'project' ? 'Projetos' :
                         task.category === 'personal' ? 'Pessoal' : 'Trabalho'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <CalendarDays className="h-3 w-3 mr-1" />
                        {new Date(task.due_date).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {task.estimated_hours}h estimadas
                      </div>
                      {task.actual_hours > 0 && (
                        <div className="flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {task.actual_hours}h realizadas
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => editTask(task)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}