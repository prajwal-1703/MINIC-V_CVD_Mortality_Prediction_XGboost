import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Activity, HeartPulse } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col items-center justify-center pt-10">
      <div className="glass-panel p-10 md:p-14 w-full max-w-3xl flex flex-col items-center text-center space-y-8">
        <div className="inline-flex items-center justify-center p-4 bg-green-500/10 rounded-full mb-2">
          <HeartPulse className="w-16 h-16 text-green-600" />
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-green-900 to-green-600">
          Mortality Risk Prediction System
        </h2>
        
        <p className="text-lg text-green-800/70 max-w-xl font-medium">
          Leverage our advanced machine learning models to analyze patient features and predict mortality risk with high accuracy. Fast, secure, and intuitive.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full py-6">
          <div className="flex flex-col items-center p-6 bg-white/50 rounded-xl border border-green-100 hover:bg-green-50 transition-colors shadow-sm">
            <Activity className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-lg text-green-900">Real-time Analysis</h3>
            <p className="text-sm text-green-700/70 mt-2 text-center">Instant risk probability scoring powered by state-of-the-art XGBoost algorithms.</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-white/50 rounded-xl border border-green-100 hover:bg-green-50 transition-colors shadow-sm">
            <ShieldAlert className="w-8 h-8 text-emerald-600 mb-3" />
            <h3 className="font-semibold text-lg text-green-900">Clinical Support</h3>
            <p className="text-sm text-green-700/70 mt-2 text-center">Empowering medical professionals with reliable data to make informed clinical decisions.</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/predict')}
          className="mt-6 group relative px-8 py-4 bg-green-600 hover:bg-green-500 rounded-full font-bold text-lg shadow-[0_4px_20px_rgba(22,163,74,0.3)] hover:shadow-[0_6px_30px_rgba(22,163,74,0.4)] transition-all overflow-hidden"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-600 to-emerald-500 group-hover:scale-105 transition-transform duration-300"></div>
          <span className="relative flex items-center gap-2 text-white">
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
