
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
  useToast,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { LuBookA } from "react-icons/lu";
import { useAuth } from '../contexts/AuthContext'
import GlossaryModal from './GlossaryModal'

// Import SVG assets
import HomeIconSVG from '../assets/icons/JJ_Icon_Home_RGB.svg'
import ProfileIconSVG from '../assets/icons/JJ_Icon_Web_Profile_RGB.svg'

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
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showGlossary, setShowGlossary] = useState(false)
  const toast = useToast()
  const isMobile = useBreakpointValue({ base: true, md: false })

  const handleHomeClick = () => {
    navigate('/')
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: 'Logout Error',
        description: 'There was an issue logging out. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const getUserDisplayName = () => {
    if (!user) return 'User'
    if (user.name) return user.name
    if (user.email) return user.email
    return 'User'
  }

  const isHomePage = location.pathname === '/'

  return (
    <>
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bg="red.500"
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
              icon={<Icon as={LuBookA} />}
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
                  src={HomeIconSVG}
                  alt="Home"
                  w="20px"
                  h="20px"
                  fallback={<Icon as={HomeIcon} color="white" />}
                />
              }
              variant="ghost"
              size="lg"
              onClick={handleHomeClick}
              bg="transparent"
              color="white"
              _hover={{
                bg: 'whiteAlpha.200'
              }}
            />

            {/* User Profile Menu - Only for Sales Reps */}
            {user?.role === 'sales_rep' && (
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  color="white"
                  size="sm"
                  rightIcon={<ChevronDownIcon />}
                  _hover={{
                    bg: 'whiteAlpha.200'
                  }}
                  _active={{
                    bg: 'whiteAlpha.300'
                  }}
                  px={2}
                >
                  <HStack spacing={2}>
                    <Image
                      src={ProfileIconSVG}
                      alt="Profile"
                      w="20px"
                      h="20px"
                      fallback={<Icon as={UserIcon} color="white" />}
                    />
                    {!isMobile && (
                      <Text fontSize="sm" fontWeight="medium" color="white">
                        {getUserDisplayName()}
                      </Text>
                    )}
                  </HStack>
                </MenuButton>
                <MenuList
                  bg="white"
                  borderColor="gray.200"
                  boxShadow="lg"
                  minW="180px"
                >
                  <MenuItem
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.700"
                    _hover={{ bg: 'transparent' }}
                    cursor="default"
                  >
                    {getUserDisplayName()}
                  </MenuItem>

                  <MenuDivider />

                  <MenuItem
                    onClick={handleLogout}
                    fontSize="sm"
                    color="red.600"
                    _hover={{ bg: 'red.50' }}
                  >
                    <HStack spacing={2}>
                      <Icon viewBox="0 0 24 24" boxSize={4}>
                        <path
                          fill="currentColor"
                          d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 0 1 2 2v2h-2V4H3v16h11v-2h2v2a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11Z"
                        />
                      </Icon>
                      <Text>Logout</Text>
                    </HStack>
                  </MenuItem>
                </MenuList>
              </Menu>
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