// frontend/src/components/GlossaryModal.jsx
import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  Text,
  Box,
  Divider,
  Badge,
  useColorModeValue,
  Spinner,
  Center,
} from '@chakra-ui/react'
import api from '../services/api'

const ComparePhilosophiesModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  useEffect(() => {
    if (isOpen) {

    }
  }, [isOpen])

  const handleClose = () => {
    setError(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={{ base: 'full', md: 'xl' }}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader bg="gray.50" borderBottom="1px solid" borderColor={borderColor}>
          <Text color="#eb1700" fontSize="lg" fontWeight="bold">
            Challenger Selling Philosophy Questions
          </Text>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody p={0}>
          <Box p={4} minH="300px">
            {loading ? (
              <Center py={8}>
                <VStack spacing={3}>
                  <Spinner size="lg" color="#eb1700" />
                  <Text color="gray.500">Loading questions ...</Text>
                </VStack>
              </Center>
            ) : error ? (
              <Center py={8}>
                <VStack spacing={4}>
                  <Text color="red.500" textAlign="center">
                    {error}
                  </Text>
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={handleRetry}
                    bg="#eb1700"
                    _hover={{ bg: "#9e0000" }}
                  >
                    Try Again
                  </Button>
                </VStack>
              </Center>
            ) : (<> </>)}
          </Box>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor={borderColor}>
          <Button
            variant="outline"
            onClick={handleClose}
            colorScheme="gray"
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ComparePhilosophiesModal