import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Badge,
  HStack,
  Box,
  AspectRatio,
  Text,
} from '@chakra-ui/react'

const VideoModal = ({ isOpen, onClose, alignmentType, videoSrc }) => {
  if (!alignmentType || !videoSrc) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent maxW="90vw" maxH="90vh">
        <ModalHeader bg="#C8102E" color="white" borderRadius="md md 0 0">
          <HStack spacing={3} justify="space-between" align="center" mr={8}>
            <Text fontSize="lg" fontWeight="medium">
              How to Execute with the VELYS™ Robotic-Assisted Solution
            </Text>
            <Badge
              bg={alignmentType.color}
              color="white"
              px={3}
              py={1}
              borderRadius="md"
              fontSize="sm"
              fontWeight="500"
              flexShrink={0}
            >
              {alignmentType.name}
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody p={0}>
          <AspectRatio ratio={16 / 9} w="100%">
            <video
              controls
              autoPlay
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#000',
              }}
            >
              <source src={videoSrc} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </AspectRatio>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default VideoModal