// Create a new component: frontend/src/components/AlignmentSummaryImage.jsx
import React, { useState } from 'react'
import {
  Box,
  Text,
  Spinner,
  Flex,
  Image,
} from '@chakra-ui/react'

const AlignmentSummaryImage = ({ alignment }) => {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  if (!alignment?.abbreviation) {
    return (
      <Flex
        w="100%"
        h="100%"
        minH={{ base: "200px", md: "250px", lg: "300px" }}
        alignItems="center"
        justifyContent="center"
        bg="jj.gray.50"
        color="#81766f"
        borderRadius="md"
      >
        <Text>No alignment data available</Text>
      </Flex>
    )
  }

  const imageSrc = `/images/${alignment.abbreviation.toLowerCase()}-summary.png`

  return (
    <Box
      w="100%"
      h="100%"
      minH={{ base: "200px", md: "250px", lg: "300px" }}
      position="relative"
      overflow="hidden"
      borderRadius="md"
      bg="#FFFFFF"
    >
      {/* Loading spinner */}
      {imageLoading && !imageError && (
        <Flex
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          alignItems="center"
          justifyContent="center"
          bg="#FFFFFF"
          zIndex={2}
        >
          <Spinner
            size="lg"
            color="#C8102E"
            thickness="3px"
          />
        </Flex>
      )}

      {/* Error fallback */}
      {imageError && (
        <Flex
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          bg="#FFFFFF"
          color="#81766f"
          textAlign="center"
          p={4}
          zIndex={2}
        >
          <Box
            w="60px"
            h="60px"
            bg={alignment.color}
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={3}
          >
            <Text fontSize="xl" fontWeight="bold" color="white">
              {alignment.abbreviation}
            </Text>
          </Box>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>
            {alignment.name}
          </Text>
          <Text fontSize="sm" color="#a39992">
            Summary diagram
          </Text>
        </Flex>
      )}

      {/* Actual image */}
      <Image
        src={imageSrc}
        alt={`${alignment.name} Summary Diagram`}
        w="100%"
        h="100%"
        objectFit="contain"
        objectPosition="center"
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageLoading(false)
          setImageError(true)
        }}
        style={{
          opacity: imageLoading || imageError ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </Box>
  )
}

export default AlignmentSummaryImage