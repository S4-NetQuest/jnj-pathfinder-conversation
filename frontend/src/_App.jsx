import React from 'react'
import { Box, Text } from '@chakra-ui/react'

function App() {
  return (
    <Box p={8} bg="jj.gray.50" minHeight="100vh">
      <Text fontSize="2xl" fontWeight="bold" color="jj.red" mb={4}>
        Pathfinder Conversation Guide
      </Text>
      <Text color="jj.gray.700">
        Application is loading successfully with Chakra UI and J&J theme!
      </Text>
    </Box>
  )
}

export default App