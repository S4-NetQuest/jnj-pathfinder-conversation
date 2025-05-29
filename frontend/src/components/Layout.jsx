import React from 'react'
import { Box } from '@chakra-ui/react'
import Header from './Header'
import Footer from './Footer'

const Layout = ({ children }) => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <Box
        pt="70px" // Account for fixed header
        pb="60px" // Account for fixed footer
        minH="calc(100vh - 130px)" // Total viewport height minus header and footer
      >
        {children}
      </Box>
      <Footer />
    </Box>
  )
}

export default Layout