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
    // Kinematic Alignment (KA) - Maroon #9E0000
    ka: {
      50: '#fef2f2',   // Very light maroon
      100: '#fde2e2',  // Light maroon
      200: '#fbc5c5',  // Lighter maroon
      300: '#f7a8a8',  // Light maroon
      400: '#f18b8b',  // Medium-light maroon
      500: '#9e0000',  // Primary KA color
      600: '#8e0000',  // Slightly darker
      700: '#7e0000',  // Darker
      800: '#6e0000',  // Much darker
      900: '#5e0000',  // Very dark
    },

    // Inverse Kinematic Alignment (IKA) - Black #000000
    ika: {
      50: '#f7f7f7',   // Very light gray (near white)
      100: '#e3e3e3',  // Light gray
      200: '#c8c8c8',  // Lighter gray
      300: '#a4a4a4',  // Light gray
      400: '#717171',  // Medium-light gray
      500: '#000000',  // Primary IKA color (black)
      600: '#1a1a1a',  // Very dark gray (since black can't get darker)
      700: '#333333',  // Dark gray
      800: '#4d4d4d',  // Medium dark gray
      900: '#666666',  // Medium gray
    },

    // Functional Alignment (FA) - Blue #004685
    fa: {
      50: '#e6f1ff',   // Very light blue
      100: '#b3d4ff',  // Light blue
      200: '#80b7ff',  // Lighter blue
      300: '#4d9aff',  // Light blue
      400: '#1a7dff',  // Medium-light blue
      500: '#004685',  // Primary FA color
      600: '#003f77',  // Slightly darker
      700: '#003869',  // Darker
      800: '#00315b',  // Much darker
      900: '#002a4d',  // Very dark
    },

    // Mechanical Alignment (MA) - Gray #6E6259
    ma: {
      50: '#f9f8f7',   // Very light warm gray
      100: '#f0eeec',  // Light warm gray
      200: '#e1ddd8',  // Lighter warm gray
      300: '#d2ccc4',  // Light warm gray
      400: '#c3bbb0',  // Medium-light warm gray
      500: '#6e6259',  // Primary MA color
      600: '#625850',  // Slightly darker
      700: '#564e47',  // Darker
      800: '#4a443e',  // Much darker
      900: '#3e3a35',  // Very dark
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
      philosophyFA: {
        bg: 'philosophy.fa.500',
        color: 'white',
        fontWeight: 'normal',
        _hover: {
          bg: 'philosophy.fa.600',
        },
        _active: {
          bg: 'philosophy.fa.700',
        },
      },
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
      philosophyKA: {
        bg: 'philosophy.ka.500',
        color: 'white',
        fontWeight: '600',
      },
      philosophyIKA: {
        bg: 'philosophy.ika.500',
        color: 'white',
        fontWeight: '600',
      },
      philosophyFA: {
        bg: 'philosophy.fa.500',
        color: 'white',
        fontWeight: '600',
      },
      philosophyMA: {
        bg: 'philosophy.ma.500',
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
      philosophyKA: {
        container: {
          borderLeft: '4px solid',
          borderLeftColor: 'philosophy.ka.500',
          bg: 'philosophy.ka.50',
        },
      },
      philosophyIKA: {
        container: {
          borderLeft: '4px solid',
          borderLeftColor: 'philosophy.ika.500',
          bg: 'philosophy.ika.50',
        },
      },
      philosophyFA: {
        container: {
          borderLeft: '4px solid',
          borderLeftColor: 'philosophy.fa.500',
          bg: 'philosophy.fa.50',
        },
      },
      philosophyMA: {
        container: {
          borderLeft: '4px solid',
          borderLeftColor: 'philosophy.ma.500',
          bg: 'philosophy.ma.50',
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
  if (!philosophyId) return 'gray.500' // Handle null/undefined

  const normalizedId = philosophyId.toLowerCase()
  const colorMap = {
    ka: `philosophy.ka.${shade}`,
    ika: `philosophy.ika.${shade}`,
    fa: `philosophy.fa.${shade}`,
    ma: `philosophy.ma.${shade}`,
  }
  return colorMap[normalizedId] || 'gray.500'
}

// Helper function to get philosophy variant name
export const getPhilosophyVariant = (philosophyId) => {
  if (!philosophyId) return 'solid' // Handle null/undefined

  const normalizedId = philosophyId.toLowerCase()
  const variantMap = {
    ka: 'philosophyKA',
    ika: 'philosophyIKA',
    fa: 'philosophyFA',
    ma: 'philosophyMA',
  }
  return variantMap[normalizedId] || 'solid'
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