import React from 'react'
import {
  Box,
  Flex,
  Text,
  Image,
  useBreakpointValue,
  Container,
  VStack,
  HStack,
  Divider,
  Link,
  useColorModeValue,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import config from '../config/config'

// Import logo
import JNJLogo from '../assets/logos/JNJ_MT_Logo_Shorthand_SingleLine_White_RGB.svg'

const Footer = () => {
  const isMobile = useBreakpointValue({ base: true, md: false })
  const footerBg = useColorModeValue('gray.700', 'gray.900')
  const borderColor = useColorModeValue('gray.600', 'gray.700')
  const textColor = useColorModeValue('white', 'gray.400')

  // Calculate footer height based on environment
  const footerHeight = config.showDevFeatures ? "90px" : "40px"

  return (

<Box
  position="fixed"
  bottom={0}
  left={0}
  right={0}
  bg={footerBg}
  zIndex={999}
  minHeight={footerHeight}
>
  <Container maxW="container.xl">
    <VStack spacing={2} py={3}>
      {/* Main Footer Content */}
      <Flex
        justify="space-between"
        align="center"
        w="100%"
        flexWrap="wrap"
        gap={4} // Use 'gap' instead of 'spacing' on Flex
      >
        {/* J&J MedTech Logo */}
        <Flex align="center" minH={footerHeight}>
          <Image
            src={JNJLogo}
            alt="Johnson & Johnson MedTech"
            h="18px"
            w="auto"
            fallback={
              <Text color={textColor} fontSize="sm" fontWeight="medium">
                Johnson & Johnson MedTech
              </Text>
            }
          />
        </Flex>
      </Flex>
    </VStack>
  </Container>
</Box>

  )
}

export default Footer