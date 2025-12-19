// frontend/src/components/TextWithReferences.jsx
import React from 'react'
import ReferenceCitation from './ReferenceCitation'

/**
 * TextWithReferences Component
 *
 * Parses text containing reference citations like (1), (2), [1], [2]
 * and renders them as clickable ReferenceCitation components
 *
 * @param {string} text - Text containing reference citations
 * @param {function} onReferenceClick - Callback when a reference is clicked
 * @param {string} citationVariant - Variant to pass to ReferenceCitation ('badge', 'superscript', 'tooltip', 'inline')
 */
const TextWithReferences = ({
  text,
  onReferenceClick,
  citationVariant = 'superscript' // Changed default from 'default' to 'superscript'
}) => {
  if (!text) return null

  // Split text by reference patterns like (1) (2) (3) or [1] [2] [3]
  // This regex captures: (number) or [number]
  const parts = text.split(/(\(\d+\)|\[\d+\])/g)

  return (
    <>
      {parts.map((part, index) => {
        // Check if this part is a reference citation
        const refMatch = part.match(/[\(\[](\d+)[\)\]]/)
        if (refMatch) {
          const refNumber = parseInt(refMatch[1])
          return (
            <ReferenceCitation
              key={index}
              referenceNumber={refNumber}
              onClick={onReferenceClick}
              variant={citationVariant}
            />
          )
        }
        return <React.Fragment key={index}>{part}</React.Fragment>
      })}
    </>
  )
}

export default TextWithReferences