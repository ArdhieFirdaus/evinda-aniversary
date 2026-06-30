import { camera, bloomPass, controls } from './galaxy.js';
import { gatherPhotos, scatterPhotos } from './orbit.js';

export function initPopup() {
    // Close button event for photo popup
    const popup = document.getElementById('photo-popup');
    const closeBtn = popup.querySelector('.btn-close');

    closeBtn.addEventListener('click', () => {
        closePhotoPopup();
    });

    // Final Surprise Button
    const btnFinal = document.getElementById('btn-final');
    btnFinal.addEventListener('click', triggerFinalSurprise);
}

export function openPhotoPopup(photo) {
    const popup = document.getElementById('photo-popup');
    const img = document.getElementById('popup-img');
    const title = document.getElementById('popup-title');
    const date = document.getElementById('popup-date');
    const desc = document.getElementById('popup-desc');
    const content = popup.querySelector('.popup-content');

    // Set Data
    img.src = photo.src;
    title.textContent = photo.title;
    date.textContent = photo.date;
    desc.textContent = photo.desc;

    // Show Popup
    popup.classList.remove('hidden');

    // GSAP Animation
    gsap.fromTo(content,
        { scale: 0.8, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
    );
}

export function closePhotoPopup() {
    const popup = document.getElementById('photo-popup');
    const content = popup.querySelector('.popup-content');

    gsap.to(content, {
        scale: 0.8, opacity: 0, y: 50, duration: 0.3, ease: "power2.in",
        onComplete: () => {
            popup.classList.add('hidden');
        }
    });
}

function triggerFinalSurprise() {
    // Lock Camera and Zoom In
    if (controls) {
        controls.enabled = false;
        gsap.to(controls.target, {
            x: 0, y: 0, z: 0,
            duration: 2,
            ease: "power2.inOut"
        });
    }

    if(camera) {
        // 1. Zoom In (0s -> 4s)
        gsap.to(camera.position, {
            x: 0,
            y: 35,
            z: 140,
            duration: 4,
            ease: "power2.inOut"
        });

        // 2. Zoom Out (5s -> 10s)
        const isMobile = window.innerWidth < 768;
        const targetZ = isMobile ? 600 : 400;
        gsap.to(camera.position, {
            x: 0,
            y: 150,
            z: targetZ,
            duration: 5,
            delay: 5,
            ease: "power3.inOut",
            onComplete: () => {
                if (controls) controls.enabled = true; // Unlock so user can look around
            }
        });
    }

    // 1. Gather all photos to the center ring initially (0s -> 4s)
    gatherPhotos();

    // 2. Scatter photos back to wide orbits (5s -> 9s)
    setTimeout(() => {
        scatterPhotos();
    }, 5000);

    // Planet Glow Explosion (Peak at 4.5s)
    if (bloomPass) {
        gsap.to(bloomPass, {
            strength: 6,
            radius: 2.0,
            duration: 1,
            delay: 3.5,
            ease: "power2.in",
            yoyo: true,
            repeat: 1
        });
    }

    // Hide Main UI
    gsap.to('#main-ui', {opacity: 0, duration: 1});

    // Show Final Screen
    setTimeout(() => {
        const finalScreen = document.getElementById('final-screen');
        finalScreen.classList.remove('hidden');

        gsap.fromTo(finalScreen,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 2, ease: "power2.out" }
        );

        createConfetti();
    }, 5000);
}

function createConfetti() {
    // Simple DOM based confetti
    const colors = ['#ff4fa0', '#ff77c8', '#ffffff', '#ff0080'];
    const emojis = ['❤️', '💖', '✨', ''];
    for (let i = 0; i < 150; i++) {
        const conf = document.createElement('div');
        conf.style.position = 'absolute';

        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        if (emoji) {
            conf.innerText = emoji;
            conf.style.fontSize = (10 + Math.random() * 20) + 'px';
            conf.style.color = colors[Math.floor(Math.random() * colors.length)];
        } else {
            conf.style.width = '10px';
            conf.style.height = '10px';
            conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        }

        conf.style.top = '-20px';
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.zIndex = '9999';

        document.body.appendChild(conf);

        gsap.to(conf, {
            y: window.innerHeight + 100,
            x: `+=${(Math.random() - 0.5) * 200}`,
            rotation: Math.random() * 360,
            duration: 2 + Math.random() * 3,
            ease: "power1.out",
            onComplete: () => conf.remove()
        });
    }
}
