import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { getWaveHeight } from '../utils/wavePhysics';
import gsap from 'gsap';

const STRAW_HATS = [
  { id: "luffy", name: "Monkey D. Luffy", bounty: "3,000,000,000", image: "/assets/posters/luffy.png" },
  { id: "zoro", name: "Roronoa Zoro", bounty: "1,111,000,000", image: "/assets/posters/zoro.png" },
  { id: "nami", name: "Nami", bounty: "366,000,000", image: "/assets/posters/nami.png" },
  { id: "usopp", name: "Usopp", bounty: "500,000,000", image: "/assets/posters/usopp.png" },
  { id: "sanji", name: "Sanji", bounty: "1,032,000,000", image: "/assets/posters/sanji.png" },
  { id: "chopper", name: "Chopper", bounty: "1,000", image: "/assets/posters/chopper.png" },
  { id: "robin", name: "Robin", bounty: "930,000,000", image: "/assets/posters/robin.png" },
  { id: "franky", name: "Franky", bounty: "394,000,000", image: "/assets/posters/franky_poster.png" },
  { id: "brook", name: "Brook", bounty: "383,000,000", image: "/assets/posters/brook_poster.png" },
];

interface ShipSceneProps {
  onPosterToggle: (id: string | null) => void;
  activePosterId: string | null;
}

