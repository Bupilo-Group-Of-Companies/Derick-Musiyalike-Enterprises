import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Clock, 
  Filter,
  MoreVertical,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string; // 'admin', 'agent', 'developer' or specific ID
  dueDate?: string;
  createdAt: string;
}

interface TaskManagerProps {
  role: 'admin' | 'agent' | 'developer';
  currentUser?: string;
}

const TaskManager: React.FC<TaskManagerProps> = ({ role, currentUser }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Load tasks from local storage
    const storedTasks = JSON.parse(localStorage.getItem('moneylink_tasks') || '[]');
    setTasks(storedTasks);
  }, []);

  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('moneylink_tasks', JSON.stringify(updatedTasks));
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTaskTitle,
      priority: newTaskPriority,
      status: 'pending',
      assignedTo: role,
      createdAt: new Date().toISOString()
    };

    const updatedTasks = [newTask, ...tasks];
    saveTasks(updatedTasks);
    setNewTaskTitle('');
    setShowAddModal(false);
  };

  const deleteTask = (id: string) => {
    if (confirm('Delete this task?')) {
      const updatedTasks = tasks.filter(t => t.id !== id);
      saveTasks(updatedTasks);
    }
  };

  const toggleStatus = (id: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: t.status === 'completed' ? 'pending' : 'completed'
        } as Task;
      }
      return t;
    });
    saveTasks(updatedTasks);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter !== 'all' && t.priority !== filter) return false;
    return true;
  });

  // Sort by priority (High -> Medium -> Low) and then by date
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="bg-white rounded-[2.5rem] border border-[#E5E5E5] shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-[#F0F0F0] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A]">Task Manager</h2>
            <p className="text-xs text-[#999] font-medium">{tasks.filter(t => t.status !== 'completed').length} Pending Tasks</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-600"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <button 
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#F8F9FA]">
        {sortedTasks.length > 0 ? (
          sortedTasks.map(task => (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 bg-white border rounded-2xl flex items-center gap-4 group transition-all ${
                task.status === 'completed' ? 'opacity-60 border-[#E5E5E5]' : 'border-[#E5E5E5] hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <button 
                onClick={() => toggleStatus(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  task.status === 'completed' 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-[#E5E5E5] text-transparent hover:border-indigo-500'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              
              <div className="flex-1">
                <p className={`text-sm font-bold ${task.status === 'completed' ? 'line-through text-[#999]' : 'text-[#1A1A1A]'}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className="text-[9px] text-[#999] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => deleteTask(task.id)}
                className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[#999] space-y-4 py-12">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#E5E5E5]">
              <CheckCircle className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-xs font-medium">No tasks found</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-bold">New Task</h3>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Task title..." 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl text-sm outline-none focus:border-indigo-600"
                  autoFocus
                />
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setNewTaskPriority(p)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                        newTaskPriority === p 
                          ? getPriorityColor(p) 
                          : 'bg-white border-[#E5E5E5] text-[#666] hover:bg-[#F8F9FA]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-[#F8F9FA] text-[#666] rounded-xl font-bold text-xs hover:bg-[#E5E5E5]"
                >
                  Cancel
                </button>
                <button 
                  onClick={addTask}
                  disabled={!newTaskTitle.trim()}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 disabled:opacity-50"
                >
                  Add Task
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskManager;
