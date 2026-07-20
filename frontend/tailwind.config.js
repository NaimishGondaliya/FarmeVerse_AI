/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Professional Agriculture Theme
                primary: {
                    light: '#e8f5e9',  // Light Green (backgrounds/subtle alerts)
                    DEFAULT: '#2e7d32',// Medium Forest Green (buttons/headers)
                    dark: '#1b5e20',   // Deep Emerald Green (active states/branding)
                },
                accent: {
                    light: '#fffde7',  // Soft Yellow (warnings/tips)
                    DEFAULT: '#fbc02d',// Vibrant Gold Yellow (badges/highlights)
                    dark: '#f57f17',   // Dark Mustard (accent borders)
                },
                secondary: {
                    light: '#fafafa',
                    DEFAULT: '#ffffff',// Clean White (cards/panels)
                    dark: '#f0f0f0',
                },
                dark: {
                    light: '#555555',
                    DEFAULT: '#333333',
                    dark: '#222222',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                'card': '12px',
                'btn': '8px',
            }
        },
    },
    plugins: [],
}
