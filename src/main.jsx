import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './router/router.config';
import './styles.css';
import './global.less';

createRoot(document.getElementById('root')).render(<RouterProvider router={router} />);
