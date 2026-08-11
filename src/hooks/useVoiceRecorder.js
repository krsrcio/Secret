import { useEffect, useState } from "react";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

export function useVoiceRecorder(onError) {
  const recorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const [voiceUrl, setVoiceUrl] = useState(null);
  const [voiceDurationMs, setVoiceDurationMs] = useState(0);

  const stopAudioMode = () =>
    setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(
      () => undefined,
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
  };

  const stopRecording = async () => {
    const durationMillis = recorder.getStatus().durationMillis;
    await recorder.stop();
    stopAudioMode();
    if (!recorder.uri) throw new Error("Your voice message could not be saved.");
    setVoiceUrl(recorder.uri);
    setVoiceDurationMs(durationMillis);
  };

  const discardVoice = async () => {
    if (recorder.isRecording) await recorder.stop();
    stopAudioMode();
    setVoiceUrl(null);
    setVoiceDurationMs(0);
  };

  const toggleRecording = async () => {
    try {
      if (recorder.isRecording) await stopRecording();
      else await startRecording();
    } catch (cause) {
      onError?.(cause.message || "We could not record that voice message.");
    }
  };

  useEffect(
    () => () => {
      if (recorder.isRecording) recorder.stop().catch(() => undefined);
      stopAudioMode();
    },
    [recorder],
  );

  return {
    voiceUrl,
    voiceDurationMs,
    isRecording: recorderState.isRecording,
    recordingDurationMs: recorderState.durationMillis,
    startRecording,
    stopRecording,
    toggleRecording,
    discardVoice,
  };
}
