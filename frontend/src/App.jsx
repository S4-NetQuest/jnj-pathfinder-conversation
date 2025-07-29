import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Conversation from './pages/Conversation';
import ConversationPDFView from './pages/ConversationPDFView';
import Results from './pages/Results';
import Profile from './pages/Profile';
import ReviewContent from './pages/ReviewContent';
import ComparePhilosophies from './pages/ComparePhilosophies';
import SellingQuestions from './pages/SellingQuestions';
import References from './pages/References';

// Component to conditionally wrap routes with Layout
const ConditionalLayout = ({ children }) => {
  const location = useLocation();

  // Routes that should NOT have Layout (header/footer)
  const pdfRoutes = ['/conversation/pdf-view'];

  const isPDFRoute = pdfRoutes.includes(location.pathname);

  if (isPDFRoute) {
    // Return children without Layout wrapper
    return <>{children}</>;
  }

  // Return children wrapped in Layout
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <ConditionalLayout>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/conversation/pdf-view" element={<ConversationPDFView />} />
          <Route path="/conversation" element={<Conversation />} />
          <Route path="/conversation/:id" element={<Conversation />} />
          <Route path="/results" element={<Results />} />
          <Route path="/results/:id" element={<Results />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/review-content" element={<ReviewContent />} />
          <Route path="/compare-philosophies" element={<ComparePhilosophies />} />
          <Route path="/selling-questions-philosophies" element={<SellingQuestions />} />
          <Route path="/references" element={<References />} />
        </Routes>
      </ConditionalLayout>
    </AuthProvider>
  )
}

export default App;