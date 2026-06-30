import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';

export let scene, camera, renderer, cssRenderer, composer, bloomPass, controls;
let galaxyParticles, stars;

export function initGalaxy() {
    const container = document.getElementById('canvas-container');
    const cssContainer = document.getElementById('css-container');

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050010, 0.002);

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 150, 400);

    // WebGL Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x050010, 1);
    container.appendChild(renderer.domElement);

    // CSS3D Renderer (For HTML Cards)
    cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = '0';
    cssRenderer.domElement.style.pointerEvents = 'none'; // Let clicks pass through empty space
    cssContainer.appendChild(cssRenderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 800;
    controls.minDistance = 80; // Allow zooming closer for final surprise

    // Post-Processing (Bloom) - reduce resolution/strength on mobile if needed
    const renderScene = new RenderPass(scene, camera);
    const isMobile = window.innerWidth < 768;

    // On mobile we might reduce bloom resolution slightly for performance, but UnrealBloomPass handles it fairly well.
    bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0;
    bloomPass.strength = isMobile ? 1.0 : 1.2;
    bloomPass.radius = 0.5;

    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // Create Background Stars
    createStars();

    // Create Pink Galaxy Spiral
    createSpiralGalaxy();

    // Resize Handler
    window.addEventListener('resize', onWindowResize, false);
}

function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 1000 : 3000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const color1 = new THREE.Color(0xffffff);
    const color2 = new THREE.Color(0xffb3dc);

    for (let i = 0; i < starCount; i++) {
        starPositions[i * 3] = (Math.random() - 0.5) * 2000;
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
        starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2000;

        const mixedColor = color1.clone().lerp(color2, Math.random());
        starColors[i * 3] = mixedColor.r;
        starColors[i * 3 + 1] = mixedColor.g;
        starColors[i * 3 + 2] = mixedColor.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

function createSpiralGalaxy() {
    const isMobile = window.innerWidth < 768;
    const parameters = {
        count: isMobile ? 25000 : 60000,
        size: 0.02,
        radius: 350,
        branches: 4,
        spin: 1.5,
        randomness: 0.1,
        randomnessPower: 5,
        insideColor: '#ff0080',
        outsideColor: '#ffb3dc'
    };

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;

        // Position
        const radius = Math.random() * parameters.radius;
        const spinAngle = radius * parameters.spin;
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY; // Flattened galaxy
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        // Color
        const mixedColor = colorInside.clone().lerp(colorOutside, radius / parameters.radius);
        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Create a circular texture for particles programmatically
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
        size: 3,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        transparent: true,
        map: texture
    });

    galaxyParticles = new THREE.Points(geometry, material);
    galaxyParticles.rotation.x = 0.2;
    scene.add(galaxyParticles);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

export function animateGalaxy() {
    if (galaxyParticles) {
        galaxyParticles.rotation.y -= 0.001; // Slow rotation
    }
    if (stars) {
        stars.rotation.y -= 0.0005;
    }

    if (controls) {
        controls.update();
    }

    // Use composer for bloom effect instead of renderer.render
    if (composer && scene && camera) {
        composer.render();
        cssRenderer.render(scene, camera);
    }
}
