// frontend/src/components/PDFDebug.jsx
// Use this component to debug what data is being sent to PDF generation
import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Code,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Textarea,
  useToast
} from '@chakra-ui/react';
import api from '../services/api';

const PDFDebug = ({ conversationData }) => {
  const [debugResult, setDebugResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const debugPDFData = async () => {
    setIsLoading(true);
    try {
      console.log('Sending debug data:', conversationData);

      const response = await api.post('/pdf/debug-data', {
        conversationData
      });

      setDebugResult(response.data);
      console.log('Debug response:', response.data);

      toast({
        title: 'Debug Complete',
        description: 'Check console and debug info below',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Debug error:', error);
      toast({
        title: 'Debug Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testScoresHTML = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/pdf/test-scores-html`);
      const html = await response.text();

      // Open in new window to see the HTML
      const newWindow = window.open();
      newWindow.document.write(html);
      newWindow.document.close();

      toast({
        title: 'Test HTML Generated',
        description: 'Check the new window to see score rendering',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Test HTML error:', error);
      toast({
        title: 'Test Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={6} border="1px solid" borderColor="orange.200" borderRadius="md" bg="orange.50">
      <VStack spacing={4} align="stretch">
        <Heading size="md" color="orange.700">PDF Data Debug Tool</Heading>

        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>Debug Information</AlertTitle>
            <AlertDescription>
              Use this tool to debug what data is being sent to PDF generation and identify score issues.
            </AlertDescription>
          </Box>
        </Alert>

        {/* Current Data Display */}
        <Box>
          <Text fontWeight="bold" mb={2}>Current Conversation Data:</Text>
          <Box bg="gray.100" p={3} borderRadius="md" maxH="200px" overflowY="auto">
            <Code fontSize="xs" whiteSpace="pre-wrap">
              {JSON.stringify(conversationData, null, 2)}
            </Code>
          </Box>
        </Box>

        {/* Quick Score Check */}
        <Box bg="white" p={3} borderRadius="md" border="1px solid" borderColor="gray.200">
          <Text fontWeight="bold" mb={2}>Quick Score Analysis:</Text>
          <VStack align="start" spacing={1} fontSize="sm">
            <Text>Scores exist: {conversationData?.scores ? '✅ Yes' : '❌ No'}</Text>
            <Text>Scores type: {typeof conversationData?.scores}</Text>
            <Text>Score keys: {conversationData?.scores ? Object.keys(conversationData.scores).length : 0}</Text>
            <Text>Score values: {conversationData?.scores ? Object.values(conversationData.scores).join(', ') : 'None'}</Text>
          </VStack>
        </Box>

        {/* Debug Actions */}
        <HStack spacing={3}>
          <Button
            colorScheme="orange"
            onClick={debugPDFData}
            isLoading={isLoading}
            loadingText="Debugging..."
          >
            Debug PDF Data
          </Button>

          <Button
            colorScheme="blue"
            variant="outline"
            onClick={testScoresHTML}
          >
            Test Score HTML
          </Button>
        </HStack>

        {/* Debug Results */}
        {debugResult && (
          <Box>
            <Text fontWeight="bold" mb={2}>Debug Results:</Text>
            <Box bg="gray.100" p={3} borderRadius="md" maxH="300px" overflowY="auto">
              <Code fontSize="xs" whiteSpace="pre-wrap">
                {JSON.stringify(debugResult.debugInfo, null, 2)}
              </Code>
            </Box>

            {/* Score-specific warnings */}
            {!debugResult.debugInfo.scores.exists && (
              <Alert status="error" mt={2}>
                <AlertIcon />
                <AlertTitle>No Scores Found!</AlertTitle>
                <AlertDescription>
                  The conversation data doesn't contain a scores object. This is why the score breakdown is missing from the PDF.
                </AlertDescription>
              </Alert>
            )}

            {debugResult.debugInfo.scores.exists && debugResult.debugInfo.scores.isEmpty && (
              <Alert status="warning" mt={2}>
                <AlertIcon />
                <AlertTitle>Empty Scores Object!</AlertTitle>
                <AlertDescription>
                  The scores object exists but is empty. Check how scores are being calculated and stored.
                </AlertDescription>
              </Alert>
            )}
          </Box>
        )}

        {/* Instructions */}
        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>How to Use:</AlertTitle>
            <AlertDescription>
              <VStack align="start" spacing={1} mt={2} fontSize="sm">
                <Text>1. Click "Debug PDF Data" to see what data is being sent to the backend</Text>
                <Text>2. Click "Test Score HTML" to see if score rendering works with sample data</Text>
                <Text>3. Check the console logs for detailed information</Text>
                <Text>4. If scores are missing, check how they're calculated in your conversation logic</Text>
              </VStack>
            </AlertDescription>
          </Box>
        </Alert>

      </VStack>
    </Box>
  );
};

export default PDFDebug;