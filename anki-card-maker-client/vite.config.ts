import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  },
  plugins: [react(), tailwindcss()],
  server: {
    headers: {
      /* 
      Required for SharedArrayBuffer API, which is needed for ffmpeg-mt

      Alternatively, can use single-threaded ffmpeg instead:
      ```
      import { FFmpeg } from "@ffmpeg/ffmpeg";
      import coreURL from "@ffmpeg/core/ffmpeg-core?url"; // not `core-mt`

      await ffmpeg.load({ coreURL }); // only coreURL needed, uses inline WASM
      ``` 
      */
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
});
