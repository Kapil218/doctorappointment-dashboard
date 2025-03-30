"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const DoctorSchedule = ({ params }) => {
  const router = useRouter();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/v1/doctors/${params.id}/schedule`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch schedule");
        }

        const data = await response.json();
        setSchedule(data.data || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching schedule:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [params.id]);

  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/doctors/${params.id}/schedule`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ schedule }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update schedule");
      }

      router.push("/doctors");
    } catch (err) {
      setError(err.message);
      console.error("Error updating schedule:", err);
    }
  };

  const addTimeSlot = () => {
    setSchedule([...schedule, { day: "", time: "" }]);
  };

  const removeTimeSlot = (index) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[index] = {
      ...newSchedule[index],
      [field]: value,
    };
    setSchedule(newSchedule);
  };

  if (loading) {
    return <div className={styles.loading}>Loading schedule...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.schedulePage}>
      <h1 className={styles.pageTitle}>Doctor Schedule</h1>

      <form onSubmit={handleUpdateSchedule} className={styles.scheduleForm}>
        <div className={styles.timeSlots}>
          <button type="button" onClick={addTimeSlot} className={styles.addButton}>
            Add Time Slot
          </button>

          {schedule.map((slot, index) => (
            <div key={index} className={styles.timeSlot}>
              <select
                value={slot.day || ""}
                onChange={(e) => updateTimeSlot(index, "day", e.target.value)}
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
                onChange={(e) => updateTimeSlot(index, "time", e.target.value)}
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
            Update Schedule
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorSchedule; 