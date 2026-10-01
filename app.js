'use strict';

const svgWrapper = (path) => `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;

// color = bright shade (glow, dark mode). ink = darker shade for light mode (all >= 4.5:1 on white).
const tracks = [
    { id: 'power',     title: 'Power',     file: 'power.mp3',     color: '#e53e3e', ink: '#c53030', transcript: '', icon: svgWrapper('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>') },
    { id: 'purity',    title: 'Purity',    file: 'purity.mp3',    color: '#ed8936', ink: '#9c4221', transcript: '', icon: svgWrapper('<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>') },
    { id: 'happiness', title: 'Happiness', file: 'happiness.mp3', color: '#ecc94b', ink: '#8a5a00', transcript: '', icon: svgWrapper('<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>') },
    { id: 'love',      title: 'Love',      file: 'love.mp3',      color: '#48bb78', ink: '#276749', transcript: '', icon: svgWrapper('<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>') },
    { id: 'peace',     title: 'Peace',     file: 'peace.mp3',     color: '#4299e1', ink: '#2b6cb0', transcript: '', icon: svgWrapper('<path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>') },
    { id: 'knowledge', title: 'Knowledge', file: 'knowledge.mp3', color: '#667eea', ink: '#4c51bf', transcript: '', icon: svgWrapper('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>') },
    { id: 'bliss',     title: 'Bliss',     file: 'bliss.mp3',     color: '#9f7aea', ink: '#6b46c1', transcript: '', icon: svgWrapper('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>') }
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
            album: 'Soul Spa Guided Meditations'
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
        symbol.style.setProperty('--ink-light', track.ink);
        symbol.style.setProperty('--ink-dark', track.color);
        symbol.style.setProperty('--tint', `rgba(${hexToChannels(track.color).join(', ')}, 0.15)`);
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
