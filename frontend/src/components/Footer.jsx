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
  const footerBg = useColorModeValue('jj.gray.700', 'jj.gray.700')
  const textColor = useColorModeValue('white', 'white')
  const currentYear = new Date().getFullYear();
  // Calculate footer height based on environment and mobile/desktop
  const footerHeight = config.showDevFeatures
    ? (isMobile ? "120px" : "90px")
    : (isMobile ? "80px" : "60px")

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
      <Container maxW="container.xl" h="100%">
        <Flex
          h="100%"
          align="center"
          justify={isMobile ? "center" : "space-between"}
          direction={isMobile ? "column" : "row"}
          py={3}
          gap={isMobile ? 3 : 4}
        >
          {/* J&J MedTech Logo */}
          <Flex
            align="center"
            justify={isMobile ? "center" : "flex-start"}
            flex={isMobile ? "none" : "0 0 auto"}
            maxW="80%"
          >

            <Text
              color={textColor}
              fontSize="xs"
              lineHeight="1.3"
              fontWeight="400"
              minW="600px"
            >
              Important Information: Prior to use, refer to the instructions for use supplied with the device(s) for indications, contraindications, side effects, warnings and precautions. Product(s) may not be commercially available in all markets and may not be commercialized nor promoted unless regulatory approval has been granted for all the products referenced. <br/>CONFIDENTIAL. FOR INTERNAL USE ONLY. NOT FOR USE WITH ANY CUSTOMER OR FOR EXTERNAL DISTRIBUTION
            </Text>
          </Flex>

          {/* Copyright and Confidentiality Text */}
          <VStack
            spacing={1}
            align={isMobile ? "center" : "flex-end"}
            textAlign={isMobile ? "center" : "right"}
            flex={isMobile ? "none" : "1"}
          >
            <Text
              color={textColor}
              fontSize="xs"
              lineHeight="1.3"
              fontWeight="400"
              minW="25%"
            >
              ©DePuy Synthes and its affiliates {currentYear}
            </Text>
            <Text
              color={textColor}
              fontSize="xs"
              lineHeight="1.3"
              fontWeight="400"
            >
              M_US_ORT_JRKN_408990
            </Text>
          </VStack>
        </Flex>
      </Container>
    </Box>
  )
}

export default Footer