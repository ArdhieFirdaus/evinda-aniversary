import { CONFIG } from './app.js';

export function initTimeline() {
    // Populate Memories
    const timelineList = document.getElementById('timeline-list');
    CONFIG.memories.forEach((mem, index) => {
        const div = document.createElement('div');
        div.className = 'timeline-item';
        div.innerHTML = `
            <h3 class="timeline-title">${mem.title}</h3>
            <p>${mem.desc}</p>
        `;
        timelineList.appendChild(div);
    });

    // Populate Love Letter
    const letterText = document.getElementById('letter-text');
    letterText.innerHTML = CONFIG.letter;

    // Event Listeners for UI Buttons
    document.getElementById('btn-memories').addEventListener('click', openTimeline);
    document.getElementById('btn-letter').addEventListener('click', openLetter);

    // Close buttons
    document.querySelectorAll('.btn-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.closest('.overlay');
            if(section) closeSection(section);
        });
    });

    // Envelope click
    document.getElementById('envelope').addEventListener('click', playEnvelopeAnimation);
}

function openTimeline() {
    const section = document.getElementById('timeline-section');
    section.classList.remove('hidden');
    
    // Animate items
    gsap.fromTo('.timeline-item', 
        {x: -50, opacity: 0}, 
        {x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out"}
    );
}

function openLetter() {
    const section = document.getElementById('letter-section');
    section.classList.remove('hidden');
    
    // Reset envelope state
    gsap.set('.flap', {rotateX: 0});
    gsap.set('.paper', {y: 0});
}

function closeSection(section) {
    gsap.to(section, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            section.classList.add('hidden');
            section.style.opacity = '';
        }
    });
}

function playEnvelopeAnimation() {
    const envelope = document.getElementById('envelope');
    // Disable further clicks during animation
    envelope.style.pointerEvents = 'none';

    // 1. Open Flap
    gsap.to('.flap', {
        rotateX: 180,
        duration: 0.8,
        ease: "power2.inOut"
    });

    // 2. Pull out paper and enlarge
    gsap.to('.paper', {
        y: -150,
        scale: 1.5,
        zIndex: 10,
        duration: 1,
        delay: 0.8,
        ease: "power2.out",
        onComplete: () => {
            envelope.style.pointerEvents = 'auto'; // allow closing
        }
    });
}
