import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Edit3,
  Moon,
  Clock,
  Compass,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { WAKING_MOODS, WakingMoodOption, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface AudioVoiceRecorderProps {
  onDreamTranscribedAndAnalyzed: (result: {
    transcript: string;
    wakingMood: string;
    isLucid: boolean;
    audioDataUrl?: string;
    audioDuration: number;
  }) => void;
  onCancel?: () => void;
  language: Language;
}

export const AudioVoiceRecorder: React.FC<AudioVoiceRecorderProps> = ({
  onDreamTranscribedAndAnalyzed,
  onCancel,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isManualInput, setIsManualInput] = useState(false);
  const [selectedMood, setSelectedMood] = useState<WakingMoodOption>(WAKING_MOODS[0]);
  const [isLucid, setIsLucid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Format time MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Live Canvas Waveform Visualizer
  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.8;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

        // Gradient for dreamy surrealist glow
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, 'rgba(147, 51, 234, 0.4)');
        gradient.addColorStop(0.5, 'rgba(192, 132, 252, 0.8)');
        gradient.addColorStop(1, 'rgba(56, 189, 248, 1)');

        ctx.fillStyle = gradient;
        // Symmetric waveform centered
        const y = (canvas.height - barHeight) / 2;
        ctx.fillRect(x, y, barWidth - 1, barHeight);

        x += barWidth;
        if (x > canvas.width) break;
      }
    };

    render();
  };

  // Start Voice Recording
  const startRecording = async () => {
    try {
      setErrorMessage(null);
      audioChunksRef.current = [];
      setRecordingTime(0);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;

      // Web Audio setup for live visualizer
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      drawVisualizer();

      // MediaRecorder initialization
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioBase64(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setIsPaused(false);

      // Start timer
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access failed:', err);
      setErrorMessage(
        'Unable to access your microphone. Please verify browser permissions, or type your dream directly below.'
      );
      setIsManualInput(true);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
  };

  // Reset Recording
  const resetRecording = () => {
    stopRecording();
    setAudioUrl(null);
    setAudioBase64(null);
    setRecordingTime(0);
    setTranscript('');
    setErrorMessage(null);
  };

  // Toggle Preview Playback
  const togglePreviewPlayback = () => {
    if (!previewAudioRef.current) return;
    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  // Handle Transcribe & Submit
  const handleProcessDream = async () => {
    // If user provided manual text or already transcribed
    if (isManualInput || (!audioBase64 && transcript.trim())) {
      if (!transcript.trim()) {
        setErrorMessage('Please enter your dream memories or voice-record them.');
        return;
      }
      onDreamTranscribedAndAnalyzed({
        transcript: transcript.trim(),
        wakingMood: selectedMood.label,
        isLucid,
        audioDataUrl: audioBase64 || undefined,
        audioDuration: recordingTime,
      });
      return;
    }

    if (!audioBase64) {
      setErrorMessage('Please record your dream voice notes first or switch to text mode.');
      return;
    }

    // Call server transcribe endpoint
    setIsProcessing(true);
    setStatusMessage('Transcribing your waking voice with Gemini audio model...');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: audioBase64,
          mimeType: 'audio/webm',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Transcription failed');
      }

      const data = await response.json();
      const transcribedText = data.transcript || '';

      if (!transcribedText) {
        throw new Error('Transcription returned empty text. Please try again or type your dream.');
      }

      setTranscript(transcribedText);
      setStatusMessage('Voice successfully transcribed! Handing off to Dream Synthesis...');

      onDreamTranscribedAndAnalyzed({
        transcript: transcribedText,
        wakingMood: selectedMood.label,
        isLucid,
        audioDataUrl: audioBase64,
        audioDuration: recordingTime,
      });
    } catch (err: any) {
      console.error('Voice processing error:', err);
      setErrorMessage(
        err.message || 'Failed to transcribe audio. You can type your dream below to continue.'
      );
      setIsManualInput(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-slate-900/80 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
      {/* Background ambient surreal glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-purple-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-600/15 blur-3xl" />

      {/* Header */}
      <div className="relative mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-purple-400">
            <Moon className="h-4 w-4" />
            <span>{t.morningCapture}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mt-1">
            {t.voiceRecordYourDream}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {t.voiceRecordSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setIsManualInput(!isManualInput)}
            className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-950/40 px-3.5 py-1.5 text-xs font-medium text-purple-200 transition hover:bg-purple-900/50 hover:text-white"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>{isManualInput ? t.switchToVoice : t.typeDreamText}</span>
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:bg-white/5 hover:text-white transition"
            >
              {t.cancel}
            </button>
          )}
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-950/30 p-4 text-sm text-rose-200">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-300">Notice</p>
            <p className="mt-0.5 text-xs opacity-90">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Recording Stage vs Manual Text Input */}
      {!isManualInput ? (
        <div className="space-y-6">
          {/* Visualizer Canvas & Status */}
          <div className="relative flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60 p-6 md:p-8">
            <canvas
              ref={canvasRef}
              width={500}
              height={100}
              className={`w-full max-w-lg h-24 rounded-lg transition-opacity duration-300 ${
                isRecording ? 'opacity-100' : 'opacity-20'
              }`}
            />

            {/* Timer and status badge */}
            <div className="mt-4 flex items-center gap-3">
              <div
                className={`flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                  isRecording
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                    : audioUrl
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-white/5'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isRecording ? 'bg-rose-500 animate-ping' : audioUrl ? 'bg-emerald-400' : 'bg-slate-500'
                  }`}
                />
                <span>
                  {isRecording
                    ? t.recordingVoice
                    : audioUrl
                    ? t.recordingReady
                    : t.micStandby}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-sm font-mono text-purple-300 bg-purple-950/40 px-3 py-1 rounded-full border border-purple-500/20">
                <Clock className="h-3.5 w-3.5 text-purple-400" />
                <span>{formatTime(recordingTime)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6 flex items-center justify-center gap-4">
              {!isRecording && !audioUrl ? (
                <button
                  onClick={startRecording}
                  disabled={isProcessing}
                  className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-900/40 transition hover:scale-105 active:scale-95 disabled:opacity-50"
                  aria-label="Start recording"
                >
                  <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 opacity-40 blur transition group-hover:opacity-80" />
                  <Mic className="relative h-8 w-8 text-white transition-transform group-hover:scale-110" />
                </button>
              ) : isRecording ? (
                <button
                  onClick={stopRecording}
                  className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-rose-600 text-white shadow-xl shadow-rose-900/50 transition hover:scale-105 active:scale-95"
                  aria-label="Stop recording"
                >
                  <span className="absolute -inset-1 rounded-full bg-rose-500 opacity-50 blur animate-pulse" />
                  <Square className="relative h-8 w-8 fill-current text-white" />
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePreviewPlayback}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition hover:bg-purple-500 hover:scale-105"
                    title="Play / Pause preview"
                  >
                    {isPlayingPreview ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={resetRecording}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white"
                    title="Re-record"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {audioUrl && (
              <audio
                ref={previewAudioRef}
                src={audioUrl}
                onEnded={() => setIsPlayingPreview(false)}
                className="hidden"
              />
            )}
          </div>
        </div>
      ) : (
        /* Manual Text Capture Mode */
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            Dream Narrative & Memory Fragments
          </label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={6}
            placeholder="Describe everything you remember upon opening your eyes: strange rooms, familiar people with different faces, impossible colors, water, clocks, falling, feelings of flight or pursuit..."
            className="w-full rounded-xl border border-white/15 bg-slate-950/70 p-4 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-serif-dream text-base leading-relaxed"
          />
        </div>
      )}

      {/* Dream Mood & Lucid State Attributes */}
      <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            <Compass className="h-3.5 w-3.5 text-purple-400" />
            <span>{t.selectImmediateMood}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {WAKING_MOODS.map((mood) => {
              const isSelected = selectedMood.label === mood.label;
              return (
                <button
                  key={mood.label}
                  type="button"
                  onClick={() => setSelectedMood(mood)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? 'border border-purple-400/80 bg-purple-600/30 text-purple-100 shadow-md shadow-purple-900/40'
                      : 'border border-white/10 bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:text-white'
                  }`}
                >
                  <span>{mood.emoji}</span>
                  <span>{mood.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lucid dream toggle */}
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 p-3.5">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🌌</span>
            <div>
              <p className="text-sm font-medium text-slate-200">{t.lucidToggleTitle}</p>
              <p className="text-xs text-slate-400">
                {t.lucidToggleSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsLucid(!isLucid)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isLucid ? 'bg-purple-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                isLucid ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Action Submit */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
        <p className="text-xs text-slate-400">
          Powered by Gemini for audio transcription, Jungian depth psychology, and surrealist art.
        </p>

        <button
          onClick={handleProcessDream}
          disabled={isProcessing || isRecording || (!audioUrl && !transcript.trim())}
          className="group relative flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:opacity-95 hover:shadow-purple-700/50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>{statusMessage || t.transcribingStatus}</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-cyan-300 transition-transform group-hover:rotate-12" />
              <span>{t.transcribeAndInterpret}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
