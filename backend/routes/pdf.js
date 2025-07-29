// backend/routes/pdf.js (clean version)
const express = require('express');
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const router = express.Router();

// Question text mapping based on question IDs (updated with your actual IDs)
const getQuestionText = (questionId) => {
  switch (questionId) {
    case 'q1_femur_tibia_first':
      return 'Do you prioritize femur or tibia first in your surgical workflow?';
    case 'q2_tka_priority':
      return 'What is your primary focus in TKA alignment?';
    case 'q3_adjust_resections':
      return 'Do you adjust resections based on soft tissue balance?';
    case 'q4_deviate_mechanical_axis':
      return 'Are you willing to deviate from mechanical axis?';
    case 'q5_distal_femoral_resection':
      return 'How do you approach distal femoral resection?';
    case 'q6_tibial_resection':
      return 'What is your approach to tibial resection?';
    case 'q7_extension_gaps_priority':
      return 'How do you prioritize extension gap management?';
    case 'q8_posterior_femoral_resection':
      return 'What is your approach to posterior femoral resection?';
    case 'q9_coronal_boundaries':
      return 'How do you handle coronal boundaries in alignment?';
    // Add more cases as needed based on your actual question IDs
    default:
      return `Question ${questionId}`;
  }
};

// Get response text based on question ID and response value (updated mappings)
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

