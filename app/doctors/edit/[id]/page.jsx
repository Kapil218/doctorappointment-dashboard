"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const EditDoctor = ({ params }) => {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    experience: 0,
    degree: "",
    location: "",
    gender: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/v1/doctors/${unwrappedParams.id}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch doctor");
        }

        const data = await response.json();
        if (data.statusCode === 200 && data.data) {
          setFormData({
            name: data.data.name || "",
            specialty: data.data.specialty || "",
            experience: data.data.experience || "",
            degree: data.data.degree || "",
            location: data.data.location || "",
            gender: data.data.gender || "",
          });
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching doctor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [unwrappedParams.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/doctors/update/${unwrappedParams.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update doctor");
      }

      router.push("/doctors");
    } catch (err) {
      setError(err.message);
      console.error("Error updating doctor:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.editDoctor}>
      <h1 className={styles.pageTitle}>Edit Doctor</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="specialty">Specialty:</label>
          <input
            type="text"
            id="specialty"
            name="specialty"
            value={formData.specialty}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="experience">Experience (years):</label>
          <input
            type="number"
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={(e) => handleChange({
              ...e,
              target: {
                ...e.target,
                name: 'experience',
                value: parseInt(e.target.value) || 0  // Convert to integer
              }
            })}
            min="0"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="degree">Degree:</label>
          <input
            type="text"
            id="degree"
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="gender">Gender:</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>
            Update Doctor
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDoctor; 