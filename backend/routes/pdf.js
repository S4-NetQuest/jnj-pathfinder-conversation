// routes/pdf.js - Complete implementation
const express = require('express');
const puppeteer = require('puppeteer');
const router = express.Router();

// You'll need to import your database connection/models
// const db = require('../config/database'); // Adjust path as needed

// Generate PDF endpoint - using POST to receive conversation data
router.post('/generate', async (req, res) => {
  try {
    const { conversationId, conversationData } = req.body;
    console.log('Generating PDF for conversation:', conversationId);
    console.log('Received conversation data:', conversationData);

    if (!conversationData) {
      return res.status(400).json({ error: 'Conversation data is required' });
    }

    // Generate PDF using the provided conversation data
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    const htmlContent = generateConversationHTML(conversationData);
    console.log('Generated HTML length:', htmlContent.length);

    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.75in',
        bottom: '0.75in',
        left: '0.5in',
        right: '0.5in'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; color: #666; width: 100%; text-align: center; margin: 0 20px;">
          <span>Pathfinder Conversation Guide - Kinematic Restoration</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; color: #666; width: 100%; text-align: center; margin: 0 20px;">
          <span>Johnson & Johnson MedTech | Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `
    });

    await browser.close();

    console.log('PDF generated successfully, size:', pdf.length, 'bytes');
    console.log('PDF first few bytes:', pdf.slice(0, 10).toString('hex'));

    // Validate PDF header
    if (pdf.length === 0) {
      throw new Error('Generated PDF is empty');
    }

    // Check if it starts with PDF header
    const pdfHeader = pdf.slice(0, 4).toString();
    if (pdfHeader !== '%PDF') {
      console.error('Invalid PDF header:', pdfHeader);
      throw new Error('Generated content is not a valid PDF');
    }

    // Set response headers for binary content
    const surgeonName = (conversationData.surgeonName || conversationData.surgeon_name || 'summary')
      .replace(/[^a-zA-Z0-9]/g, '-'); // Clean filename
    const filename = `pathfinder-conversation-${surgeonName}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdf.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send as buffer to ensure binary integrity
    res.end(pdf, 'binary');

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
});

// Simple test endpoint to verify PDF generation works
router.get('/test', async (req, res) => {
  try {
    console.log('Testing basic PDF generation...');

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();

    const simpleHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test PDF</title>
        <style>body { font-family: Arial, sans-serif; padding: 20px; }</style>
      </head>
      <body>
        <h1>PDF Generation Test</h1>
        <p>This is a simple test to verify PDF generation is working.</p>
        <p>Current time: ${new Date().toISOString()}</p>
      </body>
      </html>
    `;

    await page.setContent(simpleHTML);

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    await browser.close();

    console.log('Test PDF generated, size:', pdf.length, 'bytes');

    // Ensure proper headers for binary content
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="test.pdf"');
    res.setHeader('Content-Length', pdf.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send as buffer to ensure binary integrity
    res.end(pdf, 'binary');

  } catch (error) {
    console.error('Test PDF generation error:', error);
    res.status(500).json({ error: 'Test PDF generation failed', details: error.message });
  }
});

// Mock data function - replace with your actual database query
async function getMockConversationData(conversationId) {
  // This should be replaced with your actual database query
  // Example: return await db.query('SELECT * FROM conversations WHERE id = ?', [conversationId]);

  return {
    id: conversationId,
    surgeon_name: 'Cal Ripkin', // Use the property name that matches your database
    hospital_name: 'JHU',
    date: '2025-07-27T00:00:00.000Z',
    status: 'completed',
    recommended_approach: 'Kinematic Alignment',
    approach_description: 'Kinematic Alignment prioritizes restoring the native joint line. The femur is resurfaced first. Next, the tibia is resurfaced. Femoral and tibial resection depths are planned as the implant thickness minus the estimated cartilage and bone wear values.',
    alignment_scores: {
      kinematic: { score: 18, percentage: 90 },
      inverse_kinematic: { score: 5, percentage: 25 },
      functional: { score: 7, percentage: 35 },
      mechanical: { score: 7, percentage: 35 }
    },
    notes: 'This surgeon shows strong preference for kinematic alignment principles.',
    responses: [
      { question: 'Are you willing to deviate from mechanical axis (0° HKA)?', answer: 'Yes' },
      // Add more responses as needed
    ]
  };
}

// HTML Template Generator
function generateConversationHTML(conversationData) {
  // Handle both possible property name formats
  const surgeonName = conversationData.surgeonName || conversationData.surgeon_name || 'N/A';
  const hospitalName = conversationData.hospitalName || conversationData.hospital_name || 'N/A';
  const date = conversationData.date || conversationData.conversation_date || new Date().toISOString();
  const status = conversationData.status || 'completed';
  const recommendedApproach = conversationData.recommendedApproach || conversationData.recommended_approach;
  const notes = conversationData.notes || '';

  // Handle alignment scores - could be in different formats
  const alignmentScores = conversationData.alignmentScores || conversationData.alignment_scores || {};

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Pathfinder Conversation Summary</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #2D3748;
          background: #ffffff;
        }

        .header {
          background: #eb1700;
          color: white;
          padding: 30px;
          text-align: center;
          margin-bottom: 30px;
        }

        .header h1 {
          font-size: 28px;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .header p {
          font-size: 16px;
          opacity: 0.9;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .summary-section {
          margin-bottom: 30px;
          background: #f7fafc;
          padding: 25px;
          border-radius: 8px;
          border-left: 4px solid #eb1700;
        }

        .summary-section h2 {
          color: #eb1700;
          font-size: 20px;
          margin-bottom: 15px;
          font-weight: 600;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .info-item {
          background: white;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .info-label {
          font-weight: 600;
          color: #4a5568;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .info-value {
          color: #2d3748;
          font-size: 16px;
        }

        .completion-badge {
          display: inline-block;
          background: #48bb78;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        .approach-section {
          background: #e6fffa;
          border: 1px solid #81e6d9;
          border-radius: 8px;
          padding: 25px;
          margin: 30px 0;
        }

        .approach-title {
          font-size: 18px;
          font-weight: 600;
          color: #065f46;
          margin-bottom: 10px;
        }

        .approach-description {
          color: #047857;
          line-height: 1.7;
        }

        .scores-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 30px 0;
        }

        .score-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }

        .score-title {
          font-size: 14px;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 10px;
          text-transform: capitalize;
        }

        .score-value {
          font-size: 32px;
          font-weight: 700;
          color: #eb1700;
          margin-bottom: 5px;
        }

        .score-percentage {
          font-size: 14px;
          color: #718096;
        }

        .notes-section {
          background: #fffbf0;
          border: 1px solid #fed7aa;
          border-radius: 8px;
          padding: 25px;
          margin: 30px 0;
        }

        .notes-title {
          font-size: 18px;
          font-weight: 600;
          color: #c05621;
          margin-bottom: 15px;
        }

        .notes-content {
          color: #744210;
          line-height: 1.7;
          white-space: pre-wrap;
        }

        .footer {
          margin-top: 50px;
          padding-top: 30px;
          border-top: 2px solid #e2e8f0;
          text-align: center;
          color: #718096;
          font-size: 14px;
        }

        .jj-logo {
          color: #eb1700;
          font-weight: 700;
          font-size: 16px;
        }

        @media print {
          .header, .approach-section, .notes-section {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }

          .score-value, .approach-title, .summary-section h2 {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Pathfinder Conversation Guide</h1>
        <p>Kinematic Restoration Conversion Guide</p>
      </div>

      <div class="container">
        <div class="summary-section">
          <h2>Conversation Summary</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Surgeon</div>
              <div class="info-value">${surgeonName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Hospital</div>
              <div class="info-value">${hospitalName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date</div>
              <div class="info-value">${new Date(date).toLocaleDateString()}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Status</div>
              <div class="info-value">
                <span class="completion-badge">Assessment Completed</span>
              </div>
            </div>
          </div>
        </div>

        ${recommendedApproach ? `
        <div class="approach-section">
          <div class="approach-title">Your approach suggests: ${recommendedApproach}</div>
          <div class="approach-description">
            Kinematic Alignment prioritizes restoring the native joint line. The femur is resurfaced first. Next, the tibia is resurfaced. Femoral and tibial resection depths are planned as the implant thickness minus the estimated cartilage and bone wear values.
          </div>
        </div>
        ` : ''}

        ${Object.keys(alignmentScores).length > 0 ? `
        <div class="summary-section">
          <h2>Alignment Philosophy Scores</h2>
          <div class="scores-section">
            ${Object.entries(alignmentScores).map(([alignment, data]) => `
              <div class="score-card">
                <div class="score-title">${alignment.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}</div>
                <div class="score-value">${typeof data === 'object' ? data.score || data.value || 0 : data}</div>
                <div class="score-percentage">${typeof data === 'object' ? (data.percentage || Math.round((data.score / 20) * 100) || 0) : Math.round((data / 20) * 100)}%</div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        ${notes && notes.trim() ? `
        <div class="notes-section">
          <div class="notes-title">Sales Rep Notes</div>
          <div class="notes-content">${notes}</div>
        </div>
        ` : ''}

        <div class="footer">
          <div class="jj-logo">Johnson & Johnson MedTech</div>
          <p>© ${new Date().getFullYear()} Johnson & Johnson. All rights reserved.</p>
          <p style="margin-top: 10px; font-size: 12px;">CONFIDENTIAL. FOR INTERNAL USE ONLY. NOT FOR USE WITH ANY CUSTOMER OR FOR EXTERNAL DISTRIBUTION.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = router;