import { useState, useRef } from "react";

export const useSpeechRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [audioFile, setAudioFile] = useState<File | undefined>();

  const toggleRecording = async () => {
    if (isRecording && mediaRecorderRef.current && streamRef.current) {
      // stop recording and fire on data available and onstop event
      mediaRecorderRef.current.stop();
      //stop taking the audio
      streamRef.current.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        streamRef.current = stream;

        // require to release mic
        const tracks = stream.getAudioTracks();
        tracks.forEach((track) => track.getSettings());

        const isSafari = /^((?!chrome|android).)*safari/i.test(
          navigator.userAgent,
        );
        const supportedType = isSafari ? "audio/mp4" : "audio/webm;codecs=opus";
        const extension = isSafari ? "mp4" : "webm";
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: supportedType,
        });

        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: supportedType,
          });
          if (audioBlob.size > 0) {
            const file = new File([audioBlob], `recording.${extension}`, {
              type: supportedType,
            });
            console.log("audio file is ready")
            setAudioFile(file);
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.log("[Audio Recording]", error);
        setIsRecording(false);
      }
    }
  };

  return { isRecording, toggleRecording, audioFile, setAudioFile };
};