export default function ShipScene({ onPosterToggle, activePosterId }: ShipSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shipRef = useRef<THREE.Group | null>(null);
  const waterRef = useRef<Water | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const postersRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const mouseRef = useRef(new THREE.Vector2());
  const activePosterRef = useRef<string | null>(null);
  
  // Sync ref for click handler
  useEffect(() => {
    activePosterRef.current = activePosterId;
  }, [activePosterId]);

  useEffect(() => {
    if (!containerRef.current) return;

    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 18;
    const skyColor = isDay ? 0x88ccff : 0x010208;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.FogExp2(skyColor, 0.0015);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(40, 25, 40); // Better angle to see the sidebar
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    containerRef.current.appendChild(renderer.domElement);

    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    const water = new Water(waterGeometry, {
        textureWidth: 512, textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load('/textures/waternormals.jpg', (t) => t.wrapS = t.wrapT = THREE.RepeatWrapping),
        sunDirection: new THREE.Vector3(1, 1, 1).normalize(),
        sunColor: 0xffffff, waterColor: 0x001e0f, distortionScale: 3.7
    });
    water.rotation.x = -Math.PI / 2;
    water.position.y = -5;
    scene.add(water);
    waterRef.current = water;

    const ambient = new THREE.AmbientLight(0xffffff, isDay ? 1.0 : 0.4); scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, isDay ? 2.5 : 1.2); sun.position.set(50, 100, 50); scene.add(sun);

    const gltfLoader = new GLTFLoader();
    gltfLoader.load('/models/sunny/glTF/scene.gltf', (gltf) => {
      const ship = gltf.scene;
      ship.traverse((child: any) => {
        if (child.name.includes('Cube013')) { child.visible = false; return; }
        if (!child.isMesh) return;
        child.visible = true; child.castShadow = true; child.receiveShadow = true;
      });
      const box = new THREE.Box3().setFromObject(ship);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      ship.position.sub(center);
      const scale = 50 / Math.max(size.x, size.y, size.z);
      ship.scale.setScalar(scale);
      const baseY = -size.y * 0.1;
      ship.position.y = baseY; ship.rotation.y = Math.PI;
      ship.userData.baseY = baseY;
      scene.add(ship);
      shipRef.current = ship;
    });

    const textureLoader = new THREE.TextureLoader();
    const posterGroup = new THREE.Group();
    scene.add(posterGroup);

    STRAW_HATS.forEach((pirate, idx) => {
      const geometry = new THREE.PlaneGeometry(3.5, 5);
      const material = new THREE.MeshBasicMaterial({ 
        map: textureLoader.load(pirate.image),
        transparent: true,
        side: THREE.DoubleSide,
        opacity: 0.95
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      // Step 1: Initial Placement (Left side, spaced along Z)
      // Camera is at 40,25,40. Left of the scene from this view is towards -X or -Z.
      // Let's put them at X = -15, as requested, but ensure they aren't hidden.
      const startX = -18;
      const startZ = -15 + idx * 4;
      const startY = 10;
      
      mesh.position.set(startX, startY, startZ);
      mesh.rotation.y = Math.PI / 4; // Angled towards the camera
      
      mesh.userData = { 
        id: pirate.id, 
        originalPos: mesh.position.clone(),
        originalRot: mesh.rotation.clone(),
        baseFloatOffset: idx * 0.5 
      };
      
      postersRef.current.set(pirate.id, mesh);
      posterGroup.add(mesh);
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    const raycaster = new THREE.Raycaster();
    const onMouseClick = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouseRef.current, camera);
      
      const intersects = raycaster.intersectObjects(posterGroup.children, true);
      if (intersects.length > 0) {
        const clickedId = intersects[0].object.userData.id;
        onPosterToggle(clickedId);
        event.stopPropagation();
      } else if (activePosterRef.current) {
        onPosterToggle(null);
      }
    };
    window.addEventListener('click', onMouseClick);

    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      if (controls) controls.update();
      if (waterRef.current) waterRef.current.material.uniforms['time'].value += 1.0 / 60.0;

      if (shipRef.current) {
        const baseY = shipRef.current.userData.baseY ?? -2;
        const centerX = window.innerWidth / 2;
        const rawWaveY = getWaveHeight(centerX, t * 2.5, 5); 
        const bobDisplacement = rawWaveY * 0.04; 
        shipRef.current.position.y = baseY + bobDisplacement;
        shipRef.current.rotation.z = (rawWaveY * 0.001) + Math.sin(t * 0.4) * 0.008;
      }

      postersRef.current.forEach((mesh, id) => {
        if (id !== activePosterRef.current) {
          const offset = mesh.userData.baseFloatOffset || 0;
          mesh.position.y = mesh.userData.originalPos.y + Math.sin(t * 1.2 + offset) * 0.4;
          mesh.rotation.z = Math.sin(t * 0.6 + offset) * 0.03;
        }
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', onMouseClick);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // GSAP CINEMATIC ANIMATIONS
  useEffect(() => {
    if (!controlsRef.current) return;
    const camera = controlsRef.current.object as THREE.PerspectiveCamera;

    postersRef.current.forEach((mesh, id) => {
      const isActive = id === activePosterId;
      
      if (isActive) {
        const camDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        const targetPos = camera.position.clone().add(camDir.multiplyScalar(10));
        
        gsap.to(mesh.position, {
          x: targetPos.x, y: targetPos.y, z: targetPos.z,
          duration: 1.4, ease: "back.out(1.2)"
        });
        
        gsap.to(mesh.rotation, {
          x: camera.rotation.x, 
          y: camera.rotation.y, 
          z: camera.rotation.z + (Math.random() * 0.2 - 0.1),
          duration: 1.4, ease: "back.out(1.2)"
        });
        
        gsap.to(mesh.scale, {
          x: 2.8, y: 2.8, z: 2.8,
          duration: 1.4, ease: "back.out(1.5)"
        });

      } else {
        const originalPos = mesh.userData.originalPos;
        const originalRot = mesh.userData.originalRot;

        gsap.to(mesh.position, {
          x: originalPos.x, y: originalPos.y, z: originalPos.z,
          duration: 1.2, ease: "power4.inOut"
        });
        
        gsap.to(mesh.rotation, {
          x: originalRot.x, y: originalRot.y, z: originalRot.z,
          duration: 1.2, ease: "power4.inOut"
        });
        
        gsap.to(mesh.scale, {
          x: 1, y: 1, z: 1,
          duration: 1.2, ease: "power2.inOut"
        });
      }
    });
  }, [activePosterId]);

  return <div ref={containerRef} className="absolute inset-0 z-0 bg-transparent" />;
}
