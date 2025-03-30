"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import styles from "./page.module.css";

const DoctorSchedule = ({ params }) => {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);

  const timeSlots = {
    morning: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
    afternoon: ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"],
    evening: ["16:00", "16:30", "17:00", "17:30"]
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/v1/doctors/${unwrappedParams.id}/schedule`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch schedule");
        }

        const data = await response.json();
        setSchedule(data.data?.available_times || {});
      } catch (err) {
        setError(err.message);
        console.error("Error fetching schedule:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [unwrappedParams.id]);

  const handleDateAdd = () => {
    if (!selectedDate || selectedSlots.length === 0) return;

    setSchedule(prev => ({
      ...prev,
      [selectedDate]: {
        morning: selectedSlots.filter(slot => {
          const hour = parseInt(slot.split(':')[0]);
          return hour < 12;
        }),
        afternoon: selectedSlots.filter(slot => {
          const hour = parseInt(slot.split(':')[0]);
          return hour >= 12 && hour < 16;
        }),
        evening: selectedSlots.filter(slot => {
          const hour = parseInt(slot.split(':')[0]);
          return hour >= 16;
        })
      }
    }));

    setSelectedDate("");
    setSelectedSlots([]);
  };

  const handleDateRemove = (dateToRemove) => {
    const newSchedule = { ...schedule };
    delete newSchedule[dateToRemove];
    setSchedule(newSchedule);
  };

  const handleSlotToggle = (slot) => {
    setSelectedSlots(prev => {
      if (prev.includes(slot)) {
        return prev.filter(s => s !== slot);
      } else {
        return [...prev, slot].sort();
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/doctors/${unwrappedParams.id}/schedule`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ available_times: schedule }),
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

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.schedulePage}>
      <h1 className={styles.pageTitle}>Manage Doctor Schedule</h1>

      <form onSubmit={handleSubmit} className={styles.scheduleForm}>
        <div className={styles.addDateSection}>
          <h3>Add New Date and Time Slots</h3>
          
          <div className={styles.dateSelector}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={styles.dateInput}
            />
          </div>

          <div className={styles.timeSlotGroups}>
            {Object.entries(timeSlots).map(([period, slots]) => (
              <div key={period} className={styles.periodSection}>
                <h4 className={styles.periodTitle}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </h4>
                <div className={styles.slotGrid}>
                  {slots.map(slot => (
                    <label key={slot} className={styles.slotLabel}>
                      <input
                        type="checkbox"
                        checked={selectedSlots.includes(slot)}
                        onChange={() => handleSlotToggle(slot)}
                        className={styles.slotCheckbox}
                      />
                      <span>{slot}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleDateAdd}
            disabled={!selectedDate || selectedSlots.length === 0}
            className={styles.addButton}
          >
            Add Selected Slots
          </button>
        </div>

        <div className={styles.scheduledDates}>
          <h3>Scheduled Dates</h3>
          
          {Object.keys(schedule).length === 0 ? (
            <p className={styles.noSchedule}>No dates scheduled yet</p>
          ) : (
            Object.entries(schedule).map(([date, periods]) => (
              <div key={date} className={styles.dateCard}>
                <div className={styles.dateHeader}>
                  <h4>{new Date(date).toLocaleDateString()}</h4>
                  <button
                    type="button"
                    onClick={() => handleDateRemove(date)}
                    className={styles.removeButton}
                  >
                    Remove Date
                  </button>
                </div>
                <div className={styles.dateSlots}>
                  {Object.entries(periods).map(([period, slots]) => (
                    slots.length > 0 && (
                      <div key={period} className={styles.periodSlots}>
                        <h5>{period.charAt(0).toUpperCase() + period.slice(1)}</h5>
                        <div className={styles.slotTags}>
                          {slots.map(slot => (
                            <span key={slot} className={styles.slotTag}>
                              {slot}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>
            Save Schedule
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorSchedule; 