// Professional animations for the AI Risk Assessment Tool
export const animations = {
  // Subtle logo animations
  logo: {
    hover: 'hover:scale-105 transition-transform duration-300 ease-out',
    pulse: 'animate-pulse',
    bounce: 'hover:animate-bounce',
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up'
  },
  
  // Button animations
  button: {
    primary: 'hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out',
    secondary: 'hover:scale-102 hover:shadow-md transition-all duration-200 ease-out',
    subtle: 'hover:opacity-80 transition-opacity duration-200'
  },
  
  // Card animations
  card: {
    hover: 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out',
    subtle: 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ease-out',
    scale: 'hover:scale-102 transition-transform duration-200 ease-out'
  },
  
  // Text animations
  text: {
    fadeIn: 'animate-fade-in',
    slideIn: 'animate-slide-in',
    typewriter: 'animate-typewriter'
  },
  
  // Icon animations
  icon: {
    rotate: 'hover:rotate-12 transition-transform duration-300 ease-out',
    scale: 'hover:scale-110 transition-transform duration-200 ease-out',
    bounce: 'hover:animate-bounce',
    pulse: 'hover:animate-pulse'
  }
};

// Custom CSS classes for animations
export const animationStyles = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slide-in {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  
  @keyframes typewriter {
    from { width: 0; }
    to { width: 100%; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); }
    50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.6); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.6s ease-out;
  }
  
  .animate-slide-up {
    animation: slide-up 0.8s ease-out;
  }
  
  .animate-slide-in {
    animation: slide-in 0.5s ease-out;
  }
  
  .animate-typewriter {
    animation: typewriter 2s steps(40) 1s both;
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }
`;
