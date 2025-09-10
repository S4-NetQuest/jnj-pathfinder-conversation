// backend/routes/pdf.js - CLEANED AND FIXED
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

const getChromeExecutablePath = () => {
  // For production/staging on Windows Server 2012
  /*
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    const prodPath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
    if (fs.existsSync(prodPath)) {
      console.log(`Using production Chrome path: ${prodPath}`);
      return prodPath;
    }
    throw new Error('Production Chrome executable not found at expected path.');
  }
  */

  // For local development on Windows 11
  const devPath = path.resolve(process.cwd(), 'chrome', 'chrome-win', 'chrome.exe');
  if (fs.existsSync(devPath)) {
    console.log(`Using development Chrome for Testing path: ${devPath}`);
    return devPath;
  }

  // Fallback for local development
  const localFallbackPath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (fs.existsSync(localFallbackPath)) {
    console.log(`Using local fallback Chrome path: ${localFallbackPath}`);
    return localFallbackPath;
  }

  throw new Error('Chrome executable could not be found for the current environment.');
};

// CORS test endpoint
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

// Main PDF generation endpoint
router.post('/generate', async (req, res) => {
  console.log('PDF Generate endpoint called');
  let browser;
  let timeoutId;

  try {
    const { conversationData } = req.body;
    if (!conversationData) {
      return res.status(400).json({ success: false, error: 'Conversation data is required' });
    }

    console.log('Conversation data:', conversationData);
    console.log('Conversation data scores:', conversationData.scores);
    console.log('Scores keys:', Object.keys(conversationData.scores || {}));
    console.log('Scores length:', Object.keys(conversationData.scores || {}).length);

    timeoutId = setTimeout(() => {
      console.log('PDF generation timeout reached (60s)');
      if (browser) browser.close();
      if (!res.headersSent) {
        res.status(408).json({ success: false, error: 'PDF generation timeout' });
      }
    }, 60000);

    const executablePath = getChromeExecutablePath();

    const launchOptions = {
      executablePath,
      headless: true,
      timeout: 30000,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--single-process',
        '--no-zygote',
        '--disable-features=VizDisplayCompositor',
        '--run-all-compositor-stages-before-draw',
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

// Generate all PDF pages
async function generateAllPDFPages(browser, conversationData) {
  const pdfBuffers = [];

  try {
    console.log('Starting PDF page generation...');

    // Page 1: Main conversation results (frontend screenshot with chart + score breakdown)
    console.log('Generating Page 1: Conversation Results with Scores');
    try {
      const page1Buffer = await generateEnhancedConversationPDF(browser, conversationData);
      pdfBuffers.push(page1Buffer);
      console.log('✅ Page 1 generated successfully');
    } catch (error) {
      console.error('❌ Error generating Page 1:', error.message);
      throw new Error(`Failed to generate conversation summary: ${error.message}`);
    }

    // Remove Pages 2 and 3 (chart and score breakdown) since they're captured in Page 1

    // Page 2: Questions and Responses
    if (conversationData.responses && conversationData.responses.length > 0) {
      console.log('Generating Page 2: Questions and Responses');
      try {
        const page2Buffer = await generateQuestionsPagePDF(browser, conversationData);
        pdfBuffers.push(page2Buffer);
        console.log('✅ Page 2 generated successfully');
      } catch (error) {
        console.error('❌ Error generating Page 2:', error.message);
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
        console.log('Continuing without notes page...');
      }
    }

    // Page 4: Final Pages: Fillable Form Pages
    console.log('Generating Final Pages: Fillable Forms');
    try {
      const formPagesBuffer = await generateFillableFormPagesPDF(browser, conversationData);
      pdfBuffers.push(formPagesBuffer);
      console.log('✅ Fillable form pages generated successfully');
    } catch (error) {
      console.error('❌ Error generating fillable form pages:', error.message);
      console.log('Continuing without form pages...');
    }

    console.log(`✅ Generated ${pdfBuffers.length} pages total`);
    return pdfBuffers;

  } catch (error) {
    console.error('❌ Error in generateAllPDFPages:', error);
    throw error;
  }
}

// Generate main conversation summary PDF (Page 1)
async function generateEnhancedConversationPDF(browser, conversationData) {
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1200, height: 800 });

    // Disable animations and force colors for PDF
    await page.evaluateOnNewDocument(() => {
      const css = `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
      `;
      const style = document.createElement('style');
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);
    });

    // Try frontend view first, then fallback to enhanced HTML
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const pdfViewUrl = `${frontendUrl}/conversation/pdf-view?data=${encodeURIComponent(JSON.stringify(conversationData))}`;

    console.log('Attempting frontend PDF view:', pdfViewUrl);

    try {
      await page.goto(pdfViewUrl, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 20000
      });

      await page.waitForSelector('[data-testid="conversation-pdf-content"]', {
        timeout: 10000
      });

      // Wait for dynamic content
      await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (frontendError) {
      console.log('Frontend view failed, using enhanced fallback HTML:', frontendError.message);

      // Use enhanced HTML with proper score rendering
      const enhancedHtml = generateEnhancedConversationHTML(conversationData);
      await page.setContent(enhancedHtml, {
        waitUntil: 'networkidle0',
        timeout: 15000
      });

      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Force screen media type for color preservation
    await page.emulateMediaType('screen');

    // Generate PDF with enhanced settings
    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '0.2in',
        right: '0.2in',
        bottom: '0.2in',
        left: '0.2in'
      }
    });

    return pdf;

  } finally {
    await page.close();
  }
}

