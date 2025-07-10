// frontend/src/components/DebugInfo.jsx
import React from 'react'
import { Box, Text, VStack, HStack, Badge, Code, Divider } from '@chakra-ui/react'
import config from '../config/config'

const DebugInfo = () => {
  // Only show in development
  if (config.isProduction) {
    return null
  }

  const envVars = {
    'VITE_NODE_ENV': import.meta.env.VITE_NODE_ENV,
    'VITE_API_URL': import.meta.env.VITE_API_URL,
    'VITE_APP_TITLE': import.meta.env.VITE_APP_TITLE,
    'VITE_BASE_URL': import.meta.env.VITE_BASE_URL,
    'NODE_ENV': import.meta.env.NODE_ENV,
    'MODE': import.meta.env.MODE,
    'DEV': import.meta.env.DEV,
    'PROD': import.meta.env.PROD
  }

  return (
    <Box 
      position="fixed" 
      bottom={4} 
      right={4} 
      bg="black" 
      color="white" 
      p={4} 
      borderRadius="md" 
      fontSize="xs"
      maxW="400px"
      zIndex={9999}
      opacity={0.9}
    >
      <VStack align="start" spacing={2}>
        <HStack>
          <Badge colorScheme="blue">DEBUG INFO</Badge>
          <Text fontWeight="bold">Environment Variables</Text>
        </HStack>
        
        <Divider />
        
        <VStack align="start" spacing={1}>
          <Text fontWeight="bold" color="yellow.300">Config Values:</Text>
          <Text>NODE_ENV: <Code colorScheme="blue">{config.NODE_ENV}</Code></Text>
          <Text>API_URL: <Code colorScheme="blue">{config.API_URL}</Code></Text>
          <Text>BASE_URL: <Code colorScheme="blue">{config.BASE_URL}</Code></Text>
          <Text>showDevFeatures: <Code colorScheme="blue">{config.showDevFeatures.toString()}</Code></Text>
        </VStack>
        
        <Divider />
        
        <VStack align="start" spacing={1}>
          <Text fontWeight="bold" color="green.300">Raw Environment:</Text>
          {Object.entries(envVars).map(([key, value]) => (
            <Text key={key}>
              {key}: <Code colorScheme="green">{value || 'undefined'}</Code>
            </Text>
          ))}
        </VStack>
      </VStack>
    </Box>
  )
}

export default DebugInfo