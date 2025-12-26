
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { MapPin, DollarSign, Navigation, Camera, CheckCircle, Loader2, List, Map as MapIcon, Plus, Minus, X, Image as ImageIcon, Lightbulb, Sparkles, AlertCircle, Maximize2, Check, AlertTriangle } from 'lucide-react';
import { Mission, MissionStatus, Product } from '../types';
import { analyzeShelfImage } from '../services/geminiService';

interface Observation {
  type: 'positivo' | 'negativo';
  location: string;
  description: string;
}

interface AIReport {
  stockPercentage: number;
  shelfAnalysis: string;
  photoFeedback: string;
  isHighQuality: boolean;
  observations: Observation[];
}

const MOCK_MISSIONS: Mission[] = [
  { 
    id: '1', 
    storeName: 'Whole Foods Market', 
    address: '123 Market St, SF', 
    brand: 'Organic Oats', 
    task: 'Verificar Estoque e Repor Prateleira', 
    reward: 15.0, 
    status: MissionStatus.AVAILABLE, 
    distance: 'a 0,4 mi',
    products: [
      { id: 'p1', name: 'Aveia em Flocos 500g', expectedStock: 10 },
      { id: 'p2', name: 'Aveia com Mel 400g', expectedStock: 8 },
      { id: 'p3', name: 'Farinha de Aveia 1kg', expectedStock: 12 }
    ]
  },
  { 
    id: '2', 
    storeName: 'Kroger Express', 
    address: '456 Battery St, SF', 
    brand: 'Pure Hydration', 
    task: 'Tirar fotos da exibição', 
    reward: 10.0, 
    status: MissionStatus.AVAILABLE, 
    distance: 'a 1,2 mi',
    products: [
      { id: 'p4', name: 'Água Mineral 500ml', expectedStock: 24 },
      { id: 'p5', name: 'Água com Gás 500ml', expectedStock: 18 }
    ]
  },
  { 
    id: '3', 
    storeName: 'Safeway', 
    address: '789 Mission St, SF', 
    brand: 'Crunchy Snacks', 
    task: 'Atualizar etiquetas de preço', 
    reward: 8.5, 
    status: MissionStatus.AVAILABLE, 
    distance: 'a 2,1 mi',
    products: [
      { id: 'p6', name: 'Batata Clássica 150g', expectedStock: 15 },
      { id: 'p7', name: 'Batata Churrasco 150g', expectedStock: 15 },
      { id: 'p8', name: 'Nacho Cheese 200g', expectedStock: 10 }
    ]
  }
];

