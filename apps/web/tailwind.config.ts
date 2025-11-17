import type { Config } from "tailwindcss";

const config: Config = {
content: [
"./app//*.{js,ts,jsx,tsx,mdx}",
"./styles//*.{css,scss}"
],
theme: {
extend: {}
},
plugins: []
};

export default config;
