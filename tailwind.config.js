/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-in-delayed': 'fadeIn 0.8s ease-out 0.3s forwards',
        'fade-in-out': 'fadeInOut 3s ease-in-out infinite',
        'kenburns': 'kenBurns 20s ease-in-out infinite',
        'gradient-x': 'gradientFlow 3s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite',
        'pulse': 'pulse 2s ease-in-out infinite',
        'bounce': 'bounce 2s infinite',
        'scroll-mouse': 'scrollMouse 2s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'border-gradient': 'borderGradient 6s ease infinite',
        'grid-move': 'gridMove 20s linear infinite',
        'icon-float': 'iconFloat 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeInOut: {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '0.9' }
        },
        kenBurns: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '50%': { transform: 'scale(1.1) translate(-1%, -1%)' },
          '100%': { transform: 'scale(1) translate(0, 0)' }
        },
        gradientFlow: {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' }
        },
        float: {
          '0%': { transform: 'translate(0, 0) rotate(0deg) scale(1)' },
          '25%': { transform: 'translate(10px, 10px) rotate(90deg) scale(1.1)' },
          '50%': { transform: 'translate(0, 20px) rotate(180deg) scale(1)' },
          '75%': { transform: 'translate(-10px, 10px) rotate(270deg) scale(1.1)' },
          '100%': { transform: 'translate(0, 0) rotate(360deg) scale(1)' }
        },
        pulse: {
          '0%': { opacity: '0.4' },
          '50%': { opacity: '0.6' },
          '100%': { opacity: '0.4' }
        },
        bounce: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
          '60%': { transform: 'translateY(-5px)' }
        },
        scrollMouse: {
          '0%': { transform: 'translate(-50%, 0)', opacity: '1' },
          '50%': { transform: 'translate(-50%, 6px)', opacity: '0' },
          '51%': { transform: 'translate(-50%, -6px)', opacity: '0' },
          '100%': { transform: 'translate(-50%, 0)', opacity: '1' }
        },
        bounceGentle: {
          '0%, 100%': { transform: 'rotate(45deg) translate(0, 0)' },
          '50%': { transform: 'rotate(45deg) translate(4px, 4px)' }
        },
        borderGradient: {
          '0%': { 'border-image-source': 'linear-gradient(45deg, #3b82f6, #10b981)' },
          '50%': { 'border-image-source': 'linear-gradient(45deg, #10b981, #6366f1)' },
          '100%': { 'border-image-source': 'linear-gradient(45deg, #6366f1, #3b82f6)' }
        },
        gridMove: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-40px)' }
        },
        iconFloat: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-3px) scale(1.05)' }
        }
      },
      zIndex: {
        '1': '1',
        '5': '5',
        '6': '6',
      },
      transitionDuration: {
        '2000': '2000ms',
      },
      backgroundImage: {
        'radial-gradient-blue': 'radial-gradient(circle at center, rgba(59,130,246,0.2), transparent)'
      }
    }
  },
  plugins: [],
}

