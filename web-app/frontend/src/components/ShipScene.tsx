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

      // 3. DEN DEN MUSHI on railing
      const ddm = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xfdf6e3, roughness: 0.6 });
      const shellMat = new THREE.MeshStandardMaterial({ color: 0xffb6c1, roughness: 0.4 });
      
      const snailBody = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), bodyMat);
      snailBody.scale.set(1, 0.6, 1.5);
      ddm.add(snailBody);
      
      const snailShell = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.2, 16, 32), shellMat);
      snailShell.position.set(0, 0.4, -0.2);
      snailShell.rotation.x = Math.PI / 2;
      ddm.add(snailShell);

      const antTL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5), bodyMat);
      antTL.position.set(0.2, 0.5, 0.5);
      antTL.rotation.x = Math.PI * 0.2;
      const antTR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5), bodyMat);
      antTR.position.set(-0.2, 0.5, 0.5);
      antTR.rotation.x = Math.PI * 0.2;
      ddm.add(antTL, antTR);
      
      ddm.position.set(12, 11, 5); 
      ddm.scale.setScalar(2);
      
      ship.add(ddm);
      ship.userData.ddm = { shell: snailShell, ants: [antTL, antTR] };

      // 4. LOG POSE
      const lp = new THREE.Group();
      
      const canvas = document.createElement('canvas');
      canvas.width = 128; canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#0a2a1a';
      ctx.beginPath(); ctx.arc(64, 64, 64, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#00ffaa'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(64, 64, 58, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = '#00ffaa'; ctx.font = '24px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('LOG', 64, 30);
      
      const lpTex = new THREE.CanvasTexture(canvas);
      const lpFace = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 1.5), 
        new THREE.MeshStandardMaterial({ map: lpTex, emissive: 0x00ffaa, emissiveIntensity: 0.5 })
      );
      lpFace.rotation.x = -Math.PI / 2;
      lp.add(lpFace);
      
      const needle = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.05, 1.0),
        new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xff0000 })
      );
      needle.position.y = 0.1;
      lp.add(needle);
      
      lp.position.set(-1.5, 13, 10); 
      lp.scale.setScalar(1.5);
      ship.add(lp);
      ship.userData.lpNeedle = needle;
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

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false; // Disable panning to keep ship centered
    controls.maxPolarAngle = Math.PI * 0.48; // Prevent looking below the ship/water level
    controls.minPolarAngle = Math.PI / 6; // Prevent looking straight down from above
    controls.minDistance = 25; // Professional zoom limit - prevent clipping
    controls.maxDistance = 250; // Increased to allow viewing the beautiful new bay while still having a limit
    controlsRef.current = controls;

    // --- ONE PIECE ENVIRONMENT ELEMENTS ---
    
    // 1. REVERSE MOUNTAIN WATERFALL
    const rmGroup = new THREE.Group();
    rmGroup.position.set(0, -10, -500);
    const cliffGeo = new THREE.BoxGeometry(200, 400, 50);
    const cliffMat = new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.9, flatShading: true });
    const cliff = new THREE.Mesh(cliffGeo, cliffMat);
    cliff.position.y = 150;
    rmGroup.add(cliff);

    const wfParticleCount = 800;
    const wfGeo = new THREE.BufferGeometry();
    const wfPos = new Float32Array(wfParticleCount * 3);
    const wfVel = new Float32Array(wfParticleCount);
    for(let i=0; i<wfParticleCount; i++){
      wfPos[i*3] = (Math.random() - 0.5) * 80;
      wfPos[i*3+1] = Math.random() * 300;
      wfPos[i*3+2] = 30 + Math.random() * 10;
      wfVel[i] = -(Math.random() * 1.5 + 1.0);
    }
    wfGeo.setAttribute('position', new THREE.BufferAttribute(wfPos, 3));
    const wfMat = new THREE.PointsMaterial({ color: 0xaaccff, size: 2.0, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
    const waterfall = new THREE.Points(wfGeo, wfMat);
    rmGroup.add(waterfall);

    const mistGeo = new THREE.PlaneGeometry(150, 150);
    const mistMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, depthWrite: false });
    const mist = new THREE.Mesh(mistGeo, mistMat);
    mist.rotation.x = -Math.PI / 2;
    mist.position.set(0, 10, 40);
    rmGroup.add(mist);
    scene.add(rmGroup);

    // 2. KNOCK UP STREAM BUBBLES
    const bubbleCount = 150;
    const bubbleGeo = new THREE.BufferGeometry();
    const bubblePos = new Float32Array(bubbleCount * 3);
    const bubbleVel = new Float32Array(bubbleCount);
    for(let i=0; i<bubbleCount; i++){
      const r = Math.random() * 60 + 20;
      const theta = Math.random() * Math.PI * 2;
      bubblePos[i*3] = Math.cos(theta) * r;
      bubblePos[i*3+1] = -50 - Math.random() * 50;
      bubblePos[i*3+2] = Math.sin(theta) * r;
      bubbleVel[i] = Math.random() * 0.5 + 0.2;
    }
    bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePos, 3));
    const bubbleMat = new THREE.PointsMaterial({ color: 0x00aaff, size: 1.5, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
    const bubbles = new THREE.Points(bubbleGeo, bubbleMat);
    scene.add(bubbles);

    // 5. SEA KING SILHOUETTES
    const skGroup = new THREE.Group();
    const skGeo = new THREE.PlaneGeometry(250, 40);
    const skMat = new THREE.MeshBasicMaterial({ color: 0x000511, transparent: true, opacity: 0.15, depthWrite: false });
    const sk1 = new THREE.Mesh(skGeo, skMat);
    sk1.position.set(0, -30, -100);
    sk1.rotation.y = Math.PI * 0.1;
    const sk2 = new THREE.Mesh(skGeo, skMat);
    sk2.position.set(150, -40, 50);
    sk2.rotation.y = -Math.PI * 0.2;
    skGroup.add(sk1, sk2);
    scene.add(skGroup);

    // 6. SKYPIEA CLOUDS
    const skyClouds = new THREE.Group();
    const cloudGeo = new THREE.SphereGeometry(1, 16, 16);
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xfffcf0, roughness: 0.5, emissive: 0x221100 });
    
    const skyFalls: { pos: Float32Array, mesh: THREE.Points }[] = [];
    for (let c=0; c<3; c++) {
      const cluster = new THREE.Group();
      for(let s=0; s<6; s++) {
        const sphere = new THREE.Mesh(cloudGeo, cloudMat);
        sphere.position.set((Math.random()-0.5)*40, (Math.random()-0.5)*10, (Math.random()-0.5)*40);
        sphere.scale.set(Math.random()*15+15, Math.random()*8+8, Math.random()*15+15);
        cluster.add(sphere);
      }
      cluster.position.set((Math.random()-0.5)*300, 150 + Math.random()*50, (Math.random()-0.5)*300 - 100);
      skyClouds.add(cluster);
      
      const cwfGeo = new THREE.BufferGeometry();
      const cwfPos = new Float32Array(50 * 3);
      for(let i=0; i<50; i++) {
        cwfPos[i*3] = (Math.random()-0.5)*20;
        cwfPos[i*3+1] = -Math.random()*80;
        cwfPos[i*3+2] = (Math.random()-0.5)*20;
      }
      cwfGeo.setAttribute('position', new THREE.BufferAttribute(cwfPos, 3));
      const cwfMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
      const cwf = new THREE.Points(cwfGeo, cwfMat);
      cluster.add(cwf);
      skyFalls.push({ pos: cwfPos, mesh: cwf });
    }
    scene.add(skyClouds);

    // 7. BIOLUMINESCENT OCEAN
    const bioGlowGeo = new THREE.PlaneGeometry(2000, 2000);
    const bioGlowMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false });
    const bioGlow = new THREE.Mesh(bioGlowGeo, bioGlowMat);
    bioGlow.rotation.x = -Math.PI / 2;
    bioGlow.position.y = -4.8; 
    scene.add(bioGlow);

    const bioParts = new THREE.Group();
    for (let i=0; i<40; i++) {
      const pGeo = new THREE.PlaneGeometry(1.5, 1.5);
      const pMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: Math.random() * 0.1 + 0.1, blending: THREE.AdditiveBlending, depthWrite: false });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.rotation.x = -Math.PI / 2;
      pMesh.position.set((Math.random()-0.5)*200, -4.5, (Math.random()-0.5)*200);
      pMesh.userData = { phase: Math.random() * Math.PI * 2, driftX: (Math.random()-0.5)*0.05, driftZ: (Math.random()-0.5)*0.05 };
      bioParts.add(pMesh);
    }
    scene.add(bioParts);


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

      if (wfPos) {
        for(let i=0; i<wfParticleCount; i++){
          wfPos[i*3+1] += wfVel[i];
          if (wfPos[i*3+1] < 0) { wfPos[i*3+1] = 300; }
        }
        waterfall.geometry.attributes.position.needsUpdate = true;
      }

      if (bubblePos) {
        for(let i=0; i<bubbleCount; i++){
          bubblePos[i*3+1] += bubbleVel[i];
          if (bubblePos[i*3+1] > 0) { bubblePos[i*3+1] = -50 - Math.random()*50; }
        }
        bubbles.geometry.attributes.position.needsUpdate = true;
      }

      if (sk1) {
        sk1.position.x = Math.sin(t * 0.2) * 40;
        sk2.position.x = 150 + Math.cos(t * 0.15) * 50;
      }

      skyFalls.forEach(sf => {
         for(let i=0; i<50; i++){
            sf.pos[i*3+1] -= 0.5;
            if (sf.pos[i*3+1] < -80) { sf.pos[i*3+1] = 0; }
         }
         sf.mesh.geometry.attributes.position.needsUpdate = true;
      });

      if (bioParts) {
         bioParts.children.forEach(pm => {
            const data = pm.userData;
            pm.position.x += data.driftX;
            pm.position.z += data.driftZ;
            ((pm as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(t * 1.5 + data.phase) * 0.05;
         });
      }

      if (shipRef.current) {
        const baseY = shipRef.current.userData.baseY ?? -2;
        const centerX = window.innerWidth / 2;
        const rawWaveY = getWaveHeight(centerX, t * 2.5, 5); 
        const bobDisplacement = rawWaveY * 0.04; 
        shipRef.current.position.y = baseY + bobDisplacement;
        shipRef.current.rotation.z = (rawWaveY * 0.001) + Math.sin(t * 0.4) * 0.008;

        if (shipRef.current.userData.ddm) {
           shipRef.current.userData.ddm.shell.rotation.z -= 0.005;
           const wobble = Math.sin(t * 5) * 0.1;
           shipRef.current.userData.ddm.ants.forEach((a: THREE.Mesh) => a.rotation.z = Math.PI * 0.2 + wobble);
        }
        if (shipRef.current.userData.lpNeedle) {
           shipRef.current.userData.lpNeedle.rotation.y = Math.sin(t * 0.8) * 0.5 + t * 0.1;
        }
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
