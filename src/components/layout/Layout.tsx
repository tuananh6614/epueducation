
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <TransitionGroup component={null}>
        <CSSTransition
          key={location.pathname}
          timeout={400}
          classNames="page-transition"
        >
          <main className="flex-grow pt-20">
            {children}
          </main>
        </CSSTransition>
      </TransitionGroup>
      <Footer />
    </div>
  );
};

export default Layout;
