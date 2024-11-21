import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      primary: '#6B46C1',
      secondary: '#805AD5',
      accent: '#4FD1C5',
    },
    background: {
      primary: '#1A202C',
      secondary: '#2D3748',
    },
  },
  styles: {
    global: {
      body: {
        bg: 'background.primary',
        color: 'white',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bg: 'brand.primary',
          color: 'white',
          _hover: {
            bg: 'brand.secondary',
          },
        },
      },
    },
  },
});

export default theme;
