import * as THREE from 'three';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { scene } from './galaxy.js';
import { CONFIG } from './app.js';
import { openPhotoPopup } from './popup.js';

let planetGroup;
let orbitObjects = []; // Stores objects to animate their orbit

export function initOrbit() {
    planetGroup = new THREE.Group();
    scene.add(planetGroup);

    createCentralPlanet();
    createOrbitingCards();
    createOrbitingTexts();
}

function createCentralPlanet() {
    // Planet Geometry
    const geometry = new THREE.SphereGeometry(30, 64, 64);
    
    // Create a procedural pink planet material
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xff4fa0,
        emissive: 0xff0080,
        emissiveIntensity: 0.2,
        roughness: 0.4,
        metalness: 0.1,
        clearcoat: 0.5,
        clearcoatRoughness: 0.2
    });

    const planet = new THREE.Mesh(geometry, material);
    planetGroup.add(planet);

    // Planet Glow / Atmosphere (using slightly larger sphere with additive blending)
    const atmosGeometry = new THREE.SphereGeometry(33, 64, 64);
    const atmosMaterial = new THREE.MeshBasicMaterial({
        color: 0xffb3dc,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosGeometry, atmosMaterial);
    planetGroup.add(atmosphere);

    // Planet Ring (like Saturn)
    const ringGeometry = new THREE.RingGeometry(40, 55, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffb3dc,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2; // Flat
    planetGroup.add(ring);

    // Add a couple of small moons
    createMoon(45, 0.5, 0.02);
    createMoon(60, 0.8, -0.015);
}

function createMoon(distance, size, speed) {
    const geometry = new THREE.SphereGeometry(size * 5, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.5
    });
    const moon = new THREE.Mesh(geometry, material);
    
    // Moon orbit pivot
    const pivot = new THREE.Group();
    pivot.add(moon);
    moon.position.set(distance, 0, 0);
    
    planetGroup.add(pivot);

    orbitObjects.push({
        object: pivot,
        speed: speed,
        isPivot: true
    });
}

