import React from 'react';
import { AppView } from '../types';
import { Icons } from '../constants';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, toggleSidebar }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: '工作台', icon: Icons.ChartBar },
    { id: AppView.NEW_ENTRY, label: '开始录入', icon: Icons.PlusCircle },
    { id: AppView.HISTORY, label: '历史记录', icon: Icons.Clock },
  ];

  return (
    <>
      {/* Mobile Slide-over Overlay */}
      <div 
        className={`fixed inset-0 z-50 transition-all duration-300 md:hidden
        ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={toggleSidebar}></div>
        <div className={`absolute top-0 bottom-0 left-0 w-64 bg-ios-cardHigh transform transition-transform duration-300 flex flex-col p-4 border-r border-ios-separator ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
           <h1 className="text-2xl font-bold text-white mb-8 px-4 mt-8">门店管家</h1>
           <nav className="space-y-1">
             {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onChangeView(item.id); toggleSidebar(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === item.id ? 'bg-ios-blue text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
             ))}
           </nav>
        </div>
      </div>

      {/* Desktop Sidebar (iPad style) */}
      <div className="hidden md:flex flex-col w-64 h-full bg-ios-card border-r border-ios-separator pt-8 px-4">
        <h1 className="text-xl font-bold text-white mb-8 px-2 flex items-center gap-2">
           <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
             <div className="w-3 h-3 bg-black rounded-full"></div>
           </div>
           门店管家
        </h1>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`
                w-full group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                ${currentView === item.id 
                  ? 'bg-ios-blue text-white' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="mt-auto mb-8 px-3">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">JD</div>
            <div className="text-sm text-gray-400">店长</div>
          </div>
        </div>
      </div>
    </>
  );
};