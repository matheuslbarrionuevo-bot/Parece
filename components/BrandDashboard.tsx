
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ShoppingCart, Users, AlertTriangle, TrendingUp, Star, MoreVertical, ThumbsUp } from 'lucide-react';

const mockData = [
  { name: 'Seg', stock: 85, oos: 2 },
  { name: 'Ter', stock: 78, oos: 4 },
  { name: 'Qua', stock: 65, oos: 8 },
  { name: 'Qui', stock: 92, oos: 1 },
  { name: 'Sex', stock: 88, oos: 3 },
  { name: 'Sáb', stock: 70, oos: 6 },
  { name: 'Dom', stock: 95, oos: 0 },
];

const INITIAL_MISSIONS = [
  { id: 1, store: 'Whole Foods Market #10', user: 'Alex J.', status: 'Verificado', result: '98% em Estoque', reward: 'R$ 15,00', rating: 5 },
  { id: 2, store: 'Kroger - Centro', user: 'Maria S.', status: 'Ação Necessária', result: 'Falta Encontrada', reward: 'R$ 12,00', rating: 0 },
  { id: 3, store: 'Publix 452', user: 'Tom R.', status: 'Verificado', result: '100% em Estoque', reward: 'R$ 15,00', rating: 4 },
  { id: 4, store: 'Safeway Center', user: 'Sarah L.', status: 'Verificado', result: '92% em Estoque', reward: 'R$ 10,00', rating: 0 },
];

const TOP_FREELANCERS = [
  { name: 'Alex J.', missions: 42, rating: 4.9, avatar: 'AJ' },
  { name: 'Maria S.', missions: 38, rating: 4.7, avatar: 'MS' },
  { name: 'Tom R.', missions: 25, rating: 4.8, avatar: 'TR' },
];

export const BrandDashboard: React.FC = () => {
  const [missions, setMissions] = useState(INITIAL_MISSIONS);

  // Simulação de missão concluída chegando
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!(window as any).notify) return;
      (window as any).notify(
        "Missão Concluída!", 
        "Lucas M. acabou de enviar as fotos de 'Kroger - Centro'. Verificação IA em andamento...", 
        "success"
      );
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleRate = (missionId: number, rating: number) => {
    setMissions(prev => prev.map(m => m.id === missionId ? { ...m, rating } : m));
  };

  const StarRating = ({ rating, missionId, interactive = false }: { rating: number, missionId?: number, interactive?: boolean }) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => interactive && missionId && handleRate(missionId, star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visão Geral da Marca</h1>
          <p className="text-slate-500">Métricas de prateleira em tempo real em 248 locais</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
          Lançar Nova Missão
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de Missões', value: '1.284', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Freelancers Ativos', value: '452', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Alertas de Falta', value: '12', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Conformidade Média', value: '94%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-6">Tendências de Nível de Estoque</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="stock" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Melhores Freelancers</h3>
              <Users size={18} className="text-slate-400" />
            </div>
            <div className="space-y-4 flex-1">
              {TOP_FREELANCERS.map((fl, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                      {fl.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{fl.name}</p>
                      <p className="text-xs text-slate-500">{fl.missions} missões concluídas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star size={14} className="fill-amber-500" /> {fl.rating}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-sm font-medium text-slate-500 hover:text-blue-600 border border-slate-200 rounded-lg hover:bg-blue-50 transition-all">
              Ver Todos os Rankings
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Verificações de Missões Recentes</h3>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
            <ThumbsUp size={12} /> Avalie as missões para melhorar o treinamento da IA
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Local da Loja</th>
                <th className="px-6 py-4 font-medium">Freelancer</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Resultado IA</th>
                <th className="px-6 py-4 font-medium">Avaliar Envio</th>
                <th className="px-6 py-4 font-medium text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {missions.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{row.store}</p>
                    <p className="text-xs text-slate-400">Verificado há 2h</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{row.user}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      row.status === 'Verificado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">{row.result}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {row.status === 'Verificado' ? (
                      <StarRating rating={row.rating} missionId={row.id} interactive={true} />
                    ) : (
                      <span className="text-xs text-slate-300 italic">Verificação pendente</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
