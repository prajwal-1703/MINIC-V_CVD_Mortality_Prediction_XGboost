import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Activity, HeartPulse } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col items-center justify-center pt-10">
      <div className="glass-panel p-10 md:p-14 w-full max-w-3xl flex flex-col items-center text-center space-y-8">
        <div className="inline-flex items-center justify-center p-4 bg-emerald-500/20 rounded-full mb-2">
          <HeartPulse className="w-16 h-16 text-emerald-400" />
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
          Mortality Risk Prediction System
        </h2>
        
        <p className="text-lg text-slate-300 max-w-xl">
          Leverage our advanced machine learning models to analyze patient features and predict mortality risk with high accuracy. Fast, secure, and intuitive.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full py-6">
          <div className="flex flex-col items-center p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
            <Activity className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="font-semibold text-lg">Real-time Analysis</h3>
            <p className="text-sm text-slate-400 mt-2 text-center">Instant risk probability scoring powered by state-of-the-art XGBoost algorithms.</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
            <ShieldAlert className="w-8 h-8 text-rose-400 mb-3" />
            <h3 className="font-semibold text-lg">Clinical Support</h3>
            <p className="text-sm text-slate-400 mt-2 text-center">Empowering medical professionals with reliable data to make informed clinical decisions.</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/predict')}
          className="mt-6 group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all overflow-hidden"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-500 group-hover:scale-105 transition-transform duration-300"></div>
          <span className="relative flex items-center gap-2">
            Start Prediction
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
