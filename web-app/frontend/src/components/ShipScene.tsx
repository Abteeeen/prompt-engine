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
    // Set base background color based on time of day
    scene.background = new THREE.Color(skyColor);
    // Dark navy fog matching the water color so the distance fades naturally
    scene.fog = new THREE.FogExp2(0x001e4d, 0.0015); 

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000);
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
        waterColor: 0x30c4c0, // Vivid turquoise-cyan
        distortionScale: 3.7
    });
    water.rotation.x = -Math.PI / 2;
    water.position.y = -5;
    scene.add(water);
    waterRef.current = water;

    // Strict directional sun & ambient lighting to match custom shader calculations
    const ambient = new THREE.AmbientLight(0x7aa8b0, isDay ? 0.9 : 0.4); 
    scene.add(ambient);
    
    const sun = new THREE.DirectionalLight(0xffffff, isDay ? 2.0 : 1.0); 
    sun.position.set(500, 1000, 200); 
    sun.castShadow = true;
    sun.shadow.camera.far = 2000;
    scene.add(sun);

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

    // --- LOAD CUSTOM 3D SKY / CLOUD MODEL ---
    gltfLoader.load('/models/sky/scene.gltf', (gltf) => {
      const customSky = gltf.scene;
      
      // Position and scale the custom sky dome
      customSky.position.set(0, -100, 0); // Lowered slightly so the horizon line matches the water
      // The original model is ~250,000 units wide. Scale 0.02 brings it to ~5000 units.
      customSky.scale.setScalar(0.02); 
      
      // Ensure the sky is visible from the inside and not affected by scene lighting/fog
      customSky.traverse((child: any) => {
        if (child.isMesh && child.material) {
          child.frustumCulled = false; // CRITICAL FIX for camera-inside culling 
          child.renderOrder = -1; // Draw immediately after scene background
          
          // Extract the texture (it's stored as an emissiveMap in this specific GLTF)
          const skyTexture = child.material.emissiveMap || child.material.map;
          
          // Force rendering from the inside out and ignore lighting
          const newMat = new THREE.MeshBasicMaterial({
             map: skyTexture,
             color: 0xffffff, // Pure white so texture colors show exactly as is
             side: THREE.DoubleSide,
             depthWrite: false, // Background layer
             fog: false
          });
          child.material = newMat;
        }
      });
      
      scene.add(customSky);
      console.log('Custom sky model loaded successfully');
    }, undefined, (err) => console.error('Error loading custom sky:', err));

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
        
        // Scale and orient the island to face the ship's figurehead directly
        island.position.set(0, -35, -450); 
        island.scale.setScalar(220.0); // Bumped up for more "mountainous" feel
        island.rotation.y = -Math.PI * 0.05; // Flipped to face the ship properly

        // --- CUSTOM ANIME CEL-SHADER ---
        // Computes Sunlit Cream, Golden Cliffs, and Teal Shadows dynamically
        const skullShaderMaterial = new THREE.ShaderMaterial({
          uniforms: {
            sunDirection: { value: new THREE.Vector3(0.5, 1.0, 0.2).normalize() },
            creamColor: { value: new THREE.Color('#D4C9A0') },
            goldColor: { value: new THREE.Color('#F0B030') },
            tealShadow: { value: new THREE.Color('#7AA8B0') }
          },
          vertexShader: `
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 sunDirection;
            uniform vec3 creamColor;
            uniform vec3 goldColor;
            uniform vec3 tealShadow;
            varying vec3 vNormal;
            void main() {
              vec3 n = normalize(vNormal);
              float dotSun = dot(n, sunDirection);
              
              // Smooth transition to golden cliffs on steep side-facing normals
              float sideWeight = smoothstep(0.7, 0.95, abs(n.x));
              vec3 litColor = mix(creamColor, goldColor, sideWeight);
              
              // Hard cel-shade shadow cut
              float shadowCut = step(0.1, dotSun);
              vec3 finalColor = mix(tealShadow, litColor, shadowCut);
              
              gl_FragColor = vec4(finalColor, 1.0);
            }
          `,
          side: THREE.FrontSide
        });

        const meshesToOutline: THREE.Mesh[] = [];

        island.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // 1. Force hard flat shading for low-poly look
            if (child.geometry) {
               child.geometry.computeVertexNormals();
               // Converting back to flat shading by duplicating vertices might be expensive,
               // but the basic ShaderMaterial with vNormal looks adequately sharp on low-poly meshes.
            }

            // Apply custom anime shader
            child.material = skullShaderMaterial;
            meshesToOutline.push(child);
          }
        });

        // Add 3D Blockers for pure black Eye/Mouth cavities since it's a monolithic mesh
        const blackMat = new THREE.MeshBasicMaterial({ color: 0x0d0d0d });
        
        // Eyeballs (Black Cavities)
        const eyeGeo = new THREE.SphereGeometry(3, 8, 8);
        const leftEye = new THREE.Mesh(eyeGeo, blackMat);
        leftEye.position.set(-1.8, 4.5, 2.5); // Relative coords inside GLTF
        leftEye.scale.set(1, 0.8, 0.5);
        island.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeo, blackMat);
        rightEye.position.set(2.2, 4.5, 2.8);
        rightEye.scale.set(1, 0.8, 0.5);
        island.add(rightEye);

        // Mouth (Black Cavity)
        const mouthGeo = new THREE.BoxGeometry(6, 2, 4);
        const mouth = new THREE.Mesh(mouthGeo, blackMat);
        mouth.position.set(0.2, 1.0, 3.5);
        island.add(mouth);

        // Add Teeth!
        const teethMat = new THREE.MeshBasicMaterial({ color: 0xe8e0cc });
        const toothGeo = new THREE.BoxGeometry(0.4, 0.8, 0.5);
        for(let i=-2; i<=2; i++) {
            const upTooth = new THREE.Mesh(toothGeo, teethMat);
            upTooth.position.set(i * 0.8, 2.2, 4.2);
            island.add(upTooth);
            const downTooth = new THREE.Mesh(toothGeo, teethMat);
            downTooth.position.set(i * 0.8, 0.0, 4.0);
            island.add(downTooth);
        }

        // Thick Black Anime Outline (Inverted Hull)
        meshesToOutline.forEach(mesh => {
          const outlineMat = new THREE.MeshBasicMaterial({ 
             color: 0x000000, 
             side: THREE.BackSide 
          });
          const outlineMesh = new THREE.Mesh(mesh.geometry, outlineMat);
          outlineMesh.scale.multiplyScalar(1.03); 
          mesh.add(outlineMesh);
        });

        // ==========================================================
        // PROCEDURALLY GENERATE ALL EXTRA SCENE VEGETATION & TERRAIN
        // ==========================================================
        const decorateSkull = (sceneObj: THREE.Scene) => {
            const skullZ = -450;
            
            // 1. Palm Trees (Trunks + Fronds)
            const trunkGeo = new THREE.CylinderGeometry(1.5, 2.0, 30, 5);
            const trunkMat = new THREE.MeshToonMaterial({ color: 0x6b4226 });
            const frondGeo = new THREE.IcosahedronGeometry(12, 0);
            const frondMat = new THREE.MeshToonMaterial({ color: 0x1e5c2a });
            
            const addPalm = (x: number, y: number, z: number, tiltZ: number) => {
                const trunk = new THREE.Mesh(trunkGeo, trunkMat);
                trunk.position.set(x, y + 15, z);
                trunk.rotation.z = tiltZ;
                const fronds = new THREE.Mesh(frondGeo, frondMat);
                fronds.position.set(0, 15, 0);
                fronds.scale.set(1.5, 0.4, 1.5);
                trunk.add(fronds);
                sceneObj.add(trunk);
            };
            
            // Left cliff palms
            addPalm(-120, 20, skullZ + 20, 0.2);
            addPalm(-140, 40, skullZ, 0.3);
            addPalm(-160, 10, skullZ + 10, 0.4);
            // Right cliff palms
            addPalm(130, 30, skullZ + 15, -0.25);
            addPalm(150, 50, skullZ - 10, -0.15);
            addPalm(170, 15, skullZ + 20, -0.4);
            // Base palm
            addPalm(90, 5, skullZ + 50, -0.1);

            // 2. Shrubs around base
            const shrubGeo = new THREE.IcosahedronGeometry(8, 0);
            const shrubMat1 = new THREE.MeshToonMaterial({ color: 0x1a4d2a });
            const shrubMat2 = new THREE.MeshToonMaterial({ color: 0x2d6e3a });
            for(let i=0; i<40; i++) {
                const shrub = new THREE.Mesh(shrubGeo, i % 2 === 0 ? shrubMat1 : shrubMat2);
                const angle = (Math.random() - 0.5) * Math.PI;
                const radius = 90 + Math.random() * 80;
                shrub.position.set(Math.sin(angle) * radius, -10 + Math.random() * 5, skullZ + Math.cos(angle) * 30 + 50);
                shrub.scale.setScalar(0.5 + Math.random());
                sceneObj.add(shrub);
            }
            
            // 3. Vines wrapping top
            const vineMat = new THREE.MeshToonMaterial({ color: 0x2d6e3a });
            for(let i=0; i<35; i++) {
                const points = [];
                const sx = (Math.random() - 0.5) * 140;
                const sz = skullZ + (Math.random() - 0.5) * 80;
                for(let j=0; j<6; j++) {
                    points.push(new THREE.Vector3(sx + (Math.random()-0.5)*15, 180 - j*15, sz + j*8 + (Math.random()-0.5)*10));
                }
                const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 10, 1.5, 5, false);
                sceneObj.add(new THREE.Mesh(tube, vineMat));
            }

            // Hanging Chains (dark brown loops)
            const chainMat = new THREE.MeshToonMaterial({ color: 0x2a1f1a });
            for(let i=0; i<5; i++) {
                const chainGeo = new THREE.TorusGeometry(8, 0.8, 4, 8, Math.PI);
                const chain = new THREE.Mesh(chainGeo, chainMat);
                chain.position.set((Math.random() - 0.5) * 80, 140 - Math.random() * 30, skullZ + 30);
                chain.rotation.set(Math.PI, 0, (Math.random() - 0.5) * 0.5);
                sceneObj.add(chain);
            }

            // 4. White Beach & Boulders
            const beachGeo = new THREE.PlaneGeometry(350, 80);
            const beachMat = new THREE.MeshToonMaterial({ color: 0xf5f0e8 });
            const beach = new THREE.Mesh(beachGeo, beachMat);
            beach.rotation.x = -Math.PI / 2;
            beach.position.set(0, -4.5, skullZ + 100);
            sceneObj.add(beach);
            
            const boulderGeo = new THREE.DodecahedronGeometry(5, 0);
            const boulderMat = new THREE.MeshToonMaterial({ color: 0xc8bfa8 });
            for(let i=0; i<12; i++) {
                const boulder = new THREE.Mesh(boulderGeo, boulderMat);
                boulder.position.set((Math.random() - 0.5) * 250, -3 + Math.random()*2, skullZ + 70 + Math.random()*40);
                boulder.rotation.set(Math.random(), Math.random(), Math.random());
                boulder.scale.setScalar(Math.random() * 1.5 + 0.5);
                sceneObj.add(boulder);
            }

            // 5. Pink Coral
            const coralMat = new THREE.MeshToonMaterial({ color: 0xe85070 });
            const salmonMat = new THREE.MeshToonMaterial({ color: 0xf07060 });
            const coralGeo = new THREE.CylinderGeometry(0.5, 1.5, 10, 4);
            for(let i=0; i<25; i++) {
               const coral = new THREE.Mesh(coralGeo, Math.random() > 0.5 ? coralMat : salmonMat);
               coral.position.set((Math.random() - 0.5) * 300, -5, skullZ + 110 + Math.random()*20);
               coral.rotation.set((Math.random()-0.5)*0.5, Math.random(), (Math.random()-0.5)*0.5);
               sceneObj.add(coral);
            }
        };

        decorateSkull(scene);

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
