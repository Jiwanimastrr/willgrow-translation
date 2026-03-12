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
                'liquid-blue': '#007AFF',
                'neu-bg': '#ffffff',
                'neu-bg-dark': '#f8f9fa',
            },
            boxShadow: {
                'neu-flat': '8px 8px 16px #f0f0f0, -8px -8px 16px #ffffff',
                'neu-pressed': 'inset 4px 4px 8px #f0f0f0, inset -4px -4px 8px #ffffff',
                'neu-button': '4px 4px 8px #f0f0f0, -4px -4px 8px #ffffff',
                'neu-button-active': 'inset 2px 2px 4px #f0f0f0, inset -2px -2px 4px #ffffff',
            }
        },
    },
    plugins: [],
}
