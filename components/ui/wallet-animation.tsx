'use client';

import { useAnimationFrame } from 'motion/react';
import { useRef } from 'react';

interface WalletAnimationProps {
  className?: string;
}

export function WalletAnimation({ className }: WalletAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);

  useAnimationFrame((t) => {
    if (!ref.current) return;

    const rotateX = Math.sin(t / 3000) * 15; // Smooth rotation along X-axis
    const rotateY = Math.cos(t / 3000) * 15; // Smooth rotation along Y-axis
    ref.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  return (
    <div className={`wallet-animation-container ${className}`}>
      <div className="cube" ref={ref}>
        <div className="side front" />
        <div className="side left" />
        <div className="side right" />
        <div className="side top" />
        <div className="side bottom" />
        <div className="side back" />
      </div>
      <StyleSheet />
    </div>
  );
}

/**
 * ==============   Styles   ================
 */
function StyleSheet() {
  return (
    <style>{`
        .wallet-animation-container {
            perspective: 1000px;
            width: 250px;
            height: 250px;
            margin: 0 auto; /* Center it */
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
        }

        .cube {
            width: 200px;
            height: 200px;
            position: relative;
            transform-style: preserve-3d;
            box-shadow: 0 20px 30px rgba(0, 0, 0, 0.2); /* Subtle shadow for depth */
        }

        .side {
            position: absolute;
            width: 100%;
            height: 100%;
            border: 2px solid rgba(255, 255, 255, 0.1); /* Soft border for a clean effect */
        }

        .front {
            transform: rotateY(0deg) translateZ(100px);
            background: linear-gradient(to bottom right, #ff7eb3, #ff758c);
        }
        .right {
            transform: rotateY(90deg) translateZ(100px);
            background: linear-gradient(to bottom left, #8e7bff, #658fff);
        }
        .back {
            transform: rotateY(180deg) translateZ(100px);
            background: linear-gradient(to top right, #5effa9, #25dda8);
        }
        .left {
            transform: rotateY(-90deg) translateZ(100px);
            background: linear-gradient(to bottom right, #ffa05f, #ff7e5f);
        }
        .top {
            transform: rotateX(90deg) translateZ(100px);
            background: linear-gradient(to bottom left, #ff8fe5, #ff60d0);
        }
        .bottom {
            transform: rotateX(-90deg) translateZ(100px);
            background: linear-gradient(to top left, #70e1f5, #ffd194);
        }

        /* Smooth transitions */
        .cube, .side {
            transition: transform 0.4s ease, box-shadow 0.4s ease;
        }

        
    `}</style>
  );
}