// Generate conversation summary HTML (Page 1)
function generateEnhancedConversationHTML(conversationData) {
  const surgeonName = conversationData.surgeon_name || conversationData.surgeonName || 'Unknown Surgeon';
  const hospitalName = conversationData.hospital_name || conversationData.hospitalName || 'Unknown Hospital';
  const currentAlignment = conversationData.current_alignment || 'Not determined';
  const conversationDate = conversationData.conversation_date || conversationData.created_at || new Date().toISOString();

  return `
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
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
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
      <div class="container">
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

        <div class="footer">
          <p>Johnson & Johnson MedTech - Pathfinder Conversation Guide</p>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Generate questions page PDF (Page 4)
async function generateQuestionsPagePDF(browser, conversationData) {
  let page;
  try {
    page = await browser.newPage();
    await page.setViewport({ width: 800, height: 600 });
    const questionsHtml = generateQuestionsPageHtml(conversationData);

    await page.setContent(questionsHtml, { waitUntil: 'networkidle0', timeout: 10000 });
    await page.emulateMediaType('screen');

    return await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
    });
  } finally {
    if (page) await page.close();
  }
}

// Generate questions page HTML (Page 4)
function generateQuestionsPageHtml(conversationData) {
  const surgeonName = conversationData.surgeon_name || conversationData.surgeonName || 'Unknown Surgeon';

  const responsesHtml = conversationData.responses.map((response, index) => {
    const questionText = getQuestionText(response.question_id);
    let responseValue = response.response_value;

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

// Generate notes page PDF (Page 5)
async function generateNotesPagePDF(browser, conversationData) {
  let page;
  try {
    page = await browser.newPage();
    await page.setViewport({ width: 800, height: 600 });
    const notesHtml = generateNotesPageHtml(conversationData);

    await page.setContent(notesHtml, { waitUntil: 'networkidle0', timeout: 10000 });
    await page.emulateMediaType('screen');

    return await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
    });
  } finally {
    if (page) await page.close();
  }
}

// Generate notes page HTML (Page 5)
function generateNotesPageHtml(conversationData) {
  let notesContent = 'No notes available';
``
  if (typeof conversationData.notes === 'string' && conversationData.notes.trim() !== '') {
    notesContent = conversationData.notes;
  } else if (Array.isArray(conversationData.notes) && conversationData.notes.length > 0) {
    const notes = conversationData.notes[0];
    notesContent = notes ? notes.content : 'No notes available';
  }

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

// Generate fillable form pages PDF
async function generateFillableFormPagesPDF(browser, conversationData) {
  const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Add a page
    let currentPage = pdfDoc.addPage([612, 792]); // Letter size: 8.5" x 11"
    const { width, height } = currentPage.getSize();

    // Embed fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Colors
    const jjRed = rgb(235/255, 23/255, 0/255); // #eb1700
    const darkGray = rgb(45/255, 55/255, 72/255); // #2d3748
    const lightGray = rgb(129/255, 118/255, 111/255); // #81766f

    // Get conversation data
    const currentDate = new Date().toLocaleDateString();

    let yPosition = height - 60; // Start from top

    // Header
    currentPage.drawText('Pathfinder Conversation Follow-up', {
      x: 50,
      y: yPosition,
      size: 20,
      font: boldFont,
      color: jjRed
    });

    yPosition -= 25;


    // Get the form
    const form = pdfDoc.getForm();

    // Form sections with one multiline field each
    const formSections = [
      { title: 'Key Takeaways', height: 120 },
      { title: 'Action Planning', height: 80 },
      { title: 'Agreed Next Steps', height: 80 },
      { title: 'Resources Needed', height: 60 },
      { title: 'Target Timeline for Follow-up', height: 40 },
      { title: 'Coaching Notes', height: 140 },
      { title: 'Manager Sign-Off', height: 40 },
      { title: 'Date', height: 30 }
    ];

    for (const section of formSections) {
      // Check if we need a new page
      if (yPosition < 180) {
        currentPage = pdfDoc.addPage([612, 792]);
        yPosition = height - 60;
      }

      // Section title
      currentPage.drawText(section.title, {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: jjRed
      });

      // Draw underline for section title using actual text width
      const titleWidth = boldFont.widthOfTextAtSize(section.title, 14);
      currentPage.drawLine({
        start: { x: 50, y: yPosition - 5 },
        end: { x: 50 + titleWidth, y: yPosition - 5 },
        thickness: 1,
        color: jjRed
      });

      yPosition -= 25;

      // Create ONE multiline text field for this section
      const fieldName = section.title.replace(/\s+/g, '_').toLowerCase();
      const textField = form.createTextField(fieldName);
      textField.setText('');
      textField.enableMultiline();
      textField.enableScrolling();

      // Set up the field appearance first, then modify font size
      textField.addToPage(currentPage, {
        x: 60,
        y: yPosition - section.height,
        width: width - 120,
        height: section.height,
        textColor: rgb(0, 0, 0)
      });

      // Now set font size after the field is added to the page
      try {
        textField.setFontSize(10); // Try setting font size after addToPage
      } catch (fontError) {
        console.log(`Could not set font size for ${fieldName}, using default`);
      }

      yPosition -= section.height + 25; // Move down by field height plus spacing
    }

    // Add disclaimer at bottom of last page
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];

    const disclaimerText = 'Disclaimer: The PATHFINDER Conversation Guide is an educational resource designed to reflect TKA alignment preferences based on HCP responses. It does not prescribe or recommend any specific alignment philosophy. Clinical decisions remain the sole responsibility of the surgeon, based on their professional judgement and patient-specific factors.';

    // Split disclaimer into lines that fit
    const maxWidth = width - 100;
    const words = disclaimerText.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const textWidth = font.widthOfTextAtSize(testLine, 8);

      if (textWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    // Draw disclaimer
    let disclaimerY = 80;
    for (let i = lines.length - 1; i >= 0; i--) {
      lastPage.drawText(lines[i], {
        x: 50,
        y: disclaimerY,
        size: 8,
        font: font,
        color: lightGray
      });
      disclaimerY += 10;
    }

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);

  } catch (error) {
    console.error('Error creating fillable PDF:', error);
    throw error;
  }
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
console.log('- GET /cors-test');
console.log('- POST /generate');

module.exports = router;