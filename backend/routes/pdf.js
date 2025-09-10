// backend/routes/pdf.js - COMPLETE FIXED VERSION FOR WINDOWS SERVER 2012
process.noDeprecation = true;

const express = require('express');
const puppeteer = require('puppeteer-core');
const { PDFDocument } = require('pdf-lib');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Import questions data with error handling
let questionsData;
try {
  questionsData = require('../data/questions.json');
} catch (error) {
  console.error('Error loading questions.json:', error);
  questionsData = { questions: [] };
}

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`PDF Route: ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  next();
});

// Options handler for CORS
// Simplified OPTIONS handler - let global CORS handle it
router.options('*', (req, res) => {
  console.log('PDF OPTIONS request received for:', req.path);
  res.sendStatus(200);
});

// Generate mappings from local backend data
const generateMappings = () => {
  const questionMapping = {};
  const responseMapping = {};

  if (questionsData && questionsData.questions) {
    questionsData.questions.forEach(question => {
      questionMapping[question.id] = question.question;
      responseMapping[question.id] = {};

      if (question.options) {
        question.options.forEach(option => {
          responseMapping[question.id][option.id] = option.text;
        });
      }
    });
  }

  return { questionMapping, responseMapping };
};

const getQuestionText = (questionId) => {
  const { questionMapping } = generateMappings();
  return questionMapping[questionId] || `Question ${questionId}`;
};

const getResponseText = (questionId, responseValue) => {
  const { responseMapping } = generateMappings();
  return responseMapping[questionId]?.[responseValue] || `Response: ${responseValue}`;
};

// Helper function for waiting
const waitForTimeout = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const getChromeExecutablePath = () => {
  // For production/staging on Windows Server 2012
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    const prodPath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
    if (fs.existsSync(prodPath)) {
      console.log(`Using production Chrome path: ${prodPath}`);
      return prodPath;
    }
    throw new Error('Production Chrome executable not found at expected path.');
  }

  // For local development on Windows 11
  // Assumes you downloaded Chrome for Testing into a .chrome folder in your project root
  const devPath = path.resolve(process.cwd(), 'chrome', 'chrome-win', 'chrome.exe');
  if (fs.existsSync(devPath)) {
    console.log(`Using development Chrome for Testing path: ${devPath}`);
    return devPath;
  }
  
  // Fallback for local development if you want to use your regularly installed Chrome
  const localFallbackPath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (fs.existsSync(localFallbackPath)) {
    console.log(`Using local fallback Chrome path: ${localFallbackPath}. WARNING: Version mismatch may occur.`);
    return localFallbackPath;
  }

  throw new Error('Chrome executable could not be found for the current environment.');
};

router.get('/cors-test', (req, res) => {
  console.log('PDF CORS test endpoint hit');
  res.json({
    success: true,
    message: 'CORS working for PDF routes',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  console.log('PDF Health check called');
  res.json({
    success: true,
    message: 'PDF service is running',
    timestamp: new Date().toISOString(),
    questionsLoaded: questionsData && questionsData.questions ? questionsData.questions.length : 0,
    platform: process.platform,
    nodeVersion: process.version
  });
});

// Main PDF generation endpoint - WORKING WITH PUPPETEER 19.11.1 + CHROME 109
router.post('/generate', async (req, res) => {
  console.log('PDF Generate endpoint called');
  let browser;
  let timeoutId;

  try {
    const { conversationData } = req.body;
    if (!conversationData) {
      return res.status(400).json({ success: false, error: 'Conversation data is required' });
    }

    timeoutId = setTimeout(() => {
      console.log('PDF generation timeout reached (60s)');
      if (browser) browser.close(); // Attempt to clean up
      if (!res.headersSent) {
        res.status(408).json({ success: false, error: 'PDF generation timeout' });
      }
    }, 60000);

    // CHANGE 3: Get the executable path dynamically
    const executablePath = getChromeExecutablePath();

    // CHANGE 4: Refined and simplified launch options for Chrome 109
    const launchOptions = {
      executablePath,
      headless: true,
      timeout: 30000,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu', // Crucial for server environments
        '--disable-software-rasterizer',
        '--single-process', // Often helps stability on older Windows versions
        '--no-zygote',
        '--disable-features=VizDisplayCompositor',
        '--run-all-compositor-stages-before-draw', // Helps with rendering issues
      ]
    };

    browser = await puppeteer.launch(launchOptions);
    console.log('Browser launched successfully');

    const pdfBuffers = await generateAllPDFPages(browser, conversationData);
    const finalPdf = await combinePDFs(pdfBuffers);

    console.log('Multi-page PDF generated successfully, size:', finalPdf.length, 'bytes');
    clearTimeout(timeoutId);

    const surgeonName = conversationData.surgeon_name || 'surgeon';
    const cleanSurgeonName = surgeonName.replace(/[^a-zA-Z0-9-_]/g, '-');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `pathfinder-conversation-${cleanSurgeonName}-${dateStr}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', finalPdf.length);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(finalPdf);

  } catch (error) {
    console.error('PDF generation error:', error);
    clearTimeout(timeoutId);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate PDF',
        details: error.message,
      });
    }
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('Browser closed successfully');
      } catch (e) {
        console.error('Error closing browser:', e);
      }
    }
  }
});

