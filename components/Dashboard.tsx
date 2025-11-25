import React from 'react';
import { DailyLog } from '../types';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  logs: DailyLog[];
}

export const Dashboard: React.FC<DashboardProps> = ({ logs }) => {
  const data = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const totalSpend = logs.reduce((acc, curr) => acc + curr.totalCost, 0);
  const totalItems = logs.reduce((acc, curr) => acc + curr.items.reduce((s, i) => s + i.quantity, 0), 0);
  const uniqueSuppliers = new Set(logs.map(l => l.supplier)).size;

  const Widget = ({ label, value, colorClass }: { label: string, value: string, colorClass: string }) => (
    <div className="bg-ios-card rounded-2xl p-5 flex flex-col justify-between h-32 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity ${colorClass}`}>
         <div className="w-16 h-16 rounded-full bg-current blur-xl"></div>
      </div>
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide z-10">{label}</h3>
      <p className="text-3xl font-bold text-white z-10 tracking-tight">{value}</p>
    </div>
  );

  const chartData = data.map(log => ({
    date: log.date,
    cost: log.totalCost,
  }));

  return (
    <div className="space-y-6 animate-slide-in pb-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">今日概况</h2>
        <span className="text-sm text-ios-blue font-medium">近 30 天</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
           <Widget label="总采购额" value={`¥${totalSpend.toLocaleString()}`} colorClass="text-ios-blue" />
        </div>
        <Widget label="入库数量" value={totalItems.toLocaleString()} colorClass="text-ios-green" />
        <Widget label="供应商数" value={uniqueSuppliers.toString()} colorClass="text-purple-500" />
      </div>

      {/* Apple Health Style Chart */}
      <div className="bg-ios-card rounded-2xl p-6 border border-white/5">
        <h3 className="text-lg font-bold text-white mb-6">支出趋势</h3>
        <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
                <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0A84FF" stopOpacity={0}/>
                </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <Tooltip 
                contentStyle={{ backgroundColor: '#2C2C2E', border: 'none', borderRadius: '8px', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#fff' }}
                cursor={{ stroke: 'rgba(255,255,255,0.2)' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#0A84FF" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorCost)" 
                />
            </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};