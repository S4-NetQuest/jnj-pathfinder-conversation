import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import Layout from './components/Layout'
import Home from './pages/Home'
import Conversation from './pages/Conversation'
import Results from './pages/Results'
import Profile from './pages/Profile'
import ReviewContent from './pages/ReviewContent'
import ExploreKinematicRestoration from './pages/ExploreKinematicRestoration'
import ComparePhilosophies from './pages/ComparePhilosophies'
import SellingQuestions from './pages/SellingQuestions'

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/conversation" element={<Conversation />} />
          <Route path="/conversation/:id" element={<Conversation />} />
          <Route path="/results" element={<Results />} />
          <Route path="/results/:id" element={<Results />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/review-content" element={<ReviewContent />} />
          <Route path="/explore-kinematic-restoration" element={<ExploreKinematicRestoration />} />
          <Route path="/compare-philosophies" element={<ComparePhilosophies />} />
          <Route path="/selling-questions-philosophies" element={<SellingQuestions />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App