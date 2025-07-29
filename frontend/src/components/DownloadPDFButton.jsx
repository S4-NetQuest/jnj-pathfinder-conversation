import React, { useState } from 'react';
import { Button, useToast } from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';

const DownloadPDFButton = ({ conversationId, conversationData }) => {
  console.log('DownloadPDFButton props:', { conversationId, conversationData });

  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();

  const handleDownloadPDF = async () => {
    // Validate required props
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

    setIsGenerating(true);

    try {
      // Send conversation data to PDF endpoint
      const apiUrl = `/api/pdf/test`;
      console.log('Requesting PDF from:', apiUrl);
      console.log('Sending conversation data:', conversationData);

      const response = await fetch(apiUrl, {
        method: 'GET',
        credentials: 'include', // Include cookies for session-based auth
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf',
          // Use Authorization header if you have JWT tokens
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          conversationId: conversationId,
          conversationData: conversationData
        })
      });

      console.log('PDF Response status:', response.status);
      console.log('PDF Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('PDF generation failed:', errorText);
        throw new Error(`Failed to generate PDF: ${response.status} ${response.statusText}`);
      }

      // Check if response is actually a PDF
      const contentType = response.headers.get('content-type');
      console.log('Response content-type:', contentType);

      if (!contentType || !contentType.includes('application/pdf')) {
        console.error('Response is not a PDF:', contentType);
        const responseText = await response.text();
        console.error('Response body:', responseText.substring(0, 500));
        throw new Error('Server did not return a PDF file');
      }

      // Create blob and download
      const blob = await response.blob();
      console.log('PDF blob size:', blob.size, 'bytes');
      console.log('PDF blob type:', blob.type);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename - handle different possible property names
      const surgeonName = conversationData?.surgeonName ||
                         conversationData?.surgeon_name ||
                         conversationData?.name ||
                         'summary';

      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `pathfinder-conversation-${surgeonName.replace(/\s+/g, '-')}-${dateStr}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'PDF Downloaded',
        description: 'Conversation summary has been downloaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      console.error('PDF download error:', error);

      let errorMessage = 'Failed to generate PDF. Please try again.';

      // Provide more specific error messages
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
      colorScheme="red"
      onClick={handleDownloadPDF}
      isLoading={isGenerating}
      loadingText="Generating PDF..."
      borderColor="#eb1700"
      color="#eb1700"
      _hover={{ bg: "#eb1700", color: "white" }}
      _disabled={{ opacity: 0.6, cursor: 'not-allowed' }}
      isDisabled={!conversationId}
    >
      Download PDF
    </Button>
  );
};

export default DownloadPDFButton;