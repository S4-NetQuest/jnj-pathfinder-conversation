import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Container,
  VStack,
  HStack,
  Text,
  Box,
  Button,
  Input,
  Badge,
  Card,
  CardBody,
  Flex,
  Wrap,
  WrapItem,
  Icon,
  Collapse,
  useDisclosure,
  Image,
  IconButton,
  Select,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Divider,
  Link,
  Tooltip
} from '@chakra-ui/react'
import {
  SearchIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DownloadIcon,
  ExternalLinkIcon,
  ArrowBackIcon
} from '@chakra-ui/icons'

import { referencesData } from '../data/referencesData'  // Adjust the path as necessary
import roboticsIcon from '../assets/icons/JJMT_Icon_Robotics_RGB.svg'  // Adjust the path as necessary
import { getPhilosophyColor, getPhilosophyVariant } from '../theme/theme'

const References = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSubcategory, setSelectedSubcategory] = useState('all')
  const [selectedStudyType, setSelectedStudyType] = useState('all')
  const [selectedTechnology, setSelectedTechnology] = useState('all')
  const [selectedFollowUp, setSelectedFollowUp] = useState('all')
  const [sortBy, setSortBy] = useState('year-desc')

  // FIX: Replace useDisclosure with manual state for filter visibility
  // This gives us full control over the toggle behavior
  const [isFiltersVisible, setIsFiltersVisible] = useState(true)
  const [fromComparePhilosophies, setFromComparePhilosophies] = useState(false)

  // Custom toggle function that works reliably
  const toggleFilters = () => {
    setIsFiltersVisible(!isFiltersVisible);
  }

  // Check for URL parameters on component mount
  useEffect(() => {
    const philosophyParam = searchParams.get('philosophy')
    console.log('Philosophy param from URL:', philosophyParam)

    if (philosophyParam) {
      // Map the URL param value to the expected category value format
      let mappedCategory = philosophyParam;

      // Convert lowercase param to expected format if needed
      if (philosophyParam === 'ka') {
        mappedCategory = 'KA';
      } else if (philosophyParam === 'ma') {
        mappedCategory = 'MA';
      } else if (philosophyParam === 'ika') {
        mappedCategory = 'iKA';
      } else if (philosophyParam === 'fa') {
        mappedCategory = 'FA';
      }

      console.log('Setting category to:', mappedCategory);
      setSelectedCategory(mappedCategory);
      setFromComparePhilosophies(true);

      // IMPORTANT: Don't force toggles here, just set the state directly
      setIsFiltersVisible(true);
    }
  }, [searchParams]);

  // Filter and sort papers
  const filteredAndSortedPapers = useMemo(() => {
    console.log('Filtering with category:', selectedCategory);

    let filtered = referencesData.papers.filter(paper => {
      const matchesSearch = searchTerm === '' ||
        paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
        paper.summary.toLowerCase().includes(searchTerm.toLowerCase())

      // Check if category matches (case insensitive)
      const matchesCategory = selectedCategory === 'all' ||
        paper.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSubcategory = selectedSubcategory === 'all' || paper.subcategory === selectedSubcategory
      const matchesStudyType = selectedStudyType === 'all' || paper.studyType === selectedStudyType
      const matchesTechnology = selectedTechnology === 'all' || paper.technology === selectedTechnology
      const matchesFollowUp = selectedFollowUp === 'all' || paper.followUp === selectedFollowUp

      return matchesSearch && matchesCategory && matchesSubcategory &&
             matchesStudyType && matchesTechnology && matchesFollowUp
    })

    // Sort papers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'year-desc': return b.year - a.year
        case 'year-asc': return a.year - b.year
        case 'title': return a.title.localeCompare(b.title)
        case 'author': return a.authors[0].localeCompare(b.authors[0])
        default: return 0
      }
    })

    console.log('Filtered papers count:', filtered.length);
    return filtered
  }, [searchTerm, selectedCategory, selectedSubcategory, selectedStudyType, selectedTechnology, selectedFollowUp, sortBy])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedSubcategory('all')
    setSelectedStudyType('all')
    setSelectedTechnology('all')
    setSelectedFollowUp('all')
  }

  const handleGoBack = () => {
    if (fromComparePhilosophies) {
      navigate('/compare-philosophies')
    } else {
      navigate(-1)
    }
  }

  const getPdfUrl = (filename) => {
    const mode = import.meta.env.MODE

    // Use explicit environment variable as primary source, fallback to Vite's BASE_URL
    const baseUrl = import.meta.env.VITE_BASE_URL || import.meta.env.BASE_URL || '/'

    /*
    console.log('Mode:', mode)
    console.log('VITE_BASE_URL:', import.meta.env.VITE_BASE_URL)
    console.log('BASE_URL:', import.meta.env.BASE_URL)
    console.log('Using baseUrl:', baseUrl)
    */

    // In development, use simple path
    if (mode === 'development') {
      return `/reference-papers/${filename}`
    }

    // For staging/production, construct the full path with base URL
    let cleanBase = baseUrl
    if (cleanBase.endsWith('/')) {
      cleanBase = cleanBase.slice(0, -1)
    }

    // Construct the full path
    const fullPath = `${cleanBase}/reference-papers/${filename}`

    console.log('PDF URL constructed:', fullPath)

    return fullPath
  }

  // Get philosophy name for header if filtered
  const getFilteredPhilosophyName = () => {
    switch(selectedCategory.toLowerCase()) {
      case 'ma': return 'Mechanical Alignment'
      case 'ika': return 'Inverse Kinematic Alignment'
      case 'ka': return 'Kinematic Alignment'
      case 'fa': return 'Functional Alignment'
      default: return null
    }
  }

  const filteredPhilosophyName = getFilteredPhilosophyName()

  return (
    <Box bg="gray.50" minH="100vh" pt="20px" pb="100px">
      <Container maxW="container.xl" py={4}>
        <VStack spacing={6} align="stretch">

        {/* Back Navigation */}
          <Flex direction="row" alignItems="top" justifyContent="space-between" width="100%">
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

            {/* Header */}
            <Box textAlign="center" flex="1">
              <Text
                fontSize={{ base: '24px', md: '32px' }}
                fontFamily="heading"
                color="jj.red"
                mb={2}
                lineHeight="1.2"
              >
                Clinical References Library
              </Text>

              {filteredPhilosophyName ? (
                <HStack justify="center" spacing={2}>
                  <Badge
                    colorScheme={getPhilosophyColor(selectedCategory)}
                    variant={getPhilosophyVariant(selectedCategory)}
                    fontSize="md"
                    py={1}
                    px={2}
                    borderRadius="md"
                  >
                    {selectedCategory}
                  </Badge>
                  <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
                    {filteredPhilosophyName} Research Papers
                  </Text>
                </HStack>
              ) : (
                <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
                  Evidence-based resources for surgeons and sales teams
                </Text>
              )}
            </Box>

            {/* Empty box for visual balance */}
            <Box width={{ base: '0', md: '40px' }} />
          </Flex>

          {/* Filter Card */}
          <Card>
            <CardBody py={4}>
              <VStack spacing={4} align="stretch">
                <Flex
                  justify="space-between"
                  align="center"
                  wrap="wrap"
                  gap={3}
                >
                  {/* Search */}
                  <InputGroup maxW={{ base: "100%", md: "400px" }} size="md">
                    <InputLeftElement pointerEvents='none'>
                      <SearchIcon color='gray.300' />
                    </InputLeftElement>
                    <Input
                      placeholder="Search by title, author, or keyword..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>

                  <HStack spacing={2}>
                    {/* Clear button conditionally shown if any filters are active */}
                    {(searchTerm || selectedCategory !== 'all' || selectedSubcategory !== 'all' ||
                     selectedStudyType !== 'all' || selectedTechnology !== 'all' || selectedFollowUp !== 'all') && (
                      <Button
                        size="md"
                        variant="ghost"
                        onClick={clearFilters}
                      >
                        Clear
                      </Button>
                    )}

                    {/* Toggle Filters */}
                    <Button
                      rightIcon={isFiltersVisible ? <ChevronUpIcon /> : <ChevronDownIcon />}
                      onClick={toggleFilters}
                      variant="outline"
                    >
                      {isFiltersVisible ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                  </HStack>
                </Flex>

                <Collapse in={isFiltersVisible} animateOpacity>
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={4} pt={2}>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Philosophy</Text>
                      <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        size="sm"
                      >
                        <option value="all">All Philosophies</option>
                        {referencesData.filterOptions.categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </Select>
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Study Type</Text>
                      <Select
                        value={selectedStudyType}
                        onChange={(e) => setSelectedStudyType(e.target.value)}
                        size="sm"
                      >
                        <option value="all">All Study Types</option>
                        {referencesData.filterOptions.studyTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </Select>
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Technology</Text>
                      <Select
                        value={selectedTechnology}
                        onChange={(e) => setSelectedTechnology(e.target.value)}
                        size="sm"
                      >
                        <option value="all">All Technologies</option>
                        {referencesData.filterOptions.technologies.map(tech => (
                          <option key={tech} value={tech}>{tech}</option>
                        ))}
                      </Select>
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Follow-up Period</Text>
                      <Select
                        value={selectedFollowUp}
                        onChange={(e) => setSelectedFollowUp(e.target.value)}
                        size="sm"
                      >
                        <option value="all">All Follow-up Periods</option>
                        {referencesData.filterOptions.followUpPeriods.map(period => (
                          <option key={period} value={period}>{period}</option>
                        ))}
                      </Select>
                    </Box>

                    {/* Subcategory Filter - hidden for now
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Subcategory</Text>
                      <Select
                        value={selectedSubcategory}
                        onChange={(e) => setSelectedSubcategory(e.target.value)}
                        size="sm"
                      >
                        <option value="all">All Subcategories</option>
                        {referencesData.filterOptions.subcategories.map(subcat => (
                          <option key={subcat} value={subcat}>{subcat}</option>
                        ))}
                      </Select>
                    </Box> */}

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Sort By</Text>
                      <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        size="sm"
                      >
                        <option value="year-desc">Year (Newest)</option>
                        <option value="year-asc">Year (Oldest)</option>
                        <option value="title">Title (A-Z)</option>
                        <option value="author">Author (A-Z)</option>
                      </Select>
                    </Box>
                  </SimpleGrid>
                </Collapse>
              </VStack>
            </CardBody>
          </Card>

          {/* Results */}
          <VStack spacing={4} align="stretch">
            {filteredAndSortedPapers.length === 0 ? (
              <Card>
                <CardBody textAlign="center" py={12}>
                  <Text fontSize="lg" color="gray.500" mb={2}>
                    No papers match your current filters
                  </Text>
                  <Text color="gray.400" mb={4}>
                    Try adjusting your search criteria or clearing filters
                  </Text>
                  <Button onClick={clearFilters} colorScheme="red" variant="outline">
                    Clear All Filters
                  </Button>
                </CardBody>
              </Card>
            ) : (
              filteredAndSortedPapers.map((paper) => (
                <Card key={paper.id} shadow="md" _hover={{ shadow: "lg" }} transition="all 0.2s">
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      {/* Header Row */}
                      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={2}>
                        <Box flex="1" minW="0">
                          <Text
                            fontSize={{ base: "lg", md: "xl" }}
                            color="gray.800"
                            lineHeight="1.3"
                            mb={1}
                          >
                            {paper.title}
                          </Text>
                          <Text color="gray.600" fontSize="md">
                            {paper.authors.join(", ")} ({paper.year})
                          </Text>
                        </Box>

                        <HStack align="end" spacing={1}>
                          <Badge
                            /* colorScheme={paper.category === 'iKA' ? 'blue' : 'orange'} */
                            variant={getPhilosophyVariant(paper.category)}
                              color="white"
                              px={2}
                              py={1}
                              borderRadius="md"
                              fontSize="xs"
                              fontWeight={500}
                              userSelect={'none'}
                          >
                            {paper.category}
                          </Badge>
                          {paper.technology === 'Robotic' ? (
                            <Tooltip label="Robotics Technology" fontSize="md">
                              <Image
                                src={roboticsIcon}
                                alt="Robotics Icon"
                                boxSize="24px"
                                objectFit="contain"
                                ml={2}
                              />
                            </Tooltip>
                          ) : null}
                        </HStack>
                      </Flex>

                      {/* Summary */}
                      <Text color="gray.700" fontSize="sm" lineHeight="1.5">
                        {paper.summary}
                      </Text>

                      {/* Tags Row */}
                      <Wrap spacing={2}>
                        <WrapItem>
                          <Badge colorScheme="purple" variant="subtle" fontWeight={"500"} fontSize="xs" userSelect="none">
                            {paper.subcategory}
                          </Badge>
                        </WrapItem>
                        <WrapItem>
                          <Badge colorScheme="gray" variant="subtle" fontWeight={"500"} fontSize="xs" userSelect="none">
                            {paper.technology}
                          </Badge>
                        </WrapItem>
                        <WrapItem>
                          <Badge colorScheme="cyan" variant="subtle" fontWeight={"500"} fontSize="xs" userSelect="none">
                            {paper.followUp}
                          </Badge>
                        </WrapItem>
                        {paper.outcomes.slice(0, 2).map(outcome => (
                          <WrapItem key={outcome}>
                            <Badge colorScheme="green" variant="subtle" fontWeight={"500"} fontSize="xs" userSelect="none">
                              {outcome}
                            </Badge>
                          </WrapItem>
                        ))}
                        {paper.outcomes.length > 2 && (
                          <WrapItem>
                            <Tooltip label={paper.outcomes.slice(2).join(", ")}>
                              <Badge colorScheme="green" variant="subtle" fontWeight={"500"} fontSize="xs">
                                +{paper.outcomes.length - 2} more
                              </Badge>
                            </Tooltip>
                          </WrapItem>
                        )}
                      </Wrap>

                      <Divider />

                      {/* Action Row */}
                      <Flex justify="space-between" align="center">
                        <Text fontSize="xs" color="gray.500">
                          {getPdfUrl(paper.filename)}
                        </Text>

                        <HStack spacing={2}>
                          <Tooltip label="View PDF">
                            <IconButton
                              as={Link}
                              href={getPdfUrl(paper.filename)}
                              target="_blank"
                              rel="noopener noreferrer"
                              icon={<ExternalLinkIcon />}
                              size="sm"
                              variant="outline"
                              colorScheme="red"
                              aria-label="View PDF"
                            />
                          </Tooltip>

                          <Tooltip label="Download PDF">
                            <IconButton
                              as={Link}
                              href={getPdfUrl(paper.filename)}
                              download
                              icon={<DownloadIcon />}
                              size="sm"
                              variant="solid"
                              colorScheme="red"
                              aria-label="Download PDF"
                            />
                          </Tooltip>
                        </HStack>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>
              ))
            )}
          </VStack>

          {/* Footer Statistics */}
          {filteredAndSortedPapers.length > 0 && (
            <Card bg="gray.100">
              <CardBody>
                <Text textAlign="center" fontSize="sm" color="gray.600">
                  Showing {filteredAndSortedPapers.length} of {referencesData.metadata.totalPapers} papers
                  {searchTerm && ` matching "${searchTerm}"`}
                </Text>
              </CardBody>
            </Card>
          )}

          {/* Back Navigation (Bottom) */}
          <Flex justifyContent="center" mt={4}>
            <Button
              leftIcon={<ArrowBackIcon />}
              colorScheme="red"
              variant="outline"
              onClick={handleGoBack}
            >
              Return to Compare Philosophies
            </Button>
          </Flex>
        </VStack>
      </Container>
    </Box>
  )
}

export default References