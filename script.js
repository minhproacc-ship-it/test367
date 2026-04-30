// Initialize Particles.js
particlesJS("particles-js", {
  "particles": {
    "number": { 
      "value": 90, 
      "density": { 
        "enable": true, 
        "value_area": 800 
      } 
    },
    "color": { 
      "value": ["#ff0066", "#39ff14", "#ff006e", "#9d4edd", "#00f2ff"] 
    },
    "shape": { 
      "type": ["circle", "triangle", "star", "polygon"], 
      "polygon": { 
        "nb_sides": 5 
      } 
    },
    "opacity": { 
      "value": 0.7, 
      "random": true 
    },
    "size": { 
      "value": 4, 
      "random": true 
    },
    "line_linked": { 
      "enable": true, 
      "distance": 150, 
      "color": "#ff006e", 
      "opacity": 0.25, 
      "width": 1 
    },
    "move": { 
      "enable": true, 
      "speed": 3, 
      "direction": "none", 
      "random": true, 
      "straight": false 
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": { 
        "enable": true, 
        "mode": "repulse" 
      },
      "onclick": { 
        "enable": true, 
        "mode": "push" 
      },
      "resize": true
    },
    "modes": {
      "repulse": { 
        "distance": 100, 
        "duration": 0.4 
      },
      "push": { 
        "particles_nb": 4 
      }
    }
  },
  "retina_detect": true
});
