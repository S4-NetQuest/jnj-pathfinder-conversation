import React, { useState, useEffect } from 'react'
import {
  AbsoluteCenter,
  Box,
  Container,
  Divider,
  Text,
  Button,
  HStack,
  VStack,
  Grid,
  GridItem,
  useDisclosure,
  Alert,
  AlertIcon,
  Link,
  useToast,
  Image,
  useBreakpointValue,
  Flex,
} from '@chakra-ui/react'
import { AddIcon, SearchIcon, DownloadIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ConversationModal from '../components/ConversationModal'
import LoadConversationModal from '../components/LoadConversationModal'
import DevLogin from '../components/DevLogin'
import config from '../config/config'
import { getPdfUrl } from '../utils/urlUtils'

// Import assets
import pathfinderCompass from '../assets/images/home-compass.png'
import DPSLogo from '../assets/images/DPS_Logo_NoSig_RGB.png'

const Home = () => {
  const { user, logout, isSalesRep, isSurgeon } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [imagesLoaded, setImagesLoaded] = useState({ compass: false, dpsLogo: false })

  // New state for mobile animation
  const [mobileAnimationPhase, setMobileAnimationPhase] = useState('initial') // 'initial', 'compass', 'buttons'

  // Responsive layout configuration
  const isMobile = useBreakpointValue({ base: true, md: false })
  const compassSize = useBreakpointValue({
    base: { w: '300px', h: '300px' }, // Set proper size for mobile display
    md: { w: '520px', h: '520px' },
    lg: { w: '550px', h: '550px' },
    xl: { w: '600px', h: '600px' }
  })

  // Calculate available height accounting for header and footer
  const headerHeight = config.showDevFeatures ? "94px" : "70px"
  const footerHeight = "90px"
  const availableHeight = `calc(100vh - ${headerHeight} - ${footerHeight})`

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose
  } = useDisclosure()

  const {
    isOpen: isLoadOpen,
    onOpen: onLoadOpen,
    onClose: onLoadClose
  } = useDisclosure()

  // Animation sequence for mobile
  useEffect(() => {
    if (isMobile && imagesLoaded.compass) {
      // Start with compass visible
      setMobileAnimationPhase('compass')

      // After compass is shown for a few seconds, transition to buttons
      const timer = setTimeout(() => {
        setMobileAnimationPhase('buttons')
      }, 3000) // 3 seconds compass display

      return () => clearTimeout(timer)
    } else if (!isMobile) {
      // On desktop, just show buttons directly
      setMobileAnimationPhase('buttons')
    }
  }, [isMobile, imagesLoaded.compass])

  // Preload images
  useEffect(() => {
    const preloadImage = (src, key) => {
      const img = document.createElement('img')
      img.onload = () => {
        setImagesLoaded(prev => ({ ...prev, [key]: true }))
      }
      img.onerror = () => {
        // Still set as loaded to show fallback
        setImagesLoaded(prev => ({ ...prev, [key]: true }))
      }
      img.src = src
    }

    preloadImage(DPSLogo, 'dpsLogo')
    preloadImage(pathfinderCompass, 'compass')
  }, [])

  const handleConversationCreated = (conversationId) => {
    onCreateClose()
    navigate(`/conversation/${conversationId}`)
  }

  const handleConversationSelected = (conversationId) => {
    onLoadClose()
    navigate(`/conversation/${conversationId}`)
  }

  const handleExploreKinematicRestoration = () => {
    window.open('https://home.jnj.com/sites/velys-digital-surgery/SitePageModern/1892994/velys-robotic-assisted-solution-1-8', '_blank', 'noopener,noreferrer')
  }

  const handleComparePhilosophies = () => {
    navigate('/compare-philosophies')
  }

  const handleSellingQuestions = () => {
    navigate('/selling-questions-philosophies')
  }

  // Show dev login if not authenticated
  if (!user) {
    return (
      <Box
        minH={availableHeight}
        bg="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={{ base: 4, md: 8 }}
        py={8}
      >
        <Container maxW="container.md">
          <VStack spacing={8} align="center">
            <Box textAlign="center">
              <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
                color="white"
                textAlign="center"
                bg="red.500"
                px={4}
                py={2}
                borderRadius="md"
              >
                Pathfinder
              </Text>
              <Text
                mt={1}
                fontSize={{ base: 'sm', md: 'md' }}
                fontWeight="medium"
                color="red.500"
                textAlign="center"
                letterSpacing="wider"
                textTransform="uppercase"
              >
                CONVERSATION GUIDE
              </Text>
            </Box>

            <Box w="full" maxW="480px">
              <DevLogin />
            </Box>
          </VStack>
        </Container>
      </Box>
    )
  }

  return (
    <Box
      minH={availableHeight}
      bg="white"
      overflowX="hidden"
      overflowY="auto"
      pb={{ base: 6, md: 0 }}
    >
      <Container
        maxW="container.xl"
        minH={availableHeight}
        overflow="auto"
        /* py={{ base: 4, md: 6 }} */
      >
        <HStack>
          <Box textAlign="left" mb={6} mt={1} ml={2}>
            <Text
              fontSize="15.5px"
              fontWeight="medium"
              color="red.500"
              letterSpacing="wider"
              textTransform="uppercase"
              minW='200px'
            >
              CONVERSATION GUIDE
            </Text>
          </Box>

          <Box w="full" textAlign="center" px={{ base: 4, md: 6, lg: 8 }} position="relative" mt={0} mb={6}>
            {/* DPS Logo - Top right aligned on the page */}
            <Box
              position="absolute"
              right="2%"
              height="50px"
              display={{ base: "none", md: "block" }}
              zIndex={1}
            >
              <Image
                src={DPSLogo}
                alt="DePuy Synthes"
                height="100%"
                opacity={imagesLoaded.dpsLogo ? 1 : 0}
                transition="opacity 0.3s ease-in-out"
              />
            </Box>
          </Box>
        </HStack>

        <VStack
        mt={14}
          spacing={{ base: 0, md: 6 }}
          w="full"
          py={{ base: 0, md: 0 }}
          align="stretch"
        >
          <Box w="full" my={{ base: 2, md: 4 }}>
            <Flex
              direction="column"
              align="center"
              justify="center"
              w="full"
            >
              {isMobile ? (
                // Mobile View with Animation
                <Box
                  position="relative"
                  w="full"
                  maxW="500px"
                  h={{ base: "600px", sm: "650px" }}
                  px={0}
                  mx="auto"
                >
                  {/* Compass Image Layer - Shows first, then fades out */}
                  <Flex
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    alignItems="center"
                    justifyContent="center"
                    opacity={mobileAnimationPhase === 'compass' ? 1 : 0}
                    transform={mobileAnimationPhase === 'compass'
                      ? "scale(1)"
                      : mobileAnimationPhase === 'buttons'
                        ? "scale(0.9)"
                        : "scale(1.1)"
                    }
                    zIndex={mobileAnimationPhase === 'compass' ? 10 : 1}
                    transition="opacity 0.8s ease-in-out, transform 1s ease-in-out"
                    bg="white"
                  >
                    <Image
                      src={pathfinderCompass}
                      alt="PATHFINDER Compass"
                      maxW="85%"
                      maxH="85%"
                      opacity={imagesLoaded.compass ? 1 : 0}
                      transition="opacity 0.3s ease-in-out"
                      objectFit="contain"
                      /* filter="drop-shadow(0 8px 24px rgba(0,0,0,0.15))" */
                    />
                  </Flex>

                  {/* Buttons Layer - Initially hidden, then fades in */}
                  <VStack
                    spacing={6}
                    w="full"
                    align="center"
                    opacity={mobileAnimationPhase === 'buttons' ? 1 : 0}
                    transform={mobileAnimationPhase === 'buttons' ? "translateY(0)" : "translateY(20px)"}
                    transition="opacity 0.8s ease-in-out, transform 0.8s ease-in-out"
                    zIndex={mobileAnimationPhase === 'buttons' ? 10 : 1}
                    position="relative"
                    pt={2}
                  >
                    <VStack spacing={4} w="full" align="center">
                      {/* Enhanced Start New Conversation Button - MORE PROMINENT */}
                      <Box
                        w="full"
                        display="flex"
                        justifyContent="center"
                        position="relative"
                        my={3}
                      >
                        {/* Glow effect underneath the button */}
                        <Box
                          position="absolute"
                          top="0"
                          left="50%"
                          transform="translateX(-50%)"
                          width="125%"
                          maxWidth="400px"
                          height="70px"
                          my={4}
                          borderRadius="lg"
                          bg="rgba(235, 23, 0, 0.15)"
                          filter="blur(8px)"
                          zIndex={0}
                        />
                                                  <Button
                            colorScheme="red"
                            size="lg"
                            onClick={onCreateOpen}
                            fontSize="lg"
                            h="auto"
                            py={4}
                            px={0}  // Remove default horizontal padding
                            shadow="xl"
                            fontWeight="500"
                            position="relative"
                            zIndex={1}
                            w="full"
                            _hover={{
                              transform: "translateY(-3px)",
                              shadow: "2xl",
                              bg: "red.600",
                            }}
                            _active={{
                              transform: "translateY(1px)",
                              shadow: "md",
                            }}
                            transition="all 0.3s"
                          >
                            <HStack width="100%" spacing={0} alignItems="center">
                              {/* Left-aligned icon with padding */}
                              <Box pl={4} pr={2}>
                                <AddIcon boxSize={5} />
                              </Box>

                              {/* Center-aligned text content */}
                              <VStack spacing={1} flex={1} pr={6}>  {/* Added right padding to visually center */}
                                <Text>
                                  {isSalesRep ? 'Start New Conversation' : 'Start New Conversation'}
                                </Text>
                                <Text
                                  fontSize="xs"
                                  fontWeight="normal"
                                  opacity={0.8}
                                  lineHeight={1.2}
                                >
                                  Identify current HCP alignment technique
                                </Text>
                              </VStack>
                            </HStack>
                          </Button>
                      </Box>

                      {/* Normal Buttons */}
                      <Button
                        leftIcon={<SearchIcon boxSize={5} />}
                        colorScheme="red"
                        size="lg"
                        onClick={onLoadOpen}
                        w="full"
                        fontSize="sm"
                        py={6}
                        shadow="lg"
                        _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
                        transition="all 0.2s"
                      >
                        <VStack spacing={1}>
                            <Text>
                              {isSalesRep ? 'Load Existing Conversation' : 'Load Previous Assessment'}
                            </Text>
                            <Text
                              fontSize="xs"
                              fontWeight="normal"
                              opacity={0.8}
                              lineHeight={1.2}
                            >
                              Continue previous session
                            </Text>
                          </VStack>
                      </Button>

                      <Button
                        colorScheme="red"
                        size="lg"
                        onClick={handleExploreKinematicRestoration}
                        w="full"
                        fontSize="sm"
                        py={6}
                        shadow="lg"
                        _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
                        transition="all 0.2s"
                      >
                        <VStack spacing={1}>
                          <Text>
                            Start Your Learning Journey
                          </Text>
                          <Text
                            fontSize="xs"
                            fontWeight="normal"
                            opacity={0.8}
                            lineHeight={1.2}
                          >
                            Access training materials and evidence
                          </Text>
                        </VStack>
                      </Button>

                      <Button
                        colorScheme="red"
                        size="lg"
                        onClick={handleComparePhilosophies}
                        w="full"
                        fontSize="sm"
                        py={6}
                        shadow="lg"
                        _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
                        transition="all 0.2s"
                      >
                        <VStack spacing={1}>
                          <Text>
                            Compare Philosophies
                          </Text>
                          <Text
                            fontSize="xs"
                            fontWeight="normal"
                            opacity={0.8}
                            lineHeight={1.2}
                          >
                            Side-by-side alignment philosophy comparison
                          </Text>
                        </VStack>
                      </Button>

                      {isSalesRep && (
                        <Button
                          colorScheme="red"
                          size="lg"
                          onClick={handleSellingQuestions}
                          w="full"
                          fontSize="sm"
                          py={6}
                          shadow="lg"
                          _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
                          transition="all 0.2s"
                        >
                          <VStack spacing={1}>
                            <Text>
                              Apply the Challenger Mindset
                            </Text>
                            <Text
                              fontSize="xs"
                              fontWeight="normal"
                              opacity={0.8}
                              lineHeight={1.2}
                            >
                              Strategic sales conversation technique
                            </Text>
                          </VStack>
                        </Button>
                      )}

                      <Text fontSize="sm" fontWeight="medium" color="gray.600" mt={6}>
                        Supporting Materials
                      </Text>

                      <VStack spacing={2} w="full">
                        <Button
                          as={Link}
                          href={getPdfUrl('Solutions-In-Motion-KR-Clinical-Value-Proposition-M_EM_ORT_DGSR_399044.pdf')}
                          target="_blank"
                          rel="noopener noreferrer"
                          leftIcon={<DownloadIcon />}
                          colorScheme="red"
                          variant="outline"
                          size="md"
                          w="full"
                          fontSize="xs"
                          whiteSpace="normal"
                          textAlign="center"
                          px={2}
                        >
                          Clinical Value Proposition
                        </Button>

                        <Button
                          as={Link}
                          href={getPdfUrl('Kinematic-Restoration-Brochure-US_DPS_JRKN_393603.pdf')}
                          target="_blank"
                          rel="noopener noreferrer"
                          leftIcon={<DownloadIcon />}
                          colorScheme="red"
                          variant="outline"
                          size="md"
                          w="full"
                          fontSize="xs"
                          whiteSpace="normal"
                          textAlign="center"
                          px={2}
                        >
                          KR Brochure
                        </Button>

                        <Button
                          as={Link}
                          href={getPdfUrl('CPAK-Job-Aid.pdf')}
                          target="_blank"
                          rel="noopener noreferrer"
                          leftIcon={<DownloadIcon />}
                          colorScheme="red"
                          variant="outline"
                          size="md"
                          w="full"
                          fontSize="xs"
                          whiteSpace="normal"
                          textAlign="center"
                          px={2}
                        >
                          CPAK Job-Aid
                        </Button>
                      </VStack>
                    </VStack>
                  </VStack>
                </Box>
              ) : (
                // Desktop layout (unchanged)
                <Grid
                  templateColumns={{ md: "1fr 1fr", lg: "1.2fr 0.8fr" }}
                  gap={{ md: 8, lg: 12, xl: 16 }}
                  w="full"
                  alignItems="flex-start"
                  justifyItems="center"
                  maxW="1200px"
                  mx="auto"
                >
                  <GridItem>
                    <VStack spacing={6} align="stretch">
                  <Box>
                    <Text
                      fontSize={{ base: "md", md: "md", lg: "md" }}
                      color="gray.700"
                      className="font-text"
                      lineHeight="1.4"
                    >
                      Let's talk about alignment philosophies in Total Knee Arthroplasty (TKA).
                    </Text>
                  </Box>
                      <VStack spacing={4} align="stretch">
                        <Box
                          position="relative"
                          w="full"
                          my={5}
                        >
                          {/* Glow effect underneath the button */}
                          <Box
                            position="absolute"
                            top="-4px"
                            left="-4px"
                            right="-4px"
                            bottom="-4px"
                            borderRadius="sm"
                            bg="rgba(235, 23, 0, 0.25)"
                            filter="blur(8px)"
                            zIndex={0}
                          />
                          <Button
                            colorScheme="red"
                            size="lg"
                            onClick={onCreateOpen}
                            fontSize="lg"
                            h="auto"
                            py={4}
                            px={0}  // Remove default horizontal padding
                            shadow="xl"
                            fontWeight="500"
                            position="relative"
                            zIndex={1}
                            w="full"
                            _hover={{
                              transform: "translateY(-3px)",
                              shadow: "2xl",
                              bg: "red.600",
                            }}
                            _active={{
                              transform: "translateY(1px)",
                              shadow: "md",
                            }}
                            transition="all 0.3s"
                          >
                            <HStack width="100%" spacing={0} alignItems="center">
                              {/* Left-aligned icon with padding */}
                              <Box pl={4} pr={2}>
                                <AddIcon boxSize={5} />
                              </Box>

                              {/* Center-aligned text content */}
                              <VStack spacing={1} flex={1} pr={6}>  {/* Added right padding to visually center */}
                                <Text>
                                  {isSalesRep ? 'Start New Conversation' : 'Start New Conversation'}
                                </Text>
                                <Text
                                  fontSize="xs"
                                  fontWeight="normal"
                                  opacity={0.8}
                                  lineHeight={1.2}
                                >
                                  Identify current HCP alignment technique
                                </Text>
                              </VStack>
                            </HStack>
                          </Button>
                        </Box>

                        {/* Normal buttons */}
                        <Button
                          leftIcon={<SearchIcon />}
                          colorScheme="red"
                          size="lg"
                          onClick={onLoadOpen}
                          fontSize="md"
                          py={7}
                          shadow="lg"
                          _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
                          transition="all 0.2s"
                        >
                          <VStack spacing={1}>
                            <Text>
                              {isSalesRep ? 'Load Existing Conversation' : 'Load Previous Assessment'}
                            </Text>
                            <Text
                              fontSize="xs"
                              fontWeight="normal"
                              opacity={0.8}
                              lineHeight={1.2}
                            >
                              Continue previous session
                            </Text>
                          </VStack>
                        </Button>

                        <Button
                          colorScheme="red"
                          size="lg"
                          onClick={handleExploreKinematicRestoration}
                          fontSize="md"
                          py={7}
                          shadow="lg"
                          _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
                          transition="all 0.2s"
                        >
                          <VStack spacing={1}>
                            <Text>
                              Start Your Learning Journey
                            </Text>
                            <Text
                              fontSize="xs"
                              fontWeight="normal"
                              opacity={0.8}
                              lineHeight={1.2}
                            >
                              Access training materials and evidence
                            </Text>
                          </VStack>
                        </Button>

                        <Button
                          colorScheme="red"
                          size="lg"
                          onClick={handleComparePhilosophies}
                          fontSize="md"
                          py={7}
                          shadow="lg"
                          _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
                          transition="all 0.2s"
                        >
                          <VStack spacing={1}>
                            <Text>
                              Compare Philosophies
                            </Text>
                            <Text
                              fontSize="xs"
                              fontWeight="normal"
                              opacity={0.8}
                              lineHeight={1.2}
                            >
                              Side-by-side alignment philosophy comparison
                            </Text>
                          </VStack>
                        </Button>

                        {isSalesRep && (
                          <Button
                            colorScheme="red"
                            size="lg"
                            onClick={handleSellingQuestions}
                            fontSize="md"
                            py={7}
                            shadow="lg"
                            _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
                            transition="all 0.2s"
                          >
                            <VStack spacing={1}>
                              <Text>
                                Apply the Challenger Mindset
                              </Text>
                              <Text
                                fontSize="xs"
                                fontWeight="normal"
                                opacity={0.8}
                                lineHeight={1.2}
                              >
                                Strategic sales conversation technique
                              </Text>
                            </VStack>
                          </Button>
                        )}
                        <Box position='relative' mt={6} mb={2} textAlign="center" w="full">
                          <Divider />
                          <AbsoluteCenter bg='white' px='4'>
                            <Text fontSize="sm" fontWeight="medium" color="gray.600">
                              Supporting Materials
                            </Text>
                          </AbsoluteCenter>
                        </Box>
                        {/* Desktop layout - HStack with taller buttons */}
                        <HStack spacing={4} align="stretch">
                          <Button
                            as={Link}
                            href={getPdfUrl('Solutions-In-Motion-KR-Clinical-Value-Proposition-M_EM_ORT_DGSR_399044.pdf')}
                            target="_blank"
                            rel="noopener noreferrer"
                            leftIcon={<DownloadIcon />}
                            colorScheme="red"
                            variant="outline"
                            size="md"
                            fontSize="xs"
                            flex={1}
                            minH="46px"
                            whiteSpace="normal"
                            textAlign="center"
                            lineHeight="1.0"
                            px={3}
                          >
                            Clinical Value Proposition
                          </Button>

                          <Button
                            as={Link}
                            href={getPdfUrl('Kinematic-Restoration-Brochure-US_DPS_JRKN_393603.pdf')}
                            target="_blank"
                            rel="noopener noreferrer"
                            leftIcon={<DownloadIcon />}
                            colorScheme="red"
                            variant="outline"
                            size="md"
                            fontSize="xs"
                            flex={1}
                            minH="46px"
                            whiteSpace="normal"
                            textAlign="center"
                            lineHeight="1.0"
                            px={3}
                          >
                            KR Brochure
                          </Button>

                          <Button
                            as={Link}
                            href={getPdfUrl('CPAK-Job-Aid.pdf')}
                            target="_blank"
                            rel="noopener noreferrer"
                            leftIcon={<DownloadIcon />}
                            colorScheme="red"
                            variant="outline"
                            size="md"
                            fontSize="xs"
                            flex={1}
                            minH="46px"
                            whiteSpace="normal"
                            textAlign="center"
                            lineHeight="1.0"
                            px={3}
                          >
                            CPAK Job-Aid
                          </Button>
                        </HStack>
                      </VStack>
                    </VStack>
                  </GridItem>

                  <GridItem>
                    <Flex justify="center" align="center" h="full" marginTop={"0px"}>
                      <Image
                        src={pathfinderCompass}
                        alt="PATHFINDER Compass"
                        {...compassSize}
                        opacity={imagesLoaded.compass ? 1 : 0}
                        transition="opacity 0.3s ease-in-out"
                        objectFit="contain"
                        /* filter="drop-shadow(0 10px 25px rgba(0,0,0,0.1))" */
                      />
                    </Flex>
                  </GridItem>
                </Grid>
              )}
            </Flex>
          </Box>

          {isSurgeon && (
            <Alert status="info" borderRadius="md" bg="blue.50" borderColor="blue.200" maxW="800px">
              <AlertIcon color="blue.500" />
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" fontWeight="medium" color="blue.800">
                  Surgeon Access
                </Text>
                <Text fontSize="sm" color="blue.700">
                  As a surgeon, you can create and participate in your own alignment assessments. Notes functionality is available only for sales representatives.
                </Text>
              </VStack>
            </Alert>
          )}

          {config.showDevFeatures && (
            <Alert status="warning" borderRadius="md" bg="yellow.50" borderColor="yellow.200" maxW="800px">
              <AlertIcon color="yellow.500" />
              <Text fontSize="sm" color="yellow.800">
                <strong>Development Mode:</strong> You are logged in as {user.role.replace('_', ' ')} using development authentication.
              </Text>
            </Alert>
          )}
        </VStack>
      </Container>

      <ConversationModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        onConversationCreated={handleConversationCreated}
      />

      <LoadConversationModal
        isOpen={isLoadOpen}
        onClose={onLoadClose}
        onConversationSelected={handleConversationSelected}
      />
    </Box>
  )
}

export default Home