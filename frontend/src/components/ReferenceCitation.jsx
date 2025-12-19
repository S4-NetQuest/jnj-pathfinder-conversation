// frontend/src/components/ReferenceCitation.jsx
import React from 'react'
import { Box } from '@chakra-ui/react'

/**
 * ReferenceCitation Component
 *
 * A clickable reference citation that displays reference numbers
 * and triggers a callback when clicked (typically to open a reference modal)
 *
 * @param {number} referenceNumber - The reference number to display (e.g., 1, 2, 3)
 * @param {function} onClick - Callback function when citation is clicked
 * @param {string} variant - Visual variant: 'badge', 'superscript', 'tooltip', 'inline'
 */
const ReferenceCitation = ({
  referenceNumber,
  onClick,
  variant = 'superscript'
}) => {
  const handleClick = (e) => {
    e.stopPropagation()
    if (onClick) {
      onClick(referenceNumber)
    }
  }

  // Badge style - Blue badge (original default)
  const badgeStyle = {
    display: "inline-block",
    cursor: "pointer",
    color: "blue.600",
    fontWeight: "600",
    fontSize: "xs",
    mx: "2px",
    px: "4px",
    py: "1px",
    borderRadius: "sm",
    border: "1px solid",
    borderColor: "blue.400",
    bg: "blue.50",
    _hover: {
      bg: "blue.100",
      borderColor: "blue.500",
      transform: "translateY(-1px)"
    },
    transition: "all 0.2s",
    verticalAlign: "super",
    lineHeight: "1"
  }

  // Superscript style - Clean academic citations
  const superscriptStyle = {
    display: "inline",
    cursor: "pointer",
    color: "blue.600",
    fontWeight: "600",
    fontSize: "0.7em",
    verticalAlign: "super",
    mx: "1px",
    _hover: {
      color: "blue.800",
      textDecoration: "underline"
    },
    transition: "color 0.2s"
  }

  // Tooltip style - Subtle dotted underline (hidden until hover)
  const tooltipStyle = {
    display: "inline",
    cursor: "help",
    color: "inherit",
    fontSize: "0.7em",
    verticalAlign: "super",
    mx: "1px",
    borderBottom: "1px dotted",
    borderColor: "blue.400",
    _hover: {
      borderColor: "blue.600",
      color: "blue.600",
      bg: "blue.50"
    },
    transition: "all 0.2s"
  }

  // Inline style - Minimal compact style
  const inlineStyle = {
    display: "inline",
    cursor: "pointer",
    color: "blue.600",
    fontWeight: "600",
    fontSize: "xs",
    mx: "1px",
    _hover: {
      color: "blue.700",
      textDecoration: "underline"
    },
    transition: "all 0.2s",
    verticalAlign: "super"
  }

  // Select style based on variant
  const getStyle = () => {
    switch(variant) {
      case 'badge': return badgeStyle
      case 'superscript': return superscriptStyle
      case 'tooltip': return tooltipStyle
      case 'inline': return inlineStyle
      default: return superscriptStyle
    }
  }

  const styles = getStyle()

  return (
    <Box
      as="span"
      {...styles}
      onClick={handleClick}
      role="button"
      aria-label={`View reference ${referenceNumber}`}
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e)
        }
      }}
    >
      {variant === 'badge' ? `[${referenceNumber}]` : referenceNumber}
    </Box>
  )
}

export default ReferenceCitation