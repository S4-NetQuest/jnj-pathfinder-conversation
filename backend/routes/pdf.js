// backend/routes/pdf.js (Fixed timeout methods)
const express = require('express');
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const router = express.Router();

// Helper function for waiting (compatible with all Puppeteer versions)
const waitForTimeout = (page, ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Test PDF endpoint - FIXED VERSION
router.get('/test', async (req, res) => {
  console.log('PDF Test endpoint called');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    const testHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Test PDF</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
            background-color: white;
          }
          .header {
            color: #eb1700;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            border-bottom: 2px solid #eb1700;
            padding-bottom: 10px;
          }
          .content {
            line-height: 1.6;
          }
          .status {
            background-color: #f1efed;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .timestamp {
            color: #81766f;
            font-size: 14px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">Pathfinder PDF Generation Test</div>
        <div class="content">
          <div class="status">
            <h3>✅ PDF Generation System Status: WORKING</h3>
            <p>This PDF was successfully generated using Puppeteer on the backend.</p>
          </div>

          <h4>Test Details:</h4>
          <ul>
            <li>Generated: ${new Date().toLocaleString()}</li>
            <li>Puppeteer: Operational</li>
            <li>PDF Buffer: Valid</li>
            <li>Headers: Properly Set</li>
          </ul>

          <h4>Next Steps:</h4>
          <ol>
            <li>Verify this PDF opens correctly in Adobe Acrobat</li>
            <li>Test the full conversation PDF generation</li>
            <li>Confirm multi-page PDF creation works</li>
          </ol>

          <div class="timestamp">
            Johnson & Johnson MedTech - Pathfinder Conversation Guide<br>
            Test completed: ${new Date().toISOString()}
          </div>
        </div>
      </body>
      </html>
    `;

    // Set content and wait for it to load completely
    await page.setContent(testHtml, {
      waitUntil: ['networkidle0', 'domcontentloaded']
    });

    // Use compatible timeout method
    await waitForTimeout(page, 1000);

    // Generate PDF with explicit options
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.5in',
        bottom: '0.5in',
        left: '0.5in',
        right: '0.5in'
      },
      preferCSSPageSize: false,
      displayHeaderFooter: false
    });

    console.log('PDF generated successfully, buffer length:', pdfBuffer.length);

    // Set proper headers before sending response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', 'attachment; filename="pathfinder-test.pdf"');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send the PDF buffer directly
    res.end(pdfBuffer, 'binary');

  } catch (error) {
    console.error('Test PDF generation error:', error);

    // Send proper error response
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate test PDF',
        details: error.message
      });
    }
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Error closing browser:', e);
      }
    }
  }
});

// Main PDF generation endpoint - FIXED VERSION
router.post('/generate', async (req, res) => {
  console.log('PDF Generate endpoint called');

  let browser;

  try {
    const { conversationId, conversationData } = req.body;

    console.log('Conversation ID:', conversationId);
    console.log('Conversation data available:', !!conversationData);

    if (!conversationData) {
      return res.status(400).json({
        success: false,
        error: 'Conversation data is required'
      });
    }

    // Launch Puppeteer with better options
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    console.log('Generating multi-page PDF...');

    // Generate all PDF pages
    const pdfBuffers = await generateAllPDFPages(browser, conversationData);

    // Combine all pages into one PDF
    const finalPdf = await combinePDFs(pdfBuffers);

    console.log('Multi-page PDF generated successfully, size:', finalPdf.length, 'bytes');

    // Generate proper filename
    const surgeonName = conversationData.surgeon_name || conversationData.surgeonName || 'surgeon';
    const cleanSurgeonName = surgeonName.replace(/[^a-zA-Z0-9-_]/g, '-');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `pathfinder-conversation-${cleanSurgeonName}-${dateStr}.pdf`;

    // Set proper headers before sending response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', finalPdf.length);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send the PDF buffer directly
    res.end(finalPdf, 'binary');

  } catch (error) {
    console.error('PDF generation error:', error);

    // Send proper error response
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate PDF',
        details: error.message
      });
    }
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Error closing browser:', e);
      }
    }
  }
});

// Generate all PDF pages
async function generateAllPDFPages(browser, conversationData) {
  const pdfBuffers = [];

  try {
    // Page 1: Main conversation results (from React component)
    console.log('Generating Page 1: Conversation Results');
    const page1Buffer = await generateMainConversationPDF(browser, conversationData);
    pdfBuffers.push(page1Buffer);

    // Page 2: Questions and Responses
    if (conversationData.responses && conversationData.responses.length > 0) {
      console.log('Generating Page 2: Questions and Responses');
      const page2Buffer = await generateQuestionsPagePDF(browser, conversationData);
      pdfBuffers.push(page2Buffer);
    }

    // Page 3: Notes (if they exist)
    if (hasNotes(conversationData)) {
      console.log('Generating Page 3: Notes');
      const page3Buffer = await generateNotesPagePDF(browser, conversationData);
      pdfBuffers.push(page3Buffer);
    }

    console.log(`Generated ${pdfBuffers.length} pages total`);
    return pdfBuffers;

  } catch (error) {
    console.error('Error generating PDF pages:', error);
    throw error;
  }
}

// Generate main conversation PDF from React component
async function generateMainConversationPDF(browser, conversationData) {
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1200, height: 800 });

    // Disable animations for consistent rendering
    await page.evaluateOnNewDocument(() => {
      const css = `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `;
      const style = document.createElement('style');
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);
    });

    // Navigate to PDF view
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const pdfViewUrl = `${frontendUrl}/conversation/pdf-view?data=${encodeURIComponent(JSON.stringify(conversationData))}`;

    console.log('Navigating to:', pdfViewUrl);

    await page.goto(pdfViewUrl, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    });

    // Wait for content to load
    await page.waitForSelector('[data-testid="conversation-pdf-content"]', {
      timeout: 15000
    });

    // Wait for charts if they exist
    try {
      await page.waitForSelector('.recharts-wrapper', { timeout: 5000 });
      await waitForTimeout(page, 2000); // Compatible timeout for chart rendering
    } catch (e) {
      console.log('No charts found or timeout - continuing');
    }

    // Generate PDF
    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      preferCSSPageSize: false
    });

    return pdf;

  } finally {
    await page.close();
  }
}

// Generate questions page PDF
async function generateQuestionsPagePDF(browser, conversationData) {
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1200, height: 800 });

    const questionsHtml = generateQuestionsPageHtml(conversationData);
    await page.setContent(questionsHtml, {
      waitUntil: ['networkidle0', 'domcontentloaded']
    });

    // Wait for content to be fully rendered
    await waitForTimeout(page, 1000);

    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      preferCSSPageSize: false
    });

    return pdf;

  } finally {
    await page.close();
  }
}

// Generate notes page PDF
async function generateNotesPagePDF(browser, conversationData) {
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1200, height: 800 });

    const notesHtml = generateNotesPageHtml(conversationData);
    await page.setContent(notesHtml, {
      waitUntil: ['networkidle0', 'domcontentloaded']
    });

    // Wait for content to be fully rendered
    await waitForTimeout(page, 1000);

    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      preferCSSPageSize: false
    });

    return pdf;

  } finally {
    await page.close();
  }
}

// Question text mapping
const getQuestionText = (questionId) => {
  const questionMapping = {
    'q1_femur_tibia_first': 'Do you prioritize femur or tibia first in your surgical workflow?',
    'q2_tka_priority': 'What is your primary focus in TKA alignment?',
    'q3_adjust_resections': 'Do you adjust resections based on soft tissue balance?',
    'q4_deviate_mechanical_axis': 'Are you willing to deviate from mechanical axis?',
    'q5_distal_femoral_resection': 'How do you approach distal femoral resection?',
    'q6_tibial_resection': 'What is your approach to tibial resection?',
    'q7_extension_gaps_priority': 'How do you prioritize extension gap management?',
    'q8_posterior_femoral_resection': 'What is your approach to posterior femoral resection?',
    'q9_coronal_boundaries': 'How do you handle coronal boundaries in alignment?'
  };
  return questionMapping[questionId] || `Question ${questionId}`;
};

// Get response text
const getResponseText = (questionId, responseValue) => {
  const responseMapping = {
    'q1_femur_tibia_first': {
      'femur_first': 'I prioritize femur first in my workflow',
      'tibia_first': 'I prioritize tibia first in my workflow',
      'simultaneous': 'I approach both simultaneously'
    },
    'q2_tka_priority': {
      'native_alignment': 'I prioritize native alignment restoration',
      'mechanical_alignment': 'I prioritize mechanical alignment',
      'functional_alignment': 'I prioritize functional alignment'
    },
    'q3_adjust_resections': {
      'yes': 'Yes, I adjust resections based on soft tissue balance',
      'no': 'No, I use standard resection techniques',
      'sometimes': 'Sometimes, depending on the case'
    },
    'q4_deviate_mechanical_axis': {
      'yes': 'Yes, I am willing to deviate from mechanical axis when appropriate',
      'no': 'No, I prefer to maintain mechanical axis alignment',
      'sometimes': 'Sometimes, depending on patient factors'
    },
    'q5_distal_femoral_resection': {
      'anatomical': 'I use anatomical landmarks for distal femoral resection',
      'mechanical': 'I use mechanical axis principles',
      'balance': 'I balance anatomical and mechanical approaches'
    },
    'q6_tibial_resection': {
      'perpendicular_mechanical': 'Perpendicular to mechanical axis',
      'anatomical_slope': 'Based on anatomical tibial slope',
      'patient_specific': 'Patient-specific approach'
    },
    'q7_extension_gaps_priority': {
      'evenly_distribute': 'I prioritize even gap distribution',
      'tight_extension': 'I prefer tighter extension gaps',
      'loose_extension': 'I allow for looser extension gaps'
    },
    'q8_posterior_femoral_resection': {
      'restore_medial_balance_lateral': 'Restore medial balance laterally',
      'equal_resection': 'Equal posterior resection',
      'anatomical_based': 'Based on anatomical landmarks'
    },
    'q9_coronal_boundaries': {
      'no': 'No specific coronal boundary considerations',
      'yes': 'Yes, I consider coronal boundaries',
      'case_dependent': 'Depends on the specific case'
    }
  };

  return responseMapping[questionId]?.[responseValue] || `Response: ${responseValue}`;
};

// Generate HTML for questions page
function generateQuestionsPageHtml(conversationData) {
  const surgeonName = conversationData.surgeon_name || conversationData.surgeonName || 'Unknown Surgeon';
  const hospitalName = conversationData.hospital_name || conversationData.hospitalName || 'Unknown Hospital';

  const responsesHtml = conversationData.responses.map((response, index) => {
    const questionText = getQuestionText(response.question_id);
    let responseValue = response.response_value;

    // Parse JSON if needed
    if (typeof responseValue === 'string') {
      try {
        responseValue = JSON.parse(responseValue);
      } catch (e) {
        // Keep as string if not JSON
      }
    }

    const responseText = getResponseText(response.question_id, responseValue);
    const responseDate = new Date(response.created_at || new Date()).toLocaleDateString();

    return `
      <div class="question-item">
        <div class="question-header">
          <div class="question-number">Question ${index + 1}</div>
          <div class="response-date">${responseDate}</div>
        </div>
        <div class="question-text">${questionText}</div>
        <div class="response-section">
          <div class="response-label">Response:</div>
          <div class="response-text">${responseText}</div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Questions and Responses</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #ffffff;
          color: #333;
          line-height: 1.5;
        }
        .header {
          border-bottom: 2px solid #eb1700;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .title {
          color: #eb1700;
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #81766f;
          font-size: 16px;
          margin-bottom: 5px;
        }
        .stats-section {
          background-color: #f1efed;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 25px;
          text-align: center;
        }
        .stats-value {
          font-size: 24px;
          font-weight: bold;
          color: #eb1700;
        }
        .stats-label {
          font-size: 14px;
          color: #81766f;
          margin-top: 5px;
        }
        .question-item {
          background-color: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          break-inside: avoid;
        }
        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .question-number {
          color: #eb1700;
          font-weight: bold;
          font-size: 14px;
        }
        .question-text {
          font-size: 18px;
          font-weight: 500;
          color: #2d3748;
          margin-bottom: 15px;
          line-height: 1.4;
        }
        .response-section {
          background-color: #ffffff;
          border-radius: 6px;
          padding: 15px;
          border-left: 4px solid #eb1700;
        }
        .response-label {
          color: #81766f;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .response-text {
          color: #2d3748;
          font-size: 16px;
          line-height: 1.5;
        }
        .response-date {
          color: #81766f;
          font-size: 12px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #81766f;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">Questions and Responses</div>
        <div class="subtitle">Conversation with ${surgeonName}</div>
        <div class="subtitle">${hospitalName}</div>
      </div>

      <div class="stats-section">
        <div class="stats-value">${conversationData.responses.length}</div>
        <div class="stats-label">Questions Answered</div>
      </div>

      <div class="questions-section">
        ${responsesHtml}
      </div>

      <div class="footer">
        <p>Assessment completed on ${new Date().toLocaleDateString()}</p>
        <p>Johnson & Johnson MedTech - Pathfinder Conversation Guide</p>
      </div>
    </body>
    </html>
  `;
}

// Generate HTML for notes page
function generateNotesPageHtml(conversationData) {
  const surgeonName = conversationData.surgeon_name || conversationData.surgeonName || 'Unknown Surgeon';
  const hospitalName = conversationData.hospital_name || conversationData.hospitalName || 'Unknown Hospital';

  let notesContent = 'No notes available';
  let notesDate = '';
  let salesRepName = conversationData.sales_rep_name || 'Sales Representative';

  // Handle notes as either string or array
  if (typeof conversationData.notes === 'string' && conversationData.notes.trim() !== '') {
    notesContent = conversationData.notes;
    notesDate = new Date().toLocaleDateString();
  } else if (Array.isArray(conversationData.notes) && conversationData.notes.length > 0) {
    const notes = conversationData.notes[0];
    notesContent = notes ? notes.content : 'No notes available';
    notesDate = notes ? new Date(notes.updated_at || notes.created_at).toLocaleDateString() : '';
  }

  // Clean up HTML content from ReactQuill
  const cleanNotesContent = notesContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/<meta[^>]*>/gi, '');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Conversation Notes</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #ffffff;
          color: #333;
          line-height: 1.6;
        }
        .header {
          border-bottom: 2px solid #eb1700;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .title {
          color: #eb1700;
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #81766f;
          font-size: 16px;
          margin-bottom: 5px;
        }
        .notes-section {
          background-color: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 25px;
          min-height: 300px;
        }
        .notes-content {
          color: #2d3748;
          font-size: 16px;
          line-height: 1.6;
        }
        .empty-notes {
          text-align: center;
          color: #81766f;
          font-style: italic;
          padding: 60px 20px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #81766f;
          font-size: 14px;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">Conversation Notes</div>
        <div class="subtitle">Conversation with ${surgeonName}</div>
        <div class="subtitle">${hospitalName}</div>
      </div>

      <div class="notes-section">
        ${notesContent !== 'No notes available' ? `
          <div class="notes-content">
            ${cleanNotesContent}
          </div>
        ` : `
          <div class="empty-notes">
            <p>No notes have been added to this conversation.</p>
          </div>
        `}
      </div>

      <div class="footer">
        <p>Johnson & Johnson MedTech - Pathfinder Conversation Guide</p>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;
}

// Helper function to check if notes exist
function hasNotes(conversationData) {
  // Check if notes exist as a string
  if (typeof conversationData.notes === 'string' && conversationData.notes.trim() !== '') {
    return true;
  }

  // Check if notes exist as an array
  if (Array.isArray(conversationData.notes) &&
      conversationData.notes.length > 0 &&
      conversationData.notes[0] &&
      conversationData.notes[0].content &&
      conversationData.notes[0].content.trim() !== '') {
    return true;
  }

  return false;
}

// Function to combine multiple PDFs
async function combinePDFs(pdfBuffers) {
  const mergedPdf = await PDFDocument.create();

  for (const pdfBuffer of pdfBuffers) {
    const pdf = await PDFDocument.load(pdfBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach(page => mergedPdf.addPage(page));
  }

  return Buffer.from(await mergedPdf.save());
}

module.exports = router;