console.log('PDF /generate route registered');

// Helper function: Generate all PDF pages
async function generateAllPDFPages(browser, conversationData) {
  const pdfBuffers = [];

  try {
    console.log('Starting PDF page generation...');

    // Page 1: Main conversation results
    console.log('Generating Page 1: Conversation Results');
    try {
      //const page1Buffer = await generateSimpleConversationPDF(browser, conversationData);
      const page1Buffer = await generateMainConversationPDF(browser, conversationData);
      pdfBuffers.push(page1Buffer);
      console.log('✅ Page 1 generated successfully');
    } catch (error) {
      console.error('❌ Error generating Page 1:', error.message);
      throw new Error(`Failed to generate conversation summary: ${error.message}`);
    }

    // Page 2: Questions and Responses
    if (conversationData.responses && conversationData.responses.length > 0) {
      console.log('Generating Page 2: Questions and Responses');
      try {
        const page2Buffer = await generateQuestionsPagePDF(browser, conversationData);
        pdfBuffers.push(page2Buffer);
        console.log('✅ Page 2 generated successfully');
      } catch (error) {
        console.error('❌ Error generating Page 2:', error.message);
        // Don't throw here, just log the error and continue
        console.log('Continuing without questions page...');
      }
    }

    // Page 3: Notes (if they exist)
    if (hasNotes(conversationData)) {
      console.log('Generating Page 3: Notes');
      try {
        const page3Buffer = await generateNotesPagePDF(browser, conversationData);
        pdfBuffers.push(page3Buffer);
        console.log('✅ Page 3 generated successfully');
      } catch (error) {
        console.error('❌ Error generating Page 3:', error.message);
        // Don't throw here, just log the error and continue
        console.log('Continuing without notes page...');
      }
    }

    console.log(`✅ Generated ${pdfBuffers.length} pages total`);

    if (pdfBuffers.length === 0) {
      throw new Error('No PDF pages were generated successfully');
    }

    return pdfBuffers;

  } catch (error) {
    console.error('❌ Error in generateAllPDFPages:', error);
    throw error;
  }
}

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

