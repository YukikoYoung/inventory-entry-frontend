
import React, { useState, useRef, useEffect } from 'react';
import { DailyLog, ProcurementItem, CategoryType } from '../types';
import { parseDailyReport } from '../services/geminiService';
import { Icons } from '../constants';

interface EntryFormProps {
  onSave: (log: Omit<DailyLog, 'id'>) => void;
  userName: string;
}

type EntryStep = 'WELCOME' | 'CATEGORY' | 'WORKSHEET' | 'SUMMARY';

const CATEGORIES: { id: CategoryType; label: string; icon: any }[] = [
  { id: 'Meat', label: '肉类', icon: Icons.Meat },
  { id: 'Vegetables', label: '蔬果', icon: Icons.Vegetable },
  { id: 'Dry Goods', label: '干杂', icon: Icons.Cube },
  { id: 'Alcohol', label: '酒水', icon: Icons.Beaker },
  { id: 'Consumables', label: '低耗', icon: Icons.Sparkles },
];

// Mock Data Presets for Demo
const MOCK_PRESETS: Record<string, { supplier: string; notes: string; items: ProcurementItem[] }> = {
  'Meat': {
    supplier: '双汇冷鲜肉直供',
    notes: '今日五花肉品质不错，已核对重量。',
    items: [
      { name: '精品五花肉', specification: '带皮', quantity: 20, unit: 'kg', unitPrice: 28.5, total: 570 },
      { name: '猪肋排', specification: '精修', quantity: 15, unit: 'kg', unitPrice: 32.0, total: 480 },
    ]
  },
  'Vegetables': {
    supplier: '城南蔬菜批发市场',
    notes: '土豆这批个头较小。',
    items: [
      { name: '本地土豆', specification: '黄心', quantity: 50, unit: '斤', unitPrice: 1.2, total: 60 },
      { name: '青椒', specification: '薄皮', quantity: 20, unit: '斤', unitPrice: 4.5, total: 90 },
      { name: '大白菜', specification: '新鲜', quantity: 30, unit: '斤', unitPrice: 0.8, total: 24 },
    ]
  },
  'Alcohol': {
    supplier: '雪花啤酒总代',
    notes: '周末备货，增加库存。',
    items: [
      { name: '雪花勇闯天涯', specification: '500ml*12', quantity: 50, unit: '箱', unitPrice: 38, total: 1900 },
      { name: '百威纯生', specification: '330ml*24', quantity: 20, unit: '箱', unitPrice: 120, total: 2400 },
    ]
  },
  'Dry Goods': {
    supplier: '粮油批发中心',
    notes: '',
    items: [
      { name: '金龙鱼大豆油', specification: '20L/桶', quantity: 5, unit: '桶', unitPrice: 210, total: 1050 },
      { name: '特一粉', specification: '25kg', quantity: 10, unit: '袋', unitPrice: 95, total: 950 },
    ]
  },
  'Consumables': {
    supplier: '酒店用品城',
    notes: '补货一次性用品。',
    items: [
      { name: '抽纸', specification: '200抽', quantity: 100, unit: '包', unitPrice: 2.5, total: 250 },
      { name: '洗洁精', specification: '5kg/桶', quantity: 4, unit: '桶', unitPrice: 15, total: 60 },
    ]
  }
};

// --- Welcome Screen (Minimalist Typography) ---