function createOrbitingCards() {
    const photos = CONFIG.photos;
    
    photos.forEach((photo, index) => {
        // Create HTML Element
        const div = document.createElement('div');
        div.className = 'photo-card';
        div.innerHTML = `<img src="${photo.src}" alt="${photo.title}">`;
        
        // Add Click Event for Popup
        div.addEventListener('pointerdown', (e) => {
            // pointerdown instead of click to avoid dragging conflicts, 
            // but for safety let's use click with a check
        });

        div.onclick = () => {
            openPhotoPopup(photo);
        };

        // Create CSS3D Object
        const cssObject = new CSS3DObject(div);

        // Calculate orbit position
        const radius = 120 + (index * 25); // Staggered distances
        const angle = (index / photos.length) * Math.PI * 2;
        const yOffset = (Math.random() - 0.5) * 40; // Slight vertical variation
        
        // Initial position
        cssObject.position.x = Math.cos(angle) * radius;
        cssObject.position.z = Math.sin(angle) * radius;
        cssObject.position.y = yOffset; 

        scene.add(cssObject);

        // Add visible orbit path (Ring)
        const ringGeo = new THREE.RingGeometry(radius - 0.5, radius + 0.5, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xffb3dc,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        const orbitRing = new THREE.Mesh(ringGeo, ringMat);
        orbitRing.rotation.x = Math.PI / 2; // Lay flat
        orbitRing.position.y = yOffset; // Match photo's height
        scene.add(orbitRing);

        // Store for animation
        orbitObjects.push({
            object: cssObject,
            angle: angle,
            radius: radius,
            speed: 0.002 + (Math.random() * 0.002), // Different speeds
            yOffset: yOffset,
            isCSS3D: true,
            originalRadius: radius,
            originalSpeed: 0.002 + (Math.random() * 0.002), // store original speed
            originalY: yOffset
        });
        
        // Actually the speed assigned above is random twice, let's fix it
        const spd = 0.002 + (Math.random() * 0.002);
        orbitObjects[orbitObjects.length - 1].speed = spd;
        orbitObjects[orbitObjects.length - 1].originalSpeed = spd;
    });
}

function createOrbitingTexts() {
    const texts = CONFIG.orbitTexts;

    texts.forEach((text, index) => {
        const div = document.createElement('div');
        div.className = 'orbit-text';
        div.textContent = text;

        const cssObject = new CSS3DObject(div);

        const radius = 90 + (Math.random() * 80);
        const angle = (index / texts.length) * Math.PI * 2;

        cssObject.position.x = Math.cos(angle) * radius;
        cssObject.position.z = Math.sin(angle) * radius;
        cssObject.position.y = (Math.random() - 0.5) * 80;

        // Scale down text in 3D space so it's not huge
        cssObject.scale.set(0.2, 0.2, 0.2);

        scene.add(cssObject);

        orbitObjects.push({
            object: cssObject,
            angle: angle,
            radius: radius,
            speed: -(0.001 + (Math.random() * 0.002)), // Opposite direction
            yOffset: cssObject.position.y,
            isCSS3D: true
        });
    });
}

export function animateOrbit() {
    if (planetGroup) {
        planetGroup.rotation.y += 0.005;
        planetGroup.rotation.z = Math.sin(Date.now() * 0.0005) * 0.1; // Gentle bobbing
    }

    orbitObjects.forEach(item => {
        if (item.isPivot) {
            item.object.rotation.y += item.speed;
        } else if (item.isCSS3D) {
            if (!item.isGathering) {
                item.angle += item.speed;
                item.object.position.x = Math.cos(item.angle) * item.radius;
                item.object.position.z = Math.sin(item.angle) * item.radius;
            }
            
            // CSS3D objects need to always face the camera slightly or rotate with orbit
            // Since we use OrbitControls, CSS3DRenderer naturally handles perspective,
            // but we want the cards to always face the camera so they are readable.
            // A simple way is to make them look at the camera:
            import('./galaxy.js').then(mod => {
                if(mod.camera) {
                    item.object.lookAt(mod.camera.position);
                }
            });
        }
    });
}

export function gatherPhotos() {
    const photosOnly = orbitObjects.filter(item => item.isCSS3D && item.object.element.className === 'photo-card');
    const textsOnly = orbitObjects.filter(item => item.isCSS3D && item.object.element.className === 'orbit-text');

    // Fade out texts so they don't clutter the center
    textsOnly.forEach(item => {
        gsap.to(item.object.element, { opacity: 0, duration: 1 });
    });

    // Arrange photos in a tight circle around the planet
    photosOnly.forEach((item, index) => {
        item.isGathering = true; // Stop the regular orbit loop from overriding GSAP
        
        const targetAngle = (index / photosOnly.length) * Math.PI * 2;
        const radius = 55; // Slightly larger than planet radius (30)

        gsap.to(item.object.position, {
            x: Math.cos(targetAngle) * radius,
            y: 0,
            z: Math.sin(targetAngle) * radius,
            duration: 4,
            ease: "power3.inOut",
            onComplete: () => {
                // Keep rotating while gathered
                item.radius = radius;
                item.angle = targetAngle;
                item.speed = 0.003; 
                item.isGathering = false; 
            }
        });
    });
}

export function scatterPhotos() {
    const photosOnly = orbitObjects.filter(item => item.isCSS3D && item.object.element.className === 'photo-card');
    const textsOnly = orbitObjects.filter(item => item.isCSS3D && item.object.element.className === 'orbit-text');

    // Fade texts back in
    textsOnly.forEach(item => {
        gsap.to(item.object.element, { opacity: 1, duration: 2 });
    });

    // Scatter photos back to original orbits
    photosOnly.forEach((item) => {
        item.isGathering = true; // take control from render loop
        
        gsap.to(item.object.position, {
            x: Math.cos(item.angle) * item.originalRadius,
            y: item.originalY,
            z: Math.sin(item.angle) * item.originalRadius,
            duration: 4,
            ease: "power3.inOut",
            onComplete: () => {
                // Resume original wide orbit
                item.radius = item.originalRadius;
                item.speed = item.originalSpeed;
                item.isGathering = false; 
            }
        });
    });
}
