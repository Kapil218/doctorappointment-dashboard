"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const AddDoctor = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    experience: "",
    degree: "",
    location: "",
    gender: "",
    rating: "",
    available_times: [],
  });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/v1/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to add doctor");
      }

      router.push("/doctors");
    } catch (err) {
      setError(err.message);
      console.error("Error adding doctor:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTimeChange = (index, field, value) => {
    const newTimes = [...formData.available_times];
    if (!newTimes[index]) {
      newTimes[index] = {};
    }
    newTimes[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      available_times: newTimes,
    }));
  };

  const addTimeSlot = () => {
    setFormData((prev) => ({
      ...prev,
      available_times: [...prev.available_times, { day: "", time: "" }],
    }));
  };

  const removeTimeSlot = (index) => {
    setFormData((prev) => ({
      ...prev,
      available_times: prev.available_times.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className={styles.addDoctor}>
      <h1 className={styles.pageTitle}>Add New Doctor</h1>

      {error && <div className={styles.error}>{error}</div>}

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
            onChange={handleChange}
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

        <div className={styles.formGroup}>
          <label htmlFor="rating">Rating:</label>
          <input
            type="number"
            id="rating"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            min="0"
            max="5"
            step="0.1"
            required
          />
        </div>

        <div className={styles.timeSlots}>
          <h3>Available Time Slots</h3>
          <button type="button" onClick={addTimeSlot} className={styles.addButton}>
            Add Time Slot
          </button>

          {formData.available_times.map((slot, index) => (
            <div key={index} className={styles.timeSlot}>
              <select
                value={slot.day || ""}
                onChange={(e) => handleTimeChange(index, "day", e.target.value)}
                required
              >
                <option value="">Select Day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>

              <input
                type="time"
                value={slot.time || ""}
                onChange={(e) => handleTimeChange(index, "time", e.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => removeTimeSlot(index)}
                className={styles.removeButton}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>
            Add Doctor
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDoctor; 