import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// const ReactCompilerConfig = {
//   sources: (filename: string | string[]) => {
//     return filename.indexOf("src") !== -1;
//   },
// };

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), ["babel-plugin-react-compiler"]],
});
