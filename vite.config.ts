import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig(({ mode }) => ({
    plugins: [dts({ rollupTypes: true })],
    build: {
        lib: {
            entry: "src/index.ts",
            formats: ["es"],
            fileName: () => `index.mjs`,
        },
        rollupOptions: { external: ["preact/hooks", "preact/compat", "preact", "@preact/signals"] },
        sourcemap: true,
        minify: false,
    },
    define: {
        "process.env.NODE_ENV": JSON.stringify(mode),
    },
}))
