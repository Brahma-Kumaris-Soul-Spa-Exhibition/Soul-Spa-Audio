'use strict';

const svgWrapper = (path) => `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;

// color = brand colour (tile + glow). fg = icon colour on the tile (white, dark on yellow for contrast).
const tracks = [
    // Power: red, solid sun with 12 rays
    { id: 'power', title: 'Power', file: 'power.mp3', color: '#BA2025', fg: '#fff', transcript: '', icon: svgWrapper('<circle cx="12" cy="12" r="5" fill="currentColor" stroke="none"></circle><path d="M12.00 4.00L12.00 1.40M16.00 5.07L17.30 2.82M18.93 8.00L21.18 6.70M20.00 12.00L22.60 12.00M18.93 16.00L21.18 17.30M16.00 18.93L17.30 21.18M12.00 20.00L12.00 22.60M8.00 18.93L6.70 21.18M5.07 16.00L2.82 17.30M4.00 12.00L1.40 12.00M5.07 8.00L2.82 6.70M8.00 5.07L6.70 2.82" stroke-width="2"></path>') },
    // Purity: orange, solid drop with crescent highlight
    { id: 'purity', title: 'Purity', file: 'purity.mp3', color: '#E06221', fg: '#fff', transcript: '', icon: svgWrapper('<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="currentColor" stroke="none"></path><path d="M8 13.2A5.2 5.2 0 0 0 11.8 18.6 4 4 0 0 1 8 13.2z" fill="#E06221" stroke="none"></path>') },
    // Happiness: yellow, solid star
    { id: 'happiness', title: 'Happiness', file: 'happiness.mp3', color: '#F8B617', fg: '#fff', transcript: '', icon: svgWrapper('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#ffffff" stroke="ffffff"></polygon>') },
    // Love: green, heart outline
    { id: 'love', title: 'Love', file: 'love.mp3', color: '#006E3A', fg: '#fff', transcript: '', icon: svgWrapper('<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke-width="3"></path>') },
    // Peace: blue, three waves
    { id: 'peace', title: 'Peace', file: 'peace.mp3', color: '#0075BE', fg: '#fff', transcript: '', icon: svgWrapper('<path d="M3 7q2-2 4 0t4 0 4 0 4 0M3 12q2-2 4 0t4 0 4 0 4 0M3 17q2-2 4 0t4 0 4 0 4 0"></path>') },
    // Knowledge: indigo, light bulb with rays
    { id: 'knowledge', title: 'Knowledge', file: 'knowledge.mp3', color: '#27387A', fg: '#fff', transcript: '', icon: svgWrapper('<path d="M9.2 17.5C9.2 15 6.8 14 6.8 10.5a5.2 5.2 0 0 1 10.4 0c0 3.5-2.4 4.5-2.4 7zM9.5 21h5M12 1v1.8M3.6 4.6l1.3 1.3M20.4 4.6l-1.3 1.3M1.5 10.5h1.8M20.7 10.5h1.8" stroke-width="2"></path>') },
    // Bliss: purple, lotus
    { id: 'bliss', title: 'Bliss', file: 'bliss.mp3', color: '#652A80', fg: '#fff', transcript: '', icon: svgWrapper('<path d="M12 5c-2.2 2.4-3 4.8-3 7.2 0 2 1.2 3.4 3 3.8 1.8-.4 3-1.8 3-3.8 0-2.4-.8-4.8-3-7.2zM9 12.5C6.5 11.5 4.5 9.5 3 7.5 2.7 11.5 4.8 15.4 9 16.3M15 12.5c2.5-1 4.5-3 6-5 .3 4-1.8 7.9-6 8.8M3 15.5c1.8 3 5 4.8 9 4.8s7.2-1.8 9-4.8" stroke-width="2"></path>') }
];

const player = document.getElementById('audio-player');
const source = document.getElementById('audio-source');
const titleEl = document.getElementById('current-title');
const list = document.getElementById('playlist-container');
const errorEl = document.getElementById('audio-error');
const transcriptEl = document.getElementById('transcript');
const transcriptBody = document.getElementById('transcript-body');
const logo = document.getElementById('org-logo');
const root = document.documentElement;

let currentIndex = 0;

function hexToChannels(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function updateButtons() {
    const playing = !player.paused;
    list.querySelectorAll('.track-link').forEach((btn, i) => {
        const isActive = i === currentIndex;
        btn.classList.toggle('active', isActive);
        if (isActive) btn.setAttribute('aria-current', 'true');
        else btn.removeAttribute('aria-current');
        btn.querySelector('.play-indicator').classList.toggle('is-playing', isActive && playing);
        btn.setAttribute('aria-label', `${isActive && playing ? 'Pause' : 'Play'} ${tracks[i].title}`);
    });
}

function renderTranscript(text) {
    transcriptBody.replaceChildren();
    if (!text) { transcriptEl.hidden = true; return; }
    text.split(/\n\s*\n/).forEach(para => {
        const p = document.createElement('p');
        p.textContent = para.trim();
        transcriptBody.appendChild(p);
    });
    transcriptEl.open = false;
    transcriptEl.hidden = false;
}

function loadTrack(index, autoplay = false) {
    currentIndex = index;
    const track = tracks[index];
    const [r, g, b] = hexToChannels(track.color);

    titleEl.textContent = track.title;
    document.title = `Soul Spa - ${track.title}`;

    root.style.setProperty('--accent', track.color);
    root.style.setProperty('--glow-r', r);
    root.style.setProperty('--glow-g', g);
    root.style.setProperty('--glow-b', b);

    errorEl.hidden = true;
    source.src = track.file;
    player.load();
    if (autoplay) player.play().catch(() => {});

    renderTranscript(track.transcript);
    updateButtons();

    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title,
            artist: 'Brahma Kumaris UK',
            album: 'Soul Spa Guided Meditations',
            artwork: [{ src: `art-${track.id}.png`, sizes: '512x512', type: 'image/png' }]
        });
    }

    try {
        history.replaceState({}, '', `${location.pathname}?track=${track.id}`);
    } catch (e) { /* Running locally: URL update skipped. */ }
}

function step(offset) {
    loadTrack((currentIndex + offset + tracks.length) % tracks.length, true);
}

function buildPlaylist() {
    tracks.forEach((track, index) => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'track-link';

        const leftContent = document.createElement('div');
        leftContent.className = 'track-left-content';

        const symbol = document.createElement('div');
        symbol.className = 'track-symbol';
        symbol.style.setProperty('--ink-light', track.fg);
            symbol.style.setProperty('--ink-dark', track.fg);
            symbol.style.setProperty('--tint', track.color);
        symbol.innerHTML = track.icon; // hardcoded constants only

        const label = document.createElement('span');
        label.className = 'track-title-text';
        label.textContent = track.title;

        leftContent.append(symbol, label);

        const playIndicator = document.createElement('span');
        playIndicator.className = 'play-indicator';
        playIndicator.setAttribute('aria-hidden', 'true');

        btn.append(leftContent, playIndicator);
        btn.addEventListener('click', () => {
            if (index === currentIndex) {
                if (player.paused) player.play().catch(() => {});
                else player.pause();
            } else {
                loadTrack(index, true);
            }
        });

        li.appendChild(btn);
        list.appendChild(li);
    });
}

const showError = () => { errorEl.hidden = false; };
source.addEventListener('error', showError);
player.addEventListener('error', showError);   // mid-playback network/decode failures
player.addEventListener('play', updateButtons);
player.addEventListener('pause', updateButtons);
player.addEventListener('ended', updateButtons);

// Logo: handle failures that happened before this script ran
if (logo.complete && logo.naturalWidth === 0) logo.hidden = true;
logo.addEventListener('error', () => { logo.hidden = true; });

if ('mediaSession' in navigator) {
    try {
        navigator.mediaSession.setActionHandler('previoustrack', () => step(-1));
        navigator.mediaSession.setActionHandler('nexttrack', () => step(1));
    } catch (e) { }
}

const requested = new URLSearchParams(location.search).get('track');
const startIndex = Math.max(0, tracks.findIndex(t => t.id === requested));

buildPlaylist();
loadTrack(startIndex, false);
