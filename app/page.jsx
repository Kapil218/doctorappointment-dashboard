"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

const StatusBadge = ({ status }) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "approved":
        return styles.statusApproved;
      case "rejected":
        return styles.statusRejected;
      default:
        return styles.statusPending;
    }
  };

  return (
    <span className={`${styles.statusBadge} ${getStatusBadgeClass(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const AppointmentRow = ({ appointment, onStatusChange }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className={styles.appointmentRow}>
      <div className={styles.cell} data-label="Patient ID">
        {appointment.patient_id}
      </div>
      <div className={styles.cell} data-label="Doctor ID">
        {appointment.doctor_id}
      </div>
      <div className={styles.cell} data-label="Date & Time">
        {formatDate(appointment.appointment_time)}
      </div>
      <div className={styles.cell} data-label="Location">
        {appointment.location}
      </div>
      <div className={styles.cell} data-label="Type">
        {appointment.consultation_type}
      </div>
      <div className={styles.cell} data-label="Status">
        <StatusBadge status={appointment.status} />
      </div>
      <div className={styles.cell} data-label="Actions">
        <div className={styles.actionButtons}>
          <button
            className={`${styles.actionButton} ${styles.approveButton}`}
            onClick={() => onStatusChange(appointment.id, "approved")}
            disabled={appointment.status === "approved"}
          >
            Approve
          </button>
          <button
            className={`${styles.actionButton} ${styles.rejectButton}`}
            onClick={() => onStatusChange(appointment.id, "rejected")}
            disabled={appointment.status === "rejected"}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

const AppointmentsHeader = () => (
  <div className={styles.appointmentsHeader}>
    <div className={styles.headerCell}>Patient ID</div>
    <div className={styles.headerCell}>Doctor ID</div>
    <div className={styles.headerCell}>Date & Time</div>
    <div className={styles.headerCell}>Location</div>
    <div className={styles.headerCell}>Type</div>
    <div className={styles.headerCell}>Status</div>
    <div className={styles.headerCell}>Actions</div>
  </div>
);

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/appointments', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      setAppointments(data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load appointments');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/appointments/updateStatus', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          status: newStatus
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update status');
      }

      // Refresh appointments after status change
      await fetchAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update appointment status');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading appointments...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>Appointment Requests</h1>

      <div className={styles.appointmentsContainer}>
        <AppointmentsHeader />
        
        {appointments.length === 0 ? (
          <div className={styles.noAppointments}>No appointments found</div>
        ) : (
          appointments.map((appointment) => (
            <AppointmentRow
              key={appointment.id}
              appointment={appointment}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard; 