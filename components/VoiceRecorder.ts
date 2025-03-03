import { html } from "@sapling/sapling";

export function VoiceRecorder() {
  return html`
    <sapling-island>
      <template>
        <script>
          document.addEventListener("DOMContentLoaded", () => {
            const recordButton = document.getElementById("voice-record-button");
            const messageInput = document.getElementById("message-input");
            let mediaRecorder = null;
            let audioChunks = [];
            let isRecording = false;
            let recordingTimeout = null;

            async function startRecording() {
              try {
                const stream = await navigator.mediaDevices.getUserMedia({
                  audio: true,
                });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];

                mediaRecorder.ondataavailable = (event) => {
                  if (event.data.size > 0) {
                    audioChunks.push(event.data);
                  }
                };

                mediaRecorder.onstop = async () => {
                  const audioBlob = new Blob(audioChunks, {
                    type: "audio/webm",
                  });
                  const formData = new FormData();
                  formData.append("audio", audioBlob);

                  // Get API key from local storage
                  const apiKey = localStorage.getItem("gemini_api_key");
                  if (!apiKey) {
                    console.error("No API key found in local storage");
                    recordButton.classList.remove("recording");
                    return;
                  }

                  formData.append("apiKey", apiKey);

                  try {
                    recordButton.classList.add("animate-pulse");
                    const response = await fetch("/api/transcribe", {
                      method: "POST",
                      body: formData,
                    });

                    const data = await response.json();
                    if (data.error) {
                      console.error("Transcription error:", data.error);
                    } else if (data.transcription) {
                      messageInput.value = data.transcription;
                      // Trigger input event to adjust textarea height
                      messageInput.dispatchEvent(new Event("input"));
                    }
                  } catch (error) {
                    console.error("Error sending audio:", error);
                  } finally {
                    recordButton.classList.remove("animate-pulse");
                  }

                  // Clean up
                  mediaRecorder.stream
                    .getTracks()
                    .forEach((track) => track.stop());
                };

                mediaRecorder.start();
                isRecording = true;
                recordButton.classList.add("recording");

                // Set 15-second timeout
                recordingTimeout = setTimeout(() => {
                  if (isRecording) {
                    stopRecording();
                  }
                }, 15000);
              } catch (err) {
                console.error("Error accessing microphone:", err);
              }
            }

            function stopRecording() {
              if (mediaRecorder && isRecording) {
                clearTimeout(recordingTimeout);
                mediaRecorder.stop();
                isRecording = false;
                recordButton.classList.remove("recording");
              }
            }

            recordButton.addEventListener("click", () => {
              if (!isRecording) {
                startRecording();
              } else {
                stopRecording();
              }
            });
          });
        </script>
      </template>
      <button
        id="voice-record-button"
        type="button"
        class="p-2 rounded-full flex items-center justify-center transition-colors duration-200"
      >
        <iconify-icon icon="mdi:microphone" width="20"></iconify-icon>
      </button>
    </sapling-island>
  `;
}
