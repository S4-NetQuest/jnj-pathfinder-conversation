import { extendTheme } from '@chakra-ui/react'

// J&J Color Palette from the provided document
const colors = {
  jj: {
    red: '#eb1700',
    white: '#ffffff',
    black: '#000000',
    gray: {
      50: '#f1efed',
      100: '#e8e6e3',
      200: '#d5cfc9',
      300: '#cbc4bc',
      400: '#a39992',
      500: '#81766f',
      600: '#6e6259',
      700: '#312c2a',
    },
    yellow: {
      100: '#fbe058',
    },
    orange: {
      300: '#ff6017',
    },
    maroon: {
      500: '#9e0000',
    },
    violet: {
      100: '#b19beb',
      300: '#8c3bbb',
      500: '#541981',
    },
    blue: {
      100: '#69d0ff',
      300: '#0f68b2',
      500: '#004685',
    },
    green: {
      100: '#53ce76',
      300: '#328714',
      500: '#3b5a0d',
    }
  }
}

// Breakpoints for tablet and mobile
const breakpoints = {
  base: '0em',    // 0px
  sm: '30em',     // ~480px (mobile)
  md: '48em',     // ~768px (tablet)
  lg: '62em',     // ~992px (desktop)
  xl: '80em',     // ~1280px
  '2xl': '96em',  // ~1536px
}

// Component styles
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'bold',
      borderRadius: 'md',
    },
    variants: {
      primary: {
        bg: 'jj.red',
        color: 'white',
        _hover: {
          bg: 'jj.maroon.500',
        },
      },
      secondary: {
        bg: 'jj.blue.300',
        color: 'white',
        _hover: {
          bg: 'jj.blue.500',
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
      variant: 'primary',
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: 'white',
        borderRadius: 'lg',
        boxShadow: 'md',
        border: '1px solid',
        borderColor: 'jj.gray.200',
      },
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        bg: 'white',
        borderRadius: 'lg',
      },
      header: {
        bg: 'jj.gray.50',
        borderBottom: '1px solid',
        borderBottomColor: 'jj.gray.200',
      },
    },
  },
  Input: {
    variants: {
      outline: {
        field: {
          borderColor: 'jj.gray.300',
          _hover: {
            borderColor: 'jj.gray.400',
          },
          _focus: {
            borderColor: 'jj.red',
            boxShadow: `0 0 0 1px ${colors.jj.red}`,
          },
        },
      },
    },
  },
}

// Global styles
const styles = {
  global: {
    body: {
      bg: 'jj.gray.50',
      color: 'jj.gray.700',
      fontFamily: 'system-ui, sans-serif',
    },
    '*::placeholder': {
      color: 'jj.gray.400',
    },
    '*, *::before, &::after': {
      borderColor: 'jj.gray.200',
    },
  },
}

// Typography
const fonts = {
  heading: 'system-ui, sans-serif',
  body: 'system-ui, sans-serif',
}

const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
}

// Theme configuration
const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const theme = extendTheme({
  colors,
  breakpoints,
  components,
  styles,
  fonts,
  fontSizes,
  config,
  space: {
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  sizes: {
    max: 'max-content',
    min: 'min-content',
    full: '100%',
    '3xs': '14rem',
    '2xs': '16rem',
    xs: '20rem',
    sm: '24rem',
    md: '28rem',
    lg: '32rem',
    xl: '36rem',
    '2xl': '42rem',
    '3xl': '48rem',
    '4xl': '56rem',
    '5xl': '64rem',
    '6xl': '72rem',
    '7xl': '80rem',
    '8xl': '90rem',
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
})

export default theme