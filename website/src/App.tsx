import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Reviews } from './components/Reviews';
import { Privacy } from './components/Privacy';
import { Footer } from './components/Footer';
import { StoreModal } from './components/StoreModal';

export function App() {
  const [storeModalOpen, setStoreModalOpen] = useState(false);

  const handleOpenStore = () => setStoreModalOpen(true);
  const handleCloseStore = () => setStoreModalOpen(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-white/20 selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* Fullscreen Video Hero with Direct Store Cards */}
        <Hero />

        {/* Feature Highlights */}
        <Features />

        {/* Real Student Reviews */}
        <Reviews />

        {/* Privacy & Trust */}
        <Privacy />
      </main>

      {/* Footer with Disclaimer */}
      <Footer onOpenStore={handleOpenStore} />

      {/* Multi-store Quick Modal for Footer */}
      <StoreModal isOpen={storeModalOpen} onClose={handleCloseStore} />
    </div>
  );
}

export default App;
