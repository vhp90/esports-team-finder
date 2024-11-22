import { extendTheme } from '@chakra-ui/react';
import { createTheme } from '@mui/material/styles';

// Shared colors
const colors = {
  primary: {
    main: '#6B46C1',
    50: '#F5E8FF',
    100: '#E9D1FF',
    200: '#D4A3FF',
    300: '#B975FF',
    400: '#9747FF',
    500: '#6B46C1',
    600: '#5A32A3',
    700: '#492985',
    800: '#382167',
    900: '#271849',
  },
  secondary: {
    main: '#4FD1C5',
    50: '#E6FFFA',
    100: '#B2F5EA',
    200: '#81E6D9',
    300: '#4FD1C5',
    400: '#38B2AC',
    500: '#319795',
    600: '#2C7A7B',
    700: '#285E61',
    800: '#234E52',
    900: '#1D4044',
  },
};

// Chakra UI theme
export const chakraTheme = extendTheme({
  colors,
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.800',
        color: 'white',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'purple',
      },
    },
  },
});

// Material UI theme
export const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary.main,
      ...colors.primary,
    },
    secondary: {
      main: colors.secondary.main,
      ...colors.secondary,
    },
    background: {
      default: '#1A202C',
      paper: '#2D3748',
    },
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
});

export default chakraTheme;
