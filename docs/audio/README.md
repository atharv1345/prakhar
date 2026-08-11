Place your audio file here as `song.mp3`.

Instructions:
- Copy your MP3 (or OGG/WAV) into this folder and name it `song.mp3`.
- The app loads `/audio/song.mp3` automatically and will attempt to play on page load.
- If the browser blocks autoplay, click "Start the magic" to begin playback.

Tips:
- Preferred format: MP3 (good browser support).
- Keep the file size reasonable for fast loading (e.g., 1–3 MB for an intro loop).

Example (Windows PowerShell):

Copy-Item "C:\path\to\your\track.mp3" -Destination .\song.mp3

If you want me to add a different filename, tell me and I'll update `src/App.tsx`.