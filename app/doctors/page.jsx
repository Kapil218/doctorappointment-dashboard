"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./page.module.css";

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
    rating: "",
    experience: "",
    gender: "",
  });
  const [pendingFilters, setPendingFilters] = useState(filters);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const fetchDoctors = async () => {
    try {
      const params = new URLSearchParams();

      if (debouncedQuery.trim() !== "") {
        params.append("query", debouncedQuery);
      }

      if (filters.rating) params.append("rating", filters.rating);
      if (filters.experience) params.append("experience", filters.experience);
      if (filters.gender) params.append("gender", filters.gender);

      params.append("page", page.toString());
      params.append("perPage", "6");

      const response = await fetch(
        `http://localhost:3000/api/v1/doctors?${params}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }

      const result = await response.json();
      
      if (result.statusCode === 200) {
        setDoctors(result.data.doctors);
        if (result.data.pagination) {
          setTotalPages(result.data.pagination.totalPages);
        } else {
          setTotalPages(Math.ceil(result.data.doctors.length / 6));
        }
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
  }, [debouncedQuery, filters, page]);

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

  const handlePendingFilterChange = (key, value) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setFilters(pendingFilters);
    setPage(1);
  };

  const resetFilters = () => {
    setPendingFilters({ rating: "", experience: "", gender: "" });
    setFilters({ rating: "", experience: "", gender: "" });
    setPage(1);
  };

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

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search doctors"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <div className={styles.filterHeader}>
            <div className={styles.filterTitle}>
              <h3>Filter By:</h3>
            </div>
            <div className={styles.filterButtons}>
              <span className={styles.resetButton} onClick={resetFilters}>
                Reset
              </span>
              <span className={styles.applyButton} onClick={applyFilters}>
                Apply
              </span>
            </div>
          </div>

          <div className={styles.filterSection}>
            <h4>Rating</h4>
            {["", "1", "2", "3", "4", "5"].map((r) => (
              <label key={r} className={styles.filterOption}>
                <input
                  type="radio"
                  name="rating"
                  value={r}
                  checked={pendingFilters.rating === r}
                  onChange={() => handlePendingFilterChange("rating", r)}
                />
                {r ? `${r} star` : "Show all"}
              </label>
            ))}
          </div>

          <div className={styles.filterSection}>
            <h4>Experience</h4>
            {["", "15", "10-15", "5-10", "3-5", "1-3", "0-1"].map((exp) => (
              <label key={exp} className={styles.filterOption}>
                <input
                  type="radio"
                  name="experience"
                  value={exp}
                  checked={pendingFilters.experience === exp}
                  onChange={() => handlePendingFilterChange("experience", exp)}
                />
                {exp ? `${exp} years` : "Show all"}
              </label>
            ))}
          </div>

          <div className={styles.filterSection}>
            <h4>Gender</h4>
            {["", "Male", "Female"].map((g) => (
              <label key={g} className={styles.filterOption}>
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={pendingFilters.gender === g}
                  onChange={() => handlePendingFilterChange("gender", g)}
                />
                {g || "Show all"}
              </label>
            ))}
          </div>
        </aside>

        <div className={styles.mainContent}>
          <div className={styles.doctorsList}>
            {doctors.length === 0 ? (
              <div className={styles.noDoctors}>No doctors found</div>
            ) : (
              doctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>

          <div className={styles.pagination}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={styles.paginationButton}
            >
              &lt; Prev
            </button>

            {Array.from(
              { length: Math.min(totalPages, 5) },
              (_, index) => index + 1
            ).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`${styles.paginationButton} ${
                  page === p ? styles.active : ""
                }`}
              >
                {p}
              </button>
            ))}

            {totalPages > 5 && <span>...</span>}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={styles.paginationButton}
            >
              Next &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorsList; 