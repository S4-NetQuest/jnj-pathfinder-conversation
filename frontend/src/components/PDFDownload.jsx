// frontend/src/components/PDFDownload.jsx
import React, { useState } from 'react';
import {
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Progress,
  Text,
  VStack,
  HStack,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Spinner
} from '@chakra-ui/react';
import { DownloadIcon, CheckIcon, WarningIcon } from '@chakra-ui/icons';
import api from '../services/api';

const PDFDownload = ({
  conversationData,
  buttonText = "Download PDF",
  buttonProps = {},
  showProgress = true
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState(null);
  const toast = useToast();

  // Validate conversation data
  const validateConversationData = (data) => {
    const required = ['surgeon_name', 'hospital_name'];
    const missing = required.filter(field => !data[field]);

    if (missing.length > 0) {
      console.warn('Missing required fields for PDF:', missing);
      // Still allow PDF generation with defaults
    }

    // Ensure scores exist or provide empty object
    if (!data.scores || typeof data.scores !== 'object') {
      console.warn('No scores found, using empty scores for PDF');
      data.scores = {};
    }

    console.log('PDF validation - scores:', data.scores);
    return data;
  };

  const handleDownload = async () => {
    if (!conversationData) {
      toast({
        title: 'Error',
        description: 'No conversation data available for PDF generation',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setError(null);

    if (showProgress) {
      setShowProgressModal(true);
    }

    try {
      // Validate and prepare data
      const validatedData = validateConversationData({ ...conversationData });

      setProgressMessage('Initializing PDF generation...');
      setProgress(10);

      console.log('Starting PDF generation with data:', {
        surgeon_name: validatedData.surgeon_name,
        hospital_name: validatedData.hospital_name,
        scores: validatedData.scores,
        current_alignment: validatedData.current_alignment
      });

      setProgressMessage('Connecting to PDF service...');
      setProgress(25);

      // Make the API call to generate PDF
      const response = await api.post('/pdf/generate',
        { conversationData: validatedData },
        {
          responseType: 'blob',
          timeout: 120000, // 2 minute timeout
          onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(Math.min(75 + (percentCompleted * 0.2), 95)); // 75-95%
              setProgressMessage('Downloading PDF...');
            }
          }
        }
      );

      setProgressMessage('Processing PDF...');
      setProgress(90);

      // Check if response is actually a PDF
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('application/pdf')) {
        // Try to read as text to get error message
        const text = await response.data.text();
        let errorObj;
        try {
          errorObj = JSON.parse(text);
        } catch (e) {
          errorObj = { error: 'Invalid PDF response from server' };
        }
        throw new Error(errorObj.error || 'Server returned invalid PDF');
      }

      setProgressMessage('Saving file...');
      setProgress(95);

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename
      const surgeonName = validatedData.surgeon_name || 'surgeon';
      const cleanSurgeonName = surgeonName.replace(/[^a-zA-Z0-9-_]/g, '-');
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `pathfinder-conversation-${cleanSurgeonName}-${dateStr}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setProgress(100);
      setProgressMessage('Download complete!');

      // Close modal after brief delay
      setTimeout(() => {
        setShowProgressModal(false);
      }, 1000);

      toast({
        title: 'PDF Downloaded',
        description: 'Your conversation PDF has been downloaded successfully',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });

    } catch (error) {
      console.error('PDF generation error:', error);

      let errorMessage = 'Failed to generate PDF';

      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'PDF generation timed out. Please try again.';
      } else if (error.response?.status === 408) {
        errorMessage = 'PDF generation timed out on server. Please try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error during PDF generation. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);

      toast({
        title: 'PDF Generation Failed',
        description: errorMessage,
        status: 'error',
        duration: 8000,
        isClosable: true,
      });

    } finally {
      setIsGenerating(false);
    }
  };

  const closeProgressModal = () => {
    setShowProgressModal(false);
    setProgress(0);
    setProgressMessage('');
    setError(null);
  };

  return (
    <>
      <Button
        leftIcon={<DownloadIcon />}
        colorScheme="red"
        variant="outline"
        onClick={handleDownload}
        isLoading={isGenerating}
        loadingText="Generating PDF..."
        disabled={!conversationData}
        {...buttonProps}
      >
        {buttonText}
      </Button>

      {/* Progress Modal */}
      <Modal
        isOpen={showProgressModal}
        onClose={closeProgressModal}
        closeOnOverlayClick={false}
        closeOnEsc={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              {error ? (
                <Icon as={WarningIcon} color="red.500" />
              ) : progress === 100 ? (
                <Icon as={CheckIcon} color="green.500" />
              ) : (
                <Spinner size="sm" color="red.500" />
              )}
              <Text>
                {error ? 'PDF Generation Failed' :
                 progress === 100 ? 'PDF Generated Successfully' :
                 'Generating PDF'}
              </Text>
            </HStack>
          </ModalHeader>

          {!error && <ModalCloseButton />}

          <ModalBody>
            <VStack spacing={4} align="stretch">
              {error ? (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Generation Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Box>
                </Alert>
              ) : (
                <>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    {progressMessage}
                  </Text>

                  <Progress
                    value={progress}
                    colorScheme="red"
                    size="lg"
                    borderRadius="md"
                    bg="gray.100"
                  />

                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    {progress}% complete
                  </Text>

                  {progress < 100 && (
                    <Text fontSize="xs" color="gray.400" textAlign="center">
                      This may take up to 2 minutes for complex conversations
                    </Text>
                  )}
                </>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            {error && (
              <HStack spacing={3}>
                <Button variant="outline" onClick={closeProgressModal}>
                  Close
                </Button>
                <Button colorScheme="red" onClick={handleDownload}>
                  Try Again
                </Button>
              </HStack>
            )}
            {progress === 100 && (
              <Button colorScheme="green" onClick={closeProgressModal}>
                Done
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PDFDownload;