/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'Helvetica Neue', 'sans-serif'],
            },
            colors: {
                'liquid-blue': '#007AFF', // iOS link/button color
                'liquid-bg-light': 'rgba(255, 255, 255, 0.4)',
                'liquid-bg-dark': 'rgba(30, 30, 30, 0.4)',
            }
        },
    },
    plugins: [],
}
