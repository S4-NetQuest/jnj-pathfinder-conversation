import { extendTheme } from '@chakra-ui/react'

// J&J Color Palette
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

// Global styles
const styles = {
  global: {
    body: {
      bg: 'jj.gray.50',
      color: 'jj.gray.700',
      fontFamily: 'system-ui, sans-serif',
    }
  }
}

const theme = extendTheme({
  colors,
  styles,
})

export default theme