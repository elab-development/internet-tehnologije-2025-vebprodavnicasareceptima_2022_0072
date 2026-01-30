export default function Footer() {
  return (
    <footer className='border-t border-slate-200 bg-white'>
      <div className='mx-auto max-w-6xl px-4 py-6 text-sm text-slate-600 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='font-semibold text-slate-800'>ShopTheStep</div>
        <div>© {new Date().getFullYear()} • Recipes & web shop</div>
      </div>
    </footer>
  );
}
