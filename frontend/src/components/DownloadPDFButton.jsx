// Updated DownloadPDFButton.jsx - Handle both test and regular PDF generation
import React, { useState } from 'react';
import { Button, useToast } from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import api from '../services/api';

const DownloadPDFButton = ({ conversationId, conversationData, isTestMode = false }) => {
  console.log('DownloadPDFButton props:', { conversationId, conversationData, isTestMode });

  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();

  const handleDownloadPDF = async () => {
    setIsGenerating(true);

    try {
      let response;

      // Add detailed logging
      console.log('=== PDF Download Started ===');
      console.log('Test mode:', isTestMode);
      console.log('Conversation ID:', conversationId);
      console.log('Conversation data available:', !!conversationData);

      if (isTestMode) {
        // Test mode - GET request with no body
        console.log('Making test PDF request...');
        response = await api.get('/pdf/test', {
          responseType: 'blob', // Important: tell axios to handle binary data
          headers: {
            'Accept': 'application/pdf',
          }
        });
      } else {
        // Regular mode - POST request with conversation data
        if (!conversationId) {
          toast({
            title: 'Error',
            description: 'Conversation ID is missing',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        if (!conversationData) {
          toast({
            title: 'Error',
            description: 'Conversation data is missing',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        console.log('Making PDF generation request...');
        console.log('Conversation data sample:', {
          surgeon_name: conversationData.surgeon_name || conversationData.surgeonName,
          hospital_name: conversationData.hospital_name || conversationData.hospitalName,
          responses_count: conversationData.responses?.length || 0,
          notes_present: !!(conversationData.notes)
        });

        response = await api.post('/pdf/generate', {
          conversationId: conversationId,
          conversationData: conversationData
        }, {
          responseType: 'blob', // Important: tell axios to handle binary data
          headers: {
            'Accept': 'application/pdf',
          }
        });
      }

      console.log('PDF Response status:', response.status);
      console.log('Response headers:', response.headers);

      // With axios, successful responses are in response.data
      const blob = response.data;
      console.log('PDF blob created - Size:', blob.size, 'bytes, Type:', blob.type);

      if (blob.size === 0) {
        throw new Error('Received empty PDF file');
      }

      // Verify blob is actually PDF data
      if (blob.size < 100) {
        console.warn('PDF blob seems very small, might be an error response');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename
      let filename;
      if (isTestMode) {
        filename = `pathfinder-test-pdf-${new Date().toISOString().slice(0, 10)}.pdf`;
      } else {
        const surgeonName = conversationData?.surgeonName ||
                          conversationData?.surgeon_name ||
                          'surgeon';
        const dateStr = new Date().toISOString().split('T')[0];
        const cleanSurgeonName = surgeonName.replace(/[^a-zA-Z0-9-_]/g, '-');
        filename = `pathfinder-conversation-${cleanSurgeonName}-${dateStr}.pdf`;
      }

      link.download = filename;
      console.log('Download filename:', filename);

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ PDF download triggered successfully!');

      toast({
        title: 'PDF Downloaded',
        description: isTestMode ? 'Test PDF generated successfully' : 'Conversation summary has been downloaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      console.error('❌ PDF download error:', error);
      console.error('Error response:', error.response);

      let errorMessage = 'Failed to generate PDF. Please try again.';
      let errorTitle = 'Download Failed';

      // Handle axios errors
      if (error.response) {
        const status = error.response.status;
        console.log('Error status:', status);

        if (status === 404) {
          errorMessage = 'PDF service not found. Please contact support.';
          errorTitle = 'Service Not Found';
        } else if (status === 500) {
          errorMessage = 'Server error generating PDF. Please try again later.';
          errorTitle = 'Server Error';
        } else if (status === 408) {
          errorMessage = 'PDF generation is taking too long. Please try again.';
          errorTitle = 'Timeout Error';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
        errorTitle = 'Network Error';
      } else if (error.message.includes('Target closed')) {
        errorMessage = 'PDF generation service encountered an issue. Please try again.';
        errorTitle = 'Generation Error';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'PDF generation is taking too long. Please try again.';
        errorTitle = 'Timeout Error';
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
      console.log('=== PDF Download Process Completed ===');
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      leftIcon={<DownloadIcon />}
      colorScheme={isTestMode ? "blue" : "red"}
      onClick={handleDownloadPDF}
      fontSize={"xs"}
      isLoading={isGenerating}
      loadingText={isTestMode ? "Testing PDF..." : "Generating PDF..."}
      borderColor={isTestMode ? "blue.500" : "#eb1700"}
      color={isTestMode ? "blue.500" : "#eb1700"}
      _hover={{ bg: isTestMode ? "blue.500" : "#eb1700", color: "white" }}
      _disabled={{ opacity: 0.6, cursor: 'not-allowed' }}
      isDisabled={!isTestMode && !conversationId}
    >
      {isTestMode ? "Test PDF" : "Download PDF"}
    </Button>
  );
};

export default DownloadPDFButton;