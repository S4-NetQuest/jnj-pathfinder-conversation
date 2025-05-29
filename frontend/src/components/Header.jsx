import React, { useState } from 'react'
import {
  Box,
  Flex,
  Text,
  Button,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  useDisclosure,
  useBreakpointValue,
} from '@chakra-ui/react'
import { HamburgerIcon, QuestionIcon } from '@chakra-ui/icons'
import { useAuth } from '../contexts/AuthContext'
import GlossaryModal from './GlossaryModal'

const Header = () => {
  const { user, logout } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [showGlossary, setShowGlossary] = useState(false)
  const isMobile = useBreakpointValue({ base: true, md: false })

  const handleLogout = () => {
    logout()
    onClose()
  }

  return (
    <>
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bg="white"
        borderBottom="2px solid"
        borderColor="jj.red"
        zIndex={1000}
        height="60px"
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
              fontSize={{ base: 'lg', md: 'xl' }}
              fontWeight="bold"
              color="jj.red"
            >
              Kinematic Restoration
            </Text>
            <Text
              fontSize={{ base: 'sm', md: 'md' }}
              color="jj.gray.600"
              display={{ base: 'none', sm: 'block' }}
            >
              Conversion Guide
            </Text>
          </Flex>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Flex align="center" gap={4}>
              <IconButton
                aria-label="Open glossary"
                icon={<QuestionIcon />}
                variant="ghost"
                color="jj.gray.600"
                onClick={() => setShowGlossary(true)}
              />
              {user && (
                <Text fontSize="sm" color="jj.gray.600">
                  {user.name || `${user.role} User`}
                </Text>
              )}
              {user?.role === 'sales_rep' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              )}
            </Flex>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              aria-label="Open menu"
              icon={<HamburgerIcon />}
              variant="ghost"
              onClick={onOpen}
            />
          )}
        </Flex>
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" bg="jj.gray.50">
            Menu
          </DrawerHeader>

          <DrawerBody>
            <VStack align="stretch" spacing={4} pt={4}>
              <Button
                leftIcon={<QuestionIcon />}
                variant="ghost"
                justifyContent="flex-start"
                onClick={() => {
                  setShowGlossary(true)
                  onClose()
                }}
              >
                Glossary
              </Button>
              
              {user && (
                <Box p={4} bg="jj.gray.50" borderRadius="md">
                  <Text fontSize="sm" color="jj.gray.600" mb={2}>
                    Logged in as:
                  </Text>
                  <Text fontWeight="medium">
                    {user.name || `${user.role} User`}
                  </Text>
                </Box>
              )}
            </VStack>
          </DrawerBody>

          {user?.role === 'sales_rep' && (
            <DrawerFooter borderTopWidth="1px">
              <Button
                variant="outline"
                mr={3}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </DrawerFooter>
          )}
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