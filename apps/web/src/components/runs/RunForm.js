const React = require('react');
const { useState, useEffect } = require('react');
const { useNavigate, useParams } = require('react-router-dom');
const axios = require('axios');

const RunForm = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = require('@/context/AuthContext').useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    distance: '',
    duration: { hours: 0, minutes: 0, seconds: 0 },
    notes: '',
    type: 'run',
    terrain: 'road',
    effort: 'easy',
    weather: {
      temperature: '',
      condition: 'clear',
      humidity: '',
      windSpeed: ''
    },
    shoes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shoes, setShoes] = useState([]);
  
  // Fetch run data if in edit mode
  useEffect(() => {
    if (isEdit && id) {
      const fetchRun = async () => {
        try {
          const response = await axios.get(`/api/v1/runs/${id}`);
          const run = response.data.data;
          
          // Convert duration from seconds to hours, minutes, seconds
          const hours = Math.floor(run.duration / 3600);
          const minutes = Math.floor((run.duration % 3600) / 60);
          const seconds = run.duration % 60;
          
          setFormData({
            ...run,
            distance: (run.distance / 1000).toFixed(2), // Convert meters to km
            duration: { hours, minutes, seconds },
            weather: {
              temperature: run.weather?.temperature || '',
              condition: run.weather?.condition || 'clear',
              humidity: run.weather?.humidity || '',
              windSpeed: run.weather?.windSpeed || ''
            }
          });
        } catch (error) {
          console.error('Error fetching run:', error);
          // Handle error (e.g., show error message)
        }
      };
      
      fetchRun();
    }
    
    // Fetch user's shoes
    const fetchShoes = async () => {
      try {
        // In a real app, fetch from /api/v1/shoes
        // For now, using mock data
        const mockShoes = [
          { _id: '1', name: 'Nike Pegasus 40', distance: 120 },
          { _id: '2', name: 'Hoka Clifton 9', distance: 80 },
        ];
        setShoes(mockShoes);
      } catch (error) {
        console.error('Error fetching shoes:', error);
      }
    };
    
    fetchShoes();
  }, [isEdit, id]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name in formData.weather) {
      setFormData(prev => ({
        ...prev,
        weather: {
          ...prev.weather,
          [name]: type === 'number' ? parseFloat(value) || '' : value
        }
      }));
    } else if (name in formData.duration) {
      setFormData(prev => ({
        ...prev,
        duration: {
          ...prev.duration,
          [name]: parseInt(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.date) newErrors.date = 'Date is required';
    
    if (!formData.distance) {
      newErrors.distance = 'Distance is required';
    } else if (isNaN(formData.distance) || parseFloat(formData.distance) <= 0) {
      newErrors.distance = 'Distance must be a positive number';
    }
    
    const { hours, minutes, seconds } = formData.duration;
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      // Calculate total duration in seconds
      const totalSeconds = formData.duration.hours * 3600 + 
                          formData.duration.minutes * 60 + 
                          formData.duration.seconds;
      
      const payload = {
        ...formData,
        distance: parseFloat(formData.distance) * 1000, // Convert km to meters
        duration: totalSeconds,
        user: user.id
      };
      
      let response;
      if (isEdit) {
        response = await axios.put(`/api/v1/runs/${id}`, payload);
      } else {
        response = await axios.post('/api/v1/runs', payload);
      }
      
      // Redirect to run detail page or runs list
      navigate(`/runs/${response.data.data._id}`);
    } catch (error) {
      console.error('Error saving run:', error);
      
      // Handle validation errors from the server
      if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.param] = err.msg;
        });
        setErrors(serverErrors);
      } else {
        setErrors({ form: error.response?.data?.message || 'Failed to save run. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium leading-6 text-gray-900">
          {isEdit ? 'Edit Run' : 'Log a New Run'}
        </h2>
        
        {errors.form && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{errors.form}</h3>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          {/* Basic Run Info */}
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title (optional)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="title"
                  id="title"
                  className={`block w-full rounded-md ${errors.title ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500'} sm:text-sm`}
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Morning run, Long run, etc."
                />
              </div>
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="date"
                  id="date"
                  required
                  className={`block w-full rounded-md ${errors.date ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500'} sm:text-sm`}
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="distance" className="block text-sm font-medium text-gray-700">
                Distance (km) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  name="distance"
                  id="distance"
                  step="0.01"
                  min="0.1"
                  required
                  className={`block w-full pr-12 rounded-md ${errors.distance ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500'} sm:text-sm`}
                  placeholder="0.00"
                  value={formData.distance}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">km</span>
                </div>
              </div>
              {errors.distance && (
                <p className="mt-1 text-sm text-red-600">{errors.distance}</p>
              )}
            </div>
            
            <div className="sm:col-span-4">
              <label className="block text-sm font-medium text-gray-700">
                Duration <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="duration-hours" className="sr-only">Hours</label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="hours"
                      id="duration-hours"
                      min="0"
                      max="99"
                      className={`block w-full rounded-md ${errors.duration ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500'} sm:text-sm`}
                      value={formData.duration.hours}
                      onChange={handleChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">h</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="duration-minutes" className="sr-only">Minutes</label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="minutes"
                      id="duration-minutes"
                      min="0"
                      max="59"
                      className={`block w-full rounded-md ${errors.duration ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500'} sm:text-sm`}
                      value={formData.duration.minutes}
                      onChange={handleChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">m</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="duration-seconds" className="sr-only">Seconds</label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="seconds"
                      id="duration-seconds"
                      min="0"
                      max="59"
                      className={`block w-full rounded-md ${errors.duration ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500'} sm:text-sm`}
                      value={formData.duration.seconds}
                      onChange={handleChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">s</span>
                    </div>
                  </div>
                </div>
              </div>
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
              )}
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Run Type
              </label>
              <select
                id="type"
                name="type"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="run">Run</option>
                <option value="trail">Trail Run</option>
                <option value="track">Track</option>
                <option value="treadmill">Treadmill</option>
                <option value="race">Race</option>
                <option value="workout">Workout</option>
              </select>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="terrain" className="block text-sm font-medium text-gray-700">
                Terrain
              </label>
              <select
                id="terrain"
                name="terrain"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={formData.terrain}
                onChange={handleChange}
              >
                <option value="road">Road</option>
                <option value="trail">Trail</option>
                <option value="track">Track</option>
                <option value="treadmill">Treadmill</option>
              </select>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="effort" className="block text-sm font-medium text-gray-700">
                Effort Level
              </label>
              <select
                id="effort"
                name="effort"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={formData.effort}
                onChange={handleChange}
              >
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard</option>
                <option value="race">Race Effort</option>
              </select>
            </div>
            
            {shoes.length > 0 && (
              <div className="sm:col-span-3">
                <label htmlFor="shoes" className="block text-sm font-medium text-gray-700">
                  Shoes (optional)
                </label>
                <select
                  id="shoes"
                  name="shoes"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={formData.shoes}
                  onChange={handleChange}
                >
                  <option value="">-- Select Shoes --</option>
                  {shoes.map(shoe => (
                    <option key={shoe._id} value={shoe._id}>
                      {shoe.name} ({shoe.distance} km)
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Weather Section */}
            <div className="sm:col-span-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Weather Conditions (optional)</h3>
              <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-2">
                  <label htmlFor="weather-temperature" className="block text-sm font-medium text-gray-700">
                    Temperature (°C)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="temperature"
                      id="weather-temperature"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.weather.temperature}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="weather-condition" className="block text-sm font-medium text-gray-700">
                    Conditions
                  </label>
                  <select
                    id="weather-condition"
                    name="condition"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={formData.weather.condition}
                    onChange={handleChange}
                  >
                    <option value="clear">Clear</option>
                    <option value="partly-cloudy">Partly Cloudy</option>
                    <option value="cloudy">Cloudy</option>
                    <option value="rain">Rain</option>
                    <option value="snow">Snow</option>
                    <option value="windy">Windy</option>
                    <option value="fog">Fog</option>
                  </select>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="weather-humidity" className="block text-sm font-medium text-gray-700">
                    Humidity (%)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="humidity"
                      id="weather-humidity"
                      min="0"
                      max="100"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.weather.humidity}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="weather-windSpeed" className="block text-sm font-medium text-gray-700">
                    Wind Speed (km/h)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="windSpeed"
                      id="weather-windSpeed"
                      min="0"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.weather.windSpeed}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="sm:col-span-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <div className="mt-1">
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                  placeholder="How did it feel? Any thoughts or observations?"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEdit ? 'Updating...' : 'Saving...'}
                  </>
                ) : isEdit ? 'Update Run' : 'Save Run'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

module.exports = RunForm;
