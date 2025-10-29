import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  IconButton,
  Flex,
  Box,
  Text,
  useColorModeValue,
  Tooltip,
  Badge,
  Center,
} from '@chakra-ui/react';
import {
  TransformWrapper,
  TransformComponent
} from 'react-zoom-pan-pinch';
import {
  RepeatIcon
} from '@chakra-ui/icons';
import { ZoomInIcon, ZoomOutIcon } from './icons/ZoomIcons';

const ImageViewerModal = ({
  isOpen,
  onClose,
  imageSrc,
  imageAlt,
  alignmentType
}) => {
  const [resetKey, setResetKey] = useState(0); // Key to force remount
  const bgColor = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('#eb1700', '#eb1700');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      motionPreset="slideInBottom"
      isCentered
    >
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(2px)" />
      <ModalContent
        bg={bgColor}
        mx={{ base: 4, md: 8 }}
        my={{ base: 4, md: 8 }}
        h={{ base: "calc(100vh - 32px)", md: "calc(100vh - 64px)" }}
        borderRadius="md"
        overflow="hidden"
        display="flex"
        flexDirection="column"
      >
        <ModalHeader
          bg={headerBg}
          color="white"
          py={3}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexShrink={0}
        >
          <Text>
            {alignmentType ? alignmentType.name : ''} Alignment Details
          </Text>
          {alignmentType && (
            <Badge
              bg={alignmentType.color}
              color="white"
              py={1}
              px={2}
              borderRadius="md"
              fontSize="sm"
              ml={2}
            >
              {alignmentType.abbreviation}
            </Badge>
          )}
          <ModalCloseButton position="static" ml="auto" />
        </ModalHeader>

        {/* Zoom instructions - fixed height */}
        <Box
          bg="blackAlpha.300"
          p={2}
          textAlign="center"
          fontSize="sm"
          color="gray.600"
          flexShrink={0}
        >
          <Text>
            Double click to zoom, click and drag to pan, or use controls below
          </Text>
        </Box>

        {/* The image container - flex grow to fill available space */}
        <Box
          flex="1"
          position="relative"
          overflow="hidden"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <TransformWrapper
            key={resetKey}
            initialScale={1}
            minScale={0.5}
            maxScale={8}
            centerOnInit={true}
            wheel={{ step: 0.1 }}
            doubleClick={{ mode: "toggle" }}
            panning={{ disabled: false }}
            limitToBounds={true}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {/* Zoom controls */}
                <Flex
                  position="absolute"
                  bottom={4}
                  left="50%"
                  transform="translateX(-50%)"
                  zIndex={10}
                  bg="blackAlpha.600"
                  borderRadius="md"
                  p={2}
                  boxShadow="md"
                >
                  <Tooltip label="Zoom In" placement="top">
                    <IconButton
                      aria-label="Zoom In"
                      icon={<ZoomInIcon />}
                      onClick={() => zoomIn(0.5)}
                      size="md"
                      colorScheme="red"
                      variant="ghost"
                      _hover={{ bg: "whiteAlpha.200" }}
                      mr={2}
                    />
                  </Tooltip>
                  <Tooltip label="Zoom Out" placement="top">
                    <IconButton
                      aria-label="Zoom Out"
                      icon={<ZoomOutIcon />}
                      onClick={() => zoomOut(0.5)}
                      size="md"
                      colorScheme="red"
                      variant="ghost"
                      _hover={{ bg: "whiteAlpha.200" }}
                      mr={2}
                    />
                  </Tooltip>
                  <Tooltip label="Reset View" placement="top">
                    <IconButton
                      aria-label="Reset View"
                      icon={<RepeatIcon />}
                      onClick={() => {
                        // Use the key-based reset approach
                        setResetKey(prevKey => prevKey + 1);
                      }}
                      size="md"
                      colorScheme="red"
                      variant="ghost"
                      _hover={{ bg: "whiteAlpha.200" }}
                    />
                  </Tooltip>
                </Flex>

                {/* The actual image - centered in all dimensions */}
                <Center width="100%" height="100%">
                  <TransformComponent
                    wrapperStyle={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    contentStyle={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {imageSrc && (
                      <img
                        src={imageSrc}
                        alt={imageAlt}
                        style={{
                          maxWidth: "90%",
                          maxHeight: "90%",
                          objectFit: "contain",
                          display: "block",
                          margin: "auto"
                        }}
                      />
                    )}
                  </TransformComponent>
                </Center>
              </>
            )}
          </TransformWrapper>
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default ImageViewerModal;