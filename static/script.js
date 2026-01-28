// State
let segments = [];
let currentSegmentIndex = -1;
let isPlaying = false;
let apiKey = '';

// Elements
const form = document.getElementById('upload-form');
const fileInput = document.getElementById('file');
const filenameDisplay = document.getElementById('filename');
const convertBtn = document.getElementById('convert-btn');
const mainView = document.getElementById('main-view');
const pdfFrame = document.getElementById('pdf-frame');
const segmentsContainer = document.getElementById('segments-container');
const loading = document.getElementById('loading');
const errorOverlay = document.getElementById('error');
const errorMsg = document.getElementById('error-msg');
const audioPlayer = document.getElementById('audio-player');

// Player Elements
const playerBar = document.getElementById('player-bar');
const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const seekSlider = document.getElementById('seek-slider');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');

// Utils
const showError = (msg) => {
    errorMsg.textContent = msg;
    errorOverlay.classList.remove('hidden');
};

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// File Selection
if (fileInput) {
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            filenameDisplay.textContent = fileInput.files[0].name;
        }
    });
}

// Upload & Convert
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        apiKey = document.getElementById('api_key').value;

        loading.classList.remove('hidden');
        convertBtn.disabled = true;

        const formData = new FormData(form);

        try {
            const res = await fetch('/convert', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (!data.success) throw new Error(data.error || 'Conversion failed');

            // Success: Setup UI
            segments = data.segments;
            pdfFrame.src = data.pdf_url;

            // Reset Player
            seekSlider.max = segments.length - 1;
            seekSlider.value = 0;
            totalTimeEl.textContent = segments.length + " segs"; // Approximate "time" as segments
            currentSegmentIndex = -1;

            renderSegments();

            mainView.classList.remove('hidden');
            playerBar.classList.remove('hidden');
            loading.classList.add('hidden');
            convertBtn.disabled = false;
        } catch (err) {
            showError(err.message);
            loading.classList.add('hidden');
            convertBtn.disabled = false;
        }
    });
}

// Render Segments
function renderSegments() {
    segmentsContainer.innerHTML = '';
    segments.forEach((seg, index) => {
        const div = document.createElement('div');
        div.className = 'segment';
        div.id = `seg-${index}`;
        div.textContent = seg.text;
        div.onclick = () => jumpToSegment(index);
        segmentsContainer.appendChild(div);
    });
    // Add padding for player
    const padding = document.createElement('div');
    padding.style.height = '100px';
    segmentsContainer.appendChild(padding);
}

// Playback Logic
async function jumpToSegment(index) {
    if (index < 0 || index >= segments.length) return;

    // Stop current if playing
    if (isPlaying) audioPlayer.pause();

    updateActiveSegmentUI(index);
    currentSegmentIndex = index;
    seekSlider.value = index;
    currentTimeEl.textContent = `${index + 1}`;

    // Play
    playCurrentSegment();
}

function updateActiveSegmentUI(index) {
    // Remove old active
    const old = document.querySelector('.segment.active');
    if (old) old.classList.remove('active');

    // Add new active
    const el = document.getElementById(`seg-${index}`);
    if (el) {
        el.classList.add('active');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

async function playCurrentSegment() {
    if (currentSegmentIndex === -1) currentSegmentIndex = 0;

    isPlaying = true;
    updatePlayerUI();

    const text = segments[currentSegmentIndex].text;

    try {
        const res = await fetch('/speak', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-OpenAI-Key': apiKey
            },
            body: JSON.stringify({ text: text })
        });
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        audioPlayer.src = data.audio_url;
        audioPlayer.play();
    } catch (err) {
        console.error("Audio error:", err);
        showError(err.message);
        isPlaying = false;
        updatePlayerUI();
    }
}

// Slider Interaction
if (seekSlider) {
    seekSlider.addEventListener('input', (e) => {
        const index = parseInt(e.target.value);
        // Don't play immediately while dragging, just update visual
        currentTimeEl.textContent = `${index + 1}`;
    });

    seekSlider.addEventListener('change', (e) => {
        const index = parseInt(e.target.value);
        jumpToSegment(index);
    });
}

// Audio Events
if (audioPlayer) {
    audioPlayer.onended = () => {
        if (currentSegmentIndex < segments.length - 1) {
            currentSegmentIndex++;
            seekSlider.value = currentSegmentIndex;
            updateActiveSegmentUI(currentSegmentIndex);
            currentTimeEl.textContent = `${currentSegmentIndex + 1}`;
            playCurrentSegment();
        } else {
            isPlaying = false;
            updatePlayerUI();
        }
    };
}

// Play/Pause Button
if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            audioPlayer.pause();
            isPlaying = false;
        } else {
            if (currentSegmentIndex === -1) currentSegmentIndex = 0;

            // Resume if possible
            if (audioPlayer.src && audioPlayer.currentTime > 0 && !audioPlayer.ended) {
                audioPlayer.play();
                isPlaying = true;
            } else {
                playCurrentSegment();
            }
        }
        updatePlayerUI();
    });
}

function updatePlayerUI() {
    if (isPlaying) {
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
    } else {
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
    }
}