// Test PDF endpoint (existing functionality)
router.get('/test', async (req, res) => {
  console.log('PDF Test endpoint called');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Generate a simple test PDF
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
          }
          .header {
            color: #eb1700;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .content {
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="header">Pathfinder PDF Test</div>
        <div class="content">
          <p>This is a test PDF generated on ${new Date().toLocaleString()}</p>
          <p>PDF generation system is working correctly.</p>
          <p>Johnson & Johnson MedTech - Pathfinder Conversation Guide</p>
        </div>
      </body>
      </html>
    `;

    await page.setContent(testHtml, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="pathfinder-test.pdf"');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Test PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate test PDF' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// Main PDF generation endpoint
router.post('/generate', async (req, res) => {
  console.log('PDF Generate endpoint called');
  console.log('Request body keys:', Object.keys(req.body));

  let browser;

  try {
    const { conversationId, conversationData } = req.body;

    console.log('Conversation ID:', conversationId);
    console.log('Conversation data available:', !!conversationData);
    console.log('Conversation data keys:', conversationData ? Object.keys(conversationData) : 'none');

    if (!conversationData) {
      return res.status(400).json({ error: 'Conversation data is required' });
    }

    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    console.log('Generating PDF pages...');

    // Create PDF with multiple pages
    const pdf = await generateConversationPDF(page, conversationData);

    console.log('PDF generated successfully, size:', pdf.length, 'bytes');

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="conversation-${conversationId}.pdf"`);

    res.send(pdf);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({
      error: 'Failed to generate PDF',
      details: error.message
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// Main PDF generation function - updated to screenshot actual conversation component
async function generateConversationPDF(page, conversationData) {
  const pages = [];

  try {
    // Log the conversation data structure for debugging
    console.log('Conversation data keys:', Object.keys(conversationData));
    console.log('Notes in conversation data:', conversationData.notes);
    console.log('Has notes?', hasNotes(conversationData));

    // Page 1: Screenshot of ACTUAL Conversation Component (without buttons)
    console.log('Generating page 1: Conversation component screenshot');

    // Navigate to a special route that serves the conversation component in PDF mode
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const conversationUrl = `${baseUrl}/conversation/pdf-view?data=${encodeURIComponent(JSON.stringify(conversationData))}`;

    console.log('Navigating to:', conversationUrl);

    // Navigate to the conversation component page
    await page.goto(conversationUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for the conversation component to render
    await page.waitForSelector('[data-testid="conversation-pdf-content"]', { timeout: 15000 });

    // Wait a bit more for any dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take a screenshot and convert to PDF
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true,
      clip: null // Full page screenshot
    });

    // Create a PDF page with the screenshot
    const screenshotHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { margin: 0; padding: 0; }
          img { width: 100%; height: auto; display: block; }
        </style>
      </head>
      <body>
        <img src="data:image/png;base64,${screenshot.toString('base64')}" alt="Conversation Screenshot" />
      </body>
      </html>
    `;

    await page.setContent(screenshotHtml, { waitUntil: 'networkidle0' });

    const conversationPdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10px', bottom: '10px', left: '10px', right: '10px' }
    });
    pages.push(conversationPdf);

    // Page 2: Questions and Responses
    if (conversationData.responses && conversationData.responses.length > 0) {
      console.log('Generating page 2: Questions and responses');
      const questionsPageHtml = generateQuestionsPageHtml(conversationData);
      await page.setContent(questionsPageHtml, { waitUntil: 'networkidle0' });

      const questionsPdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
      });
      pages.push(questionsPdf);
    }

    // Page 3: Notes (if they exist)
    if (hasNotes(conversationData)) {
      console.log('Generating page 3: Notes');
      const notesPageHtml = generateNotesPageHtml(conversationData);
      await page.setContent(notesPageHtml, { waitUntil: 'networkidle0' });

      const notesPdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
      });
      pages.push(notesPdf);
    } else {
      console.log('No notes found, skipping notes page');
    }

    console.log('Combining', pages.length, 'pages');

    // Combine all pages
    return await combinePDFs(pages);
  } catch (error) {
    console.error('Error in generateConversationPDF:', error);
    throw error;
  }
}

// Generate HTML for questions and responses (Page 2)
function generateQuestionsPageHtml(conversationData) {
  const surgeonName = conversationData.surgeon_name || conversationData.surgeonName || 'Unknown Surgeon';
  const hospitalName = conversationData.hospital_name || conversationData.hospitalName || 'Unknown Hospital';

  const responsesHtml = conversationData.responses.map((response, index) => {
    const questionText = getQuestionText(response.question_id);
    const responseText = getResponseText(response.question_id, response.response_value);
    const responseDate = new Date(response.created_at).toLocaleDateString();

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
          position: fixed; bottom: 20px;
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

// Generate HTML for notes (Page 3) - improved
function generateNotesPageHtml(conversationData) {
  const surgeonName = conversationData.surgeon_name || conversationData.surgeonName || 'Unknown Surgeon';
  const hospitalName = conversationData.hospital_name || conversationData.hospitalName || 'Unknown Hospital';

  // Handle notes as either string or array
  let notesContent = 'No notes available';
  let notesDate = '';

  if (typeof conversationData.notes === 'string' && conversationData.notes.trim() !== '') {
    notesContent = conversationData.notes;
    notesDate = new Date().toLocaleDateString(); // Use current date if no specific date
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
        .notes-info {
          background-color: #f1efed;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .notes-author {
          font-weight: 500;
          color: #2d3748;
        }
        .notes-date {
          color: #81766f;
          font-size: 14px;
        }
        .notes-section {
          background-color: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 25px;
          min-height: 300px;
          margin-bottom: 60px; /* Add space for footer */
        }
        .notes-content {
          color: #2d3748;
          font-size: 16px;
          line-height: 1.6;
        }
        .notes-content h1, .notes-content h2, .notes-content h3 {
          color: #2d3748;
          margin-top: 20px;
          margin-bottom: 10px;
        }
        .notes-content ul, .notes-content ol {
          padding-left: 20px;
        }
        .notes-content strong {
          font-weight: 600;
        }
        .notes-content em {
          font-style: italic;
        }
        .notes-content u {
          text-decoration: underline;
        }
        .empty-notes {
          text-align: center;
          color: #81766f;
          font-style: italic;
          padding: 60px 20px;
        }
        .footer {
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          text-align: center;
          color: #81766f;
          font-size: 14px;
          background-color: white;
          border-top: 1px solid #e2e8f0;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">Conversation Notes</div>
        <div class="subtitle">Conversation with ${surgeonName}</div>
        <div class="subtitle">${hospitalName}</div>
      </div>

      ${notesContent !== 'No notes available' ? `
        <div class="notes-info">
          <div class="notes-author">Notes by: ${conversationData.sales_rep_name || 'Sales Representative'}</div>
          <div class="notes-date">${notesDate}</div>
        </div>
      ` : ''}

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

// Helper function to check if notes exist (improved)
function hasNotes(conversationData) {
  console.log('Checking for notes:', conversationData.notes);

  // Check if notes exist as a string (direct notes content)
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

// Helper function to get approach description
function getApproachDescription(approach) {
  const descriptions = {
    'KA': 'Kinematic Alignment restores the pre-disease anatomy and joint line orientation of the patient.',
    'iKA': 'Inverse Kinematic Alignment combines anatomical restoration with mechanical considerations.',
    'FA': 'Functional Alignment prioritizes soft tissue balance and functional outcomes.',
    'MA': 'Mechanical Alignment aims for neutral mechanical axis and standardized component positioning.'
  };

  return descriptions[approach] || 'Assessment results will be available once completed.';
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