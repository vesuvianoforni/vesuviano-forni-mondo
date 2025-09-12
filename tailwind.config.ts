
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'playfair': ['Playfair Display', 'serif'],
				'inter': ['Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Vesuviano brand colors - palette con migliore contrasto
				vesuviano: {
					50: 'hsl(13, 100%, 96%)',   // Molto chiaro
					100: 'hsl(13, 92%, 89%)',   // Chiaro  
					200: 'hsl(14, 89%, 81%)',   // Chiaro medio
					300: 'hsl(14, 88%, 71%)',   // Medio chiaro
					400: 'hsl(14, 89%, 62%)',   // Arancione visibile su scuro
					500: 'hsl(14, 91%, 54%)',   // Arancione principale
					600: 'hsl(14, 91%, 48%)',   // Arancione scuro
					700: 'hsl(14, 84%, 40%)',   // Scuro
					800: 'hsl(14, 78%, 33%)',   // Molto scuro
					900: 'hsl(14, 69%, 28%)',   // Scurissimo
					950: 'hsl(14, 80%, 15%)',   // Quasi nero
				},
				// Charcoal palette per sfondi scuri
				charcoal: {
					50: 'hsl(60, 9%, 98%)',
					100: 'hsl(60, 5%, 96%)', 
					200: 'hsl(20, 6%, 90%)',
					300: 'hsl(24, 6%, 83%)',
					400: 'hsl(24, 5%, 64%)',
					500: 'hsl(25, 5%, 45%)',
					600: 'hsl(33, 5%, 32%)',
					700: 'hsl(30, 6%, 25%)',
					800: 'hsl(12, 6%, 15%)',
					900: 'hsl(24, 10%, 10%)',
					950: 'hsl(20, 14%, 4%)',
				},
				// Palette di supporto
				earth: {
					50: 'hsl(33, 100%, 96%)',
					100: 'hsl(34, 57%, 88%)',
					200: 'hsl(32, 47%, 80%)',
					300: 'hsl(31, 42%, 70%)',
					400: 'hsl(30, 38%, 59%)',
					500: 'hsl(28, 33%, 49%)',
					600: 'hsl(26, 28%, 40%)',
					700: 'hsl(24, 24%, 32%)',
					800: 'hsl(23, 20%, 25%)',
					900: 'hsl(22, 17%, 19%)',
				},
				sage: {
					50: 'hsl(138, 25%, 96%)',
					100: 'hsl(138, 15%, 88%)',
					200: 'hsl(138, 13%, 79%)',
					300: 'hsl(138, 12%, 68%)',
					400: 'hsl(138, 10%, 56%)',
					500: 'hsl(138, 9%, 45%)',
					600: 'hsl(138, 9%, 36%)',
					700: 'hsl(138, 10%, 28%)',
					800: 'hsl(138, 11%, 22%)',
					900: 'hsl(138, 12%, 18%)',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in-left': {
					'0%': {
						opacity: '0',
						transform: 'translateX(-50px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'slide-in-right': {
					'0%': {
						opacity: '0',
						transform: 'translateX(50px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'scale-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'bounce-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.3)'
					},
					'50%': {
						opacity: '1',
						transform: 'scale(1.05)'
					},
					'70%': {
						transform: 'scale(0.9)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'slide-in-left': 'slide-in-left 0.6s ease-out',
				'slide-in-right': 'slide-in-right 0.6s ease-out',
				'scale-in': 'scale-in 0.4s ease-out',
				'bounce-in': 'bounce-in 0.6s ease-out',
				'float': 'float 3s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
