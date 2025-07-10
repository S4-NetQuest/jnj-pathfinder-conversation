import React from 'react'
import { Box } from '@chakra-ui/react'
import Header from './Header'
import Footer from './Footer'
import config from '../config/config'

const Layout = ({ children }) => {
  // Calculate header height based on environment
  const headerHeight = config.showDevFeatures ? "94px" : "70px" // 24px env bar + 70px header
  const footerHeight = config.showDevFeatures ? "90px" : "60px" // Extra height for dev info

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <Box
        pt={headerHeight} // Account for fixed header (+ environment bar if present)
        pb={footerHeight} // Account for fixed footer (+ dev info if present)
        minH={`calc(100vh - ${parseInt(headerHeight) + parseInt(footerHeight)}px)`}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  )
}

export default Layout