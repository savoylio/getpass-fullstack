'use client';
import { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
      <div className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-lg border ${
        type === 'success' ? 'bg-white text-green-700 border-green-100' : 'bg-white text-red-700 border-red-100'
      }`}>
        {type === 'success' ? <CheckCircle size={20} className="text-green-500"/> : <AlertCircle size={20} className="text-red-500"/>}
        <span className="font-medium text-sm">{message}</span>
        <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100"><X size={16}/></button>
      </div>
    </div>
  );
}