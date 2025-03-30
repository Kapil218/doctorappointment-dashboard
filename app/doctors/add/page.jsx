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
    available_times: {}
  });
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);

  const timeSlots = {
    morning: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
    afternoon: ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"],
    evening: ["16:00", "16:30", "17:00", "17:30"]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/v1/doctors/add-doctor", {
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

  const handleDateAdd = () => {
    if (!selectedDate || selectedSlots.length === 0) return;

    setFormData(prev => ({
      ...prev,
      available_times: {
        ...prev.available_times,
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
      }
    }));

    setSelectedDate("");
    setSelectedSlots([]);
  };

  const handleDateRemove = (dateToRemove) => {
    const newAvailableTimes = { ...formData.available_times };
    delete newAvailableTimes[dateToRemove];
    setFormData(prev => ({
      ...prev,
      available_times: newAvailableTimes
    }));
  };

  const handleSlotToggle = (slot) => {
    setSelectedSlots(prev => {
      if (prev.includes(slot)) {
        return prev.filter(s => s !== slot);
      } else {
        return [...prev, slot];
      }
    });
  };

  const handleSlotUpdate = (date, slot) => {
    setFormData(prev => ({
      ...prev,
      available_times: prev.available_times.map(d => {
        if (d.date === date) {
          const newSlots = d.slots.includes(slot)
            ? d.slots.filter(s => s !== slot)
            : [...d.slots, slot];
          return { ...d, slots: newSlots };
        }
        return d;
      })
    }));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Add New Doctor</h1>

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

        <div className={styles.timeSlotsSection}>
          <h3>Available Dates and Time Slots</h3>
          
          <div className={styles.dateSelector}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            
            {Object.entries(timeSlots).map(([period, slots]) => (
              <div key={period} className={styles.periodSection}>
                <h4 className={styles.periodTitle}>{period.charAt(0).toUpperCase() + period.slice(1)}</h4>
                <div className={styles.slotSelector}>
                  {slots.map(slot => (
                    <label key={slot} className={styles.slotLabel}>
                      <input
                        type="checkbox"
                        checked={selectedSlots.includes(slot)}
                        onChange={() => {
                          setSelectedSlots(prev => 
                            prev.includes(slot) 
                              ? prev.filter(s => s !== slot)
                              : [...prev, slot]
                          );
                        }}
                        className={styles.slotCheckbox}
                      />
                      <span>{slot}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleDateAdd}
              disabled={!selectedDate || selectedSlots.length === 0}
              className={styles.addDateButton}
            >
              Add Date
            </button>
          </div>

          {Object.keys(formData.available_times).length === 0 ? (
            <p className={styles.noDateMessage}>No dates added yet</p>
          ) : (
            Object.entries(formData.available_times).map(([date, periods]) => (
              <div key={date} className={styles.dateSection}>
                <div className={styles.dateHeader}>
                  <h4>{new Date(date).toLocaleDateString()}</h4>
                  <button
                    type="button"
                    onClick={() => handleDateRemove(date)}
                    className={styles.removeDateButton}
                  >
                    Remove
                  </button>
                </div>
                {Object.entries(periods).map(([period, slots]) => (
                  slots.length > 0 && (
                    <div key={period} className={styles.periodSection}>
                      <h5 className={styles.periodTitle}>
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </h5>
                      <div className={styles.selectedSlots}>
                        {slots.map(slot => (
                          <span key={slot} className={styles.selectedSlot}>
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            ))
          )}
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