// Helper function: Generate simple conversation PDF
async function generateSimpleConversationPDF(browser, conversationData) {
  let page;

  try {
    console.log('Creating new page for conversation PDF...');
    page = await browser.newPage();

    // Set a smaller viewport for better compatibility
    await page.setViewport({ width: 800, height: 600 });

    console.log('Setting page content...');

    const surgeonName = conversationData.surgeon_name || conversationData.surgeonName || 'Unknown Surgeon';
    const hospitalName = conversationData.hospital_name || conversationData.hospitalName || 'Unknown Hospital';
    const currentAlignment = conversationData.current_alignment || 'Not determined';
    const conversationDate = conversationData.conversation_date || conversationData.created_at || new Date().toISOString();

    const mainHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Conversation Summary</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #ffffff;
            color: #333;
            line-height: 1.6;
          }
          .header {
            border-bottom: 3px solid #eb1700;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            color: #eb1700;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #81766f;
            font-size: 18px;
            margin-bottom: 5px;
          }
          .info-section {
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 25px;
          }
          .info-item {
            margin-bottom: 15px;
          }
          .info-label {
            color: #81766f;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 5px;
          }
          .info-value {
            color: #2d3748;
            font-size: 16px;
            font-weight: 500;
          }
          .result-section {
            background-color: #f1efed;
            border-radius: 8px;
            padding: 25px;
            text-align: center;
            margin-bottom: 25px;
          }
          .result-title {
            color: #eb1700;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 15px;
          }
          .result-value {
            color: #2d3748;
            font-size: 20px;
            font-weight: 500;
            background-color: white;
            padding: 15px;
            border-radius: 6px;
            border: 2px solid #eb1700;
          }
          .stats-section {
            background-color: #f7fafc;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
            text-align: center;
          }
          .stat-item {
            background-color: white;
            padding: 15px;
            margin: 10px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            display: inline-block;
            min-width: 120px;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #eb1700;
            margin-bottom: 5px;
          }
          .stat-label {
            font-size: 14px;
            color: #81766f;
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
          <div class="title">Pathfinder Conversation Guide</div>
          <div class="subtitle">Kinematic Restoration Assessment Summary</div>
        </div>

        <div class="info-section">
          <div class="info-item">
            <div class="info-label">Surgeon</div>
            <div class="info-value">${surgeonName}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Hospital</div>
            <div class="info-value">${hospitalName}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Assessment Date</div>
            <div class="info-value">${new Date(conversationDate).toLocaleDateString()}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Status</div>
            <div class="info-value">Completed</div>
          </div>
        </div>

        <div class="result-section">
          <div class="result-title">Recommended Alignment Philosophy</div>
          <div class="result-value">${currentAlignment}</div>
        </div>

        <div class="stats-section">
          <div class="stat-item">
            <div class="stat-value">${conversationData.responses ? conversationData.responses.length : 0}</div>
            <div class="stat-label">Questions Answered</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${hasNotes(conversationData) ? 'Yes' : 'No'}</div>
            <div class="stat-label">Notes Included</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">100%</div>
            <div class="stat-label">Assessment Complete</div>
          </div>
        </div>

        <div class="footer">
          <p>Johnson & Johnson MedTech - Pathfinder Conversation Guide</p>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;

    // Set content with timeout
    await page.setContent(mainHtml, {
      waitUntil: 'networkidle0', // Waits until there are no network connections for 500ms
      timeout: 15000
    });

    console.log('Content set, waiting for render...');

    // Wait for content to be fully rendered
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Generating PDF...');

    await page.emulateMediaType('screen');

    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
      timeout: 20000
    });

    console.log('✅ PDF generated successfully, size:', pdf.length);
    return pdf;

  } catch (error) {
    console.error('❌ Error in generateSimpleConversationPDF:', error);
    throw error;
  } finally {
    if (page) {
      try {
        await page.close();
        console.log('Page closed successfully');
      } catch (e) {
        console.error('Error closing page:', e);
      }
    }
  }
}

// Helper function: Generate questions page PDF
async function generateQuestionsPagePDF(browser, conversationData) {
    let page;
    try {
        page = await browser.newPage();
        await page.setViewport({ width: 800, height: 600 });
        const questionsHtml = generateQuestionsPageHtml(conversationData);

        await page.setContent(questionsHtml, { waitUntil: 'networkidle0', timeout: 10000 });
        await page.emulateMediaType('screen'); // Add this line

        return await page.pdf({ format: 'Letter', printBackground: true, /* ... */ });
    } finally {
        if (page) await page.close();
    }
}

// Helper function: Generate notes page PDF
async function generateNotesPagePDF(browser, conversationData) {
    let page;
    try {
        page = await browser.newPage();
        await page.setViewport({ width: 800, height: 600 });
        const notesHtml = generateNotesPageHtml(conversationData);

        await page.setContent(notesHtml, { waitUntil: 'networkidle0', timeout: 10000 });
        await page.emulateMediaType('screen'); // Add this line

        return await page.pdf({ format: 'Letter', printBackground: true, /* ... */ });
    } finally {
        if (page) await page.close();
    }
}

// Helper function: Generate questions page HTML
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
          font-family: Arial, sans-serif;
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

// Helper function: Generate notes page HTML
function generateNotesPageHtml(conversationData) {
  const surgeonName = conversationData.surgeon_name || conversationData.surgeonName || 'Unknown Surgeon';
  const hospitalName = conversationData.hospital_name || conversationData.hospitalName || 'Unknown Hospital';

  let notesContent = 'No notes available';

  // Handle notes as either string or array
  if (typeof conversationData.notes === 'string' && conversationData.notes.trim() !== '') {
    notesContent = conversationData.notes;
  } else if (Array.isArray(conversationData.notes) && conversationData.notes.length > 0) {
    const notes = conversationData.notes[0];
    notesContent = notes ? notes.content : 'No notes available';
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
          font-family: Arial, sans-serif;
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

// Helper function: Check if notes exist
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

// Helper function: Combine multiple PDFs
async function combinePDFs(pdfBuffers) {
  const mergedPdf = await PDFDocument.create();

  for (const pdfBuffer of pdfBuffers) {
    const pdf = await PDFDocument.load(pdfBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach(page => mergedPdf.addPage(page));
  }

  return Buffer.from(await mergedPdf.save());
}

console.log('PDF router setup complete. Routes registered:');
console.log('- GET /health');
console.log('- GET /test');
console.log('- GET /simple-test');
console.log('- GET /alt-test');
console.log('- POST /generate');

module.exports = router;