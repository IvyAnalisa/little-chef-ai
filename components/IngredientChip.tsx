
import React from 'react';

interface IngredientChipProps {
  label: string;
  onRemove: () => void;
}

const IngredientChip: React.FC<IngredientChipProps> = ({ label, onRemove }) => {
  return (
    <div className="flex items-center gap-2 bg-[#f4e4bc] text-[#5c4033] border border-[#d2b48c] px-3 py-1.5 rounded-md text-sm font-semibold shadow-sm animate-in fade-in zoom-in duration-300">
      <span className="font-serif italic">{label}</span>
      <button 
        onClick={onRemove}
        className="hover:text-red-700 transition-colors rounded-full hover:bg-red-100 p-0.5"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  );
};

export default IngredientChip;
