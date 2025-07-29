// frontend/src/pages/ConversationPDFView.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Conversation from './Conversation';
import api from '../services/api';

const ConversationPDFView = () => {
  const [searchParams] = useSearchParams();
  const [conversationData, setConversationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadConversationData = async () => {
      try {
        // Check if data is passed directly in URL
        const dataParam = searchParams.get('data');
        if (dataParam) {
          const parsedData = JSON.parse(decodeURIComponent(dataParam));
          setConversationData(parsedData);
          setLoading(false);
          return;
        }

        // Check if ID is passed for fetching
        const id = searchParams.get('id');
        if (id) {
          console.log('Fetching conversation data for ID:', id);
          const response = await api.get(`/conversations/${id}`);
          const conversationDataFromAPI = response.data.conversation;

          console.log('Fetched conversation data:', conversationDataFromAPI);
          setConversationData(conversationDataFromAPI);
          setLoading(false);
          return;
        }

        // No data or ID provided
        setError('No conversation data or ID provided');
        setLoading(false);

      } catch (error) {
        console.error('Error loading conversation data:', error);
        setError('Failed to load conversation data: ' + error.message);
        setLoading(false);
      }
    };

    loadConversationData();
  }, [searchParams]);

  if (loading) {
    return (
      <Layout pdfMode={true}>
        <div style={{
          padding: '40px',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          color: '#81766f'
        }}>
          Loading conversation for PDF generation...
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout pdfMode={true}>
        <div style={{
          padding: '40px',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          color: '#eb1700'
        }}>
          <h3>Error Loading Conversation</h3>
          <p>{error}</p>
          <p>
            <strong>Usage:</strong><br/>
            • With ID: <code>/conversation/pdf-view?id=12</code><br/>
            • With data: <code>/conversation/pdf-view?data=...</code>
          </p>
        </div>
      </Layout>
    );
  }

  if (!conversationData) {
    return (
      <Layout pdfMode={true}>
        <div style={{
          padding: '40px',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          color: '#eb1700'
        }}>
          No conversation data available
        </div>
      </Layout>
    );
  }

  // Render the Conversation component in PDF mode
  return (
    <Layout pdfMode={true}>
      <Conversation
        pdfMode={true}
        pdfConversationData={conversationData}
      />
    </Layout>
  );
};

export default ConversationPDFView;