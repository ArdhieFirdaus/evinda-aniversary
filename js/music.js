export function initMusic() {
    const musicToggle = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');
    
    let isPlaying = false;
    bgMusic.volume = 0.5; // Set default volume

    musicToggle.addEventListener('click', () => {
        if (!isPlaying) {
            bgMusic.play().then(() => {
                isPlaying = true;
                musicToggle.innerHTML = '🎵 On';
                musicToggle.classList.add('playing');
            }).catch(err => {
                console.log("Autoplay prevented", err);
            });
        } else {
            bgMusic.pause();
            isPlaying = false;
            musicToggle.innerHTML = '🎵 Off';
            musicToggle.classList.remove('playing');
        }
    });
}
