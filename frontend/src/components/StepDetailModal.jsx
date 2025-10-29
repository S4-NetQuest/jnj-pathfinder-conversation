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
  VStack,
  Text,
  Box,
  HStack,
  IconButton,
  Heading,
  useColorModeValue,
  SimpleGrid,
  List,
  ListItem,
  ListIcon,
  Collapse,
  Fade,
  Flex,
  Spacer,
  useToast,
} from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon, ArrowBackIcon, ChevronDownIcon, ChevronUpIcon, ArrowForwardIcon } from '@chakra-ui/icons'
import { MdCheckCircle } from 'react-icons/md'

const StepDetailModal = ({
  isOpen,
  onClose,
  currentStep,
  onPreviousStep,
  onNextStep,
  hasNextStep,
  hasPreviousStep,
  onNavigateToDiscovery, // Navigation handler prop
}) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('jj.gray.200', 'gray.600')
  const cardBgColor = useColorModeValue('white', 'gray.700')
  const toast = useToast()

  // State to track which cards have details expanded
  const [expandedCards, setExpandedCards] = useState({});

  // Reset expanded state when step changes
  useEffect(() => {
    if (currentStep) {
      setExpandedCards({});
    }
  }, [currentStep?.id]);

  // Log when navigation prop changes
  useEffect(() => {
    console.log("Modal received navigation handler:", !!onNavigateToDiscovery);
  }, [onNavigateToDiscovery]);

  // Toggle expanded state for a specific card
  const toggleCardExpansion = (index) => {
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Handle navigation to Discovery Questions with debug logging
  const handleNavigateToDiscovery = () => {
    console.log("Navigate button clicked in modal");

    // Show toast for visual feedback
    toast({
      title: "Navigation",
      description: "Navigating from StepDetailModal...",
      status: "info",
      duration: 2000,
      isClosable: true,
    });

    // Call the navigation handler from props
    if (typeof onNavigateToDiscovery === 'function') {
      console.log("Calling navigation function from props");
      onNavigateToDiscovery();
    } else {
      console.warn("No navigation function provided to modal");
      // Just close the modal if no handler provided
      onClose();
    }
  };

  // Is this the final step?
  const isFinalStep = currentStep && currentStep.id === 6;

  // Swipe handling
  useEffect(() => {
    if (!isOpen) return

    let startX = null
    let startY = null
    let startTime = null
    const threshold = 100 // minimum distance for swipe
    const restraint = 100 // maximum perpendicular distance
    const allowedTime = 300 // maximum time for swipe

    const handleTouchStart = (e) => {
      const touch = e.touches[0]
      startX = touch.clientX
      startY = touch.clientY
      startTime = Date.now()
    }

    const handleTouchEnd = (e) => {
      if (!startX || !startY || !startTime) return

      const touch = e.changedTouches[0]
      const distX = touch.clientX - startX
      const distY = touch.clientY - startY
      const elapsedTime = Date.now() - startTime

      // Check if swipe meets criteria
      if (elapsedTime <= allowedTime && Math.abs(distY) <= restraint && Math.abs(distX) >= threshold) {
        if (distX > 0 && hasNextStep) {
          // Swipe right - go to next step
          onNextStep()
        } else if (distX < 0 && hasPreviousStep) {
          // Swipe left - go to previous step
          onPreviousStep()
        }
      }

      startX = null
      startY = null
      startTime = null
    }

    const handleMouseDown = (e) => {
      startX = e.clientX
      startY = e.clientY
      startTime = Date.now()
    }

    const handleMouseUp = (e) => {
      if (!startX || !startY || !startTime) return

      const distX = e.clientX - startX
      const distY = e.clientY - startY
      const elapsedTime = Date.now() - startTime

      // Check if swipe meets criteria
      if (elapsedTime <= allowedTime && Math.abs(distY) <= restraint && Math.abs(distX) >= threshold) {
        if (distX > 0 && hasNextStep) {
          // Swipe right - go to next step
          onNextStep()
        } else if (distX < 0 && hasPreviousStep) {
          // Swipe left - go to previous step
          onPreviousStep()
        }
      }

      startX = null
      startY = null
      startTime = null
    }

    // Add keyboard navigation
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          if (hasPreviousStep) {
            e.preventDefault()
            onPreviousStep()
          }
          break
        case 'ArrowRight':
          if (hasNextStep) {
            e.preventDefault()
            onNextStep()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    const modalElement = document.querySelector('[data-swipe-container]')
    if (modalElement) {
      // Touch events for mobile
      modalElement.addEventListener('touchstart', handleTouchStart, { passive: true })
      modalElement.addEventListener('touchend', handleTouchEnd, { passive: true })

      // Mouse events for desktop
      modalElement.addEventListener('mousedown', handleMouseDown)
      modalElement.addEventListener('mouseup', handleMouseUp)
    }

    // Keyboard events
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      if (modalElement) {
        modalElement.removeEventListener('touchstart', handleTouchStart)
        modalElement.removeEventListener('touchend', handleTouchEnd)
        modalElement.removeEventListener('mousedown', handleMouseDown)
        modalElement.removeEventListener('mouseup', handleMouseUp)
      }
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, hasNextStep, hasPreviousStep, onNextStep, onPreviousStep, onClose])

  if (!currentStep) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      scrollBehavior="inside"
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent
        bg={bgColor}
        m={0}
        borderRadius={0}
        data-swipe-container
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      >
        <ModalHeader
          bg="jj.red"
          color="white"
          py={4}
          borderRadius={0}
        >
          <VStack spacing={2} align="center">
            {/* Step Number Badge */}
            <Box
              w="50px"
              h="50px"
              borderRadius="full"
              bg="white"
              color="jj.red"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="xl"
              fontWeight="bold"
            >
              {currentStep.id}
            </Box>
            {/* Step Title */}
            <Heading size="lg" textAlign="center">
              {currentStep.title}
            </Heading>
          </VStack>
        </ModalHeader>

        <ModalCloseButton
          color="white"
          size="lg"
          _hover={{ bg: 'whiteAlpha.200' }}
        />

        <ModalBody py={8}>
          <Box maxW="6xl" mx="auto">
            {/* Swipe Instruction Text */}
            <Box textAlign="center" mb={6}>
              <Text fontSize="sm" color="jj.gray.500">
                Swipe left/right or use arrow keys to navigate between steps
              </Text>
            </Box>

            {/* Cards Grid */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {currentStep.cards.map((card, index) => (
                <Box
                  key={index}
                  bg={cardBgColor}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  shadow="md"
                  overflow="hidden"
                  _hover={{ shadow: 'lg' }}
                  transition="box-shadow 0.2s"
                >
                  {/* Conversational Anchor Header */}
                  <Box
                    bg="jj.red"
                    color="white"
                    p={4}
                    borderTopRadius="lg"
                  >
                    <Heading size="sm" mb={2}>
                      Conversational Anchor
                    </Heading>
                    <Text fontSize="sm" lineHeight="1.6">
                      {card.conversationalAnchor}
                    </Text>
                  </Box>

                  {/* Bullet Points Section */}
                  <Box p={6}>
                    <Heading
                      size="sm"
                      color="jj.red"
                      mb={4}
                      borderBottom="1px solid"
                      borderColor="jj.red"
                      pb={2}
                    >
                      Key Points
                    </Heading>

                    {/* Bullet Points List */}
                    {card.bulletText && (
                      <List spacing={3} mb={4}>
                        {card.bulletText.map((bullet, i) => (
                          <ListItem key={i} display="flex">
                            <ListIcon as={MdCheckCircle} color="jj.red" mt="3px" />
                            <Text fontSize="sm" lineHeight="1.5">
                              {bullet}
                            </Text>
                          </ListItem>
                        ))}
                      </List>
                    )}

                    {/* Show Details Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="red"
                      width="100%"
                      mt={2}
                      onClick={() => toggleCardExpansion(index)}
                      rightIcon={expandedCards[index] ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    >
                      {expandedCards[index] ? 'Hide Details' : 'Show Details'}
                    </Button>

                    {/* Expandable Details Section */}
                    <Collapse in={expandedCards[index]} animateOpacity>
                      <Box
                        mt={4}
                        p={4}
                        bg="gray.50"
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor="gray.200"
                      >
                        <Text
                          fontSize="sm"
                          lineHeight="1.7"
                          color="jj.gray.700"
                          whiteSpace="pre-line"
                        >
                          {card.expandedMessage}
                        </Text>
                      </Box>
                    </Collapse>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </ModalBody>

        <ModalFooter
          bg="jj.gray.50"
          borderTop="1px solid"
          borderColor={borderColor}
          py={4}
        >
          <Flex width="100%" align="center">
            {/* Return to Choreography Button */}
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="outline"
              colorScheme="red"
              onClick={onClose}
            >
              Return to Choreography
            </Button>

            <Spacer />

            {/* Navigation - Shows differently on final step */}
            {isFinalStep ? (
              <Fade in={true}>
                <Button
                  rightIcon={<ArrowForwardIcon />}
                  colorScheme="red"
                  onClick={handleNavigateToDiscovery}
                  ml={2}
                  id="discovery-button" // Add an ID for easier debugging
                >
                  Continue to Discovery Questions
                </Button>
              </Fade>
            ) : (
              <HStack spacing={2}>
                <IconButton
                  icon={<ChevronLeftIcon />}
                  aria-label="Previous step"
                  variant="outline"
                  colorScheme="red"
                  isDisabled={!hasPreviousStep}
                  onClick={onPreviousStep}
                />
                <Text fontSize="sm" color="jj.gray.600" minW="120px" textAlign="center">
                  Step {currentStep.id} of 6: {currentStep.title}
                </Text>
                <IconButton
                  icon={<ChevronRightIcon />}
                  aria-label="Next step"
                  variant="outline"
                  colorScheme="red"
                  isDisabled={!hasNextStep}
                  onClick={onNextStep}
                />
              </HStack>
            )}
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default StepDetailModal