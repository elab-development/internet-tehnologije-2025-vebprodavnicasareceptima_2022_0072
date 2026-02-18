import '@testing-library/jest-dom/vitest';

beforeEach(() => {
  localStorage.clear();
});

export function resetZustandStore(store, initialState) {
  store.setState(initialState, true);
}
