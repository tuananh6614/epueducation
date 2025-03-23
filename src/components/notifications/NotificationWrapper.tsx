
import React from 'react';
import NotificationMenu from './NotificationMenu';

export const NotificationWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem('token');
  
  return (
    <>
      {isLoggedIn && <NotificationMenu />}
      {children}
    </>
  );
};

export default NotificationWrapper;
