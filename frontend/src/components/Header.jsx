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
  Icon,
} from '@chakra-ui/react'
import { QuestionIcon } from '@chakra-ui/icons'
import { useAuth } from '../contexts/AuthContext'
import GlossaryModal from './GlossaryModal'

// Custom Home Icon Component (fallback if SVG doesn't load)
const HomeIcon = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
)

// Custom User Profile Icon Component (fallback if SVG doesn't load)
const UserIcon = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
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
              icon={<Icon as={QuestionIcon} />}
              variant="ghost"
              color="white"
              size="lg"
              onClick={() => setShowGlossary(true)}
              _hover={{
                bg: 'whiteAlpha.200',
                color: 'white'
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
                  fallback={<Icon as={HomeIcon} color="white" />}
                  onError={(e) => {
                    console.log('Home icon failed to load:', e);
                    e.target.style.display = 'none';
                  }}
                />
              }
              variant="ghost"
              size="lg"
              onClick={handleHomeClick}
              bg={isHomePage ? 'whiteAlpha.300' : 'transparent'}
              color="white"
              _hover={{
                bg: 'whiteAlpha.200'
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
                    fallback={<Icon as={UserIcon} color="white" />}
                    onError={(e) => {
                      console.log('Profile icon failed to load:', e);
                      e.target.style.display = 'none';
                    }}
                  />
                }
                variant="ghost"
                color="white"
                size="lg"
                onClick={handleProfileClick}
                _hover={{
                  bg: 'whiteAlpha.200'
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