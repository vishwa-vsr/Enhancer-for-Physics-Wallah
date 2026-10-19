import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Reviews } from './components/Reviews';
import { Privacy } from './components/Privacy';
import { Footer } from './components/Footer';
import KineticGrid from './components/ui/kinetic-grid';
import SmoothScroll from './components/ui/smooth-scroll';

export function App() {
  return (
    <SmoothScroll>
      <div className="relative min-h-screen text-foreground flex flex-col selection:bg-white/20 selection:text-white">
        {/* Full-Page Interactive Kinetic Grid Background */}
        <KineticGrid globalColor="navy" isFixedBackground className="fixed inset-0 w-full h-full pointer-events-none z-0" />

        {/* Top Navigation */}
        <Navbar />

        {/* Main Content */}
        <main className="relative z-10 flex-1">
          {/* Fullscreen Video Hero with Direct Store Cards */}
          <Hero />

          {/* Feature Highlights */}
          <Features />

          {/* Real Student Reviews */}
          <Reviews />

          {/* Privacy & Trust */}
          <Privacy />
        </main>

        {/* Footer with Direct Store Links */}
        <Footer />
      </div>
    </SmoothScroll>
  );
}

export default App;