const WelcomeScreen: React.FC<{ userName: string; onStart: () => void }> = ({ userName, onStart }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = currentTime.getHours();
  let greeting = "早上好";
  if (hour >= 12 && hour < 18) greeting = "下午好";
  if (hour >= 18) greeting = "晚上好";

  return (
    <div className="h-full flex flex-col items-center justify-between p-8 bg-zinc-950 animate-scale-up safe-area-bottom">
      <div className="flex-1 w-full flex flex-col items-center justify-center space-y-12">
         <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold tracking-tighter text-white">
              {greeting}
            </h1>
            <p className="text-lg text-zinc-400 font-medium">
              {userName}，今日的工作就拜托你了
            </p>
         </div>
      </div>

      <div className="w-full space-y-8 pb-4">
        <div className="flex justify-center">
            <div className="px-6 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur text-sm font-mono text-zinc-500">
                {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>

        <button 
            onClick={onStart}
            className="w-full h-14 bg-white text-black rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10"
        >
            <span>开始录入</span>
            <Icons.PlusCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// --- Category Screen (Floating Layered List) ---

const CategoryScreen: React.FC<{ onSelect: (cat: CategoryType) => void; onBack: () => void }> = ({ onSelect, onBack }) => (
  <div className="h-full bg-zinc-950 p-6 flex flex-col animate-slide-in">
    <div className="flex items-center gap-4 mb-10 pt-2">
      <button 
        onClick={onBack} 
        className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors"
      >
        <Icons.ArrowLeft className="w-5 h-5" />
      </button>
      <h2 className="text-2xl font-bold text-white tracking-tight">选择分类</h2>
    </div>

    <div className="flex-1 space-y-3 overflow-y-auto">
      {CATEGORIES.map((cat, idx) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className="group w-full flex items-center justify-between p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all active:scale-[0.98] animate-slide-in"
          style={{ animationDelay: `${idx * 0.05}s` }}
        >
          <div className="flex items-center gap-4">
            {/* Minimal Icon Container */}
            <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
               <cat.icon className="w-5 h-5" />
            </div>
            <span className="text-lg font-medium text-zinc-200 group-hover:text-white">{cat.label}</span>
          </div>
          <Icons.ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400" />
        </button>
      ))}
    </div>
  </div>
);

// --- Worksheet Screen ---

const WorksheetScreen: React.FC<{
  items: ProcurementItem[];
  supplier: string;
  notes: string;
  isAnalyzing: boolean;
  grandTotal: number;
  onBack: () => void;
  onSupplierChange: (val: string) => void;
  onNotesChange: (val: string) => void;
  onItemChange: (index: number, field: keyof ProcurementItem, value: any) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReview: () => void;
}> = ({ 
  items, supplier, notes, isAnalyzing, grandTotal, 
  onBack, onSupplierChange, onNotesChange, onItemChange, onAddItem, onRemoveItem, onImageUpload, onReview 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [items.length]);

  return (
    <div className="h-full flex flex-col bg-zinc-950 animate-slide-in relative">
      {/* Header Layer */}
      <div className="px-6 py-5 flex items-center justify-between sticky top-0 bg-zinc-950/80 backdrop-blur-xl z-20">
         <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <Icons.ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">返回</span>
         </button>
         <div className="px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-mono text-white">
            ¥{grandTotal.toFixed(2)}
         </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pb-40 space-y-6">
        
        {/* Info Section - Card Layer */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-2 ml-1">
              供应商全称
            </label>
            <input 
              type="text"
              value={supplier}
              onChange={(e) => onSupplierChange(e.target.value)}
              placeholder="请输入..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-700 outline-none focus:border-zinc-600 transition-colors"
            />
          </div>
          <div>
             <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-2 ml-1">
               备注信息
             </label>
             <textarea 
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="可选..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 outline-none focus:border-zinc-600 transition-colors resize-none h-12"
             />
          </div>
        </div>

        {/* List Section */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">物品清单</h3>
            <span className="text-[10px] text-zinc-600">{items.length} 项</span>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 relative group transition-all hover:border-zinc-700">
                 {/* Top Row: Name & Remove */}
                 <div className="flex items-start justify-between mb-4">
                    <input 
                      type="text"
                      placeholder="输入品名"
                      value={item.name}
                      onChange={(e) => onItemChange(index, 'name', e.target.value)}
                      className="flex-1 bg-transparent text-lg font-bold text-white placeholder-zinc-700 outline-none"
                    />
                    {items.length > 1 && (
                       <button onClick={() => onRemoveItem(index)} className="text-zinc-600 hover:text-red-400 transition-colors pl-2">
                         <Icons.Trash className="w-4 h-4" />
                       </button>
                    )}
                 </div>

                 {/* Grid Row: Data Inputs */}
                 <div className="grid grid-cols-12 gap-2">
                    {/* Packaging */}
                    <div className="col-span-3">
                        <label className="block text-[9px] text-zinc-600 mb-1 text-center">包装</label>
                        <input 
                            type="text" 
                            value={item.specification || ''}
                            onChange={(e) => onItemChange(index, 'specification', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 text-center text-sm text-zinc-300 outline-none focus:border-zinc-600"
                        />
                    </div>
                    {/* Unit */}
                    <div className="col-span-2">
                        <label className="block text-[9px] text-zinc-600 mb-1 text-center">单位</label>
                        <input 
                            type="text" 
                            value={item.unit}
                            onChange={(e) => onItemChange(index, 'unit', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 text-center text-sm text-zinc-300 outline-none focus:border-zinc-600"
                        />
                    </div>
                    {/* Qty */}
                    <div className="col-span-2">
                        <label className="block text-[9px] text-zinc-600 mb-1 text-center">数量</label>
                        <input 
                            type="number" 
                            value={item.quantity || ''}
                            onChange={(e) => onItemChange(index, 'quantity', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 text-center text-sm text-white font-medium outline-none focus:border-zinc-600"
                        />
                    </div>
                    {/* Price */}
                    <div className="col-span-2">
                        <label className="block text-[9px] text-zinc-600 mb-1 text-center">单价</label>
                        <input 
                            type="number" 
                            value={item.unitPrice || ''}
                            onChange={(e) => onItemChange(index, 'unitPrice', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 text-center text-sm text-white font-medium outline-none focus:border-zinc-600"
                        />
                    </div>
                    {/* Subtotal */}
                    <div className="col-span-3">
                        <label className="block text-[9px] text-zinc-600 mb-1 text-center">小计</label>
                        <div className="w-full bg-zinc-800/50 border border-zinc-800 rounded-lg py-2 text-center text-sm font-bold text-ios-blue">
                             {item.total ? item.total.toFixed(0) : '0'}
                        </div>
                    </div>
                 </div>
              </div>
            ))}
            
            {/* Inline Add Button */}
            <button
                onClick={onAddItem}
                className="w-full py-4 rounded-3xl border-2 border-dashed border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all flex items-center justify-center gap-2 group active:scale-[0.99]"
            >
                <Icons.PlusCircle className="w-5 h-5 group-hover:text-white transition-colors" />
                <span className="font-medium text-sm">添加物品</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Island */}
      <div className="absolute bottom-6 left-4 right-4 z-30 safe-area-bottom">
        <div className="bg-zinc-900 border border-zinc-700/50 rounded-3xl p-2 shadow-2xl flex items-center justify-between backdrop-blur-md">
           <div className="flex items-center gap-1 pl-1">
             {/* Hidden Inputs */}
             <input 
                type="file" 
                ref={cameraInputRef}
                onChange={onImageUpload}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={onImageUpload}
                accept="image/*"
                className="hidden"
              />

             {/* Camera Button */}
             <button 
               onClick={() => cameraInputRef.current?.click()}
               disabled={isAnalyzing}
               className="w-12 h-12 rounded-2xl flex items-center justify-center text-white hover:bg-zinc-800 transition-colors active:scale-95"
             >
               {isAnalyzing ? <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div> : <Icons.Camera className="w-6 h-6" />}
             </button>

             {/* File Upload Button */}
             <button 
               onClick={() => fileInputRef.current?.click()}
               disabled={isAnalyzing}
               className="w-12 h-12 rounded-2xl flex items-center justify-center text-white hover:bg-zinc-800 transition-colors active:scale-95"
             >
               <Icons.Folder className="w-6 h-6" />
             </button>
           </div>

           <button 
              onClick={onReview}
              className="bg-white text-black px-6 py-3 rounded-2xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-transform"
           >
              确认提交
           </button>
        </div>
      </div>
    </div>
  );
}

// --- Summary Screen (Receipt Style) ---

const SummaryScreen: React.FC<{
  items: ProcurementItem[];
  supplier: string;
  notes: string;
  grandTotal: number;
  onBack: () => void;
  onConfirm: () => void;
}> = ({ items, supplier, notes, grandTotal, onBack, onConfirm }) => {
  return (
    <div className="h-full bg-zinc-950 animate-slide-in flex flex-col relative">
      <div className="px-6 py-5 flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors">
           <Icons.ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-white tracking-tight">确认单据</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32">
        <div className="bg-white text-zinc-900 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
           {/* Receipt Header */}
           <div className="text-center mb-6 border-b-2 border-dashed border-zinc-200 pb-6">
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-900">
                  <Icons.Check className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black tracking-tight mb-1">入库清单预览</h3>
              <p className="text-sm text-zinc-500 font-mono">{new Date().toLocaleString('zh-CN', { hour12: false })}</p>
              <div className="mt-4 px-4 py-2 bg-zinc-50 rounded-xl inline-block border border-zinc-100">
                  <p className="text-lg font-bold">{supplier || "未知供应商"}</p>
              </div>
           </div>

           {/* Receipt Items */}
           <div className="space-y-4 mb-8">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-sm group">
                   <div className="flex-1 pr-4">
                      <p className="font-bold text-zinc-900 text-base">{item.name}</p>
                      <p className="text-zinc-500 text-xs mt-0.5 font-mono">
                        {item.specification ? `${item.specification} | ` : ''}
                        {item.quantity}{item.unit} × ¥{item.unitPrice}
                      </p>
                   </div>
                   <p className="font-mono font-bold text-zinc-900">¥{item.total.toFixed(0)}</p>
                </div>
              ))}
           </div>

           {/* Receipt Footer */}
           <div className="border-t-2 border-dashed border-zinc-200 pt-6 space-y-4">
              <div className="flex justify-between items-center">
                 <span className="text-zinc-500 font-medium">总计金额</span>
                 <span className="text-3xl font-black tracking-tighter text-black">¥{grandTotal.toFixed(2)}</span>
              </div>
           </div>

           {notes && (
             <div className="mt-8 bg-zinc-100 p-4 rounded-xl text-sm border border-zinc-200">
                <p className="font-bold text-zinc-400 text-[10px] uppercase tracking-wider mb-1">备注</p>
                <p className="text-zinc-700">{notes}</p>
             </div>
           )}
           
           {/* Decorative Paper Edge (Visual only) */}
           <div className="absolute bottom-0 left-0 right-0 h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAxMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PHBhdGggZD0iTTAgMTBMMTAgMEwyMCAxMFoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] opacity-0"></div>
        </div>
        
        <p className="text-center text-zinc-500 text-xs mt-6">请核对以上信息，确认无误后提交入库。</p>
      </div>

      <div className="absolute bottom-6 left-4 right-4 z-30 safe-area-bottom">
         <button 
            onClick={onConfirm}
            className="w-full bg-ios-blue text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-ios-blue/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
         >
            <Icons.Check className="w-5 h-5" />
            <span>确认入库</span>
         </button>
      </div>
    </div>
  )
}

// --- Main Container ---

export const EntryForm: React.FC<EntryFormProps> = ({ onSave, userName }) => {
  const [step, setStep] = useState<EntryStep>('WELCOME');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Meat');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ProcurementItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCategorySelect = (cat: CategoryType) => {
    setSelectedCategory(cat);
    // Initialize with mock data based on category for demonstration purposes
    const mockData = MOCK_PRESETS[cat] || { supplier: '', notes: '', items: [] };
    
    if (mockData.items.length > 0) {
        setSupplier(mockData.supplier);
        setNotes(mockData.notes);
        setItems(mockData.items);
    } else {
        setSupplier('');
        setNotes('');
        setItems([{ name: '', specification: '', quantity: 0, unit: '', unitPrice: 0, total: 0 }]);
    }
    
    setStep('WORKSHEET');
  };

  const handleItemChange = (index: number, field: keyof ProcurementItem, value: any) => {
    const newItems = [...items];
    const updatedItem = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      const q = parseFloat(updatedItem.quantity as any) || 0;
      const p = parseFloat(updatedItem.unitPrice as any) || 0;
      updatedItem.total = q * p;
    }
    newItems[index] = updatedItem;
    setItems(newItems);
  };

  const addNewRow = () => {
    setItems([...items, { name: '', specification: '', quantity: 0, unit: '', unitPrice: 0, total: 0 }]);
  };

  const removeRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input to allow re-selection of same file
    e.target.value = '';

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        
        const result = await parseDailyReport("", { data: base64Data, mimeType: file.type });
        if (result) {
            const currentItems = items.filter(i => i.name.trim() !== '');
            setItems([...currentItems, ...result.items]);
            if (!supplier && result.supplier) setSupplier(result.supplier);
            if (!notes && result.notes) setNotes(result.notes);
        }
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsAnalyzing(false);
      alert("识别图片失败，请重试");
    }
  };

  const calculateGrandTotal = () => items.reduce((acc, curr) => acc + curr.total, 0);

  const handleWorksheetSubmit = () => {
    // Validate minimally
    if (items.filter(i => i.name.trim() !== '').length === 0) {
        alert("请至少录入一项物品");
        return;
    }
    setStep('SUMMARY');
  };

  const handleSummaryConfirm = () => {
    const validItems = items.filter(i => i.name.trim() !== '');
    onSave({
      date: new Date().toISOString(),
      category: selectedCategory,
      supplier: supplier || '未知供应商',
      items: validItems,
      totalCost: calculateGrandTotal(),
      notes: notes,
      status: 'Stocked'
    });
  };

  return (
    <div className="h-full bg-zinc-950 text-white overflow-hidden">
      {step === 'WELCOME' && (
        <WelcomeScreen 
          userName={userName} 
          onStart={() => setStep('CATEGORY')} 
        />
      )}
      {step === 'CATEGORY' && (
        <CategoryScreen 
          onSelect={handleCategorySelect} 
          onBack={() => setStep('CATEGORY')} 
        />
      )}
      {step === 'WORKSHEET' && (
        <WorksheetScreen
          items={items}
          supplier={supplier}
          notes={notes}
          isAnalyzing={isAnalyzing}
          grandTotal={calculateGrandTotal()}
          onBack={() => setStep('CATEGORY')}
          onSupplierChange={setSupplier}
          onNotesChange={setNotes}
          onItemChange={handleItemChange}
          onAddItem={addNewRow}
          onRemoveItem={removeRow}
          onImageUpload={handleImageUpload}
          onReview={handleWorksheetSubmit}
        />
      )}
      {step === 'SUMMARY' && (
        <SummaryScreen
          items={items}
          supplier={supplier}
          notes={notes}
          grandTotal={calculateGrandTotal()}
          onBack={() => setStep('WORKSHEET')}
          onConfirm={handleSummaryConfirm}
        />
      )}
    </div>
  );
};
