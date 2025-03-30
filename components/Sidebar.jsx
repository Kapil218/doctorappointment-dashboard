"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/v1/users/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        router.push("/login");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <h2>Admin Panel</h2>
      </div>
      
      <nav className={styles.navigation}>
        <Link href="/" className={styles.navLink}>
          <span className={styles.icon}>📊</span>
          Appointments
        </Link>
        <Link href="/doctors" className={styles.navLink}>
          <span className={styles.icon}>👨‍⚕️</span>
          Doctors
        </Link>
      </nav>

      <div className={styles.bottomSection}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <span className={styles.icon}>🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 