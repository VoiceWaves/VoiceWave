document.addEventListener('DOMContentLoaded', () => {
    const speakButton = document.getElementById('speak-button');
    const downloadButton = document.getElementById('download-button');
    const textArea = document.getElementById('text-to-speech');
    const voiceSelect = document.getElementById('voice-selection');
    const menuIcon = document.querySelector('.menu-icon');
    const navLinks = document.querySelector('.nav-links');

    // Initialize Speech Synthesis
    const synth = window.speechSynthesis;
    let voices = [];
    let recorder;
    let audioChunks = [];

    function populateVoiceList() {
        voices = synth.getVoices();
        voiceSelect.innerHTML = voices
            .map(voice => `<option value="${voice.name}">${voice.name} (${voice.lang})</option>`)
            .join('');
    }

    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    // Convert text to speech
    speakButton.addEventListener('click', () => {
        const text = textArea.value;
        const utterThis = new SpeechSynthesisUtterance(text);
        const selectedVoiceName = voiceSelect.value;

        for (let voice of voices) {
            if (voice.name === selectedVoiceName) {
                utterThis.voice = voice;
                break;
            }
        }

        synth.speak(utterThis);
    });

    // Setup media recorder for download
    downloadButton.addEventListener('click', async () => {
        const text = textArea.value;
        const utterThis = new SpeechSynthesisUtterance(text);
        const selectedVoiceName = voiceSelect.value;

        for (let voice of voices) {
            if (voice.name === selectedVoiceName) {
                utterThis.voice = voice;
                break;
            }
        }

        // Create an audio context and destination
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const streamDestination = audioContext.createMediaStreamDestination();
        const mediaStream = streamDestination.stream;

        // Use RecordRTC to record the MediaStream
        recorder = RecordRTC(mediaStream, {
            type: 'audio',
            mimeType: 'audio/mp3',
            recorderType: RecordRTC.StereoAudioRecorder,
            desiredSampRate: 16000
        });

        // Connect the Web Speech API to the MediaStream
        const mediaElementSource = audioContext.createMediaElementSource(new Audio());
        mediaElementSource.connect(streamDestination);

        utterThis.onstart = () => {
            recorder.startRecording();
        };

        utterThis.onend = () => {
            recorder.stopRecording(() => {
                const blob = recorder.getBlob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'speech.mp3';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        };

        synth.speak(utterThis);
    });

    // Toggle mobile menu
    menuIcon.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });

   
});
