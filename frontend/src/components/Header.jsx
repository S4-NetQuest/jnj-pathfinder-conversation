import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Flex,
  Text,
  IconButton,
  HStack,
  VStack,
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
  Badge,
  Container,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Divider,
} from '@chakra-ui/react'
import { HamburgerIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { LuBookA } from "react-icons/lu";
import { useAuth } from '../contexts/AuthContext'
import GlossaryModal from './GlossaryModal'
import config from '../config/config'

// Import SVG assets and images
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
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const isMobile = useBreakpointValue({ base: true, md: false })

  const handleHomeClick = () => {
    navigate('/')
    onClose()
  }

  const handleGlossaryClick = () => {
    setShowGlossary(true)
    onClose()
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
      onClose()
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
      {/* Environment indicator for non-production */}
      {config.showDevFeatures && (
        <Box
          bg={config.isStaging ? 'orange.500' : 'blue.500'}
          color="white"
          py={1}
          fontSize="xs"
          textAlign="center"
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={1001}
        >
          <Container maxW="container.xl">
            <HStack justify="space-between" spacing={2}>
              <Badge
                colorScheme={config.isStaging ? 'orange' : 'blue'}
                variant="solid"
                fontSize="xs"
              >
                {config.NODE_ENV.toUpperCase()}
              </Badge>
              <Text fontSize="xs" isTruncated>
                {config.APP_TITLE}
              </Text>
              <Text fontSize="xs">
                API: {config.API_URL}
              </Text>
            </HStack>
          </Container>
        </Box>
      )}

      {/* Main Header */}
      <Box
        position="fixed"
        top={config.showDevFeatures ? "24px" : "0"}
        left={0}
        right={0}
        bg="red.500"
        borderBottom="1px solid"
        borderColor="gray.200"
        zIndex={1000}
        height="70px"
        shadow="sm"
      >
        <Box
          height="100%"
          px={{ base: 4, md: 6 }}
          maxW="container.xl"
          mx="auto"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap={4}
        >
          {/* Left section - Pathfinder only */}
          <Box>
            <Text
              fontSize={{ base: '28px', md: '40px' }}
              fontFamily="heading"
              fontWeight="REGULAR"
              color="white"
              cursor="pointer"
              onClick={handleHomeClick}
              whiteSpace="nowrap"
              lineHeight="1.1"
            >
              Pathfinder
            </Text>
          </Box>

          {/* Center section - Title */}
          <Box textAlign="center" flex="1" display={{ base: 'none', sm: 'block' }}>
            <Text
              fontSize={{ base: '16px', md: '22px' }}
              fontFamily="heading"
              fontWeight="medium"
              color="white"
              cursor="pointer"
              onClick={handleHomeClick}
              whiteSpace="nowrap"
            >
              Kinematic Restoration
            </Text>
          </Box>

          {/* Right section - Navigation */}
          <Flex justifyContent="flex-end" alignItems="center">
            {/* Desktop Navigation */}
            {!isMobile && (
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

                {/* User Profile Menu */}
                {user && (
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
                        <Text fontSize="sm" fontWeight="medium" color="white">
                          {getUserDisplayName()}
                        </Text>
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

                {!user && (
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={() => navigate('/')}
                  >
                    Login
                  </Button>
                )}
              </HStack>
            )}

            {/* Mobile Hamburger Menu */}
            {isMobile && (
              <IconButton
                aria-label="Open menu"
                icon={<HamburgerIcon />}
                variant="ghost"
                color="white"
                size="lg"
                onClick={onOpen}
                _hover={{
                  bg: 'whiteAlpha.200'
                }}
              />
            )}
          </Flex>
        </Box>
      </Box>

      {/* Mobile Navigation Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton color="white" />
          <DrawerHeader bg="red.500" color="white" borderBottom="1px solid" borderColor="gray.200">
            Menu
          </DrawerHeader>

          <DrawerBody p={0}>
            <VStack spacing={0} align="stretch">
              {/* User Info Section */}
              {user && (
                <>
                  <Box p={4} bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
                    <HStack spacing={3}>
                      <Image
                        src={ProfileIconSVG}
                        alt="Profile"
                        w="32px"
                        h="32px"
                        fallback={<Icon as={UserIcon} boxSize={8} color="red.500" />}
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                          {getUserDisplayName()}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {user.role === 'sales_rep' ? 'Sales Representative' : 'Surgeon'}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                  <Divider />
                </>
              )}

              {/* Navigation Items */}
              <Button
                leftIcon={
                  <Image
                    src={HomeIconSVG}
                    alt="Home"
                    w="20px"
                    h="20px"
                    fallback={<Icon as={HomeIcon} />}
                  />
                }
                onClick={handleHomeClick}
                variant="ghost"
                justifyContent="flex-start"
                size="lg"
                py={6}
                px={6}
                borderRadius={0}
                fontWeight="normal"
                _hover={{ bg: 'gray.50' }}
              >
                Home
              </Button>

              <Divider />

              <Button
                leftIcon={<Icon as={LuBookA} boxSize={5} />}
                onClick={handleGlossaryClick}
                variant="ghost"
                justifyContent="flex-start"
                size="lg"
                py={6}
                px={6}
                borderRadius={0}
                fontWeight="normal"
                _hover={{ bg: 'gray.50' }}
              >
                Glossary
              </Button>

              <Divider />

              {/* Logout Button */}
              {user && (
                <>
                  <Box flex={1} />
                  <Divider />
                  <Button
                    leftIcon={
                      <Icon viewBox="0 0 24 24" boxSize={5}>
                        <path
                          fill="currentColor"
                          d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 0 1 2 2v2h-2V4H3v16h11v-2h2v2a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11Z"
                        />
                      </Icon>
                    }
                    onClick={handleLogout}
                    variant="ghost"
                    colorScheme="red"
                    justifyContent="flex-start"
                    size="lg"
                    py={6}
                    px={6}
                    borderRadius={0}
                    fontWeight="normal"
                    _hover={{ bg: 'red.50' }}
                  >
                    Logout
                  </Button>
                </>
              )}

              {!user && (
                <Box p={4}>
                  <Button
                    colorScheme="red"
                    width="100%"
                    onClick={() => {
                      navigate('/')
                      onClose()
                    }}
                  >
                    Login
                  </Button>
                </Box>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Glossary Modal */}
      <GlossaryModal
        isOpen={showGlossary}
        onClose={() => setShowGlossary(false)}
      />
    </>
  )
}

export default Header