// theme.js
// Place this file in: frontend/src/theme/theme.js
// Update your existing theme file

import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    jj: {
      red: '#eb1700',
      white: '#ffffff',
      black: '#000000',
    },
    gray: {
      50: '#f1efed',  // gray-01
      100: '#e8e6e3', // gray-02
      200: '#d5cfc9', // gray-03
      300: '#cbc4bc', // gray-04
      400: '#a39992', // gray-05
      500: '#81766f', // gray-06
      600: '#6e6259', // gray-07
      700: '#312c2a', // gray-08
      800: '#312c2a',
      900: '#312c2a',
    },
    brand: {
      yellow: '#fbe058',
      orange: '#ff6017',
      maroon: '#9e0000',
      violet: {
        light: '#b19beb',
        medium: '#8c3bbb',
        dark: '#541981',
      },
      blue: {
        light: '#69d0ff',
        medium: '#0f68b2',
        dark: '#004685',
      },
      green: {
        light: '#53ce76',
        medium: '#328714',
        dark: '#3b5a0d',
      },
    },
  },
  fonts: {
    heading: "'Johnson Display', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    body: "'Johnson Text', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 500, // Map semibold to medium since we only have regular and medium
    bold: 500,     // Map bold to medium
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.700',
        fontFamily: 'body',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontFamily: 'body',
        fontWeight: 'medium',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bg: 'jj.red',
          color: 'white',
          _hover: {
            bg: '#d11400', // Darker red on hover
          },
        },
        secondary: {
          bg: 'brand.blue.medium',
          color: 'white',
          _hover: {
            bg: '#0c5a9e', // Darker blue on hover
          },
        },
        outline: {
          borderColor: 'jj.red',
          color: 'jj.red',
          _hover: {
            bg: 'jj.red',
            color: 'white',
          },
        },
      },
      defaultProps: {
        variant: 'solid',
      },
    },
    Heading: {
      baseStyle: {
        fontFamily: 'heading',
        fontWeight: 'medium',
        color: 'gray.700',
      },
    },
    Text: {
      baseStyle: {
        fontFamily: 'body',
        color: 'gray.700',
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: 'lg',
          boxShadow: 'xl',
        },
        header: {
          fontFamily: 'heading',
          fontWeight: 'medium',
          color: 'gray.700',
        },
        body: {
          fontFamily: 'body',
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          boxShadow: 'md',
          bg: 'white',
        },
        header: {
          fontFamily: 'heading',
          fontWeight: 'medium',
        },
        body: {
          fontFamily: 'body',
        },
      },
    },
  },
  breakpoints: {
    sm: '480px',  // Mobile
    md: '768px',  // Tablet
    lg: '1024px', // Desktop
    xl: '1200px',
    '2xl': '1536px',
  },
});

export default theme;