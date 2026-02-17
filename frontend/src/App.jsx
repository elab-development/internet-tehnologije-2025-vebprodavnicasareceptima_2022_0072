import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { useCurrencyStore } from './stores/currencyStore';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import AuthBootstrap from './components/auth/AuthBootstrap';
import RequireGuest from './components/protectors/RequireGuest';
import RequireAuth from './components/protectors/RequireAuth';
import RequireAdmin from './components/protectors/RequireAdmin';

import Home from './pages/Home';
import Products from './pages/Products';
import Recipes from './pages/Recipes';
import RecipeDetails from './pages/RecipeDetails';

import Login from './pages/Login';
import Register from './pages/Register';

import Profile from './pages/Profile';
import Cart from './pages/Cart';
import OrderDetails from './pages/OrderDetails';

import Admin from './pages/Admin';

function App() {
  const initCurrency = useCurrencyStore((s) => s.init);

  useEffect(() => {
    initCurrency();
  }, [initCurrency]);

  return (
    <BrowserRouter>
      <AuthBootstrap />
      <div className='min-h-screen flex flex-col'>
        <Navbar />

        <main className='flex-1'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/products' element={<Products />} />
            <Route path='/recipes' element={<Recipes />} />
            <Route path='/recipes/:recipeId' element={<RecipeDetails />} />

            <Route element={<RequireGuest />}>
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route path='/profile' element={<Profile />} />
              <Route path='/cart' element={<Cart />} />
              <Route path='/orders/:orderId' element={<OrderDetails />} />
            </Route>

            <Route element={<RequireAdmin />}>
              <Route path='/admin' element={<Admin />} />
            </Route>
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
