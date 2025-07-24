// frontend/src/theme/theme.js
import { extendTheme } from '@chakra-ui/react'

// J&J Color Palette
const colors = {
  // Override the default 'red' palette with J&J Red variations
  red: {
    50: '#fef2f2',   // Very light tint of J&J Red
    100: '#fee2e2',  // Light tint
    200: '#fecaca',  // Lighter tint
    300: '#fca5a5',  // Light tint
    400: '#f87171',  // Medium-light tint
    500: '#eb1700',  // J&J Red (base color)
    600: '#dc2626',  // Slightly darker
    700: '#b91c1c',  // Darker
    800: '#991b1b',  // Much darker
    900: '#7f1d1d',  // Very dark
  },

  // Custom J&J color palette
  jj: {
    red: '#eb1700',
    white: '#ffffff',
    black: '#000000',

    // Grays
    gray: {
      50: '#f1efed',   // Gray 01
      100: '#e8e6e3',  // Gray 02
      200: '#d5cfc9',  // Gray 03
      300: '#cbc4bc',  // Gray 04
      400: '#a39992',  // Gray 05
      500: '#81766f',  // Gray 06
      600: '#6e6259',  // Gray 07
      700: '#312c2a',  // Gray 08
    },

    // Accent colors
    yellow: '#fbe058',
    orange: '#ff6017',
    maroon: '#9e0000',

    // Violets
    violet: {
      light: '#b19beb',
      medium: '#8c3bbb',
      dark: '#541981',
    },

    // Blues
    blue: {
      light: '#69d0ff',
      medium: '#0f68b2',
      dark: '#004685',
    },

    // Greens
    green: {
      light: '#53ce76',
      medium: '#328714',
      dark: '#3b5a0d',
    },
  }
}

// Component style overrides
const components = {
  Button: {
    // Override base styles for ALL button variants
    baseStyle: {
      fontWeight: 'normal', // This sets font-weight: 400 instead of 600
      // Or use 'medium' for font-weight: 500 if you prefer
    },
    variants: {
      solid: {
        bg: 'red.500',     // Uses J&J Red
        color: 'white',
        fontWeight: 'normal', // Explicitly set for solid variant
        _hover: {
          bg: 'red.600',   // Slightly darker on hover
        },
        _active: {
          bg: 'red.700',   // Even darker when pressed
        },
      },
      outline: {
        borderColor: 'red.500',
        color: 'red.500',
        fontWeight: 'normal', // Explicitly set for outline variant
        _hover: {
          bg: 'red.50',    // Very light background on hover
          borderColor: 'red.600',
          color: 'red.600',
        },
      },
    },
  },

  Badge: {
    baseStyle: {
      fontWeight: '500',  // Set default font weight to 600 instead of 700
      fontSize: 'xs',     // Keep default size
      px: 2,              // Keep default padding
      textTransform: 'uppercase', // Keep default text transform
    },
    variants: {
      // You can also customize specific variants if needed
      solid: {
        fontWeight: '600', // Ensure solid variant uses 600
      },
      subtle: {
        fontWeight: '600', // Ensure subtle variant uses 600
      },
      outline: {
        fontWeight: '600', // Ensure outline variant uses 600
      },
    },
    // You can also customize different sizes
    sizes: {
      sm: {
        fontSize: 'xs',
        fontWeight: '500',
      },
      md: {
        fontSize: 'sm',
        fontWeight: '600',
      },
      lg: {
        fontSize: 'md',
        fontWeight: '600',
      },
    },
  },

  Checkbox: {
    baseStyle: {
      control: {
        _checked: {
          bg: 'red.500',
          borderColor: 'red.500',
          _hover: {
            bg: 'red.600',
            borderColor: 'red.600',
          },
        },
      },
    },
  },

  Radio: {
    baseStyle: {
      control: {
        _checked: {
          bg: 'red.500',
          borderColor: 'red.500',
          _hover: {
            bg: 'red.600',
            borderColor: 'red.600',
          },
        },
      },
    },
  },

  Input: {
    variants: {
      outline: {
        field: {
          _focus: {
            borderColor: 'red.500',
            boxShadow: '0 0 0 1px #eb1700',
          },
        },
      },
    },
  },

  Select: {
    variants: {
      outline: {
        field: {
          _focus: {
            borderColor: 'red.500',
            boxShadow: '0 0 0 1px #eb1700',
          },
        },
      },
    },
  },

  Textarea: {
    variants: {
      outline: {
        _focus: {
          borderColor: 'red.500',
          boxShadow: '0 0 0 1px #eb1700',
        },
      },
    },
  },

  Tabs: {
    variants: {
      line: {
        tab: {
          _selected: {
            color: 'red.500',
            borderColor: 'red.500',
          },
        },
      },
      enclosed: {
        tab: {
          _selected: {
            color: 'red.500',
            bg: 'white',
            borderColor: 'red.500',
            borderBottomColor: 'white',
          },
        },
      },
    },
  },

  Modal: {
    baseStyle: {
      header: {
        bg: 'red.500',
        color: 'white',
      },
    },
  },
}

// Global styles
const styles = {
  global: {
    body: {
      bg: 'jj.gray.50',     // Gray 01 background
      color: 'jj.gray.700', // Gray 08 text
    },
  },
}

// Responsive breakpoints
const breakpoints = {
  base: '0px',
  sm: '480px',   // Mobile
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',
  '2xl': '1536px',
}

// Create the custom theme
const theme = extendTheme({
  colors,
  components,
  styles,
  breakpoints,
  fonts: {
    heading: '"Johnson Display", system-ui, sans-serif',
    body: '"Johnson Text", system-ui, sans-serif',
  },
})

export default theme