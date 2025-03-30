"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

// List of specialties for filtering
const SPECIALTIES = [
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "Ophthalmology",
  "Gynecology",
  "Psychiatry",
  "Urology",
  "Oncology",
];

// List of locations for filtering
const LOCATIONS = [
  "Main Clinic",
  "East Wing",
  "West Wing",
  "North Wing",
  "South Wing",
];

const DoctorCard = ({ doctor, onDelete }) => {
  return (
    <div className={styles.doctorCard}>
      <div className={styles.doctorInfo}>
        <h3>{doctor.name}</h3>
        <p>
          <strong>Specialty:</strong> {doctor.specialty}
        </p>
        <p>
          <strong>Experience:</strong> {doctor.experience} years
        </p>
        <p>
          <strong>Rating:</strong> {doctor.rating}
        </p>
        <p>
          <strong>Location:</strong> {doctor.location}
        </p>
      </div>
      <div className={styles.doctorActions}>
        <Link
          href={`/doctors/${doctor.id}/edit`}
          className={styles.editButton}
        >
          Edit
        </Link>
        <Link
          href={`/doctors/${doctor.id}/schedule`}
          className={styles.scheduleButton}
        >
          Schedule
        </Link>
        <button
          onClick={() => onDelete(doctor.id)}
          className={styles.deleteButton}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const PageHeader = () => {
  return (
    <div className={styles.pageHeader}>
      <h1 className={styles.pageTitle}>Doctors</h1>
      <Link href="/doctors/add" className={styles.addButton}>
        Add Doctor
      </Link>
    </div>
  );
};

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    specialty: "",
    location: "",
  });

  const fetchDoctors = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/v1/doctors", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }

      const result = await response.json();
      
      if (result.statusCode === 200 && result.data.doctors) {
        setDoctors(result.data.doctors);
      } else {
        throw new Error(result.message || "Failed to fetch doctors");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDelete = async (doctorId) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/doctors/${doctorId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete doctor");
      }

      // Refresh the doctors list
      fetchDoctors();
    } catch (err) {
      setError(err.message);
      console.error("Error deleting doctor:", err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSpecialty =
      !filters.specialty || doctor.specialty === filters.specialty;
    const matchesLocation =
      !filters.location || doctor.location === filters.location;
    return matchesSpecialty && matchesLocation;
  });

  if (loading) {
    return (
      <div className={styles.doctorsPage}>
        <PageHeader />
        <div className={styles.loading}>Loading doctors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.doctorsPage}>
        <PageHeader />
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.doctorsPage}>
      <PageHeader />

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="specialty">Specialty:</label>
          <select
            id="specialty"
            name="specialty"
            value={filters.specialty}
            onChange={handleFilterChange}
          >
            <option value="">All Specialties</option>
            {SPECIALTIES.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="location">Location:</label>
          <select
            id="location"
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
          >
            <option value="">All Locations</option>
            {LOCATIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.doctorsList}>
        {filteredDoctors.length === 0 ? (
          <div className={styles.noDoctors}>No doctors found</div>
        ) : (
          filteredDoctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorsList; 