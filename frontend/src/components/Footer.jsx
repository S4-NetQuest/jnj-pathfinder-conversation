import React from 'react'
import {
  Box,
  Flex,
  Text,
  Image,
  useBreakpointValue,
} from '@chakra-ui/react'

// Import logo
import JNJLogo from '../assets/logos/JNJ_MT_Logo_Shorthand_SingleLine_White_RGB.svg'

const Footer = () => {
  const isMobile = useBreakpointValue({ base: true, md: false })

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="gray.700"
      zIndex={999}
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
        {/* J&J MedTech Logo */}
        <Flex align="center">
          <Image
            src={JNJLogo}
            alt="Johnson & Johnson MedTech"
            h="18px"
            w="auto"
            fallback={
              <Text color="white" fontSize="sm" fontWeight="medium">
                Johnson & Johnson MedTech
              </Text>
            }
          />
        </Flex>

        {/* Optional additional footer content */}
        <Flex align="center" gap={4}>
          <Text
            fontSize="12px"
            fontFamily="body"
            color="white"
            display={{ base: 'none', md: 'block' }}
          >
            © 2024 Johnson & Johnson MedTech
          </Text>
        </Flex>
      </Flex>
    </Box>
  )
}

export default Footer