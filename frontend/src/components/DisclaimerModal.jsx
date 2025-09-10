// components/DisclaimerModal.jsx
import React, { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  Checkbox,
  Box,
  Icon,
  HStack,
  useColorModeValue,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'

const DisclaimerModal = ({ isOpen, onClose, onAccept }) => {
  const [isAcknowledged, setIsAcknowledged] = useState(false)
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const handleAccept = () => {
    if (isAcknowledged) {
      onAccept()
      onClose()
    }
  }

  const handleClose = () => {
    // Reset state when modal is closed without accepting
    setIsAcknowledged(false)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      size="lg"
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent
        bg={bgColor}
        border="2px solid"
        borderColor="#eb1700" // J&J Red
        borderRadius="md"
        mx={4} // Mobile margin
      >
        <ModalHeader
          bg="#eb1700"
          color="white"
          borderRadius="sm sm 0 0"
          py={4}
        >
          <HStack spacing={3}>
            {/* <Icon as={InfoIcon} boxSize={5} /> */}
            <Text fontSize="lg" fontWeight="500">
              Important Disclaimer
            </Text>
          </HStack>
        </ModalHeader>

        {/* Remove close button to force acknowledgment */}

        <ModalBody py={6}>
          <VStack spacing={4} align="stretch">
            <Alert status="info" borderRadius="md" bg="blue.50">
              <AlertIcon color="blue.500" />
              <Text fontSize="sm" color="blue.800">
                Please read and acknowledge the following disclaimer before proceeding.
              </Text>
            </Alert>

            <Box
              p={4}
              bg="gray.50"
              borderRadius="md"
              border="1px solid"
              borderColor={borderColor}
            >
              <Text
                fontSize="sm"
                lineHeight="1.6"
                color="gray.700"
              >
                The PATHFINDER Conversation Guide is an educational resource designed to
                reflect TKA alignment preferences based on HCP responses. It does not
                prescribe or recommend any specific alignment philosophy. Clinical decisions
                remain the sole responsibility of the surgeon, based on their professional
                judgement and patient-specific factors.
              </Text>
            </Box>

            <Box pt={2}>
              <Checkbox
                isChecked={isAcknowledged}
                onChange={(e) => setIsAcknowledged(e.target.checked)}
                colorScheme="red"
                size="md"
              >
                <Text fontSize="sm" color="gray.700" ml={2}>
                  I have read and acknowledge this disclaimer
                </Text>
              </Checkbox>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button
              variant="outline"
              onClick={handleClose}
              size="md"
            >
              Cancel
            </Button>
            <Button
              bg="#eb1700"
              color="white"
              _hover={{ bg: "#d11400" }}
              _active={{ bg: "#b81200" }}
              onClick={handleAccept}
              isDisabled={!isAcknowledged}
              size="md"
            >
              Continue
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DisclaimerModal