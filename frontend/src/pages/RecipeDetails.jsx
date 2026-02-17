import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useAuthStore } from '../stores/authStore';
import { useRecipesStore } from '../stores/recipesStore';
import { useRecipeIngredientsStore } from '../stores/recipeIngredientsStore';
import { useProductsStore } from '../stores/productsStore';
import { useCartStore } from '../stores/cartStore';

import RecipeHeader from '../components/recipes/RecipeHeader';
import IngredientsTable from '../components/recipes/IngredientsTable';
import RecipeActions from '../components/recipes/RecipeActions';
import ExternalRecipesSection from '../components/recipes/ExternalRecipesSection';

export default function RecipeDetails() {
  const { recipeId } = useParams();

  const user = useAuthStore((s) => s.user);
  const role = (user?.role || '').toLowerCase();
  const canAddToCart = role === 'user';

  const recipe = useRecipesStore((s) => s.recipe);
  const fetchRecipeById = useRecipesStore((s) => s.fetchRecipeById);

  const ingredients = useRecipeIngredientsStore((s) => s.items);
  const fetchByRecipeId = useRecipeIngredientsStore((s) => s.fetchByRecipeId);
  const setRecipeId = useRecipeIngredientsStore((s) => s.setRecipeId);

  const products = useProductsStore((s) => s.items);
  const fetchProducts = useProductsStore((s) => s.fetchProducts);

  const addItem = useCartStore((s) => s.addItem);

  const [addedMsg, setAddedMsg] = useState('');

  useEffect(() => {
    if (!recipeId) return;

    setAddedMsg('');
    setRecipeId(recipeId);

    fetchProducts();
    fetchRecipeById(recipeId);
    fetchByRecipeId(recipeId);
  }, [recipeId]);

  const productsById = useMemo(() => {
    const map = new Map();
    for (const p of products || []) map.set(p.id, p);
    return map;
  }, [products]);

  function addIngredientToCart(ri, product) {
    if (!canAddToCart) return;
    if (!product) return;

    addItem(product, Number(ri.quantity || 1));
    setAddedMsg(`Added ${ri.quantity}× ${product.name} to cart.`);
    window.setTimeout(() => setAddedMsg(''), 1200);
  }

  function addWholeRecipeToCart() {
    if (!canAddToCart) return;
    if (!ingredients?.length) return;

    let added = 0;
    for (const ri of ingredients) {
      const p = productsById.get(ri.product_id);
      if (!p) continue;
      const qty = Number(ri.quantity || 1);
      if (qty > 0) {
        addItem(p, qty);
        added += 1;
      }
    }

    setAddedMsg(
      added > 0
        ? `Added ${added} ingredient(s) from this recipe to cart.`
        : 'No matching products were added.',
    );
    window.setTimeout(() => setAddedMsg(''), 1400);
  }

  return (
    <div className='mx-auto max-w-6xl px-4 py-10'>
      {!recipe ? (
        <div className='rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600'>
          Loading recipe...
        </div>
      ) : (
        <div className='space-y-6'>
          <RecipeHeader recipe={recipe} />

          <div className='grid gap-6 lg:grid-cols-3'>
            <div className='lg:col-span-2'>
              <IngredientsTable
                ingredients={ingredients}
                productsById={productsById}
                canAddToCart={canAddToCart}
                onAddIngredient={addIngredientToCart}
              />
            </div>

            <div className='space-y-6'>
              <RecipeActions
                canAddToCart={canAddToCart}
                onAddWholeRecipe={addWholeRecipeToCart}
                addedMessage={addedMsg}
              />
            </div>
          </div>

          <ExternalRecipesSection recipe={recipe} />
        </div>
      )}
    </div>
  );
}
