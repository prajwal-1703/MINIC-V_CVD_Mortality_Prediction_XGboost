import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ArrowLeft, CheckCircle2, AlertOctagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000';

export default function PredictionForm() {
  const navigate = useNavigate();
  const [features, setFeatures] = useState([]);
  const [formData, setFormData] = useState({});
  const [loadingConfig, setLoadingConfig] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch required features from API
    axios.get(`${API_BASE_URL}/features`)
      .then(res => {
        const feats = res.data.features || [];
        setFeatures(feats);
        // Initialize form data
        const initialData = {};
        feats.forEach(f => initialData[f] = '');
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate inputs
    const parsedData = {};
    for (const [key, val] of Object.entries(formData)) {
      if (val === '') {
        setError(`Please fill in the ${key} field.`);
        return;
      }
      const num = parseFloat(val);
      if (isNaN(num)) {
        setError(`Invalid number for ${key}`);
        return;
      }
      parsedData[key] = num;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, parsedData);
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
    features.forEach(f => resetData[f] = '');
    setFormData(resetData);
  };

  // Convert CamelCase or snake_case to Title Case based on likely feature names
  const formatFeatureName = (name) => {
    return name
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };

  // Helper to determine risk level text and color
  const getRiskStatus = (probability) => {
    const probPct = probability * 100;
    if (probPct < 30) return { text: "Low Risk", color: "text-emerald-400", bg: "bg-emerald-500/20", icon: <CheckCircle2 className="w-12 h-12 text-emerald-400" /> };
    if (probPct <= 60) return { text: "Medium Risk", color: "text-amber-400", bg: "bg-amber-500/20", icon: <AlertOctagon className="w-12 h-12 text-amber-400" /> };
    return { text: "High Risk", color: "text-rose-500", bg: "bg-rose-500/20", icon: <AlertOctagon className="w-12 h-12 text-rose-500" /> };
  };

  if (loadingConfig) {
    return (
      <div className="flex flex-col items-center justify-center mt-32 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        <p className="text-slate-400">Loading model configuration...</p>
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
        <h2 className="text-3xl font-bold mb-2">Prediction Result</h2>
        
        <div className="flex flex-col items-center mt-8 w-full max-w-sm">
          <div className="flex justify-between w-full mb-2 text-sm font-medium">
            <span className="text-slate-400">Probability Score</span>
            <span className={status.color}>{probPct}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden outline outline-1 outline-slate-700">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${probPct > 60 ? 'bg-rose-500' : probPct > 30 ? 'bg-amber-400' : 'bg-emerald-500'}`}
              style={{ width: `${probPct}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-10 p-6 bg-slate-900/50 rounded-xl border border-slate-700 w-full text-center">
          <p className="text-slate-400 text-sm uppercase tracking-wider mb-1">Risk Evaluation</p>
          <p className={`text-4xl font-extrabold ${status.color}`}>
            {status.text}
          </p>
          <p className="text-slate-400 text-sm mt-4">
            Threshold setting: {(result.threshold * 100).toFixed(0)}%
          </p>
        </div>

        <div className="flex gap-4 mt-10">
          <button 
            onClick={resetForm}
            className="px-6 py-3 rounded-lg font-medium border border-blue-500 text-blue-400 hover:bg-blue-500/10 transition-colors"
          >
            New Prediction
          </button>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-lg font-medium bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mt-4 animate-fade-in mb-20">
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Home</span>
      </button>

      <div className="glass-panel p-8 md:p-10">
        <h2 className="text-2xl font-bold mb-6 text-white border-b border-slate-700 pb-4">Patient Information</h2>
        
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-4 rounded-lg mb-6 flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {features.length === 0 && !error ? (
          <div className="bg-amber-500/10 border border-amber-500/50 text-amber-400 p-4 rounded-lg mb-6">
            Warning: The backend did not return any explicit feature names. The model might not have feature names saved, or something went wrong.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  {formatFeatureName(feature)}
                </label>
                <input
                  type="number"
                  step="any"
                  name={feature}
                  value={formData[feature] || ''}
                  onChange={handleChange}
                  placeholder={`Enter ${formatFeatureName(feature)}`}
                  className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                />
              </div>
            ))}
          </div>

          <div className="pt-6 mt-6 border-t border-slate-700">
            <button
              type="submit"
              disabled={isSubmitting || features.length === 0}
              className="w-full relative px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all overflow-hidden flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Analyzing Patient Data...
                </>
              ) : (
                <>
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-500 group-hover:scale-105 transition-transform duration-300"></div>
                  <span className="relative">Compute Risk Score</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
