"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

const SignupHeader = () => (
  <div className={styles.signupHeader}>
    <h1 className={styles.signupTitle}>Create Account</h1>
    <p className={styles.signupSubtitle}>Doctor Appointment System</p>
  </div>
);

const FormInput = ({ type, id, name, value, onChange, placeholder, label, disabled }) => (
  <div className={styles.formGroup}>
    <label htmlFor={id} className={styles.formLabel}>
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={styles.formInput}
      placeholder={placeholder}
      required
      disabled={disabled}
    />
  </div>
);

const SignupForm = ({ formData, onSubmit, onChange, error, loading }) => (
  <form onSubmit={onSubmit} className={styles.signupForm}>
    {error && <div className={styles.errorMessage}>{error}</div>}
    
    <FormInput
      type="text"
      id="name"
      name="name"
      value={formData.name}
      onChange={onChange}
      placeholder="Enter your full name"
      label="Full Name"
      disabled={loading}
    />

    <FormInput
      type="email"
      id="email"
      name="email"
      value={formData.email}
      onChange={onChange}
      placeholder="Enter your email"
      label="Email"
      disabled={loading}
    />

    <FormInput
      type="password"
      id="password"
      name="password"
      value={formData.password}
      onChange={onChange}
      placeholder="Create a password"
      label="Password"
      disabled={loading}
    />

    <button 
      type="submit" 
      className={styles.signupButton}
      disabled={loading}
    >
      {loading ? 'Creating Account...' : 'Sign Up'}
    </button>
  </form>
);

const SignupFooter = () => (
  <div className={styles.signupFooter}>
    <p>
      Already have an account? <Link href="/login">Login here</Link>
    </p>
  </div>
);

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/v1/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register');
      }

      // If registration is successful, redirect to login
      router.push('/login');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupCard}>
        <SignupHeader />
        <SignupForm
          formData={formData}
          onSubmit={handleSubmit}
          onChange={handleChange}
          error={error}
          loading={loading}
        />
        <SignupFooter />
      </div>
    </div>
  );
};

export default SignupPage; 