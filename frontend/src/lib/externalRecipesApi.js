import { apiFetch } from './api';

export function searchExternalRecipes(q, signal) {
  const query = String(q || '').trim();
  const qs = new URLSearchParams({ q: query });
  return apiFetch(`/api/external/recipes?${qs.toString()}`, { signal });
}

export function getExternalRecipeDetails(source, externalId, signal) {
  return apiFetch(`/api/external/recipes/${source}/${externalId}`, { signal });
}
