import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
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

// Import new assets
import pathfinderWordmark from '../assets/images/FINAL-JJMT_Wordmark_Pathfinder Conversation Guide_RGB_Red.png'
import pathfinderCompass from '../assets/images/Picture1.png'

const Home = () => {
  const { user, logout, isSalesRep, isSurgeon } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [imagesLoaded, setImagesLoaded] = useState({ wordmark: false, compass: false })

  // Responsive layout configuration
  const isMobile = useBreakpointValue({ base: true, md: false })
  const compassSize = useBreakpointValue({
    base: { w: '280px', h: '280px' },
    md: { w: '320px', h: '320px' },
    lg: { w: '400px', h: '400px' },
    xl: { w: '450px', h: '450px' }
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

    preloadImage(pathfinderWordmark, 'wordmark')
    preloadImage(pathfinderCompass, 'compass')
  }, [])

  const handleConversationCreated = (conversationId) => {
    onCreateClose()
    /*
    toast({
      title: 'Conversation Created',
      description: `Successfully created conversation with ID: ${conversationId}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    */
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
              <Image
                src={pathfinderWordmark}
                alt="PATHFINDER Kinematic Restoration Conversation Guide"
                maxH={{ base: '80px', md: '100px' }}
                w="auto"
                fallback={
                  <Text
                    fontSize={{ base: 'xl', md: '2xl' }}
                    fontWeight="bold"
                    color="red.500"
                    textAlign="center"
                  >
                    PATHFINDER<br />
                    Kinematic Restoration Conversation Guide
                  </Text>
                }
              />
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
      overflow="hidden"
    >
      <Container maxW="container.xl" h={availableHeight}>
        <VStack spacing={{ base: 4, md: 6 }} h="full" py={{ base: 2, md: 4 }}>
          <Box textAlign="center" w="full">
            <Image
              src={pathfinderWordmark}
              alt="PATHFINDER Kinematic Restoration Conversation Guide"
              maxH={{ base: '50px', md: '65px', lg: '80px' }}
              w="auto"
              mx="auto"
              opacity={imagesLoaded.wordmark ? 1 : 0}
              transition="opacity 0.3s ease-in-out"
              fallback={
                <Text
                  fontSize={{ base: 'md', md: 'lg', lg: 'xl' }}
                  fontWeight="bold"
                  color="red.500"
                  textAlign="center"
                  className="font-display"
                >
                  PATHFINDER<br />
                  Kinematic Restoration Conversation Guide
                </Text>
              }
            />
          </Box>

          <Box w="full" textAlign="center" px={{ base: 4, md: 6, lg: 8 }}>
            <Text
              fontSize={{ base: "md", md: "lg", lg: "xl" }}
              color="gray.700"
              className="font-text"
              lineHeight="1.4"
              maxW="900px"
              mx="auto"
            >
              The PATHFINDER Kinematic Restoration Conversation Guide will help identify {isSalesRep ? "your customer's" : "your"} alignment philosophy in Total Knee Arthroplasty (TKA).
            </Text>
          </Box>

          <Box flex={1} w="full">
            <Flex h="full" align="center" justify="center">
              {isMobile ? (
                <VStack spacing={6} w="full" maxW="400px" px={4}>
                  <VStack spacing={4} w="full">
                    <Button
                      leftIcon={<AddIcon />}
                      colorScheme="red"
                      size="lg"
                      onClick={onCreateOpen}
                      w="full"
                      fontSize="sm"
                      py={6}
                      shadow="lg"
                      _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
                      transition="all 0.2s"
                    >
                      {isSalesRep ? 'Start New Conversation' : 'Start New Assessment'}
                    </Button>

                    <Button
                      leftIcon={<SearchIcon />}
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
                      {isSalesRep ? 'Load Existing Conversation' : 'Load Previous Assessment'}
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
                      Start Your Learning Journey
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
                      Compare Philosophies Tool
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
                        Applying the Challenger Mindset
                      </Button>
                    )}

                    <Text fontSize="sm" fontWeight="medium" color="gray.600" mt={4}>
                      Additional Resources
                    </Text>

                    {/* Fixed mobile layout for additional resources */}
                    <VStack spacing={3} w="full">
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
                        minH="44px"
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
                        minH="44px"
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
                        minH="44px"
                        px={2}
                      >
                        CPAK Job-Aid
                      </Button>
                    </VStack>
                  </VStack>

                  <Box textAlign="center">
                    <Image
                      src={pathfinderCompass}
                      alt="PATHFINDER Compass"
                      {...compassSize}
                      opacity={imagesLoaded.compass ? 1 : 0}
                      transition="opacity 0.3s ease-in-out"
                      objectFit="contain"
                    />
                  </Box>
                </VStack>
              ) : (
                <Grid
                  templateColumns={{ md: "1fr 1fr", lg: "1.2fr 0.8fr" }}
                  gap={{ md: 8, lg: 12, xl: 16 }}
                  w="full"
                  alignItems="center"
                  maxW="1200px"
                >
                  <GridItem>
                    <VStack spacing={6} align="stretch">
                      <VStack spacing={4} align="stretch">
                        <Button
                          leftIcon={<AddIcon />}
                          colorScheme="red"
                          size="lg"
                          onClick={onCreateOpen}
                          fontSize="md"
                          py={7}
                          shadow="lg"
                          _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
                          transition="all 0.2s"
                        >
                          {isSalesRep ? 'Start New Conversation' : 'Start New Assessment'}
                        </Button>

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
                          {isSalesRep ? 'Load Existing Conversation' : 'Load Previous Assessment'}
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
                          Start Your Learning Journey
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
                          Compare Philosophies Tool
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
                            Applying the Challenger Mindset
                          </Button>
                        )}

                        <Text fontSize="sm" fontWeight="medium" color="gray.600" mt={4} mb={2}>
                          Additional Resources
                        </Text>

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
                            fontSize="sm"
                            flex={1}
                            minH="60px"
                            whiteSpace="normal"
                            textAlign="center"
                            lineHeight="1.3"
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
                            fontSize="sm"
                            flex={1}
                            minH="60px"
                            whiteSpace="normal"
                            textAlign="center"
                            lineHeight="1.3"
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
                            fontSize="sm"
                            flex={1}
                            minH="60px"
                            whiteSpace="normal"
                            textAlign="center"
                            lineHeight="1.3"
                            px={3}
                          >
                            CPAK Job-Aid
                          </Button>
                        </HStack>
                      </VStack>
                    </VStack>
                  </GridItem>

                  <GridItem>
                    <Flex justify="center" align="center" h="full">
                      <Image
                        src={pathfinderCompass}
                        alt="PATHFINDER Compass"
                        {...compassSize}
                        opacity={imagesLoaded.compass ? 1 : 0}
                        transition="opacity 0.3s ease-in-out"
                        objectFit="contain"
                        filter="drop-shadow(0 10px 25px rgba(0,0,0,0.1))"
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