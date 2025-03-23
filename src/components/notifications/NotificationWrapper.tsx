
import React from 'react';
import NotificationMenu from './NotificationMenu';

// This wrapper component checks if the user is logged in before showing notifications
const NotificationWrapper = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  
  if (!isLoggedIn) {
    return null;
  }
  
  return <NotificationMenu />;
};

export default NotificationWrapper;
