import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  Flex,
  Button,
  Tooltip,
  IconButton
} from '@chakra-ui/react'
import {
  ArrowBackIcon
} from '@chakra-ui/icons'

import ReferencesContent from '../components/ReferencesContent'

const References = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [fromComparePhilosophies, setFromComparePhilosophies] = useState(false)
  const [initialCategory, setInitialCategory] = useState('all')

  // Check for URL parameters on component mount
  useEffect(() => {
    const philosophyParam = searchParams.get('philosophy')
    console.log('Philosophy param from URL:', philosophyParam)

    if (philosophyParam) {
      // Map the URL param value to the expected category value format
      let mappedCategory = philosophyParam

      // Convert lowercase param to expected format if needed
      if (philosophyParam === 'ka') {
        mappedCategory = 'KA'
      } else if (philosophyParam === 'ma') {
        mappedCategory = 'MA'
      } else if (philosophyParam === 'ika') {
        mappedCategory = 'iKA'
      } else if (philosophyParam === 'fa') {
        mappedCategory = 'FA'
      }

      console.log('Setting category to:', mappedCategory)
      setInitialCategory(mappedCategory)
      setFromComparePhilosophies(true)
    }
  }, [searchParams])

  const handleGoBack = () => {
    if (fromComparePhilosophies) {
      navigate('/compare-philosophies')
    } else {
      navigate(-1)
    }
  }

  return (
    <Box bg="gray.50" minH="100vh" pt="20px" pb="100px">
      <Container maxW="container.xl" py={4}>
        {/* Back Navigation (Top) */}
        <Flex direction="row" alignItems="top" justifyContent="space-between" width="100%" mb={6}>
          {fromComparePhilosophies && (
            <Tooltip label="Go Back" placement="right">
              <IconButton
                icon={<ArrowBackIcon />}
                onClick={handleGoBack}
                colorScheme="red"
                variant="outline"
                size="md"
                aria-label="Go back"
              />
            </Tooltip>
          )}

          {/* Empty spacer for visual balance */}
          <Box flex="1" />
          <Box width={{ base: '0', md: '40px' }} />
        </Flex>

        {/* References Content Component */}
        <ReferencesContent
          initialCategory={initialCategory}
          showFilters={true}
          showHeader={true}
        />

        {/* Back Navigation (Bottom) */}
        <Flex justifyContent="center" mt={6}>
          <Button
            leftIcon={<ArrowBackIcon />}
            colorScheme="red"
            variant="outline"
            onClick={handleGoBack}
          >
            {fromComparePhilosophies ? 'Return to Compare Philosophies' : 'Go Back'}
          </Button>
        </Flex>
      </Container>
    </Box>
  )
}

export default References