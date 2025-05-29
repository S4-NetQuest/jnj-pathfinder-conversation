import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Flex,
  Text,
  IconButton,
  HStack,
  useBreakpointValue,
  Image,
} from '@chakra-ui/react'
// No icons needed from @chakra-ui/icons since we're using custom ones
import { useAuth } from '../contexts/AuthContext'
import GlossaryModal from './GlossaryModal'

// Custom Glossary Icon Component (since we need a custom one)
const GlossaryIcon = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
  </svg>
)

const Header = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showGlossary, setShowGlossary] = useState(false)
  const isMobile = useBreakpointValue({ base: true, md: false })

  const handleHomeClick = () => {
    navigate('/')
  }

  const handleProfileClick = () => {
    if (user?.role === 'sales_rep') {
      navigate('/profile')
    }
  }

  const isHomePage = location.pathname === '/'

  return (
    <>
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bg="jj.red"
        borderBottom="1px solid"
        borderColor="gray.200"
        zIndex={1000}
        height="70px"
        shadow="sm"
      >
        <Flex
          height="100%"
          align="center"
          justify="space-between"
          px={{ base: 4, md: 6 }}
          maxW="container.xl"
          mx="auto"
        >
          {/* Logo/Title */}
          <Flex align="center" gap={3}>
            <Text
              fontSize={{ base: '18px', md: '22px' }}
              fontFamily="heading"
              fontWeight="medium"
              color="white"
              cursor="pointer"
              onClick={handleHomeClick}
            >
              Kinematic Restoration Conversion Guide
            </Text>
          </Flex>

          {/* Navigation Icons */}
          <HStack spacing={2}>
            {/* Glossary Icon */}
            <IconButton
              aria-label="Open glossary"
              icon={<GlossaryIcon />}
              variant="ghost"
              color="gray.600"
              size="lg"
              onClick={() => setShowGlossary(true)}
              _hover={{
                bg: 'gray.100',
                color: 'jj.red'
              }}
            />

            {/* Home Icon */}
            <IconButton
              aria-label="Home"
              icon={
                <Image
                  src="/assets/icons/JJ_Icon_Home_RGB.svg"
                  alt="Home"
                  w="20px"
                  h="20px"
                  filter={isHomePage ? 'none' : 'grayscale(100%)'}
                />
              }
              variant="ghost"
              size="lg"
              onClick={handleHomeClick}
              bg={isHomePage ? 'jj.red' : 'transparent'}
              color={isHomePage ? 'white' : 'gray.600'}
              _hover={{
                bg: isHomePage ? 'jj.red' : 'gray.100'
              }}
            />

            {/* User Profile Icon - Only for Sales Reps */}
            {user?.role === 'sales_rep' && (
              <IconButton
                aria-label="User Profile"
                icon={
                  <Image
                    src="/assets/icons/JJ_Icon_Web_Profile_RGB.svg"
                    alt="Profile"
                    w="20px"
                    h="20px"
                  />
                }
                variant="ghost"
                color="gray.600"
                size="lg"
                onClick={handleProfileClick}
                _hover={{
                  bg: 'gray.100',
                  color: 'jj.red'
                }}
              />
            )}
          </HStack>
        </Flex>
      </Box>

      {/* Glossary Modal */}
      <GlossaryModal
        isOpen={showGlossary}
        onClose={() => setShowGlossary(false)}
      />
    </>
  )
}

export default Header