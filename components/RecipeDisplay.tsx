
import React from 'react';
import { Recipe } from '../types';

interface RecipeDisplayProps {
  recipe: Recipe;
  imageUrl: string | null;
  isGeneratingImage: boolean;
  onSave?: () => void;
  onAddToList?: () => void;
  isSaved?: boolean;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ 
  recipe, 
  imageUrl, 
  isGeneratingImage, 
  onSave,
  onAddToList,
  isSaved 
}) => {
  return (
    <div className="bg-[#fffdf9] rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-700 border-8 border-white copper-shadow">
      <div className="relative h-72 md:h-[450px] bg-[#fdfaf0] overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={recipe.title} 
            className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#8b0000] bg-[#fcf5e5]">
            {isGeneratingImage ? (
              <>
                <div className="relative mb-6">
                   <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#b87333]"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-2xl">🐀</span>
                   </div>
                </div>
                <p className="font-script text-2xl">The little chef is plating...</p>
              </>
            ) : (
              <p className="font-script text-xl">Waiting for the Chef's creation...</p>
            )}
          </div>
        )}
        
        <div className="absolute top-6 right-6 flex gap-3">
          {onSave && (
            <button 
              onClick={onSave}
              title="Save to Cookbook"
              className={`p-3 rounded-full shadow-lg transition-all active:scale-90 ${
                isSaved 
                ? 'bg-[#8b0000] text-white' 
                : 'bg-white/90 backdrop-blur text-[#8b0000] hover:bg-white'
              }`}
            >
              <svg className="w-6 h-6" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          )}
          <span className="bg-[#8b0000] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg flex items-center">
            {recipe.difficulty}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#fffdf9] to-transparent"></div>
      </div>

      <div className="p-8 md:p-14 -mt-10 relative bg-[#fffdf9] rounded-t-[40px]">
        <header className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="h-[2px] w-12 bg-[#b87333] self-center"></div>
            <span className="px-4 text-[#b87333] text-xl">❦</span>
            <div className="h-[2px] w-12 bg-[#b87333] self-center"></div>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif text-[#2c1810] mb-6 leading-tight font-bold">{recipe.title}</h1>
          <p className="text-xl text-[#5c4033] leading-relaxed max-w-2xl mx-auto italic font-serif">
            "{recipe.description}"
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14 border-y-2 border-[#f4e4bc] py-8 text-center">
          <div>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-[#b87333] font-bold mb-1">Preparation</span>
            <span className="text-xl font-serif font-bold text-[#2c1810]">{recipe.prepTime}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-[#b87333] font-bold mb-1">In the Kitchen</span>
            <span className="text-xl font-serif font-bold text-[#2c1810]">{recipe.cookTime}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-[#b87333] font-bold mb-1">Serves</span>
            <span className="text-xl font-serif font-bold text-[#2c1810]">{recipe.servings} People</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-[#b87333] font-bold mb-1">Calories</span>
            <span className="text-xl font-serif font-bold text-[#2c1810]">{recipe.nutritionalInfo.calories} kcal</span>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-16">
          <div className="md:col-span-5">
            <div className="flex justify-between items-center mb-8 border-b-2 border-[#b87333] pb-2">
              <h3 className="text-2xl font-serif font-bold text-[#2c1810]">
                Ingredients
              </h3>
              {onAddToList && (
                <button 
                  onClick={onAddToList}
                  className="text-[10px] font-bold text-[#8b0000] uppercase tracking-widest hover:underline flex items-center gap-1 group"
                >
                  <span className="group-hover:-translate-x-1 transition-transform">+</span> Add all to list
                </button>
              )}
            </div>
            <ul className="space-y-6">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex justify-between items-baseline gap-4 group">
                  <span className="text-[#5c4033] font-medium border-b border-dotted border-[#d2b48c] flex-grow leading-none pb-1 group-hover:text-[#8b0000] transition-colors">
                    {ing.item}
                  </span>
                  <span className="text-[#b87333] font-serif font-bold text-sm whitespace-nowrap">{ing.amount}</span>
                </li>
              ))}
            </ul>

            <div className="mt-12 p-6 bg-[#fcf5e5] rounded-3xl border border-[#f4e4bc]">
              <h4 className="text-[10px] uppercase tracking-widest text-[#b87333] mb-4 font-black">Nutritional Insight</h4>
              <div className="flex justify-between text-center">
                <div>
                  <span className="block text-[10px] text-[#5c4033] uppercase mb-1">Protein</span>
                  <span className="text-sm font-bold text-[#2c1810]">{recipe.nutritionalInfo.protein}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#5c4033] uppercase mb-1">Carbs</span>
                  <span className="text-sm font-bold text-[#2c1810]">{recipe.nutritionalInfo.carbs}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#5c4033] uppercase mb-1">Fat</span>
                  <span className="text-sm font-bold text-[#2c1810]">{recipe.nutritionalInfo.fat}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <h3 className="text-2xl font-serif font-bold text-[#2c1810] mb-8 border-b-2 border-[#b87333] pb-2 inline-block">
              The Method
            </h3>
            <div className="space-y-12">
              {recipe.instructions.map((step, i) => (
                <div key={i} className="relative pl-12">
                  <div className="absolute left-0 top-0 font-script text-4xl text-[#b87333]/30 select-none">
                    {step.stepNumber}.
                  </div>
                  <p className="text-[#2c1810] leading-relaxed text-lg font-serif italic mb-3">
                    {step.instruction}
                  </p>
                  {step.tip && (
                    <div className="text-sm text-[#5c4033] bg-white/50 p-4 rounded-xl border-l-4 border-[#b87333] shadow-sm italic">
                      <span className="font-bold text-[#b87333] not-italic mr-2">Chef's Secret:</span>
                      {step.tip}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="h-4 bg-[#8b0000] gingham-border opacity-50"></div>
    </div>
  );
};

export default RecipeDisplay;
