import React, { useState } from 'react';
import './SettingsContainer.css'; // Import the CSS file

const SettingsContainer: React.FC = () => {
  const [notes, setNotes] = useState<string>('');
  const [reminderNumber, setReminderNumber] = useState<number | ''>('');
  const [reminderUnit, setReminderUnit] = useState<string>('minutes');

  const handleSave = () => {
    // Save logic can be implemented here
    console.log('Notes:', notes);
    console.log('Reminder Number:', reminderNumber);
    console.log('Reminder Unit:', reminderUnit);
  };

  return (
    <div className="setting-container">
      <h2 className="setting-heading">Quiz 1</h2>
      <hr className="divider" />

      {/* Notes Section */}
      <div className="notes-section">
        <label htmlFor="notes" className="notes-label">Notes:</label>
        <textarea
          id="notes"
          className="notes-textbox"
          placeholder="Write your notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Reminder Section */}
      <div className="reminder-section">
        <label htmlFor="reminder-number" className="reminder-label">Reminder:</label>
        <input
          type="number"
          id="reminder-number"
          className="reminder-input"
          min="1"
          placeholder="Enter number"
          value={reminderNumber}
          onChange={(e) => setReminderNumber(e.target.value ? parseInt(e.target.value) : '')}
        />

        <select
          id="reminder-unit"
          className="reminder-dropdown"
          value={reminderUnit}
          onChange={(e) => setReminderUnit(e.target.value)}
        >
          <option value="minutes">Minute(s)</option>
          <option value="hours">Hour(s)</option>
          <option value="days">Day(s)</option>
          <option value="weeks">Week(s)</option>
        </select>

        <button className="save-button" onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default SettingsContainer;
