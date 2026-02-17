import { useEffect, useMemo, useState } from 'react';
import {
  X,
  PlusCircle,
  Save,
  Text,
  ClipboardList,
  Package,
  Hash,
  Ruler,
  Trash2,
  Plus,
} from 'lucide-react';

import { useRecipesStore } from '../../../stores/recipesStore';
import { useProductsStore } from '../../../stores/productsStore';

function FieldError({ show, children }) {
  if (!show) return null;
  return (
    <div className='mt-1 text-xs font-semibold text-red-600'>{children}</div>
  );
}

export default function RecipeModal({ open, onClose, recipe }) {
  const createRecipe = useRecipesStore((s) => s.createRecipe);
  const updateRecipe = useRecipesStore((s) => s.updateRecipe);
  const isLoading = useRecipesStore((s) => s.isLoading);
  const error = useRecipesStore((s) => s.error);
  const clearMessages = useRecipesStore((s) => s.clearMessages);

  const products = useProductsStore((s) => s.items);
  const fetchProducts = useProductsStore((s) => s.fetchProducts);

  const isEdit = useMemo(() => Boolean(recipe?.id), [recipe]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [ingredients, setIngredients] = useState([]);
  const [touched, setTouched] = useState(false);

  const [newPid, setNewPid] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [newUnit, setNewUnit] = useState('');

  const fetchRecipeById = useRecipesStore((s) => s.fetchRecipeById);

  useEffect(() => {
    if (!open) return;

    clearMessages();
    setTouched(false);

    fetchProducts();

    (async () => {
      if (!recipe?.id) {
        setName('');
        setDescription('');
        setIngredients([]);
        setNewPid('');
        setNewQty('1');
        setNewUnit('');
        return;
      }

      const full = await fetchRecipeById(recipe.id);
      setName(full?.name || recipe.name || '');
      setDescription(full?.description || recipe.description || '');

      const ings = Array.isArray(full?.ingredients) ? full.ingredients : [];
      setIngredients(
        ings.map((x) => ({
          product_id: x.product_id,
          quantity: x.quantity,
          unit: x.unit || '',
        })),
      );

      setNewPid('');
      setNewQty('1');
      setNewUnit('');
    })();
  }, [open, recipe?.id]);

  const productMap = useMemo(() => {
    const m = new Map();
    (products || []).forEach((p) => m.set(String(p.id), p));
    return m;
  }, [products]);

  const nameErr = useMemo(() => {
    if (!touched) return '';
    const n = name.trim();
    if (!n) return 'Name is required.';
    if (n.length > 100) return 'Name must be at most 100 characters.';
    return '';
  }, [touched, name]);

  const ingredientsErr = useMemo(() => {
    if (!touched) return '';
    if (!ingredients.length) return 'At least one ingredient is required.';
    for (const it of ingredients) {
      if (!it.product_id) return 'Each ingredient must have a product.';
      const q = Number(it.quantity);
      if (!Number.isInteger(q) || q <= 0)
        return 'Ingredient quantity must be an integer > 0.';
      if ((it.unit || '').trim().length > 50)
        return 'Ingredient unit must be at most 50 characters.';
    }
    const ids = ingredients.map((i) => String(i.product_id));
    if (new Set(ids).size !== ids.length)
      return 'Duplicate products in ingredients are not allowed.';
    return '';
  }, [touched, ingredients]);

  const canSubmit = useMemo(() => {
    if (!name.trim() || name.trim().length > 100) return false;
    if (!ingredients.length) return false;

    const ids = ingredients.map((i) => String(i.product_id));
    if (new Set(ids).size !== ids.length) return false;

    for (const it of ingredients) {
      if (!it.product_id) return false;
      const q = Number(it.quantity);
      if (!Number.isInteger(q) || q <= 0) return false;
      if ((it.unit || '').trim().length > 50) return false;
    }
    return true;
  }, [name, ingredients]);

  if (!open) return null;

  function addIngredient() {
    const pid = String(newPid || '').trim();
    const qty = Number(newQty);
    const u = (newUnit || '').trim();

    if (!pid) return;
    if (!Number.isInteger(qty) || qty <= 0) return;
    if (u.length > 50) return;

    if (ingredients.some((x) => String(x.product_id) === pid)) return;

    setIngredients((prev) => [
      ...prev,
      { product_id: Number(pid), quantity: qty, unit: u },
    ]);

    setNewPid('');
    setNewQty('1');
    setNewUnit('');
  }

  function removeIngredient(pid) {
    setIngredients((prev) =>
      prev.filter((x) => String(x.product_id) !== String(pid)),
    );
  }

  function updateIngredient(pid, patch) {
    setIngredients((prev) =>
      prev.map((x) =>
        String(x.product_id) === String(pid) ? { ...x, ...patch } : x,
      ),
    );
  }

  async function submit(e) {
    e.preventDefault();
    setTouched(true);
    clearMessages();

    if (!canSubmit) return;

    const payload = {
      name: name.trim(),
      description: description || null,
      ingredients: ingredients.map((x) => ({
        product_id: Number(x.product_id),
        quantity: Number(x.quantity),
        unit: (x.unit || '').trim(),
      })),
    };

    try {
      if (isEdit) await updateRecipe(recipe.id, payload);
      else await createRecipe(payload);
      onClose();
    } catch {}
  }

  return (
    <div
      className='fixed inset-0 z-100 flex items-center justify-center p-4'
      role='dialog'
      aria-modal='true'
    >
      <button
        onClick={onClose}
        className='absolute inset-0 bg-black/40'
        aria-label='Close'
      />

      <div className='relative w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl'>
        <div className='flex items-center justify-between border-b border-slate-200 px-5 py-4'>
          <div className='min-w-0'>
            <div className='text-base font-extrabold text-slate-900'>
              {isEdit ? 'Edit recipe' : 'Add new recipe'}
            </div>
            <div className='mt-0.5 text-sm text-slate-600'>
              {isEdit
                ? 'Update recipe details and ingredients.'
                : 'Create a recipe with ingredients.'}
            </div>
          </div>

          <button
            onClick={onClose}
            className='inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            aria-label='Close modal'
            disabled={isLoading}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className='p-5 space-y-4'>
          {error ? (
            <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
              {error}
            </div>
          ) : null}

          {/* Name */}
          <div>
            <label className='text-sm font-semibold text-slate-800'>Name</label>
            <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-red-200'>
              <Text size={18} className='text-slate-500' />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full bg-transparent text-sm outline-none'
                placeholder='e.g. Pasta Pomodoro'
                maxLength={100}
              />
            </div>
            <FieldError show={Boolean(nameErr)}>{nameErr}</FieldError>
          </div>

          {/* Description */}
          <div>
            <label className='text-sm font-semibold text-slate-800'>
              Description (optional)
            </label>
            <div className='mt-1 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-red-200'>
              <ClipboardList size={18} className='mt-0.5 text-slate-500' />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className='min-h-21 w-full resize-none bg-transparent text-sm outline-none'
                placeholder='Short cooking instructions or notes...'
              />
            </div>
          </div>

          {/* Ingredients */}
          <div className='rounded-2xl border border-slate-200 bg-white p-4'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <div className='text-sm font-extrabold text-slate-900'>
                  Ingredients
                </div>
                <div className='mt-0.5 text-xs text-slate-500'>
                  Add at least 1 ingredient. Duplicate products are not allowed.
                </div>
              </div>
            </div>

            {/* Add ingredient row */}
            <div className='mt-3 grid gap-2 md:grid-cols-12'>
              <div className='md:col-span-6'>
                <label className='text-xs font-semibold text-slate-700'>
                  Product
                </label>
                <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2'>
                  <Package size={18} className='text-slate-500' />
                  <select
                    value={newPid}
                    onChange={(e) => setNewPid(e.target.value)}
                    className='w-full bg-transparent text-sm outline-none'
                  >
                    <option value=''>Select product...</option>
                    {(products || []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.unit ? `(${p.unit})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='md:col-span-2'>
                <label className='text-xs font-semibold text-slate-700'>
                  Qty
                </label>
                <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2'>
                  <Hash size={18} className='text-slate-500' />
                  <input
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className='w-full bg-transparent text-sm outline-none'
                    inputMode='numeric'
                    placeholder='1'
                  />
                </div>
              </div>

              <div className='md:col-span-3'>
                <label className='text-xs font-semibold text-slate-700'>
                  Unit
                </label>
                <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2'>
                  <Ruler size={18} className='text-slate-500' />
                  <input
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className='w-full bg-transparent text-sm outline-none'
                    placeholder='e.g. g / ml / pcs'
                    maxLength={50}
                  />
                </div>
              </div>

              <div className='md:col-span-1 flex items-end'>
                <button
                  type='button'
                  onClick={addIngredient}
                  className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60'
                  disabled={!newPid}
                  title='Add ingredient'
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Ingredients list */}
            <div className='mt-4 space-y-2'>
              {ingredients.length ? (
                ingredients.map((it) => {
                  const p = productMap.get(String(it.product_id));
                  return (
                    <div
                      key={it.product_id}
                      className='rounded-xl border border-slate-200 bg-slate-50 p-3'
                    >
                      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                        <div className='min-w-0'>
                          <div className='font-extrabold text-slate-900 truncate'>
                            {p?.name || `Product #${it.product_id}`}
                          </div>
                          <div className='mt-0.5 text-xs text-slate-600'>
                            Product unit:{' '}
                            <span className='font-semibold text-slate-800'>
                              {p?.unit || '-'}
                            </span>
                          </div>
                        </div>

                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                          <div className='flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2'>
                            <Hash size={16} className='text-slate-500' />
                            <input
                              value={String(it.quantity)}
                              onChange={(e) =>
                                updateIngredient(it.product_id, {
                                  quantity: e.target.value,
                                })
                              }
                              className='w-20 bg-transparent text-sm outline-none'
                              inputMode='numeric'
                              placeholder='1'
                            />
                          </div>

                          <div className='flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2'>
                            <Ruler size={16} className='text-slate-500' />
                            <input
                              value={it.unit || ''}
                              onChange={(e) =>
                                updateIngredient(it.product_id, {
                                  unit: e.target.value,
                                })
                              }
                              className='w-40 bg-transparent text-sm outline-none'
                              placeholder='unit'
                              maxLength={50}
                            />
                          </div>

                          <button
                            type='button'
                            onClick={() => removeIngredient(it.product_id)}
                            className='inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                            title='Remove ingredient'
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className='rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600'>
                  No ingredients added yet.
                </div>
              )}

              <FieldError show={Boolean(ingredientsErr)}>
                {ingredientsErr}
              </FieldError>
            </div>
          </div>

          {/* Actions */}
          <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
            <button
              type='button'
              onClick={onClose}
              className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50'
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              type='submit'
              disabled={!canSubmit || isLoading}
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60'
            >
              {isEdit ? <Save size={18} /> : <PlusCircle size={18} />}
              {isLoading
                ? 'Saving...'
                : isEdit
                  ? 'Save changes'
                  : 'Create recipe'}
            </button>
          </div>

          <div className='text-xs text-slate-500'>
            Tip: use search or product filter in the tab to quickly find
            recipes.
          </div>
        </form>
      </div>
    </div>
  );
}
