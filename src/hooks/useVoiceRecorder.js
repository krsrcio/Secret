import { useEffect, useRef, useState } from "react";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";

export function useVoiceRecorder(onError, initialVoice) {
  const recorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);
  const [voiceUrl, setVoiceUrl] = useState(initialVoice?.audioUrl || null);
  const [voiceDurationMs, setVoiceDurationMs] = useState(initialVoice?.audioDurationMs || 0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDurationMs, setRecordingDurationMs] = useState(0);
  const recordingStartedAt = useRef(null);
  const isBusy = useRef(false);

  const stopAudioMode = async () => {
    try {
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    } catch {
      // The recording is already stopped; there is nothing else to clean up.
    }
  };

  useEffect(() => {
    if (!isRecording) return undefined;

    const interval = setInterval(() => {
      if (recordingStartedAt.current) {
        setRecordingDurationMs(Date.now() - recordingStartedAt.current);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(
    () => () => {
      // useAudioRecorder releases its native recorder on unmount. Do not read
      // from that released object here.
      setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(
        () => undefined,
      );
    },
    [],
  );

  const startRecording = async () => {
    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Microphone permission is needed to record a voice message.");
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    setVoiceUrl(null);
    setVoiceDurationMs(0);
    await recorder.prepareToRecordAsync();
    recorder.record();
    recordingStartedAt.current = Date.now();
    setRecordingDurationMs(0);
    setIsRecording(true);
  };

  const stopRecording = async () => {
    const durationMillis = recordingStartedAt.current
      ? Date.now() - recordingStartedAt.current
      : recordingDurationMs;

    try {
      await recorder.stop();
      if (!recorder.uri) throw new Error("Your voice message could not be saved.");
      setVoiceUrl(recorder.uri);
      setVoiceDurationMs(durationMillis);
    } finally {
      recordingStartedAt.current = null;
      setRecordingDurationMs(0);
      setIsRecording(false);
      await stopAudioMode();
    }
  };

  const discardVoice = async () => {
    if (isRecording) {
      try {
        await recorder.stop();
      } catch {
        // A released recorder has already stopped recording.
      }
    }
    recordingStartedAt.current = null;
    setRecordingDurationMs(0);
    setIsRecording(false);
    setVoiceUrl(null);
    setVoiceDurationMs(0);
    await stopAudioMode();
  };

  const toggleRecording = async () => {
    if (isBusy.current) return;
    isBusy.current = true;
    try {
      if (isRecording) await stopRecording();
      else await startRecording();
    } catch (cause) {
      recordingStartedAt.current = null;
      setRecordingDurationMs(0);
      setIsRecording(false);
      await stopAudioMode();
      onError?.(cause.message || "We could not record that voice message.");
    } finally {
      isBusy.current = false;
    }
  };

  return {
    voiceUrl,
    voiceDurationMs,
    isRecording,
    recordingDurationMs,
    startRecording,
    stopRecording,
    toggleRecording,
    discardVoice,
  };
}
