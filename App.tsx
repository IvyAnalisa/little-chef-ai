
import React, { useState, useEffect } from 'react';
import { AppState, SavedRecipe, Recipe, ShoppingItem } from './types';
import { generateRecipe, generateFoodImage } from './services/geminiService';
import IngredientChip from './components/IngredientChip';
import RecipeDisplay from './components/RecipeDisplay';

const DIETARY_OPTIONS = ["Vegan", "Vegetarian", "Gluten-Free", "Keto", "Dairy-Free"];
const TIME_OPTIONS = ["Quick (15 min)", "30 mins", "1 Hour", "Show-stopper"];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    ingredients: [],
    dietaryRestrictions: [],
    cookingTime: "30 mins",
    recipe: null,
    isLoading: false,
    isGeneratingImage: false,
    foodImageUrl: null,
    error: null,
    savedRecipes: [],
    shoppingList: [],
    currentView: 'home'
  });

  const [inputValue, setInputValue] = useState("");
  const [shoppingInputValue, setShoppingInputValue] = useState("");

  // Load saved data on mount
  useEffect(() => {
    const savedCookbook = localStorage.getItem('littlechef_cookbook');
    const savedShopping = localStorage.getItem('littlechef_shopping');
    
    setState(prev => ({
      ...prev,
      savedRecipes: savedCookbook ? JSON.parse(savedCookbook) : [],
      shoppingList: savedShopping ? JSON.parse(savedShopping) : []
    }));
  }, []);

  // Persist data when it changes
  useEffect(() => {
    localStorage.setItem('littlechef_cookbook', JSON.stringify(state.savedRecipes));
  }, [state.savedRecipes]);

  useEffect(() => {
    localStorage.setItem('littlechef_shopping', JSON.stringify(state.shoppingList));
  }, [state.shoppingList]);

  const addIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputValue.trim().toLowerCase();
    if (val && !state.ingredients.includes(val)) {
      setState(prev => ({ ...prev, ingredients: [...prev.ingredients, val] }));
      setInputValue("");
    }
  };

  const removeIngredient = (ing: string) => {
    setState(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(i => i !== ing)
    }));
  };

  const toggleDietary = (option: string) => {
    setState(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(option)
        ? prev.dietaryRestrictions.filter(o => o !== option)
        : [...prev.dietaryRestrictions, option]
    }));
  };

  const handleGenerate = async () => {
    if (state.ingredients.length === 0) {
      setState(prev => ({ ...prev, error: "Please add at least one ingredient!" }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null, 
      recipe: null, 
      foodImageUrl: null,
      currentView: 'home' 
    }));

    try {
      const recipe = await generateRecipe(
        state.ingredients,
        state.dietaryRestrictions,
        state.cookingTime
      );

      setState(prev => ({ ...prev, recipe, isLoading: false, isGeneratingImage: true }));

      try {
        const imageUrl = await generateFoodImage(recipe.title, recipe.description);
        setState(prev => ({ ...prev, foodImageUrl: imageUrl, isGeneratingImage: false }));
      } catch (err) {
        console.error("Image generation failed", err);
        setState(prev => ({ ...prev, isGeneratingImage: false }));
      }

    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: "The chef is busy... please try again in a moment." 
      }));
    }
  };

  const saveCurrentRecipe = () => {
    if (!state.recipe) return;
    const isAlreadySaved = state.savedRecipes.some(r => r.recipe.title === state.recipe?.title);
    if (isAlreadySaved) return;

    const newSaved: SavedRecipe = {
      id: Date.now().toString(),
      recipe: state.recipe,
      imageUrl: state.foodImageUrl,
      timestamp: Date.now()
    };
    setState(prev => ({ ...prev, savedRecipes: [newSaved, ...prev.savedRecipes] }));
  };

  const addIngredientsToShoppingList = () => {
    if (!state.recipe) return;
    const itemsToAdd: ShoppingItem[] = state.recipe.ingredients.map(ing => ({
      id: Math.random().toString(36).substr(2, 9),
      name: ing.item,
      amount: ing.amount,
      checked: false
    }));
    setState(prev => ({ ...prev, shoppingList: [...prev.shoppingList, ...itemsToAdd] }));
    alert("Ingredients added to your shopping list!");
  };

  const manualAddShoppingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shoppingInputValue.trim()) return;
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: shoppingInputValue.trim(),
      amount: "",
      checked: false
    };
    setState(prev => ({ 
      ...prev, 
      shoppingList: [newItem, ...prev.shoppingList] 
    }));
    setShoppingInputValue("");
  };

  const toggleShoppingItem = (id: string) => {
    setState(prev => ({
      ...prev,
      shoppingList: prev.shoppingList.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    }));
  };

  const removeShoppingItem = (id: string) => {
    setState(prev => ({
      ...prev,
      shoppingList: prev.shoppingList.filter(item => item.id !== id)
    }));
  };

  const clearShoppingList = () => {
    if (window.confirm("Are you sure you want to clear your entire list?")) {
      setState(prev => ({ ...prev, shoppingList: [] }));
    }
  };

  const deleteSavedRecipe = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setState(prev => ({ ...prev, savedRecipes: prev.savedRecipes.filter(r => r.id !== id) }));
  };

  const loadSavedRecipe = (saved: SavedRecipe) => {
    setState(prev => ({
      ...prev,
      recipe: saved.recipe,
      foodImageUrl: saved.imageUrl,
      currentView: 'home'
    }));
  };

  const isCurrentRecipeSaved = state.savedRecipes.some(r => r.recipe.title === state.recipe?.title);

  return (
    <div className="min-h-screen pb-20">
      <div className="h-2 gingham-border shadow-sm"></div>

      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-[#f4e4bc] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => setState(prev => ({ ...prev, currentView: 'home' }))}
          >
             <div className="relative">
                <div className="w-14 h-14 bg-[#8b0000] rounded-2xl flex items-center justify-center text-white shadow-lg transform rotate-3 group-hover:rotate-12 transition-transform">
                  <span className="text-4xl">👨‍🍳</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#b87333] rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                  <span className="text-sm">🐀</span>
                </div>
             </div>
             <div>
               <h1 className="text-2xl font-serif font-black tracking-tighter text-[#2c1810]">LittleChef<span className="text-[#8b0000]">AI</span></h1>
               <p className="text-[10px] uppercase tracking-[0.3em] text-[#b87333] font-bold">Inspired by Gusteau's</p>
             </div>
          </div>
          <div className="hidden md:flex gap-10 text-sm font-bold text-[#5c4033] uppercase tracking-widest">
            <button 
              onClick={() => setState(prev => ({ ...prev, currentView: 'home' }))}
              className={`transition-colors border-b-2 pb-1 ${state.currentView === 'home' ? 'text-[#8b0000] border-[#8b0000]' : 'border-transparent hover:text-[#8b0000] hover:border-[#8b0000]'}`}
            >
              The Menu
            </button>
            <button 
              onClick={() => setState(prev => ({ ...prev, currentView: 'saved' }))}
              className={`transition-colors border-b-2 pb-1 flex items-center gap-2 ${state.currentView === 'saved' ? 'text-[#8b0000] border-[#8b0000]' : 'border-transparent hover:text-[#8b0000] hover:border-[#8b0000]'}`}
            >
              My Cookbook
              {state.savedRecipes.length > 0 && (
                <span className="bg-[#8b0000] text-white text-[10px] px-1.5 py-0.5 rounded-full">{state.savedRecipes.length}</span>
              )}
            </button>
            <button 
              onClick={() => setState(prev => ({ ...prev, currentView: 'shopping' }))}
              className={`transition-colors border-b-2 pb-1 flex items-center gap-2 ${state.currentView === 'shopping' ? 'text-[#8b0000] border-[#8b0000]' : 'border-transparent hover:text-[#8b0000] hover:border-[#8b0000]'}`}
            >
              Shopping List
              {state.shoppingList.filter(i => !i.checked).length > 0 && (
                <span className="bg-[#b87333] text-white text-[10px] px-1.5 py-0.5 rounded-full">{state.shoppingList.filter(i => !i.checked).length}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        {state.currentView === 'home' && (
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
            {/* Control Panel */}
            <div className="lg:col-span-4 space-y-10">
              <section className="bg-white p-8 rounded-[32px] copper-shadow border border-[#f4e4bc] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="text-9xl">🐀</span>
                </div>
                
                <h2 className="text-2xl font-serif font-bold text-[#2c1810] mb-8 flex items-center gap-3">
                  <span className="text-[#b87333]">❦</span>
                  Your Pantry
                </h2>

                <form onSubmit={addIngredient} className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="What's in your fridge?"
                      className="w-full bg-[#fdfaf0] border-2 border-[#f4e4bc] rounded-2xl py-4 pl-5 pr-14 text-lg focus:ring-4 focus:ring-[#b87333]/10 focus:border-[#b87333] outline-none transition-all font-serif italic"
                    />
                    <button 
                      type="submit"
                      className="absolute right-3 top-2.5 bg-[#8b0000] text-white p-2.5 rounded-xl hover:bg-[#a52a2a] transition-all shadow-md active:scale-95"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                    </button>
                  </div>
                </form>

                <div className="flex flex-wrap gap-3 min-h-[80px] mb-10">
                  {state.ingredients.length === 0 ? (
                    <p className="text-[#b87333]/60 text-sm font-serif italic">"Anyone can cook, but only the fearless can be great." — Gusteau</p>
                  ) : (
                    state.ingredients.map(ing => (
                      <IngredientChip key={ing} label={ing} onRemove={() => removeIngredient(ing)} />
                    ))
                  )}
                </div>

                <div className="space-y-10 pt-8 border-t border-[#f4e4bc]">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-[#b87333] font-black mb-4">Dietary Preferences</label>
                    <div className="flex flex-wrap gap-2">
                      {DIETARY_OPTIONS.map(opt => (
                        <button
                          key={opt}
                          onClick={() => toggleDietary(opt)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                            state.dietaryRestrictions.includes(opt)
                              ? 'bg-[#8b0000] border-[#8b0000] text-white shadow-lg'
                              : 'bg-white border-[#f4e4bc] text-[#5c4033] hover:border-[#b87333]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-[#b87333] font-black mb-4">Cooking Time</label>
                    <div className="grid grid-cols-2 gap-3">
                      {TIME_OPTIONS.map(opt => (
                        <button
                          key={opt}
                          onClick={() => setState(prev => ({ ...prev, cookingTime: opt }))}
                          className={`px-4 py-3 rounded-xl text-xs font-bold text-left transition-all border-2 ${
                            state.cookingTime === opt
                              ? 'bg-[#2c1810] border-[#2c1810] text-white shadow-lg scale-[1.02]'
                              : 'bg-white border-[#f4e4bc] text-[#5c4033] hover:border-[#b87333]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={state.isLoading || state.ingredients.length === 0}
                  className="w-full mt-10 bg-[#8b0000] hover:bg-[#a52a2a] disabled:bg-[#f4e4bc] disabled:text-[#d2b48c] text-white font-bold py-5 rounded-2xl shadow-xl shadow-red-100 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
                >
                  {state.isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-bounce text-2xl">🔪</div>
                      <span className="font-serif italic text-lg uppercase tracking-widest">Chef is Preparing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="font-serif italic text-xl">Create Recipe</span>
                      <span className="text-xl group-hover:translate-x-1 transition-transform">✨</span>
                    </div>
                  )}
                </button>
                
                {state.error && (
                  <p className="mt-6 text-sm text-red-700 font-bold text-center italic bg-red-50 p-3 rounded-xl">"{state.error}"</p>
                )}
              </section>
            </div>

            {/* Recipe Card Area */}
            <div className="lg:col-span-8">
              {!state.recipe && !state.isLoading && (
                <div className="h-full min-h-[600px] border-4 border-dashed border-[#f4e4bc] rounded-[40px] flex flex-col items-center justify-center text-center p-12 bg-white/40">
                  <div className="w-32 h-32 bg-[#fdfaf0] rounded-full flex items-center justify-center mb-10 shadow-inner border border-[#f4e4bc]">
                    <span className="text-6xl animate-pulse">🍳</span>
                  </div>
                  <h3 className="text-4xl font-serif text-[#2c1810] mb-4 font-bold">The Kitchen is Empty</h3>
                  <p className="text-[#b87333] max-w-sm font-serif text-lg italic leading-relaxed">Add ingredients on the left, and our little chef will craft a masterpiece.</p>
                </div>
              )}

              {state.isLoading && (
                <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden animate-pulse border-8 border-white copper-shadow">
                  <div className="h-[450px] bg-[#fcf5e5]"></div>
                  <div className="p-12 space-y-6">
                    <div className="h-14 bg-[#fcf5e5] rounded-2xl w-2/3 mx-auto"></div>
                    <div className="h-4 bg-[#fcf5e5] rounded-full w-full"></div>
                    <div className="grid grid-cols-4 gap-8 mt-12 py-10">
                      {[1,2,3,4].map(i => <div key={i} className="h-12 bg-[#fcf5e5] rounded-xl"></div>)}
                    </div>
                  </div>
                </div>
              )}

              {state.recipe && (
                <RecipeDisplay 
                  recipe={state.recipe} 
                  imageUrl={state.foodImageUrl} 
                  isGeneratingImage={state.isGeneratingImage}
                  onSave={saveCurrentRecipe}
                  onAddToList={addIngredientsToShoppingList}
                  isSaved={isCurrentRecipeSaved}
                />
              )}
            </div>
          </div>
        )}

        {state.currentView === 'saved' && (
          <div className="animate-in fade-in duration-500">
            <header className="mb-12 text-center">
              <h2 className="text-5xl font-serif font-bold text-[#2c1810] mb-4">My Culinary History</h2>
              <p className="text-[#b87333] font-serif italic text-xl">"A collection of your finest creations"</p>
            </header>

            {state.savedRecipes.length === 0 ? (
              <div className="h-[500px] border-4 border-dashed border-[#f4e4bc] rounded-[40px] flex flex-col items-center justify-center text-center p-12 bg-white/40">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#f4e4bc]">
                  <span className="text-4xl">📖</span>
                </div>
                <h3 className="text-2xl font-serif text-[#2c1810] mb-2 font-bold">Your Cookbook is Empty</h3>
                <p className="text-[#b87333] max-w-sm font-serif italic mb-8">You haven't saved any recipes yet. Start cooking and save your favorites!</p>
                <button 
                  onClick={() => setState(prev => ({ ...prev, currentView: 'home' }))}
                  className="bg-[#8b0000] text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-[#a52a2a] transition-colors"
                >
                  Back to Kitchen
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                {state.savedRecipes.map(saved => (
                  <div 
                    key={saved.id}
                    onClick={() => loadSavedRecipe(saved)}
                    className="group bg-white p-4 rounded-lg shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:-rotate-1 relative"
                    style={{ background: '#fdfaf0' }}
                  >
                    <div className="aspect-square bg-gray-100 mb-4 overflow-hidden rounded-sm border-4 border-white shadow-inner">
                      {saved.imageUrl ? (
                        <img src={saved.imageUrl} alt={saved.recipe.title} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 italic">No image</div>
                      )}
                    </div>
                    <div className="px-1">
                      <h4 className="font-serif font-bold text-xl text-[#2c1810] leading-tight mb-1">{saved.recipe.title}</h4>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-[10px] uppercase tracking-widest text-[#b87333] font-bold">{saved.recipe.difficulty}</span>
                        <button 
                          onClick={(e) => deleteSavedRecipe(saved.id, e)}
                          className="text-[#8b0000] hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {state.currentView === 'shopping' && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
             <header className="mb-12 text-center">
              <h2 className="text-5xl font-serif font-bold text-[#2c1810] mb-4">Liste de Courses</h2>
              <p className="text-[#b87333] font-serif italic text-xl">Your market checklist</p>
            </header>

            <div className="bg-[#fffdf9] p-10 md:p-16 rounded-xl shadow-2xl relative border border-[#f4e4bc] min-h-[600px]">
              {/* Paper Lines decoration */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px)', backgroundSize: '100% 2.5rem' }}></div>
              
              <div className="relative z-10">
                <form onSubmit={manualAddShoppingItem} className="mb-10">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={shoppingInputValue}
                      onChange={(e) => setShoppingInputValue(e.target.value)}
                      placeholder="Add an extra item..."
                      className="flex-grow bg-transparent border-b-2 border-[#b87333]/30 py-2 text-xl font-script outline-none focus:border-[#8b0000] transition-colors"
                    />
                    <button type="submit" className="text-[#8b0000] text-3xl font-bold">+</button>
                  </div>
                </form>

                {state.shoppingList.length === 0 ? (
                  <div className="text-center py-20 opacity-30">
                    <span className="text-6xl block mb-4">🛒</span>
                    <p className="font-serif italic text-lg text-[#2c1810]">Your list is clear, Chef!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {state.shoppingList.map(item => (
                      <div key={item.id} className="flex items-center group">
                        <button 
                          onClick={() => toggleShoppingItem(item.id)}
                          className={`w-6 h-6 rounded-full border-2 border-[#b87333] mr-4 flex-shrink-0 flex items-center justify-center transition-all ${item.checked ? 'bg-[#b87333]' : 'hover:border-[#8b0000]'}`}
                        >
                          {item.checked && <span className="text-white text-[10px]">✓</span>}
                        </button>
                        <div className={`flex-grow flex justify-between items-baseline gap-4 transition-all ${item.checked ? 'opacity-40' : ''}`}>
                          <span className={`text-2xl font-script text-[#2c1810] ${item.checked ? 'line-through' : ''}`}>
                            {item.name}
                          </span>
                          <span className="text-sm font-serif font-bold text-[#b87333]">{item.amount}</span>
                        </div>
                        <button 
                          onClick={() => removeShoppingItem(item.id)}
                          className="ml-4 text-red-300 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {state.shoppingList.length > 0 && (
                  <button 
                    onClick={clearShoppingList}
                    className="mt-16 w-full text-center text-[10px] uppercase tracking-[0.3em] font-black text-[#8b0000]/40 hover:text-[#8b0000] transition-colors"
                  >
                    Clear All Items
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 py-16 border-t border-[#f4e4bc] bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="font-script text-4xl text-[#8b0000] mb-4">Bon Appétit!</div>
          <p className="text-[#b87333] text-xs uppercase tracking-[0.4em] font-bold mb-8">LittleChef Gourmet Kitchen AI</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