export const FreelancerMarketplace: React.FC = () => {
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [previewMission, setPreviewMission] = useState<Mission | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [zoomLevel, setZoomLevel] = useState(7);
  const [isVerifying, setIsVerifying] = useState(false);
  const [report, setReport] = useState<AIReport | null>(null);
  const [submittedPhoto, setSubmittedPhoto] = useState<string | null>(null);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);
  const [productStocks, setProductStocks] = useState<Record<string, number>>({});
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!(window as any).notify) return;
      (window as any).notify(
        "Nova Missão Disponível!", 
        "Uma nova tarefa de reposição em 'Safeway Center' acabou de aparecer. R$ 18,00.", 
        "info"
      );
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleClaim = (mission: Mission) => {
    setSelectedMission({ ...mission, status: MissionStatus.IN_PROGRESS });
    setPreviewMission(null);
    // Inicializar estoques
    const initialStocks: Record<string, number> = {};
    mission.products.forEach(p => initialStocks[p.id] = 0);
    setProductStocks(initialStocks);
  };

  const updateStock = (productId: string, delta: number) => {
    setProductStocks(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + delta)
    }));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsVerifying(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Full = reader.result as string;
      const base64Data = base64Full.split(',')[1];
      setSubmittedPhoto(base64Full);
      
      const result = await analyzeShelfImage(base64Data);
      if (result) {
        try {
          setReport(JSON.parse(result));
        } catch (e) {
          console.error("Falha ao analisar o relatório da IA", e);
        }
      }
      setIsVerifying(false);
      if (selectedMission) {
        setSelectedMission({ ...selectedMission, status: MissionStatus.COMPLETED });
      }
    };
    reader.readAsDataURL(file);
  };

  const clusters = useMemo(() => {
    if (zoomLevel > 5) {
      return MOCK_MISSIONS.map((m, i) => ({
        type: 'individual' as const,
        mission: m,
        pos: [
          { t: '30%', l: '40%' },
          { t: '50%', l: '60%' },
          { t: '45%', l: '30%' }
        ][i] || { t: '50%', l: '50%' }
      }));
    } else {
      return [
        { 
          type: 'cluster' as const, 
          count: 3, 
          pos: { t: '38%', l: '42%' }, 
          missions: MOCK_MISSIONS.slice(0, 3) 
        }
      ];
    }
  }, [zoomLevel]);

  if (selectedMission && selectedMission.status === MissionStatus.IN_PROGRESS) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg space-y-4">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold">{selectedMission.storeName}</h2>
            <span className="text-blue-600 font-bold text-lg">R$ {selectedMission.reward.toFixed(2)}</span>
          </div>
          <p className="text-slate-600 flex items-center gap-2 text-sm"><MapPin size={16}/> {selectedMission.address}</p>
          
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <p className="text-xs font-bold text-blue-800 uppercase tracking-widest">Tarefa da Missão Ativa</p>
            <p className="text-blue-900 mt-1 font-medium">{selectedMission.task}</p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Contagem de Inventário</h4>
              <span className="text-[10px] text-slate-400 font-medium">Informe o estoque atual nas prateleiras</span>
            </div>
            
            <div className="space-y-3">
              {selectedMission.products.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="min-w-0 pr-2">
                    <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Meta: {product.expectedStock} un.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => updateStock(product.id, -1)}
                      className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 active:scale-90 transition-transform shadow-sm"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center font-bold text-slate-900">{productStocks[product.id] || 0}</span>
                    <button 
                      onClick={() => updateStock(product.id, 1)}
                      className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white active:scale-90 transition-transform shadow-sm"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 space-y-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Camera size={18} className="text-slate-400" />
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Finalizar com Foto</h4>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                disabled={isVerifying}
                className="w-full bg-blue-600 text-white h-14 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all shadow-md disabled:opacity-70"
              >
                {isVerifying ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <><Camera size={22} /> Tirar Foto da Prateleira</>
                )}
              </button>
              
              <button
                onClick={() => galleryInputRef.current?.click()}
                disabled={isVerifying}
                className="w-full bg-slate-50 text-slate-600 border border-slate-200 h-12 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-100 active:scale-95 transition-all"
              >
                <ImageIcon size={18} /> Enviar da Galeria
              </button>
            </div>
          </div>

          <input type="file" ref={cameraInputRef} onChange={handleFileChange} accept="image/*" capture="environment" className="hidden" />
          <input type="file" ref={galleryInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          
          <button onClick={() => { setSelectedMission(null); setSubmittedPhoto(null); }} className="w-full text-slate-400 font-medium text-sm py-2 hover:text-slate-600 transition-colors">
            Cancelar Missão
          </button>
        </div>
      </div>
    );
  }

  if (selectedMission && selectedMission.status === MissionStatus.COMPLETED) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 pt-8 pb-12 animate-in fade-in zoom-in duration-500">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-2 shadow-inner">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Missão Enviada!</h2>
        
        {submittedPhoto && (
          <div className="relative group cursor-pointer" onClick={() => setIsPhotoZoomed(true)}>
            <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
              <img src={submittedPhoto} alt="Foto enviada" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="bg-white/90 p-2 rounded-full shadow-lg transform group-hover:scale-110 transition-transform">
                  <Maximize2 size={20} className="text-slate-700" />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium uppercase tracking-wider">Clique para ampliar a foto enviada</p>
          </div>
        )}

        {report ? (
          <div className="space-y-4 text-left">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-blue-500" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Análise da Prateleira</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                  {report.stockPercentage}% em Estoque
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {report.shelfAnalysis}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Destaques e Áreas de Atenção</p>
              <div className="space-y-3">
                {report.observations.map((obs, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${obs.type === 'positivo' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {obs.type === 'positivo' ? <Check size={14} /> : <AlertTriangle size={14} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{obs.location}</p>
                      <p className="text-sm text-slate-600">{obs.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-5 rounded-2xl border ${report.isHighQuality ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={18} className={report.isHighQuality ? 'text-green-600' : 'text-amber-600'} />
                <p className={`text-xs font-bold uppercase tracking-widest ${report.isHighQuality ? 'text-green-700' : 'text-amber-700'}`}>
                  Feedback de Fotografia
                </p>
              </div>
              <p className={`text-sm leading-relaxed ${report.isHighQuality ? 'text-green-800' : 'text-amber-800'}`}>
                {report.photoFeedback}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-slate-600 px-4 italic animate-pulse">A IA está analisando sua foto em detalhes...</p>
          </div>
        )}

        <button 
          onClick={() => { setSelectedMission(null); setSubmittedPhoto(null); setReport(null); setProductStocks({}); }}
          className="w-full bg-slate-900 text-white h-12 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
        >
          Voltar ao Mercado
        </button>

        {isPhotoZoomed && submittedPhoto && (
          <div 
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={() => setIsPhotoZoomed(false)}
          >
            <button className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
              <X size={24} />
            </button>
            <img 
              src={submittedPhoto} 
              alt="Zoom da foto" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300" 
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Missões Disponíveis</h1>
          <p className="text-slate-500">Encontre tarefas de varejo perto de você para ganhar uma renda extra</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-200/50 p-1 rounded-lg shadow-inner">
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`} title="Visualização em Lista"><List size={20} /></button>
            <button onClick={() => setViewMode('map')} className={`p-1.5 rounded-md transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`} title="Visualização no Mapa"><MapIcon size={20} /></button>
          </div>
          <span className="bg-white px-3 py-1.5 rounded-full border border-slate-200 text-sm font-medium flex items-center gap-1 shadow-sm">
            <Navigation size={14} className="text-blue-600"/> San Francisco, CA
          </span>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {MOCK_MISSIONS.map((mission) => (
            <div key={mission.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              <div className="h-32 bg-slate-100 relative overflow-hidden">
                 <img src={`https://picsum.photos/seed/${mission.id}/600/300`} alt="Loja" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                 <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-sm font-bold text-slate-900 shadow-sm flex items-center gap-1">
                   <DollarSign size={14}/>{mission.reward.toFixed(2)}
                 </div>
                 <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">{mission.brand}</div>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 leading-tight">{mission.storeName}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><MapPin size={14} className="text-slate-400"/> {mission.address} • {mission.distance}</p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-sm text-slate-700 font-medium line-clamp-2">{mission.task}</p>
                </div>
                <button onClick={() => handleClaim(mission)} className="w-full py-2.5 rounded-xl border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-all active:scale-[0.98]">
                  Aceitar Missão
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative w-full h-[650px] bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden shadow-inner animate-in zoom-in-95 duration-300">
          <div className="absolute inset-0 transition-all duration-700 ease-out bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] opacity-40" style={{ backgroundSize: `${zoomLevel * 8}px ${zoomLevel * 8}px`, backgroundPosition: 'center center' }}></div>
          <div className="absolute inset-0 flex items-center justify-center text-slate-300 pointer-events-none uppercase tracking-[1em] font-black text-7xl opacity-5 select-none transition-all duration-700" style={{ transform: `scale(${zoomLevel / 5})` }}>San Francisco</div>
          
          <div className="absolute right-6 top-6 flex flex-col gap-2 z-20">
            <button onClick={() => setZoomLevel(prev => Math.min(10, prev + 1))} className="w-10 h-10 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-slate-50 active:scale-95 transition-all"><Plus size={20} /></button>
            <button onClick={() => setZoomLevel(prev => Math.max(1, prev - 1))} className="w-10 h-10 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-slate-50 active:scale-95 transition-all"><Minus size={20} /></button>
          </div>

          {clusters.map((item, idx) => (
            <div key={idx} className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500" style={{ top: item.pos.t, left: item.pos.l }}>
              {item.type === 'cluster' ? (
                <div onClick={() => setZoomLevel(7)} className="w-12 h-12 rounded-full bg-blue-600 border-4 border-white shadow-xl flex items-center justify-center text-white font-bold cursor-pointer hover:scale-110 active:scale-95 transition-all">{item.count}</div>
              ) : (
                <div className={`relative flex flex-col items-center cursor-pointer transition-all ${previewMission?.id === item.mission.id ? 'scale-110 z-10' : 'hover:scale-105'}`} onClick={() => setPreviewMission(item.mission)}>
                  <div className={`shadow-xl rounded-full px-3 py-1.5 border-2 flex items-center gap-1 transition-all ${previewMission?.id === item.mission.id ? 'bg-blue-600 border-white text-white' : 'bg-white border-blue-600 text-blue-600 hover:bg-blue-50'}`}>
                    <span className="font-bold text-sm">${item.mission.reward.toFixed(0)}</span>
                  </div>
                  <div className={`w-0.5 h-3 ${previewMission?.id === item.mission.id ? 'bg-blue-600' : 'bg-blue-500/50'}`}></div>
                </div>
              )}
            </div>
          ))}

          {previewMission && (
            <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in slide-in-from-bottom-4 duration-300 z-30">
              <button onClick={() => setPreviewMission(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  <img src={`https://picsum.photos/seed/${previewMission.id}/200/200`} alt="Loja" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <h4 className="font-bold text-slate-900 truncate">{previewMission.storeName}</h4>
                  <p className="text-xs text-slate-500 truncate">{previewMission.address}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-blue-600 font-bold text-sm">R$ {previewMission.reward.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400">• {previewMission.distance}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0"></div>
                  <p className="text-xs text-slate-700 leading-relaxed"><span className="font-semibold">{previewMission.brand}:</span> {previewMission.task}</p>
                </div>
                <button onClick={() => handleClaim(previewMission)} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2">Aceitar Esta Missão</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
