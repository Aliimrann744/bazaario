import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileTabBar from './components/layout/MobileTabBar';
import { useAuth } from './store/auth';
import { useFavourites } from './store/favourites';

import Home from './pages/Home';
import Search from './pages/Search';
import ListingDetail from './pages/ListingDetail';
import PostAd from './pages/PostAd';
import Login from './pages/Login';
import Register from './pages/Register';
import Favourites from './pages/Favourites';
import MyListings from './pages/MyListings';
import Chat from './pages/Chat';
import SellerProfile from './pages/SellerProfile';
import Account from './pages/Account';
import NotFound from './pages/NotFound';

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo({ top: 0, behavior: 'instant' }), [pathname]);
  return null;
}

function RequireAuth({ children }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname + loc.search }} replace />;
  return children;
}

export default function App() {
  const { init, ready, user } = useAuth();
  const hydrate = useFavourites((s) => s.hydrate);

  useEffect(() => { init(); }, [init]);
  useEffect(() => { if (user) hydrate(); }, [user, hydrate]);

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollTop />
      <Header />
      <main className="flex-1 pb-20 sm:pb-0">
        {ready ? (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/listing/:publicId" element={<ListingDetail />} />
            <Route path="/seller/:publicId" element={<SellerProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/post" element={<RequireAuth><PostAd /></RequireAuth>} />
            <Route path="/favourites" element={<RequireAuth><Favourites /></RequireAuth>} />
            <Route path="/my-listings" element={<RequireAuth><MyListings /></RequireAuth>} />
            <Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />
            <Route path="/chat/:id" element={<RequireAuth><Chat /></RequireAuth>} />
            <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        ) : null}
      </main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}
