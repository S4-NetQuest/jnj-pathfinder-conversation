import React, { useState, useMemo } from 'react'
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
  CardHeader,
  Flex,
  Wrap,
  WrapItem,
  Icon,
  Collapse,
  useDisclosure,
  IconButton,
  Select,
  InputGroup,
  InputLeftElement,
  useBreakpointValue,
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
  InfoIcon
} from '@chakra-ui/icons'

import { referencesData, getStudyTypeColor, getTechnologyIcon } from '../data/referencesData'  // Adjust the path as necessary

const References = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSubcategory, setSelectedSubcategory] = useState('all')
  const [selectedStudyType, setSelectedStudyType] = useState('all')
  const [selectedTechnology, setSelectedTechnology] = useState('all')
  const [selectedFollowUp, setSelectedFollowUp] = useState('all')
  const [sortBy, setSortBy] = useState('year-desc')
  const { isOpen: isFiltersOpen, onToggle: onFiltersToggle } = useDisclosure({ defaultIsOpen: false })

  const isMobile = useBreakpointValue({ base: true, md: false })

  // Filter and sort papers
  const filteredAndSortedPapers = useMemo(() => {
    let filtered = referencesData.papers.filter(paper => {
      const matchesSearch = searchTerm === '' ||
        paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
        paper.summary.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === 'all' || paper.category === selectedCategory
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

  return (
    <Box bg="gray.50" minH="100vh" pt="20px" pb="100px">
      <Container maxW="container.xl" py={4}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box textAlign="center" px={4}>
            <Text
              fontSize={{ base: '28px', md: '36px' }}
              fontFamily="heading"
              fontWeight="bold"
              color="#eb1700"
              mb={2}
              lineHeight="1.2"
            >
              References & Citations
            </Text>
            <Text color="gray.600" fontSize={{ base: 'md', md: 'lg' }}>
              Comprehensive collection of kinematic alignment research
            </Text>
            <HStack justify="center" mt={3} spacing={4}>
              <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                {referencesData.metadata.totalPapers} Papers
              </Badge>
              <Badge colorScheme="green" fontSize="sm" px={3} py={1}>
                10 iKA Studies
              </Badge>
              <Badge colorScheme="orange" fontSize="sm" px={3} py={1}>
                17 KA Studies
              </Badge>
            </HStack>
          </Box>

          {/* Search and Filter Bar */}
          <Card>
            <CardBody>
              <VStack spacing={4}>
                {/* Search */}
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search by title, author, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    bg="white"
                    focusBorderColor="#eb1700"
                  />
                </InputGroup>

                {/* Filter Toggle */}
                <HStack w="full" justify="space-between">
                  <Button
                    leftIcon={isFiltersOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    onClick={onFiltersToggle}
                    variant="outline"
                    colorScheme="gray"
                    size="sm"
                  >
                    {isFiltersOpen ? 'Hide Filters' : 'Show Filters'}
                  </Button>

                  <HStack spacing={2}>
                    <Text fontSize="sm" color="gray.600">
                      {filteredAndSortedPapers.length} of {referencesData.metadata.totalPapers} papers
                    </Text>
                    <Button size="sm" variant="ghost" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </HStack>
                </HStack>

                {/* Expandable Filters */}
                <Collapse in={isFiltersOpen} animateOpacity>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} w="full">
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Category</Text>
                      <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        size="sm"
                      >
                        <option value="all">All Categories</option>
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
                        <option value="all">All Periods</option>
                        {referencesData.filterOptions.followUpPeriods.map(period => (
                          <option key={period} value={period}>{period}</option>
                        ))}
                      </Select>
                    </Box>

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
                            fontWeight="bold"
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

                        <VStack align="end" spacing={1}>
                          <Badge
                            colorScheme={paper.category === 'iKA' ? 'blue' : 'orange'}
                            fontSize="xs"
                            px={2}
                            py={1}
                          >
                            {paper.category}
                          </Badge>
                          <Badge
                            colorScheme={getStudyTypeColor(paper.studyType)}
                            variant="outline"
                            fontSize="xs"
                          >
                            {paper.studyType}
                          </Badge>
                        </VStack>
                      </Flex>

                      {/* Summary */}
                      <Text color="gray.700" fontSize="sm" lineHeight="1.5">
                        {paper.summary}
                      </Text>

                      {/* Tags Row */}
                      <Wrap spacing={2}>
                        <WrapItem>
                          <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                            📊 {paper.subcategory}
                          </Badge>
                        </WrapItem>
                        <WrapItem>
                          <Badge colorScheme="gray" variant="subtle" fontSize="xs">
                            {getTechnologyIcon(paper.technology)} {paper.technology}
                          </Badge>
                        </WrapItem>
                        <WrapItem>
                          <Badge colorScheme="cyan" variant="subtle" fontSize="xs">
                            ⏱️ {paper.followUp}
                          </Badge>
                        </WrapItem>
                        {paper.outcomes.slice(0, 2).map(outcome => (
                          <WrapItem key={outcome}>
                            <Badge colorScheme="green" variant="subtle" fontSize="xs">
                              📈 {outcome}
                            </Badge>
                          </WrapItem>
                        ))}
                        {paper.outcomes.length > 2 && (
                          <WrapItem>
                            <Tooltip label={paper.outcomes.slice(2).join(", ")}>
                              <Badge colorScheme="green" variant="subtle" fontSize="xs">
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
                          {paper.filename}
                        </Text>

                        <HStack spacing={2}>
                          <Tooltip label="View PDF">
                            <IconButton
                              as={Link}
                              href={paper.url}
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
                              href={paper.url}
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
        </VStack>
      </Container>
    </Box>
  )
}

export default References