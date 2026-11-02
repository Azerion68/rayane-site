/* Configuration Tailwind (chargée après le script Tailwind CDN) */
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        cond: ['Barlow Condensed', 'Arial Narrow', 'Impact', 'sans-serif'],
        sans: ['Barlow', 'system-ui', 'sans-serif']
      },
      colors: { page: '#0d0c0b', panel: '#060605', ink: '#ece9e3', mute: '#8c8881', red: '#d2452b' }
    }
  }
};
