import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Line } from '@react-three/drei';
import * as THREE from 'three';

function LidarGrid() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = clock.getElapsedTime() * 0.05;
    }
  });

  const gridLines = useMemo(() => {
    const lines: [THREE.Vector3, THREE.Vector3][] = [];
    const count = 12;
    const spacing = 0.8;
    for (let i = -count; i <= count; i++) {
      lines.push([
        new THREE.Vector3(i * spacing, -count * spacing, 0),
        new THREE.Vector3(i * spacing, count * spacing, 0),
      ]);
      lines.push([
        new THREE.Vector3(-count * spacing, i * spacing, 0),
        new THREE.Vector3(count * spacing, i * spacing, 0),
      ]);
    }
    return lines;
  }, []);

  return (
    <group ref={ref} position={[0, 0, -2]}>
      {gridLines.map((points, i) => (
        <Line
          key={i}
          points={points}
          color="#00D2C4"
          lineWidth={0.5}
          transparent
          opacity={0.08}
        />
      ))}
    </group>
  );
}

function LidarRings() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const t = clock.getElapsedTime();
        const scale = 1 + ((t * 0.3 + i * 0.5) % 3);
        mesh.scale.set(scale, scale, 1);
        (mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.3 - scale * 0.08);
      });
    }
  });

  return (
    <group ref={ref} position={[0, 0, -1]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i}>
          <ringGeometry args={[0.8, 0.85, 64]} />
          <meshBasicMaterial color="#00A3FF" opacity={0.3} transparent side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function SensorDots() {
  const ref = useRef<THREE.Points>(null);
  const count = 200;

  const geom = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.5 + Math.random() * 2.5;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = -1 + Math.random() * 2;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geometry;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      const positions = ref.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = positions.array as Float32Array;
      const t = clock.getElapsedTime();
      for (let i = 0; i < count; i++) {
        arr[i * 3 + 2] = -1 + Math.sin(t * 0.5 + i * 0.1) * 0.5;
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial color="#00D2C4" size={0.03} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function VehicleOrb() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.position.y = Math.sin(t * 0.8) * 0.1;
      ref.current.rotation.y = t * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={ref} position={[0, 0, 0]}>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshStandardMaterial
          color="#00A3FF"
          emissive="#00A3FF"
          emissiveIntensity={0.3}
          wireframe
          transparent
          opacity={0.7}
        />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshStandardMaterial
          color="#00D2C4"
          emissive="#00D2C4"
          emissiveIntensity={0.2}
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>
    </Float>
  );
}

export function DrivingHeroScene() {
  return (
    <div className="absolute inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#00A3FF" />
        <pointLight position={[-5, -5, 5]} intensity={0.4} color="#00D2C4" />

        <LidarGrid />
        <LidarRings />
        <SensorDots />
        <VehicleOrb />

        <Stars radius={50} depth={50} count={300} factor={2} saturation={0} fade speed={0.5} />
      </Canvas>
    </div>
  );
}
