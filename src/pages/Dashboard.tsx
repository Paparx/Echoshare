import { useData } from '../context/DataContext';
import { Leaf, Recycle, Share2, Award, Trophy, Calendar, Boxes, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard = () => {
  const { stats, leaderboard, items } = useData();

  const statCards = [
    { label: 'Items Posted', value: stats.totalItemsShared, icon: Boxes, color: 'text-primary', bg: 'bg-accent/20' },
    { label: 'Events Posted', value: stats.totalEventsOrganized, icon: Calendar, color: 'text-secondary', bg: 'bg-surface' },
    { label: 'Cleanups Posted', value: stats.totalCleanupReports, icon: Leaf, color: 'text-primary', bg: 'bg-accent/30' },
    { label: 'Borrow Actions', value: stats.totalBorrowActions, icon: Recycle, color: 'text-secondary', bg: 'bg-surface', tooltip: 'Borrow actions track how often items are successfully shared between residents, saving new purchases.' },
  ];

  // Prepare data for category chart
  const categoryData = items.reduce((acc: any[], item) => {
    const existing = acc.find(a => a.name === item.category);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ name: item.category, count: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#215B63', '#5B7E3C', '#AAFFC7', '#E8F5BD', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8 md:space-y-12">
      <div className="px-2">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900">Community Impact</h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base font-medium">See how our colony is making a difference together.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat: any, idx: number) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-center text-center md:text-left gap-3 md:gap-4 group hover:shadow-xl transition-all duration-300 relative">
              <div className={`${stat.bg} p-3 md:p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
              </div>
              <div>
                <div className="flex items-center justify-center md:justify-start gap-1">
                  <p className="text-[10px] md:text-xs font-black uppercase text-gray-400 tracking-wider mb-0.5">{stat.label}</p>
                  {stat.tooltip && (
                    <div className="group/tip relative">
                      <Info className="w-3 h-3 text-gray-300 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity z-20">
                        {stat.tooltip}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-lg md:text-2xl font-black text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100">
          <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-6">Items by Category</h3>
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} 
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={window.innerWidth < 768 ? 24 : 40}>
                  {categoryData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2.5 rounded-xl"><Trophy className="w-5 h-5 text-amber-600" /></div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tighter">Leaderboard</h3>
            </div>
          </div>
          <div className="space-y-6">
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No rankings yet</p>
              </div>
            ) : (
              leaderboard.map((u, idx) => (
                <div key={idx} className="flex items-center justify-between group p-2 rounded-2xl hover:bg-surface/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-sm border",
                      idx === 0 ? "bg-amber-100 text-amber-600 border-amber-200" :
                      idx === 1 ? "bg-slate-100 text-slate-600 border-slate-200" :
                      idx === 2 ? "bg-orange-100 text-orange-600 border-orange-200" :
                      "bg-gray-50 text-gray-400 border-gray-100"
                    )}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 group-hover:text-primary transition-colors text-sm md:text-base leading-none">{u.name}</p>
                      <p className="text-[10px] font-black uppercase text-gray-400 mt-1 tracking-wider">{u.points} Points</p>
                    </div>
                  </div>
                  {idx === 0 && <Award className="w-5 h-5 text-amber-500 animate-bounce" />}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default Dashboard;
