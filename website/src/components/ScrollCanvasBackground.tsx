import React from 'react';
import { ShaderMetal } from '@/components/ui/shader-metal';

export const ScrollCanvasBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-[#020e17]">
      {/* Interactive Liquid Metal Ribbons Background */}
      <ShaderMetal
        metal="chrome"
        theme="dark"
        speed={0.25}
        ribbons={3}
        iridescence={0.3}
        interactive={true}
        className="opacity-75"
      />
      {/* Subtle deep gradient overlay for crisp text and card contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020e17]/80 via-[#020e17]/35 to-[#020e17]/85 pointer-events-none" />
    </div>
  );
};

export default ScrollCanvasBackground;
