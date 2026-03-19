import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
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
  const cavesRef = useRef<{ stones: { mat: THREE.MeshStandardMaterial, phase: number }[] }>({ stones: [] });
  
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
    
    // --- REALISTIC SKY SYSTEM ---
    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;
    skyUniforms['turbidity'].value = isDay ? 0.6 : 10;
    skyUniforms['rayleigh'].value = isDay ? 2 : 0.1;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;

    const sunVec = new THREE.Vector3();
    const phi = THREE.MathUtils.degToRad(isDay ? 86 : 175); // Adjusted for better horizon color
    const theta = THREE.MathUtils.degToRad(180);
    sunVec.setFromSphericalCoords(1, phi, theta);
    skyUniforms['sunPosition'].value.copy(sunVec);

    // Dark navy fog matching the water color so the distance fades naturally
    scene.fog = new THREE.FogExp2(0x001e4d, 0.0015); 

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);
    // Position camera to see the ship's deck and the island clearly in the background
    camera.position.set(20, 30, 60); 
    camera.lookAt(0, 5, -20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Using ACES for better sky/sun highlights
    renderer.toneMappingExposure = isDay ? 0.8 : 0.4;
    containerRef.current.appendChild(renderer.domElement);

    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    const water = new Water(waterGeometry, {
        textureWidth: 512, textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load('/textures/waternormals.jpg', (t) => t.wrapS = t.wrapT = THREE.RepeatWrapping),
        sunDirection: new THREE.Vector3(1, 1, 1).normalize(),
        sunColor: 0x77ccff, // Cool moonlight
        waterColor: 0x001e4d, // Brighter blue tinted water
        distortionScale: 3.7
    });
    water.rotation.x = -Math.PI / 2;
    water.position.y = -5;
    scene.add(water);
    waterRef.current = water;

    // Stronger ambient and moonlight to bring back colors
    const ambient = new THREE.AmbientLight(0xffffff, isDay ? 1.5 : 0.8); scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xddeeff, isDay ? 2.5 : 1.5); sun.position.set(50, 100, 50); scene.add(sun);

    // Front-Left Directional Light to make the island and ship colors pop
    const frontLeftLight = new THREE.DirectionalLight(0xfffaee, 2.0);
    frontLeftLight.position.set(-100, 100, 100);
    scene.add(frontLeftLight);

    const gltfLoader = new GLTFLoader();
    console.log('Starting ship load...');
    gltfLoader.load('/models/sunny/glTF/scene.gltf', (gltf) => {
      console.log('Ship loaded successfully');
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
    }, undefined, (err) => console.error('Ship load error:', err));

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
      const isMobile = window.innerWidth <= 768;
      // Moved closer to ship rail on mobile so they fit in narrower FOV
      const startX = isEven ? (isMobile ? 12.0 : 22.0) : (isMobile ? 14.0 : 25.0); 
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

    // --- TRUE 3D MESH CLOUD SYSTEM ---
    const cloudGroup = new THREE.Group();
    scene.add(cloudGroup);
    
    // Low-poly icosahedron for stylized 3D clouds
    const cloudGeo = new THREE.IcosahedronGeometry(30, 1); 
    
    // Solid toon-like material for cartoon/stylized look
    const cloudMaterial = new THREE.MeshToonMaterial({
        color: isDay ? 0xffffff : 0x7788aa,
        transparent: true,
        opacity: isDay ? 0.95 : 0.85,
    });

    const numClouds = 20;
    for (let i = 0; i < numClouds; i++) {
        const cluster = new THREE.Group();
        const numPuffs = 5 + Math.floor(Math.random() * 5); // 5 to 9 puffs
        
        for (let j = 0; j < numPuffs; j++) {
            const puff = new THREE.Mesh(cloudGeo, cloudMaterial);
            const scale = 1 + Math.random() * 1.5;
            // Flatten clouds slightly on the Y axis
            puff.scale.set(scale, scale * 0.6, scale); 
            
            // Random offset within the cluster
            puff.position.set(
              (Math.random() - 0.5) * 80,
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 80
            );
            puff.rotation.set(
              Math.random() * Math.PI,
              Math.random() * Math.PI,
              Math.random() * Math.PI
            );
            cluster.add(puff);
        }

        const angle = Math.random() * Math.PI * 2;
        const dist = 600 + Math.random() * 800;
        const altitude = 150 + Math.random() * 180;
        
        cluster.position.set(
            Math.cos(angle) * dist,
            altitude,
            Math.sin(angle) * dist
        );
        
        cloudGroup.add(cluster);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false; // Disable panning to keep ship centered
    controls.maxPolarAngle = Math.PI * 0.48; // Prevent looking below the ship/water level
    controls.minPolarAngle = Math.PI / 6; // Prevent looking straight down from above
    controls.minDistance = 25; // Professional zoom limit - prevent clipping
    controls.maxDistance = 500; // Increased to allow more exploration
    controlsRef.current = controls;

    // --- GENERATE CEL-SHADING GRADIENT MAP ---
    const format = THREE.RGBAFormat;
    const colors = new Uint8Array([
      60, 60, 60, 255,     // Shadow
      140, 140, 140, 255,  // Midtone
      255, 255, 255, 255   // Highlight
    ]);
    const threeTone = new THREE.DataTexture(colors, 3, 1, format);
    threeTone.minFilter = THREE.NearestFilter;
    threeTone.magFilter = THREE.NearestFilter;
    threeTone.needsUpdate = true;

    // --- LOADING NEW ENVO.GLB ISLAND MODEL ---
    gltfLoader.load('/models/island/envo.glb', 
      (gltf) => {
        const island = gltf.scene;
        
        // Position the island closer, acting as a massive mountain in the background
        // Scale and orient the island to face the ship's figurehead directly
        island.position.set(0, -35, -450); 
        island.scale.setScalar(220.0); // Bumped up for more "mountainous" feel
        island.rotation.y = -Math.PI * 0.05; // Flipped to face the ship properly
        
        const meshesToOutline: THREE.Mesh[] = [];

        island.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // 1. Smooth shading for low poly
            if (child.geometry) {
               child.geometry.computeVertexNormals();
            }

            // 2. Toon Material with specific color overrides
            const originalMat = child.material as any;
            if (!originalMat) return;
            
            const name = (child.name || '').toLowerCase();
            const matName = (originalMat ? (originalMat.name || '') : '').toLowerCase();
            let newColor = (originalMat && originalMat.color) ? originalMat.color.clone() : new THREE.Color(0xffffff);
            
            if (name.includes('skull') || matName.includes('skull') || name.includes('bone') || matName.includes('bone')) {
                newColor.setHex(0xfdf6e3); // Off-white/Cream
            } else if (name.includes('tree') || matName.includes('leaf') || name.includes('grass') || name.includes('mountain') || name.includes('greenery')) {
                newColor.setHex(0x2d5a27); // Vibrant forest green
            } else if (name.includes('rock') || matName.includes('rock') || name.includes('cliff') || name.includes('base') || name.includes('stone')) {
                newColor.setHex(0xc2b280); // Sandy Brown rocks
            }

            child.material = new THREE.MeshToonMaterial({
               color: newColor,
               map: originalMat ? originalMat.map : null,
               gradientMap: threeTone,
            });
            
            meshesToOutline.push(child);
          }
        });

        // 3. Thick Black Anime Outline (Inverted Hull) - Added after traverse to avoid mod-during-iter
        meshesToOutline.forEach(mesh => {
          const outlineMat = new THREE.MeshBasicMaterial({ 
             color: 0x000000, 
             side: THREE.BackSide 
          });
          const outlineMesh = new THREE.Mesh(mesh.geometry, outlineMat);
          outlineMesh.scale.multiplyScalar(1.02); 
          mesh.add(outlineMesh);
        });

        scene.add(island);
        console.log('Island loaded successfully at background position');
      },
      undefined,
      (error) => console.error('Error loading island:', error)
    );


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

    // Using Date.now for time to avoid THREE.Clock deprecation if applicable
    let lastTime = Date.now();
    let elapsed = 0;
    
    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      elapsed += delta;
      const t = elapsed;

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

      if (cloudGroup) {
        cloudGroup.children.forEach((cluster, idx) => {
          cluster.position.x += Math.sin(t * 0.05 + idx) * 0.02;
          cluster.position.z += Math.cos(t * 0.05 + idx) * 0.02;
        });
      }

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
        
        const isMobile = window.innerWidth <= 768;
        // Target: 8 units in front, 3.0 units to the LEFT (centered on mobile, pushed out slightly more)
        const targetPos = camera.position.clone()
          .add(camDir.multiplyScalar(isMobile ? 12 : 8))
          .add(camRight.multiplyScalar(isMobile ? 0 : -3.0));
        
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
