import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

// Components
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

// Format duration from seconds to HH:MM:SS
const formatDurationFromSeconds = (totalSeconds) => {
  if (!totalSeconds && totalSeconds !== 0) return { hours: '', minutes: '', seconds: '' };
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return {
    hours: hours > 0 ? hours.toString() : '',
    minutes: minutes > 0 || hours > 0 ? minutes.toString() : '',
    seconds: seconds > 0 || minutes > 0 || hours > 0 ? seconds.toString() : ''
  };
};

// Convert HH:MM:SS to seconds
const durationToSeconds = (hours, minutes, seconds) => {
  return (parseInt(hours || 0) * 3600) + (parseInt(minutes || 0) * 60) + parseInt(seconds || 0);
};

// Run types for the dropdown
const RUN_TYPES = [
  { value: 'run', label: 'Run' },
  { value: 'trail', label: 'Trail Run' },
  { value: 'track', label: 'Track' },
  { value: 'treadmill', label: 'Treadmill' },
  { value: 'race', label: 'Race' },
  { value: 'workout', label: 'Workout' },
];

// Terrain types
const TERRAIN_TYPES = [
  { value: 'road', label: 'Road' },
  { value: 'track', label: 'Track' },
  { value: 'trail', label: 'Trail' },
  { value: 'treadmill', label: 'Treadmill' },
];

// Effort levels
const EFFORT_LEVELS = [
  { value: 'easy', label: 'Easy' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'hard', label: 'Hard' },
  { value: 'race', label: 'Race Effort' },
];

// Weather conditions
const WEATHER_CONDITIONS = [
  { value: 'sunny', label: 'Sunny' },
  { value: 'partly-cloudy', label: 'Partly Cloudy' },
  { value: 'cloudy', label: 'Cloudy' },
  { value: 'rain', label: 'Rain' },
  { value: 'snow', label: 'Snow' },
  { value: 'windy', label: 'Windy' },
  { value: 'fog', label: 'Fog' },
];

const RunFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: format(new Date(), 'HH:mm'),
    distance: '',
    duration: { hours: '', minutes: '', seconds: '' },
    type: 'run',
    terrain: 'road',
    effort: 'easy',
    notes: '',
    calories: '',
    elevationGain: '',
    elevationLoss: '',
    avgHeartRate: '',
    maxHeartRate: '',
    avgCadence: '',
    weather: {
      temperature: '',
      conditions: '',
      humidity: '',
      windSpeed: ''
    },
    shoes: ''
  });
  
  // UI state
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [userShoes, setUserShoes] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Fetch run data in edit mode
  useEffect(() => {
    if (!isEditMode) {
      fetchUserShoes();
      return;
    }

    const fetchRun = async () => {
      try {
        const response = await axios.get(`/api/v1/runs/${id}`);
        const run = response.data;
        
        // Format the run data for the form
        setFormData({
          ...run,
          date: format(parseISO(run.date), 'yyyy-MM-dd'),
          startTime: run.startTime ? format(new Date(`2000-01-01T${run.startTime}`), 'HH:mm') : '',
          duration: formatDurationFromSeconds(run.duration),
          weather: run.weather || {
            temperature: '',
            conditions: '',
            humidity: '',
            windSpeed: ''
          }
        });
        
        // Show advanced/weather sections if they contain data
        if (run.elevationGain || run.elevationLoss || run.avgHeartRate || run.maxHeartRate || run.avgCadence) {
          setShowAdvanced(true);
        }
        if (run.weather && (run.weather.temperature || run.weather.conditions)) {
          setShowWeather(true);
        }
        
        // Fetch user's shoes after run data is loaded
        await fetchUserShoes();
      } catch (err) {
        console.error('Error fetching run:', err);
        setError('Failed to load run data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRun();
  }, [id, isEditMode]);

  // Fetch user's shoes
  const fetchUserShoes = async () => {
    try {
      const response = await axios.get('/api/v1/shoes');
      setUserShoes(response.data);
      
      // If there's only one pair of shoes, pre-select it
      if (response.data.length === 1 && !isEditMode) {
        setFormData(prev => ({
          ...prev,
          shoes: response.data[0]._id
        }));
      }
    } catch (err) {
      console.error('Error fetching shoes:', err);
      // Don't fail the whole form if shoes can't be loaded
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested state (like duration.hours, weather.temperature)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : parseFloat(value)) : value)
      }));
    }
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    // Required fields
    if (!formData.date) {
      errors.date = 'Date is required';
      isValid = false;
    }
    
    if (!formData.distance) {
      errors.distance = 'Distance is required';
      isValid = false;
    } else if (isNaN(formData.distance) || formData.distance <= 0) {
      errors.distance = 'Distance must be a positive number';
      isValid = false;
    }
    
    // Check if at least one duration field has a value
    const { hours, minutes, seconds } = formData.duration;
    if (!hours && !minutes && !seconds) {
      errors.duration = 'At least one duration field is required';
      isValid = false;
    } else {
      // Validate duration components
      if (hours && (isNaN(hours) || hours < 0)) {
        errors.duration = 'Hours must be a positive number';
        isValid = false;
      }
      if (minutes && (isNaN(minutes) || minutes < 0 || minutes >= 60)) {
        errors.duration = 'Minutes must be between 0 and 59';
        isValid = false;
      }
      if (seconds && (isNaN(seconds) || seconds < 0 || seconds >= 60)) {
        errors.duration = 'Seconds must be between 0 and 59';
        isValid = false;
      }
    }
    
    // Validate weather fields if shown
    if (showWeather) {
      const { temperature, conditions } = formData.weather;
      if (temperature && (isNaN(temperature) || temperature < -50 || temperature > 60)) {
        errors.weather = 'Temperature must be between -50°C and 60°C';
        isValid = false;
      }
    }
    
    setValidationErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare the data for API
      const payload = {
        ...formData,
        duration: durationToSeconds(
          formData.duration.hours,
          formData.duration.minutes,
          formData.duration.seconds
        ),
        // Only include weather data if the section is shown
        weather: showWeather ? formData.weather : undefined,
        // Remove empty strings for numeric fields to allow default values
        calories: formData.calories || undefined,
        elevationGain: formData.elevationGain || undefined,
        elevationLoss: formData.elevationLoss || undefined,
        avgHeartRate: formData.avgHeartRate || undefined,
        maxHeartRate: formData.maxHeartRate || undefined,
        avgCadence: formData.avgCadence || undefined,
        shoes: formData.shoes || undefined
      };
      
      let response;
      if (isEditMode) {
        response = await axios.put(`/api/v1/runs/${id}`, payload);
      } else {
        response = await axios.post('/api/v1/runs', payload);
      }
      
      // Redirect to the run detail page after successful save
      navigate(`/runs/${response.data._id}`);
    } catch (err) {
      console.error('Error saving run:', err);
      
      // Handle validation errors from the server
      if (err.response && err.response.data && err.response.data.errors) {
        const serverErrors = {};
        err.response.data.errors.forEach(error => {
          // Map server field names to form field names if needed
          const field = error.path === 'duration' ? 'duration' : error.path;
          serverErrors[field] = error.msg;
        });
        setValidationErrors(serverErrors);
      } else {
        setError(err.response?.data?.message || 'Failed to save run. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    
    try {
      setSaving(true);
      await axios.delete(`/api/v1/runs/${id}`);
      navigate('/runs');
    } catch (err) {
      console.error('Error deleting run:', err);
      setError('Failed to delete run. Please try again.');
      setSaving(false);
      setDeleteConfirm(false);
    }
  };

  // Loading and error states
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={isEditMode ? () => window.location.reload() : null} />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Run' : 'Log a New Run'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Section */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Basic Information</h3>
              <p className="mt-1 text-sm text-gray-500">Basic details about your run.</p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                {/* Date and Time */}
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    required
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                    Start Time (optional)
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    id="startTime"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={formData.startTime}
                    onChange={handleChange}
                  />
                </div>

                {/* Distance and Duration */}
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="distance" className="block text-sm font-medium text-gray-700">
                    Distance (km) <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="distance"
                      id="distance"
                      step="0.01"
                      min="0"
                      required
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                      value={formData.distance}
                      onChange={handleChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">km</span>
                    </div>
                  </div>
                  {validationErrors.distance && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.distance}</p>
                  )}
                </div>

                {/* Duration Fields */}
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 grid grid-cols-3 gap-3 max-w-md">
                    <div>
                      <input
                        type="number"
                        name="duration.hours"
                        placeholder="0"
                        min="0"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.duration.hours}
                        onChange={handleChange}
                      />
                      <label htmlFor="duration.hours" className="block text-xs text-center text-gray-500 mt-1">hours</label>
                    </div>
                    <div>
                      <input
                        type="number"
                        name="duration.minutes"
                        placeholder="0"
                        min="0"
                        max="59"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.duration.minutes}
                        onChange={handleChange}
                      />
                      <label htmlFor="duration.minutes" className="block text-xs text-center text-gray-500 mt-1">min</label>
                    </div>
                    <div>
                      <input
                        type="number"
                        name="duration.seconds"
                        placeholder="0"
                        min="0"
                        max="59"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.duration.seconds}
                        onChange={handleChange}
                      />
                      <label htmlFor="duration.seconds" className="block text-xs text-center text-gray-500 mt-1">sec</label>
                    </div>
                  </div>
                  {validationErrors.duration && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.duration}</p>
                  )}
                </div>

                {/* Run Type, Terrain, Effort */}
                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    {RUN_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="terrain" className="block text-sm font-medium text-gray-700">
                    Terrain
                  </label>
                  <select
                    id="terrain"
                    name="terrain"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.terrain}
                    onChange={handleChange}
                  >
                    {TERRAIN_TYPES.map((terrain) => (
                      <option key={terrain.value} value={terrain.value}>
                        {terrain.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="effort" className="block text-sm font-medium text-gray-700">
                    Effort
                  </label>
                  <select
                    id="effort"
                    name="effort"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.effort}
                    onChange={handleChange}
                  >
                    {EFFORT_LEVELS.map((effort) => (
                      <option key={effort.value} value={effort.value}>
                        {effort.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div className="col-span-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes (optional)
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="How did it go? Any thoughts or feelings about the run?"
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Shoes */}
                {userShoes.length > 0 && (
                  <div className="col-span-6">
                    <label htmlFor="shoes" className="block text-sm font-medium text-gray-700">
                      Shoes (optional)
                    </label>
                    <select
                      id="shoes"
                      name="shoes"
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.shoes || ''}
                      onChange={handleChange}
                    >
                      <option value="">-- Select shoes --</option>
                      {userShoes.map((shoe) => (
                        <option key={shoe._id} value={shoe._id}>
                          {shoe.name} ({shoe.brand} {shoe.model})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Stats Section */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Advanced Stats</h3>
              <p className="mt-1 text-sm text-gray-500">Additional statistics about your run.</p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="calories" className="block text-sm font-medium text-gray-700">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    name="calories"
                    id="calories"
                    min="0"
                    step="1"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={formData.calories}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="avgHeartRate" className="block text-sm font-medium text-gray-700">
                    Avg. Heart Rate (bpm)
                  </label>
                  <input
                    type="number"
                    name="avgHeartRate"
                    id="avgHeartRate"
                    min="0"
                    step="1"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={formData.avgHeartRate}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="elevationGain" className="block text-sm font-medium text-gray-700">
                    Elevation Gain (m)
                  </label>
                  <input
                    type="number"
                    name="elevationGain"
                    id="elevationGain"
                    min="0"
                    step="0.1"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={formData.elevationGain}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="elevationLoss" className="block text-sm font-medium text-gray-700">
                    Elevation Loss (m)
                  </label>
                  <input
                    type="number"
                    name="elevationLoss"
                    id="elevationLoss"
                    min="0"
                    step="0.1"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={formData.elevationLoss}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="avgCadence" className="block text-sm font-medium text-gray-700">
                    Avg. Cadence (spm)
                  </label>
                  <input
                    type="number"
                    name="avgCadence"
                    id="avgCadence"
                    min="0"
                    step="1"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={formData.avgCadence}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Section */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Weather</h3>
              <p className="mt-1 text-sm text-gray-500">Weather conditions during your run.</p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="weather.temperature" className="block text-sm font-medium text-gray-700">
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    name="weather.temperature"
                    id="weather.temperature"
                    min="-50"
                    max="60"
                    step="0.1"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={formData.weather.temperature}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="weather.conditions" className="block text-sm font-medium text-gray-700">
                    Conditions
                  </label>
                  <select
                    id="weather.conditions"
                    name="weather.conditions"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.weather.conditions}
                    onChange={handleChange}
                  >
                    <option value="">-- Select condition --</option>
                    {WEATHER_CONDITIONS.map((condition) => (
                      <option key={condition.value} value={condition.value}>
                        {condition.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="weather.humidity" className="block text-sm font-medium text-gray-700">
                    Humidity (%)
                  </label>
                  <input
                    type="number"
                    name="weather.humidity"
                    id="weather.humidity"
                    min="0"
                    max="100"
                    step="1"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={formData.weather.humidity}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="weather.windSpeed" className="block text-sm font-medium text-gray-700">
                    Wind Speed (km/h)
                  </label>
                  <input
                    type="number"
                    name="weather.windSpeed"
                    id="weather.windSpeed"
                    min="0"
                    step="0.1"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={formData.weather.windSpeed}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          {isEditMode && (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              disabled={saving}
            >
              {deleteConfirm ? 'Confirm Delete' : 'Delete Run'}
            </button>
          )}
          <Link
            to="/runs"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={saving}
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : isEditMode ? 'Update Run' : 'Save Run'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RunFormPage;