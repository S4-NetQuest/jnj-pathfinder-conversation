// frontend/src/main.jsx - Update the BrowserRouter configuration

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import theme from './theme/theme.js';
import config from './config/config.js';

// Import SASS instead of CSS
import './styles/main.scss';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter basename={config.BASE_URL}>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>,
);