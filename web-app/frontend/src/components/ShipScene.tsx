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
    // Deep moonlit navy instead of pure black
    const skyColor = isDay ? 0x88ccff : 0x01081a; 
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(skyColor);
    // Dark navy fog that doesn't wash out foreground colors
    scene.fog = new THREE.FogExp2(0x01050f, 0.0012); 

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(40, 25, 40); 
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.NoToneMapping; // Disable ACES Filmic to keep poster colors exactly as provided
    containerRef.current.appendChild(renderer.domElement);

    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    const water = new Water(waterGeometry, {
        textureWidth: 512, textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load('/textures/waternormals.jpg', (t) => t.wrapS = t.wrapT = THREE.RepeatWrapping),
        sunDirection: new THREE.Vector3(1, 1, 1).normalize(),
        sunColor: 0x77ccff, // Cool moonlight
        waterColor: 0x000a1a, // Deep navy water
        distortionScale: 3.7
    });
    water.rotation.x = -Math.PI / 2;
    water.position.y = -5;
    scene.add(water);
    waterRef.current = water;

    // Stronger ambient and moonlight to bring back colors
    const ambient = new THREE.AmbientLight(0xffffff, isDay ? 1.0 : 0.6); scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xddeeff, isDay ? 2.5 : 1.5); sun.position.set(50, 100, 50); scene.add(sun);

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
      // Use MeshBasicMaterial but ensure renderer toneMapping is off for exact color reproduction
      const material = new THREE.MeshBasicMaterial({ 
        map: textureLoader.load(pirate.image),
        transparent: true,
        side: THREE.DoubleSide,
        opacity: 0.98, // Slightly more solid for better color pop
        fog: false // Prevent fog from washing colors away
      });
      const geometry = new THREE.PlaneGeometry(3.2, 4.6); // Large enough to be easily interactive
      const mesh = new THREE.Mesh(geometry, material);
      
      // Step 1: Initial Placement (Proximal rail, spaced along Z)
      const isEven = idx % 2 === 0;
      // Moved further out to X=22-24 to avoid ship bulk occlusion
      const startX = isEven ? 22.0 : 25.0; 
      const startZ = -14 + idx * 5.2; 
      const startY = 10.0; 
      
      mesh.position.set(startX, startY, startZ);
      mesh.rotation.y = -Math.PI / 4 + (isEven ? -0.1 : 0.1);
      
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
    controls.enablePan = false; // Disable panning to keep ship centered
    controls.maxPolarAngle = Math.PI * 0.48; // Prevent looking below the ship/water level
    controls.minPolarAngle = Math.PI / 6; // Prevent looking straight down from above
    controls.minDistance = 25; // Professional zoom limit - prevent clipping
    controls.maxDistance = 120; // Stop unlimited zoom-out - keep island in view
    controlsRef.current = controls;

    // --- LOADING PROVIDED 3D ISLAND MODEL ---
    gltfLoader.load('/models/island/scene.gltf', (gltf) => {
      const island = gltf.scene;
      island.position.set(-200, -12, -100); // Positioned to the far side for an "arrival" feel
      island.scale.setScalar(40); // Scales to fit the scene's large-scale ocean
      island.rotation.y = Math.PI * 0.7; // Rotates to show the best "cliff face" to the camera
      
      island.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Enhancing textures for the low-light ocean environment
          if (child.material) {
            child.material.roughness = 0.9;
            child.material.metalness = 0.1;
          }
        }
      });
      scene.add(island);
    });

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
        // Find a position that is to the LEFT of the camera's view center
        const camDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        
        // Target: 8 units in front, 3.0 units to the LEFT
        const targetPos = camera.position.clone()
          .add(camDir.multiplyScalar(8))
          .add(camRight.multiplyScalar(-3.0));
        
        gsap.to(mesh.position, {
          x: targetPos.x, y: targetPos.y, z: targetPos.z,
          duration: 1.4, ease: "back.out(1.2)"
        });
        
        gsap.to(mesh.rotation, {
          x: camera.rotation.x, 
          y: camera.rotation.y, 
          z: camera.rotation.z,
          duration: 1.4, ease: "back.out(1.2)"
        });
        
        gsap.to(mesh.scale, {
          x: 2.2, y: 2.2, z: 2.2,
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
