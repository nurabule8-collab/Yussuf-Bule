// Voice assistance helper supporting Web Speech API & Server Gemini TTS

class VoiceManager {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  public isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isSpeechRecognitionSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    );
  }

  public stopSpeaking(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  public async speakText(
    text: string,
    lang = 'en-US',
    onEnd?: () => void,
    onError?: (err: any) => void
  ): Promise<void> {
    this.stopSpeaking();

    // Clean text: strip markdown symbols for natural reading
    const cleanText = text
      .replace(/[*_#`~[\]]/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .slice(0, 1000);

    // Try server Gemini TTS first if internet is available, or fallback immediately to Web Speech
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText.slice(0, 400) }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          this.currentAudio = audio;
          audio.onended = () => {
            this.currentAudio = null;
            if (onEnd) onEnd();
          };
          audio.onerror = () => {
            this.currentAudio = null;
            this.fallbackWebSpeech(cleanText, lang, onEnd, onError);
          };
          await audio.play();
          return;
        }
      }
    } catch {
      // Server TTS not available or network error, proceed to Web Speech
    }

    this.fallbackWebSpeech(cleanText, lang, onEnd, onError);
  }

  private fallbackWebSpeech(
    text: string,
    lang: string,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): void {
    if (!this.isSpeechSynthesisSupported()) {
      if (onError) onError(new Error('Speech synthesis is not supported on this device.'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang || 'en-US';
    utterance.rate = 0.95; // slightly deliberate for clarity
    utterance.pitch = 1.0;

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      if (onError) onError(e);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public createRecognizer(
    onResult: (transcript: string) => void,
    onError?: (error: any) => void
  ): { start: () => void; stop: () => void } | null {
    if (!this.isSpeechRecognitionSupported()) return null;

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognizer = new SpeechRec();
    recognizer.continuous = false;
    recognizer.interimResults = false;

    recognizer.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognizer.onerror = (event: any) => {
      if (onError) onError(event);
    };

    return {
      start: () => recognizer.start(),
      stop: () => recognizer.stop(),
    };
  }
}

export const voiceManager = new VoiceManager();
