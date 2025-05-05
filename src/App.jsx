import { useState, useEffect, useRef } from 'react';
import './styles.css';

function App() {
  const [formData, setFormData] = useState({
    processName: '',
    productDescription: '',
    line: '',
    unitsPerBag: '',
    bagsPerCase: '',
    casesPerPallet: ''
  });

  const [events, setEvents] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const timerRef = useRef(null);
  const [palletCount, setPalletCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalEventType, setModalEventType] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [pendingEvent, setPendingEvent] = useState(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 10);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, startTime]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const logEvent = (label, description = '', customTimestamp = null, customDuration = null) => {
    const now = customTimestamp || Date.now();
    const duration = customDuration !== null ? customDuration : (events.length > 0 ? now - events[events.length - 1].timestamp : 0);
    let extra = {};
    if (label === 'Pallet Complete') {
      extra.palletCount = palletCount + 1;
      setPalletCount(prev => prev + 1);
    }
    if (description) {
      extra.description = description;
    }
    setEvents(prev => [...prev, {
      label,
      timestamp: now,
      duration,
      formattedTime: formatTime(duration),
      ...extra
    }]);
  };

  const handleStartTimer = () => {
    if (!isRunning) {
      setStartTime(Date.now());
      setIsRunning(true);
      logEvent('Process Started');
    }
  };

  const handleStopTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      logEvent('Process Stopped');
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setStartTime(null);
    setCurrentTime(0);
    setEvents([]);
  };

  const exportData = () => {
    // Create CSV content
    const csvContent = [
      // Header row
      ['Process Name', 'Product Description', 'Line', 'Units per Bag', 'Bags per Case', 'Cases per Pallet', 'Event', 'Timestamp', 'Duration'],
      // Form data row
      [
        formData.processName,
        formData.productDescription,
        formData.line,
        formData.unitsPerBag,
        formData.bagsPerCase,
        formData.casesPerPallet,
        'Process Data',
        new Date().toISOString(),
        ''
      ],
      // Empty row for separation
      ['', '', '', '', '', '', '', '', ''],
      // Event log header
      ['', '', '', '', '', '', 'Event Log', 'Timestamp', 'Duration'],
      // Event log data
      ...events.map(event => [
        '', '', '', '', '', '',
        event.label,
        new Date(event.timestamp).toISOString(),
        event.formattedTime
      ])
    ];

    // Convert to CSV string
    const csvString = csvContent.map(row => row.join(',')).join('\n');

    // Create and trigger download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `time_study_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEventWithDescription = (eventType) => {
    const now = Date.now();
    const duration = events.length > 0 ? now - events[events.length - 1].timestamp : 0;
    setPendingEvent({ eventType, timestamp: now, duration });
    setModalEventType(eventType);
    setModalDescription('');
    setShowModal(true);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (pendingEvent) {
      logEvent(pendingEvent.eventType, modalDescription, pendingEvent.timestamp, pendingEvent.duration);
    }
    setShowModal(false);
    setModalEventType('');
    setModalDescription('');
    setPendingEvent(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalEventType('');
    setModalDescription('');
    setPendingEvent(null);
  };

  return (
    <div className="app-outer-center">
      <div className="app-container">
        <img src="logo-rustic.png" alt="Time Study Tool Logo" className="logo" />
        <h1 className="title">Time Study Tool</h1>
        
        <div className="space-y-6">
          <div className="input-group">
            <label className="input-label">Process Name</label>
            <input
              type="text"
              name="processName"
              value={formData.processName}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter process name"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Product Description</label>
            <input
              type="text"
              name="productDescription"
              value={formData.productDescription}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter product description"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Line</label>
            <input
              type="text"
              name="line"
              value={formData.line}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter line number"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Units per Bag</label>
            <input
              type="number"
              name="unitsPerBag"
              value={formData.unitsPerBag}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter units per bag"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Bags per Case</label>
            <input
              type="number"
              name="bagsPerCase"
              value={formData.bagsPerCase}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter bags per case"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Cases per Pallet</label>
            <input
              type="number"
              name="casesPerPallet"
              value={formData.casesPerPallet}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter cases per pallet"
            />
          </div>
        </div>

        <div className="timer-container">
          <div className="timer-display">{formatTime(currentTime)}</div>
          <div className="timer-status">
            {isRunning ? '⏱️ Timer Running' : '⏸️ Timer Stopped'}
          </div>
        </div>

        <div className="mt-12 space-y-5">
          <button 
            onClick={handleStartTimer}
            disabled={isRunning}
            className="button button-start"
          >
            ▶️ Start Timer
          </button>
          <button 
            onClick={() => handleEventWithDescription('Downtime Start')}
            disabled={!isRunning}
            className="button button-downtime"
          >
            ⚠️ Downtime Start
          </button>
          <button 
            onClick={() => logEvent('Downtime End')}
            disabled={!isRunning}
            className="button button-downtime"
          >
            ✅ Downtime End
          </button>
          <button 
            onClick={() => handleEventWithDescription('Operator Task')}
            disabled={!isRunning}
            className="button button-operator"
          >
            👷 Log Operator Task
          </button>
          <button 
            onClick={() => logEvent('Pallet Complete')}
            disabled={!isRunning}
            className="button button-pallet"
          >
            📦 Log Pallet Complete
          </button>
          <button 
            onClick={handleStopTimer}
            disabled={!isRunning}
            className="button button-stop"
          >
            ⏹️ Stop Timer
          </button>
          <button 
            onClick={handleReset}
            className="button button-reset"
          >
            🔄 Reset
          </button>
          <button 
            onClick={exportData}
            className="button button-export"
          >
            📊 Export Data
          </button>
        </div>

        {showModal && (
          <div className="modal-backdrop">
            <div className="modal">
              <form onSubmit={handleModalSubmit}>
                <h3 className="modal-title">Add Description</h3>
                <textarea
                  className="modal-textarea"
                  value={modalDescription}
                  onChange={e => setModalDescription(e.target.value)}
                  placeholder="Enter a description for this event..."
                  rows={3}
                  autoFocus
                />
                <div className="modal-actions">
                  <button type="button" className="button button-reset" onClick={handleModalClose}>Cancel</button>
                  <button type="submit" className="button button-start">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {events.length > 0 && (
          <div className="event-log">
            <h2 className="event-log-title">📋 Event Log</h2>
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={index} className="event-item">
                  <span className="event-label">
                    {event.label}
                    {event.label === 'Pallet Complete' && event.palletCount ? ` (Pallet #${event.palletCount})` : ''}
                  </span>
                  <span className="event-time">{event.formattedTime}</span>
                  {event.description && (
                    <div className="event-description">{event.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
