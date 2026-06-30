# Our First Anniversary - 3D Website ❤️

A premium, interactive 3D website built with Vanilla HTML/CSS/JS, Three.js, and GSAP.

## How to Run

1. Open this folder (`Aniversary`) in **VSCode**.
2. Install the **Live Server** extension if you haven't already.
3. Right-click on `index.html` and select **"Open with Live Server"**.
4. Enjoy the 3D Pink Galaxy experience! 🚀

## Customization

You can easily customize the content without writing any complex code! Open `js/app.js` and look at the `CONFIG` object at the top.

### 1. Changing Photos
- Add your photos into the `/images/` folder.
- Update the `photos` array in `js/app.js` to match your new filenames.
- Provide a title, date, and description for each photo popup.

### 2. Changing the Music
- Add your favorite song into the `/music/` folder.
- Rename it to `song.mpeg` OR change the `src` attribute of the `<audio>` tag in `index.html`.

### 3. Changing Text
- **Anniversary Date:** Update `anniversaryDate` in `js/app.js` to change the countdown target.
- **Orbit Text:** Update `orbitTexts` to change the small floating love messages around the planet.
- **Memories Timeline:** Update the `memories` array to add your own milestones.
- **Love Letter:** Update the `letter` HTML string to write a personal message.

## Features Included
- **Pink Galaxy Spiral:** Built procedurally with Three.js Points and Bloom Post-Processing.
- **Orbiting Glass Cards:** Uses CSS3DRenderer so pure HTML/CSS elements (like Glassmorphism) exist in 3D space.
- **GSAP Animations:** Smooth transitions, popups, and timeline effects.
- **Procedural Textures:** Stars and particle textures are generated purely via HTML5 Canvas (No external image loading required for the galaxy).
- **Responsive & Interactive:** Mouse orbit controls and click events.
