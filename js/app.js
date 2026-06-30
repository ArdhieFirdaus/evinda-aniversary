import { initGalaxy, animateGalaxy } from './galaxy.js';
import { initOrbit, animateOrbit } from './orbit.js';
import { initMusic } from './music.js';
import { initPopup } from './popup.js';
import { initTimeline } from './timeline.js';

// Configuration for Photos and Text
// To add new photos, simply drop them in the /images/ folder and add the filename here.
export const CONFIG = {
    anniversaryDate: new Date('2025-06-30T00:00:00'), // Change this to the real anniversary date
    photos: [
        { src: 'images/1.jpg', title: 'Every Moment Counts', desc: 'Looking back, I realize that every little moment with you has become part of my favorite memories.' },
        { src: 'images/2.jpeg', title: 'Better Together', desc: 'Life is simply better when we experience it side by side.' },
        { src: 'images/3.jpeg', title: 'Moonlight Memories', desc: 'Under the moonlight, every conversation, every laugh, and every moment with you became a memory I will never forget..' },
        { src: 'images/4.jpg', title: 'Just You and Me', desc: 'The stars above us, the cool night breeze, and your hand in mine were all I ever needed to feel complete.' },
        { src: 'images/5.jpeg', title: 'Foto Booth', desc: 'Our little photo strips may fade over time, but the smiles and laughter we shared that day will stay in my heart forever.' }
    ],
    orbitTexts: [
        '❤️ I Love You',
        '❤️ Forever',
        '❤️ My Everything',
        '❤️ My Princess',
        '❤️ You & Me',
        '❤️ Our Story',
        '❤️ 365 Days',
        '❤️ To Infinity'
    ],
    memories: [
        { title: 'First Chat', desc: 'The simple "hello" that started it all.' },
        { title: 'First Meet', desc: 'I was so nervous but you were so perfect.' },
        { title: 'First Date', desc: 'We talked for hours and lost track of time.' },
        { title: 'First Gift', desc: 'The cute little thing I keep on my desk.' },
        { title: 'First Trip', desc: 'Making memories outside the city.' },
        { title: 'First Anniversary', desc: 'One year down, forever to go.' }
    ],
    letter: `
        <p>You are the best thing that ever happened to me. This past year has been filled with so much joy, laughter, and love.</p>
        <p>I cherish every single moment we spend together. You are not just my partner, but my best friend.</p>
        <p>I can't wait to see what the future holds for us. I love you more than words can say.</p>
    `
};

// Application State
const appState = {
    hasStarted: false
};

// Initialize Application
function initApp() {
    initMusic();
    initPopup();
    initTimeline();

    // Setup Countdown
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Event Listeners for UI
    document.getElementById('btn-start').addEventListener('click', startJourney);

    // Wait for user to interact with audio prompt before showing landing properly
    // The logic is in music.js, but we assume the landing page is always visible beneath it.
}

// Start the Journey (Fade from Landing to Main Scene)
function startJourney() {
    if (appState.hasStarted) return;
    appState.hasStarted = true;

    // Fade out landing
    gsap.to('#landing', {
        opacity: 0,
        duration: 1.5,
        onComplete: () => {
            document.getElementById('landing').classList.add('hidden');
            document.getElementById('main-ui').classList.remove('hidden');
            gsap.fromTo('#main-ui', { opacity: 0 }, { opacity: 1, duration: 1 });
        }
    });

    // Initialize 3D Scene
    initGalaxy();
    initOrbit();

    // Start Animation Loop
    animate();

    // Set initial zoomed-in camera position and animate Zoom Out
    import('./galaxy.js').then(mod => {
        if (mod.camera) {
            const isMobile = window.innerWidth < 768;
            const targetZ = isMobile ? 600 : 400;

            // Start zoomed in
            mod.camera.position.set(0, 20, 80);

            // Animate to normal zoomed out position
            gsap.to(mod.camera.position, {
                x: 0,
                y: 150,
                z: targetZ,
                duration: 5,
                ease: "power3.inOut"
            });
        }
    });
}

// Countdown Logic
function updateCountdown() {
    const now = new Date();
    const diff = now - CONFIG.anniversaryDate;

    if (diff < 0) return; // Not reached yet, or handle differently

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById('time-display').innerText =
        `${days} Days ${hours} Hours ${minutes} Mins ${seconds} Secs`;
}

// Main Render Loop
function animate() {
    requestAnimationFrame(animate);

    animateGalaxy();
    animateOrbit();
}

// Handle Window Resize
window.addEventListener('resize', () => {
    // Handled in galaxy.js to keep concerns separated, but dispatched here if needed
});

// Run Init
window.addEventListener('DOMContentLoaded', initApp);

export { appState };
