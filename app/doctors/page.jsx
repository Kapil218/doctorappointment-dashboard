"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import Image from 'next/image';

const DoctorCard = ({ doctor, onDelete }) => {
  return (
    <div className={styles.doctorCard}>
      <div className={styles.doctorImageContainer}>
        <Image
          src={doctor.image || "/defaultpic.jpg"}
          alt={`Dr. ${doctor.name}`}
          className={styles.doctorImage}
          width={400}
          height={400}
          priority
        />
      </div>
      <div className={styles.doctorContent}>
        <div className={styles.doctorInfo}>
          <h3>Dr. {doctor.name}</h3>
          <p className={styles.specialty}>{doctor.specialty}</p>
          <p className={styles.experience}>
            <span>👨‍⚕️</span> {doctor.experience} experience
          </p>
          <p className={styles.rating}>
            <span>⭐</span> {doctor.rating} Rating
          </p>
          <p className={styles.location}>
            <span>📍</span> {doctor.location}
          </p>
        </div>
        <div className={styles.doctorActions}>
          <Link
            href={`/doctors/edit/${doctor.id}/${doctor.id}`}
            className={styles.editButton}
          >
            Edit
          </Link>
          <Link
            href={`/doctors/schedule/${doctor.id}`}
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
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Doctors</h1>
        <Link href="/doctors/add" className={styles.addButton}>
          Add Doctor
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search doctors..."
        className={styles.searchBar}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className={styles.filterSection}>
        <div className={styles.filterHeader}>
          <h2 className={styles.filterTitle}>Filter By:</h2>
          
          <div className={styles.filterContent}>
            <div className={styles.filterGroup}>
              <h3 className={styles.filterGroupTitle}>Rating:</h3>
              <select
                className={styles.select}
                value={pendingFilters.rating}
                onChange={(e) => handlePendingFilterChange("rating", e.target.value)}
              >
                <option value="">All</option>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating.toString()}>
                    {rating} star
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.filterGroupTitle}>Experience:</h3>
              <select
                className={styles.select}
                value={pendingFilters.experience}
                onChange={(e) => handlePendingFilterChange("experience", e.target.value)}
              >
                <option value="">All</option>
                {[
                  "15 years",
                  "10-15 years",
                  "5-10 years",
                  "3-5 years",
                  "1-3 years",
                  "0-1 years",
                ].map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.filterGroupTitle}>Gender:</h3>
              <select
                className={styles.select}
                value={pendingFilters.gender}
                onChange={(e) => handlePendingFilterChange("gender", e.target.value)}
              >
                <option value="">All</option>
                {["Male", "Female"].map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterActions}>
              <button onClick={resetFilters} className={styles.resetButton}>
                Reset
              </button>
              <button onClick={applyFilters} className={styles.applyButton}>
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <div className={styles.doctorsList}>
            {doctors.length === 0 ? (
              <div className={styles.noDoctors}>No doctors found</div>
            ) : (
              doctors.map((doctor) => (
                <div key={doctor.id} className={styles.doctorCard}>
                  <div className={styles.doctorImageContainer}>
                    <Image
                      src={doctor.image || "/defaultpic.jpg"}
                      alt={`Dr. ${doctor.name}`}
                      className={styles.doctorImage}
                      width={400}
                      height={400}
                      priority
                    />
                  </div>
                  <div className={styles.doctorContent}>
                    <div className={styles.doctorInfo}>
                      <h3>Dr. {doctor.name}</h3>
                      <p className={styles.specialty}>{doctor.specialty}</p>
                      <p className={styles.experience}>
                        <span>👨‍⚕️</span> {doctor.experience} experience
                      </p>
                      <p className={styles.rating}>
                        <span>⭐</span> {doctor.rating} Rating
                      </p>
                      <p className={styles.location}>
                        <span>📍</span> {doctor.location}
                      </p>
                    </div>
                    <div className={styles.doctorActions}>
                      <Link href={`/doctors/edit/${doctor.id}`} className={styles.editButton}>
                        Edit
                      </Link>
                      <Link href={`/doctors/schedule/${doctor.id}`} className={styles.scheduleButton}>
                        Schedule
                      </Link>
                      <button
                        onClick={() => handleDelete(doctor.id)}
                        className={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.pagination}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`${styles.paginationButton} ${styles.paginationNav}`}
            >
              ← Prev
            </button>

            {/* First page */}
            {page > 3 && (
              <>
                <button
                  onClick={() => setPage(1)}
                  className={`${styles.paginationButton} ${page === 1 ? styles.active : ''}`}
                >
                  1
                </button>
                <span className={styles.paginationEllipsis}>...</span>
              </>
            )}

            {/* Page numbers */}
            {Array.from(
              { length: Math.min(5, totalPages) },
              (_, i) => {
                const pageNum = Math.max(
                  1,
                  Math.min(
                    page - 2 + i,
                    totalPages - 4
                  )
                );
                return pageNum;
              }
            )
              .filter((value, index, self) => self.indexOf(value) === index)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`${styles.paginationButton} ${page === p ? styles.active : ''}`}
                >
                  {p}
                </button>
              ))}

            {/* Last page */}
            {page < totalPages - 2 && (
              <>
                <span className={styles.paginationEllipsis}>...</span>
                <button
                  onClick={() => setPage(totalPages)}
                  className={`${styles.paginationButton} ${page === totalPages ? styles.active : ''}`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`${styles.paginationButton} ${styles.paginationNav}`}
            >
              Next →
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DoctorsList; 