import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Text,
  Button,
  HStack,
  VStack,
  useDisclosure,
  Alert,
  AlertIcon,
  Link,
  useToast,
  Card,
  CardBody,
} from '@chakra-ui/react'
import { AddIcon, SearchIcon, DownloadIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ConversationModal from '../components/ConversationModal'
import LoadConversationModal from '../components/LoadConversationModal'
import DevLogin from '../components/DevLogin'
import config from '../config/config'
import { getPdfUrl } from '../utils/urlUtils'

// Import all background images
import pathfinderBgMobile from '../assets/images/pathfinder-bg-mobile.jpg'
import pathfinderBgTablet from '../assets/images/pathfinder-bg-tablet.jpg'
import pathfinderBgDesktop from '../assets/images/pathfinder-bg-desktop.jpg'
import pathfinderBgMobileWebp from '../assets/images/pathfinder-bg-mobile.webp'
import pathfinderBgTabletWebp from '../assets/images/pathfinder-bg-tablet.webp'
import pathfinderBgDesktopWebp from '../assets/images/pathfinder-bg-desktop.webp'
import pathfinderBackground from '../assets/images/pathfinder-background.jpg'

const Home = () => {
  const { user, logout, isSalesRep, isSurgeon } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [imageLoaded, setImageLoaded] = useState(false)

  // Calculate available height accounting for header and footer
  //const headerHeight = config.showDevFeatures ? "94px" : "70px" // 24px env banner + 70px header OR just 70px
  const headerHeight = "40px"
  const footerHeight = "90px" // From Footer.jsx
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

  // Preload the background image
  useEffect(() => {
    const img = new Image()
    img.onload = () => setImageLoaded(true)
    // Use the appropriate size based on screen
    const screenWidth = window.innerWidth
    if (screenWidth <= 480) {
      img.src = pathfinderBgMobile // 1200x800
    } else if (screenWidth <= 1024) {
      img.src = pathfinderBgTablet // 2000x1333
    } else {
      img.src = pathfinderBgDesktop // 3000x2000
    }
  }, [])

  const getBackgroundImage = () => {
    // Return appropriate image size based on viewport
    if (typeof window !== 'undefined') {
      const screenWidth = window.innerWidth

      if (screenWidth <= 480) {
        // Mobile: smaller image for faster loading
        return pathfinderBgMobileWebp
      } else if (screenWidth <= 1024) {
        // Tablet: medium resolution
        return pathfinderBgTabletWebp
      } else {
        // Desktop: full resolution for crisp display
        return pathfinderBgDesktopWebp
      }
    }
    return pathfinderBgDesktopWebp
  }

  const handleConversationCreated = (conversationId) => {
    onCreateClose()
    toast({
      title: 'Conversation Created',
      description: `Successfully created conversation with ID: ${conversationId}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
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
        h={availableHeight} // Use calculated available height
        overflow="hidden"
        bgImage={`url('${pathfinderBackground}')`}
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        bgAttachment={{ base: "scroll", md: "fixed" }}
        position="relative"
        pt={headerHeight}
        pb={footerHeight}
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: "rgba(0, 0, 0, 0.4)",
          zIndex: 1
        }}
      >
        <Container
          maxW="container.md"
          position="relative"
          zIndex={2}
          h={availableHeight} // Use height instead of minH
          display="flex"
          alignItems="center"
          justifyContent="center"
          py={0}
        >
          <Card
            bg="rgba(255, 255, 255, 0.95)"
            backdropFilter="blur(10px)"
            shadow="2xl"
            borderRadius="xl"
            maxW={{ base: "90%", sm: "480px" }}
            w="full"
          >
            <CardBody textAlign="center" p={8}>
              <DevLogin />
            </CardBody>
          </Card>
        </Container>
      </Box>
    )
  }

  return (
    <Box
      minH={availableHeight}
      h={availableHeight} // Use calculated available height
      overflow="hidden"
      bgImage={imageLoaded ? `url('${getBackgroundImage()}')` : 'none'}
      bgSize={{
        base: "cover",      // Mobile: crop to fill
        md: "cover",        // Tablet: crop to fill
        lg: "cover",        // Desktop: crop to fill (your image is high-res enough)
        xl: "contain"       // Very large screens: show full image
      }}
      bgPosition={{
        base: "center",     // Mobile: center the crop
        md: "center top",   // Tablet: favor top portion
        lg: "center",       // Desktop: center
        xl: "center"        // XL: center when showing full image
      }}
      bgRepeat="no-repeat"
      bgAttachment={{ base: "scroll", lg: "fixed" }} // Fixed only on desktop for performance
      position="relative"
      backgroundColor="#FFFFFF" // Fallback while loading
      transition="background-image 0.3s ease-in-out"
      pt={headerHeight}
      pb={footerHeight}
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        transition: "background 0.3s ease-in-out"
      }}
    >
      <Box
        position="relative"
        zIndex={2}
        h={availableHeight}
        w="100vw" // Full viewport width
        py={{ base: 4, md: 8 }}
        display="flex"
        flexDirection="column"
        justifyContent={{ base: "flex-start", md: "flex-start" }}
        alignItems="center"
        px={{ base: 4, md: 8 }} // Add horizontal padding instead of using Container
      >
        {/* Main Content Card */}
        <Card
          bg="rgba(255, 255, 255, 0.96)"
          backdropFilter="blur(12px)"
          shadow="2xl"
          borderRadius="xl"
          className={imageLoaded ? 'fade-in' : ''}
          maxW={{ base: "90%", sm: "480px", md: "520px" }}
          w="full"
          mt={{ base: 4, md: 12 }} // Add top margin to position higher
        >
          <CardBody p={{ base: 6, md: 8 }}>
            {/* Welcome Message */}
            <Box textAlign="center" mb={8}>
              <Text
                fontSize={{ base: "md", md: "lg" }}
                color="gray.700"
                className="font-text"
                lineHeight={{ base: "1.1", md: "1.2" }}
              >
                The PATHFINDER Kinematic Restoration Conversation Guide will help identify {isSalesRep ? "your customer's" : "your"} alignment philosophy in Total Knee Arthroplasty (TKA).
              </Text>
            </Box>

            {/* Action Buttons */}
            <VStack spacing={4} align="stretch">
              <Button
                leftIcon={<AddIcon />}
                colorScheme="red"
                size="lg"
                onClick={onCreateOpen}
                fontSize={{ base: "sm", md: "md" }}
                py={{ base: 6, md: 7 }}
                shadow="lg"
                _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                {isSalesRep ? 'Start New Conversation' : 'Start New Assessment'}
              </Button>

              {isSalesRep ? (
                <Button
                  leftIcon={<SearchIcon />}
                  colorScheme="red"
                  size="lg"
                  onClick={onLoadOpen}
                  fontSize={{ base: "sm", md: "md" }}
                  py={{ base: 6, md: 7 }}
                  shadow="lg"
                  _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
                  transition="all 0.2s"
                >
                  Load Existing Conversation
                </Button>
              ) : (
                <Button
                  leftIcon={<SearchIcon />}
                  colorScheme="red"
                  size="lg"
                  onClick={onLoadOpen}
                  fontSize={{ base: "sm", md: "md" }}
                  py={{ base: 6, md: 7 }}
                  shadow="lg"
                  _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
                  transition="all 0.2s"
                >
                  Load Previous Assessment
                </Button>
              )}

              <Button
                colorScheme="red"
                size="lg"
                onClick={handleExploreKinematicRestoration}
                fontSize={{ base: "sm", md: "md" }}
                py={{ base: 6, md: 7 }}
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
                fontSize={{ base: "sm", md: "md" }}
                py={{ base: 6, md: 7 }}
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
                  fontSize={{ base: "sm", md: "md" }}
                  py={{ base: 0, md: 0 }}
                  shadow="lg"
                  _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
                  transition="all 0.2s"
                >
                  Applying the Challenger Mindset
                </Button>
              )}

              <Text fontSize={"sm"}>Additional Resources</Text>
              <HStack spacing={4} justify="center">
              <Button
                as={Link}
                href={'https://truview.my.salesforce.com/sfc/p/36000000IwFC/a/Pl000005yPTh/kFGB.6JK_G2_bfIW_1Qy1GDhSsI4Tyhtkzf569pMnKo'}
                target="_blank"
                rel="noopener noreferrer"
                leftIcon={<DownloadIcon/>}
                color={"red.500"}
                backgroundColor={"white"}
                border={"1px solid"}
                size="lg"
                fontSize={{ base: "sm", md: "md" }}
                py={{ base: 4, md: 6 }}
                shadow="lg"
                _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                Clinical Value Proposition
              </Button>

              <Button
                as={Link}
                href={getPdfUrl('Kinematic-Restoration-Handbook-US_ORT_DGSR_395356.pdf')}
                target="_blank"
                rel="noopener noreferrer"
                leftIcon={<DownloadIcon/>}
                color={"red.500"}
                backgroundColor={"white"}
                border={"1px solid"}
                size="lg"
                fontSize={{ base: "sm", md: "md" }}
                py={{ base: 4, md: 6 }}
                shadow="lg"
                _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                KR Handbook
              </Button>
              </HStack>

            </VStack>

            {/* Role-specific Information */}
            {isSurgeon && (
              <Alert status="info" borderRadius="md" mt={6} bg="blue.50" borderColor="blue.200">
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

            {/* Development Info */}
            {config.showDevFeatures && (
              <Alert status="warning" borderRadius="md" mt={6} bg="yellow.50" borderColor="yellow.200">
                <AlertIcon color="yellow.500" />
                <Text fontSize="sm" color="yellow.800">
                  <strong>Development Mode:</strong> You are logged in as {user.role.replace('_', ' ')} using development authentication.
                </Text>
              </Alert>
            )}
          </CardBody>
        </Card>

        {/* Modals */}
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
    </Box>
  )
}

export default Home