// Updated DownloadPDFButton.jsx - Handle both test and regular PDF generation
import React, { useState } from 'react';
import { Button, useToast } from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';

const DownloadPDFButton = ({ conversationId, conversationData, isTestMode = false }) => {
  console.log('DownloadPDFButton props:', { conversationId, conversationData, isTestMode });

  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();

  const handleDownloadPDF = async () => {
    setIsGenerating(true);

    try {
      let response;

      if (isTestMode) {
        // Test mode - GET request with no body
        response = await fetch('/api/pdf/test', {
          method: 'GET',
          credentials: 'include',
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

        response = await fetch('/api/pdf/generate', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/pdf',
          },
          body: JSON.stringify({
            conversationId: conversationId,
            conversationData: conversationData
          })
        });
      }

      console.log('PDF Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('PDF generation failed:', errorText);
        throw new Error(`Failed to generate PDF: ${response.status} ${response.statusText}`);
      }

      // Check if response is actually a PDF
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        console.error('Response is not a PDF:', contentType);
        throw new Error('Server did not return a PDF file');
      }

      // Create blob and download
      const blob = await response.blob();
      console.log('PDF blob size:', blob.size, 'bytes');

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename
      let filename;
      if (isTestMode) {
        filename = `test-pdf-${new Date().toISOString().slice(0, 10)}.pdf`;
      } else {
        const surgeonName = conversationData?.surgeonName ||
                           conversationData?.surgeon_name ||
                           'summary';
        const dateStr = new Date().toISOString().split('T')[0];
        filename = `pathfinder-conversation-${surgeonName.replace(/\s+/g, '-')}-${dateStr}.pdf`;
      }

      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'PDF Downloaded',
        description: isTestMode ? 'Test PDF generated successfully' : 'Conversation summary has been downloaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      console.error('PDF download error:', error);

      let errorMessage = 'Failed to generate PDF. Please try again.';
      if (error.message.includes('404')) {
        errorMessage = 'PDF service not found. Please contact support.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error generating PDF. Please try again later.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection.';
      }

      toast({
        title: 'Download Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      leftIcon={<DownloadIcon />}
      colorScheme={isTestMode ? "blue" : "red"}
      onClick={handleDownloadPDF}
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