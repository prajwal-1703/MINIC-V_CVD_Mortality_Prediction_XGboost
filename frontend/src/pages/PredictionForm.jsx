import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ArrowLeft, CheckCircle2, AlertOctagon, Settings2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000';

export default function PredictionForm() {
  const navigate = useNavigate();
  const [featureMeta, setFeatureMeta] = useState([]);
  const [formData, setFormData] = useState({});
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch required features with metadata from API
    axios.get(`${API_BASE_URL}/features`)
      .then(res => {
        const meta = res.data.features || [];
        setFeatureMeta(meta);
        
        // Initialize form data with defaults
        const initialData = {};
        meta.forEach(f => {
          initialData[f.name] = f.default;
        });
        setFormData(initialData);
        setLoadingConfig(false);
      })
      .catch(err => {
        console.error("Error fetching features:", err);
        setError("Failed to load model features. Please ensure backend is running.");
        setLoadingConfig(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // Keep numeric values as numbers if they are intended to be
    const processedValue = type === 'number' ? (value === '' ? '' : parseFloat(value)) : value;
    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Clean data: remove empty strings, use defaults if needed
    const submissionData = { ...formData };
    
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, submissionData);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "An error occurred during prediction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    const resetData = {};
    featureMeta.forEach(f => resetData[f.name] = f.default);
    setFormData(resetData);
  };

  const formatFeatureName = (name) => {
    return name
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace('Los', 'Length of Stay (days)')
      .replace('Anchor Age', 'Age');
  };

  const getRiskStatus = (probability) => {
    const probPct = probability * 100;
    if (probPct < 30) return { text: "Low Risk", color: "text-emerald-700", bg: "bg-emerald-100", icon: <CheckCircle2 className="w-12 h-12 text-emerald-600" /> };
    if (probPct <= 60) return { text: "Medium Risk", color: "text-amber-700", bg: "bg-amber-100", icon: <AlertOctagon className="w-12 h-12 text-amber-600" /> };
    return { text: "High Risk", color: "text-rose-700", bg: "bg-rose-100", icon: <AlertOctagon className="w-12 h-12 text-rose-600" /> };
  };

  if (loadingConfig) {
    return (
      <div className="flex flex-col items-center justify-center mt-32 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
        <p className="text-green-800/60">Loading clinical model configuration...</p>
      </div>
    );
  }

  if (result) {
    const probPct = (result.probability * 100).toFixed(1);
    const status = getRiskStatus(result.probability);

    return (
      <div className="w-full max-w-2xl mt-10 animate-fade-in glass-panel p-10 flex flex-col items-center">
        <div className={`p-6 rounded-full mb-6 ${status.bg}`}>
          {status.icon}
        </div>
        <h2 className="text-3xl font-bold mb-2 text-green-900">Analysis Complete</h2>
        
        <div className="flex flex-col items-center mt-8 w-full max-w-sm">
          <div className="flex justify-between w-full mb-2 text-sm font-semibold">
            <span className="text-green-800/60 font-medium">Mortality Probability</span>
            <span className={status.color}>{probPct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200 shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${probPct > 60 ? 'bg-rose-500' : probPct > 30 ? 'bg-amber-400' : 'bg-emerald-500'}`}
              style={{ width: `${probPct}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-10 p-6 bg-white/50 rounded-2xl border border-green-100 w-full text-center shadow-sm">
          <p className="text-green-800/40 text-xs uppercase tracking-widest font-bold mb-1">Risk Evaluation</p>
          <p className={`text-5xl font-black ${status.color}`}>
            {status.text}
          </p>
          <p className="text-green-800/60 text-sm mt-4 font-medium">
            Clinical threshold: {(result.threshold * 100).toFixed(0)}%
          </p>
        </div>

        <div className="flex gap-4 mt-10">
          <button 
            onClick={resetForm}
            className="px-6 py-3 rounded-xl font-bold border-2 border-green-600 text-green-700 hover:bg-green-50 transition-colors"
          >
            New Assessment
          </button>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl font-bold bg-green-50 text-green-800 border border-green-100 hover:bg-green-100 transition-colors"
          >
            Back Home
          </button>
        </div>
      </div>
    );
  }

  const renderField = (field) => {
    const { name, type, options } = field;
    const commonClass = "bg-white border border-green-100 rounded-xl px-4 py-3 text-green-900 placeholder-green-800/30 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm";
    
    return (
      <div key={name} className="flex flex-col space-y-2">
        <label className="text-xs font-bold text-green-800/60 uppercase tracking-widest flex items-center gap-1.5 ml-1">
          {formatFeatureName(name)}
          {field.important && <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Required Feature"></span>}
        </label>
        
        {type === 'categorical' || type === 'boolean' ? (
          <div className="relative">
            <select
              name={name}
              value={formData[name]}
              onChange={handleChange}
              className={`${commonClass} w-full appearance-none pr-10 font-medium`}
            >
              {options.map(opt => (
                <option key={opt} value={opt} className="bg-white text-green-900">{opt === 0 ? "No" : opt === 1 ? "Yes" : opt}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400 pointer-events-none" />
          </div>
        ) : (
          <input
            type="number"
            step="any"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder={`e.g. ${field.default}`}
            className={`${commonClass} font-mono`}
          />
        )}
      </div>
    );
  };

  const importantFields = featureMeta.filter(f => f.important);
  const technicalFields = featureMeta.filter(f => !f.important);

  return (
    <div className="w-full max-w-4xl mt-4 animate-fade-in mb-20">
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center space-x-2 text-green-800/60 hover:text-green-900 font-bold transition-colors mb-6 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Home</span>
      </button>

      <div className="glass-panel overflow-hidden border-2">
        <div className="bg-gradient-to-r from-green-600/5 to-emerald-600/5 p-8 border-b border-green-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-black text-green-900 mb-2">Patient Assessment</h2>
              <p className="text-green-800/60 font-medium max-w-lg text-sm">Enter the clinical parameters below. Essential fields have been prioritized for a faster workflow.</p>
            </div>
            <div className="bg-green-500/10 p-3 rounded-2xl border border-green-500/20">
              <Info className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-start gap-3 animate-shake font-medium">
              <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <h3 className="text-lg font-black text-green-900 flex items-center gap-2">
              <span className="w-2 h-6 bg-green-500 rounded-full"></span>
              Primary Clinical Indicators
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {importantFields.map(renderField)}
            </div>
          </div>

          <div className="pt-4 border-t border-green-50">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs font-bold text-green-800/40 uppercase tracking-widest hover:text-green-600 transition-colors group"
            >
              <Settings2 className={`w-4 h-4 transition-transform duration-300 ${showAdvanced ? 'rotate-90 text-green-500' : ''}`} />
              {showAdvanced ? 'Hide Technical Parameters' : 'Show Technical Parameters (Advanced)'}
              {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" /> }
            </button>
            
            {showAdvanced && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-down">
                <div className="col-span-full bg-green-50/50 p-4 rounded-xl border border-green-100 text-[10px] text-green-800/50 uppercase tracking-[2px] font-bold italic mb-2">
                  Technical parameters are pre-filled with clinical averages.
                </div>
                {technicalFields.map(renderField)}
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || featureMeta.length === 0}
              className="w-full relative px-8 py-5 bg-green-600 hover:bg-green-500 rounded-2xl font-black text-xl shadow-[0_10px_40px_rgba(22,163,74,0.2)] disabled:opacity-50 disabled:cursor-not-allowed transition-all overflow-hidden flex items-center justify-center gap-3 group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-7 h-7 animate-spin text-white" />
                  <span className="text-white">Generating Risk Profile...</span>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-600 via-emerald-600 to-green-500 background-animate group-hover:scale-105 transition-transform duration-500"></div>
                  <span className="relative z-10 text-white">Run Mortality Prediction</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
