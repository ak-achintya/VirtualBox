/**
 * Real WebRTC Stream & Voice Engine for Virtual Box
 * Handles HTMLMediaElement.captureStream() for Movie Sharing and getUserMedia({ audio: true }) for Voice Chat.
 */

class WebRTCEngine {
  constructor() {
    this.localMicStream = null;
    this.peerConnection = null;
    this.audioContext = null;
    this.analyser = null;
    this.isMicMuted = false;
    this.speakingCheckInterval = null;
  }

  // REAL MICROPHONE AUDIO ACCESS & SPEAKING METER
  async startVoiceChat(onSpeakingCallback, onErrorCallback) {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('This browser does not support microphone voice chat.');
      }

      this.localMicStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      // WebAudio API Analyser for Real Volume Metering
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.localMicStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      if (this.speakingCheckInterval) clearInterval(this.speakingCheckInterval);

      this.speakingCheckInterval = setInterval(() => {
        if (!this.analyser || this.isMicMuted) {
          if (onSpeakingCallback) onSpeakingCallback(false, 0);
          return;
        }

        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const isSpeaking = average > 18;

        if (onSpeakingCallback) {
          onSpeakingCallback(isSpeaking, average);
        }
      }, 100);

      return this.localMicStream;
    } catch (err) {
      console.warn('[VirtualBox WebRTC] Mic Permission Denied:', err);
      if (onErrorCallback) {
        onErrorCallback('Microphone permission is required for voice chat.');
      }
      throw err;
    }
  }

  toggleMicrophoneMute() {
    if (this.localMicStream) {
      const audioTrack = this.localMicStream.getAudioTracks()[0];
      if (audioTrack) {
        this.isMicMuted = !audioTrack.enabled;
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled; // returns isMuted
      }
    }
    this.isMicMuted = !this.isMicMuted;
    return this.isMicMuted;
  }

  stopVoiceChat() {
    if (this.speakingCheckInterval) clearInterval(this.speakingCheckInterval);
    if (this.localMicStream) {
      this.localMicStream.getTracks().forEach(track => track.stop());
      this.localMicStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  // HOST MOVIE STREAM CAPTURE
  captureHostMovieStream(videoElement) {
    if (!videoElement) return null;
    try {
      if (videoElement.captureStream) {
        return videoElement.captureStream();
      } else if (videoElement.mozCaptureStream) {
        return videoElement.mozCaptureStream();
      } else {
        console.warn('HTMLMediaElement.captureStream() unsupported in this browser engine.');
        return null;
      }
    } catch (e) {
      console.error('Failed to capture movie stream:', e);
      return null;
    }
  }
}

export const webrtcEngine = new WebRTCEngine();
