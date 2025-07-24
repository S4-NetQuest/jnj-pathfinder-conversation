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
  },

  // Philosophy-specific color palettes
  philosophy: {
    // Mechanical Alignment (MA) - Using J&J Blues
    ma: {
      50: '#e6f3ff',   // Very light blue
      100: '#b3d9ff',  // Light blue
      200: '#80bfff',  // Lighter blue
      300: '#4da6ff',  // Light blue
      400: '#1a8cff',  // Medium-light blue
      500: '#0f68b2',  // J&J Blue Medium (base)
      600: '#0d5a9a',  // Slightly darker
      700: '#0a4c82',  // Darker
      800: '#083e6a',  // Much darker
      900: '#053052',  // Very dark
    },

    // Kinematic Alignment (KA) - Using J&J Greens
    ka: {
      50: '#e8f9ec',   // Very light green
      100: '#b8edc4',  // Light green
      200: '#88e19c',  // Lighter green
      300: '#58d574',  // Light green
      400: '#53ce76',  // J&J Green Light (slightly adjusted)
      500: '#328714',  // J&J Green Medium (base)
      600: '#2c7611',  // Slightly darker
      700: '#26650f',  // Darker
      800: '#20540c',  // Much darker
      900: '#1a430a',  // Very dark
    },

    // Restricted Kinematic Alignment (RKA) - Using J&J Violets
    rka: {
      50: '#f3effc',   // Very light violet
      100: '#d9ccf5',  // Light violet
      200: '#bfa9ee',  // Lighter violet
      300: '#b19beb',  // J&J Violet Light (base for lighter tones)
      400: '#9c7ce4',  // Medium-light violet
      500: '#8c3bbb',  // J&J Violet Medium (base)
      600: '#7d349f',  // Slightly darker
      700: '#6e2d84',  // Darker
      800: '#5f2668',  // Much darker
      900: '#541981',  // J&J Violet Dark
    },

    // Inverse Kinematic Alignment (IKA) - Using J&J Orange/Maroon
    ika: {
      50: '#fff1e6',   // Very light orange
      100: '#ffd6b3',  // Light orange
      200: '#ffbb80',  // Lighter orange
      300: '#ffa04d',  // Light orange
      400: '#ff851a',  // Medium-light orange
      500: '#ff6017',  // J&J Orange (base)
      600: '#e65515',  // Slightly darker
      700: '#cc4a12',  // Darker
      800: '#b33f10',  // Much darker
      900: '#9a340d',  // Very dark
    },
  }
}

// Component style overrides
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'normal',
    },
    variants: {
      solid: {
        bg: 'red.500',
        color: 'white',
        fontWeight: 'normal',
        _hover: {
          bg: 'red.600',
        },
        _active: {
          bg: 'red.700',
        },
      },
      outline: {
        borderColor: 'red.500',
        color: 'red.500',
        fontWeight: 'normal',
        _hover: {
          bg: 'red.50',
          borderColor: 'red.600',
          color: 'red.600',
        },
      },
      // Philosophy-specific button variants
      philosophyMA: {
        bg: 'philosophy.ma.500',
        color: 'white',
        fontWeight: 'normal',
        _hover: {
          bg: 'philosophy.ma.600',
        },
        _active: {
          bg: 'philosophy.ma.700',
        },
      },
      philosophyKA: {
        bg: 'philosophy.ka.500',
        color: 'white',
        fontWeight: 'normal',
        _hover: {
          bg: 'philosophy.ka.600',
        },
        _active: {
          bg: 'philosophy.ka.700',
        },
      },
      philosophyRKA: {
        bg: 'philosophy.rka.500',
        color: 'white',
        fontWeight: 'normal',
        _hover: {
          bg: 'philosophy.rka.600',
        },
        _active: {
          bg: 'philosophy.rka.700',
        },
      },
      philosophyIKA: {
        bg: 'philosophy.ika.500',
        color: 'white',
        fontWeight: 'normal',
        _hover: {
          bg: 'philosophy.ika.600',
        },
        _active: {
          bg: 'philosophy.ika.700',
        },
      },
    },
  },

  Badge: {
    baseStyle: {
      fontWeight: '500',
      fontSize: 'xs',
      px: 2,
      textTransform: 'uppercase',
    },
    variants: {
      solid: {
        fontWeight: '600',
      },
      subtle: {
        fontWeight: '600',
      },
      outline: {
        fontWeight: '600',
      },
      // Philosophy-specific badge variants
      philosophyMA: {
        bg: 'philosophy.ma.500',
        color: 'white',
        fontWeight: '600',
      },
      philosophyKA: {
        bg: 'philosophy.ka.500',
        color: 'white',
        fontWeight: '600',
      },
      philosophyRKA: {
        bg: 'philosophy.rka.500',
        color: 'white',
        fontWeight: '600',
      },
      philosophyIKA: {
        bg: 'philosophy.ika.500',
        color: 'white',
        fontWeight: '600',
      },
    },
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

  // Philosophy-specific Card component
  Card: {
    variants: {
      philosophyMA: {
        container: {
          borderLeft: '4px solid',
          borderLeftColor: 'philosophy.ma.500',
          bg: 'philosophy.ma.50',
        },
      },
      philosophyKA: {
        container: {
          borderLeft: '4px solid',
          borderLeftColor: 'philosophy.ka.500',
          bg: 'philosophy.ka.50',
        },
      },
      philosophyRKA: {
        container: {
          borderLeft: '4px solid',
          borderLeftColor: 'philosophy.rka.500',
          bg: 'philosophy.rka.50',
        },
      },
      philosophyIKA: {
        container: {
          borderLeft: '4px solid',
          borderLeftColor: 'philosophy.ika.500',
          bg: 'philosophy.ika.50',
        },
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
      bg: 'jj.gray.50',
      color: 'jj.gray.700',
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

// Helper function to get philosophy colors (optional utility)
export const getPhilosophyColor = (philosophyId, shade = 500) => {
  const colorMap = {
    ma: `philosophy.ma.${shade}`,
    ka: `philosophy.ka.${shade}`,
    rka: `philosophy.rka.${shade}`,
    ika: `philosophy.ika.${shade}`,
  }
  return colorMap[philosophyId] || 'gray.500'
}

// Helper function to get philosophy variant name
export const getPhilosophyVariant = (philosophyId) => {
  const variantMap = {
    ma: 'philosophyMA',
    ka: 'philosophyKA',
    rka: 'philosophyRKA',
    ika: 'philosophyIKA',
  }
  return variantMap[philosophyId] || 'solid'
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