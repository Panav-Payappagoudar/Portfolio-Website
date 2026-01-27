import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField() {
    const pointsRef = useRef();
    
    // Create particle positions - reduced count for better performance
    const particles = useMemo(() => {
        const count = 800; // Reduced from 2000 to 800
        const positions = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 150; // Reduced space
            positions[i * 3 + 1] = (Math.random() - 0.5) * 150;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 150;
        }
        
        return positions;
    }, []);

    useFrame((state, delta) => {
        if (pointsRef.current) {
            // Slower rotation for better performance
            pointsRef.current.rotation.x += delta * 0.02;
            pointsRef.current.rotation.y += delta * 0.01;
            pointsRef.current.rotation.z += delta * 0.005;
        }
    });

    return (
        <Points ref={pointsRef} positions={particles}>
            <PointMaterial
                transparent
                color="#00f3ff"
                size={0.3} // Reduced size
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.6} // Reduced opacity
            />
        </Points>
    );
}

function FloatingOrbs() {
    const meshRef = useRef();
    
    useFrame((state, delta) => {
        if (meshRef.current) {
            // Slower rotation for better performance
            meshRef.current.rotation.x += delta * 0.05;
            meshRef.current.rotation.y += delta * 0.08;
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[40, 16, 16]} /> {/* Reduced geometry complexity */}
            <meshBasicMaterial 
                color="#7000ff" 
                transparent 
                opacity={0.03} 
                wireframe
            />
        </mesh>
    );
}

const Background = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create noise texture
    const createNoise = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255;
        data[i] = noise;     // red
        data[i + 1] = noise; // green
        data[i + 2] = noise; // blue
        data[i + 3] = 255;   // alpha
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // Apply blend mode for subtle effect
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    createNoise();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      {/* Main black background */}
      <div className="absolute inset-0 bg-black"></div>
      
      {/* Canvas for noise texture */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 opacity-5 mix-blend-overlay pointer-events-none"
      />
      
      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
};

export default Background;
