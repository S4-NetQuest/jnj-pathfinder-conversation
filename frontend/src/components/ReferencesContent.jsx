// frontend/src/components/ReferencesContent.jsx
import React, { useState, useMemo, useEffect } from 'react'
import {
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
  Collapse,
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
  ExternalLinkIcon
} from '@chakra-ui/icons'

import { referencesData } from '../data/referencesData'
import roboticsIcon from '../assets/icons/JJMT_Icon_Robotics_RGB.svg'
import { getPhilosophyColor, getPhilosophyVariant } from '../theme/theme'

const ReferencesContent = ({
  initialCategory = 'all',
  initialReferenceNumber = null,
  showFilters = true,
  showHeader = true
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedSubcategory, setSelectedSubcategory] = useState('all')
  const [selectedStudyType, setSelectedStudyType] = useState('all')
  const [selectedTechnology, setSelectedTechnology] = useState('all')
  const [selectedFollowUp, setSelectedFollowUp] = useState('all')
  const [sortBy, setSortBy] = useState('year-desc')
  const [isFiltersVisible, setIsFiltersVisible] = useState(true)

  // Custom toggle function that works reliably
  const toggleFilters = () => {
    setIsFiltersVisible(!isFiltersVisible)
  }

  // Handle initial category prop
  useEffect(() => {
    if (initialCategory !== 'all') {
      setSelectedCategory(initialCategory)
    }
  }, [initialCategory])

  // Filter and sort papers
  const filteredAndSortedPapers = useMemo(() => {
    let filtered = referencesData.papers.filter(paper => {
      const matchesSearch = searchTerm === '' ||
        paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
        paper.summary.toLowerCase().includes(searchTerm.toLowerCase())

      // Check if category matches (case insensitive)
      const matchesCategory = selectedCategory === 'all' ||
        paper.category.toLowerCase() === selectedCategory.toLowerCase()

      const matchesSubcategory = selectedSubcategory === 'all' || paper.subcategory === selectedSubcategory
      const matchesStudyType = selectedStudyType === 'all' || paper.studyType === selectedStudyType
      const matchesTechnology = selectedTechnology === 'all' || paper.technology === selectedTechnology
      const matchesFollowUp = selectedFollowUp === 'all' || paper.followUp === selectedFollowUp

      // If filtering by reference number, only show that specific reference
      if (initialReferenceNumber) {
        return paper.referenceNumber === initialReferenceNumber
      }

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

    return filtered
  }, [searchTerm, selectedCategory, selectedSubcategory, selectedStudyType, selectedTechnology, selectedFollowUp, sortBy, initialReferenceNumber])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedSubcategory('all')
    setSelectedStudyType('all')
    setSelectedTechnology('all')
    setSelectedFollowUp('all')
  }

  const getPdfUrl = (filename) => {
    // Return empty if no filename
    if (!filename) return ''

    const mode = import.meta.env.MODE
    const baseUrl = import.meta.env.VITE_BASE_URL || import.meta.env.BASE_URL || '/'

    // In development, use simple path
    if (mode === 'development') {
      return `/reference-papers/${filename}`
    }

    // For staging/production, construct the full path with base URL
    let cleanBase = baseUrl
    if (cleanBase.endsWith('/')) {
      cleanBase = cleanBase.slice(0, -1)
    }

    const fullPath = `${cleanBase}/reference-papers/${filename}`
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
    <VStack spacing={6} align="stretch">
      {/* Header */}
      {showHeader && (
        <Box textAlign="center">
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
      )}

      {/* Filter Card */}
      {showFilters && (
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
      )}

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
                    {paper.filename ? (
                      <>
                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
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
                      </>
                    ) : (
                      <Badge colorScheme="gray" fontSize="xs">
                        PDF Not Available
                      </Badge>
                    )}
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
    </VStack>
  )
}

export default ReferencesContent