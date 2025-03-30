"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./LogoutButton.module.css";

const LogoutButton = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      const response = await fetch('http://localhost:3000/api/v1/users/logout', {
        method: 'POST',
        credentials: 'include', // Important for cookies
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to logout');
      }

      // Redirect to login page after successful logout
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button 
      onClick={handleLogout} 
      className={styles.logoutButton}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
  );
};

export default LogoutButton; 