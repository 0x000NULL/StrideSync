import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

// Components
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

const RunDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Format duration from seconds to HH:MM:SS or MM:SS
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate pace in min/km
  const calculatePace = (distanceKm, durationSeconds) => {
    if (!distanceKm || !durationSeconds) return '--:--';
    const paceSeconds = Math.round(durationSeconds / distanceKm);
    const minutes = Math.floor(paceSeconds / 60);
    const seconds = paceSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format date to a readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(parseISO(dateString), 'EEEE, MMMM d, yyyy');
  };

  // Format time to 12-hour format with AM/PM
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return format(parseISO(dateString), 'h:mm a');
  };

  // Fetch run details
  const fetchRun = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/runs/${id}`);
      setRun(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching run:', err);
      setError('Failed to load run details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete run
  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      setDeleting(true);
      await axios.delete(`/api/v1/runs/${id}`);
      navigate('/runs', { state: { message: 'Run deleted successfully' } });
    } catch (err) {
      console.error('Error deleting run:', err);
      setDeleteError('Failed to delete run. Please try again.');
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  // Fetch run on component mount
  useEffect(() => {
    fetchRun();
  }, [id]);

  // Show loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Show error state
  if (error) {
    return <ErrorMessage message={error} onRetry={fetchRun} />;
  }

  // If no run data
  if (!run) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No run found</h3>
        <p className="mt-1 text-sm text-gray-500">The run you're looking for doesn't exist or was deleted.</p>
        <div className="mt-6">
          <Link
            to="/runs"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View All Runs
          </Link>
        </div>
      </div>
    );
  }

  // Calculate stats
  const distanceKm = (run.distance / 1000).toFixed(2);
  const pace = calculatePace(distanceKm, run.duration);
  const calories = run.calories || '--';
  const elevationGain = run.elevationGain ? `${run.elevationGain} m` : '--';
  const elevationLoss = run.elevationLoss ? `${run.elevationLoss} m` : '--';
  const avgHeartRate = run.avgHeartRate ? `${run.avgHeartRate} bpm` : '--';
  const maxHeartRate = run.maxHeartRate ? `${run.maxHeartRate} bpm` : '--';
  const cadence = run.avgCadence ? `${run.avgCadence} spm` : '--';
  const temperature = run.weather?.temperature ? `${run.weather.temperature}°C` : '--';
  const humidity = run.weather?.humidity ? `${run.weather.humidity}%` : '--';
  const windSpeed = run.weather?.windSpeed ? `${run.weather.windSpeed} km/h` : '--';
  const conditions = run.weather?.conditions || '--';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{run.title || 'Untitled Run'}</h1>
          <p className="mt-1 text-sm text-gray-500">{formatDate(run.date)}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            to={`/runs/${id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              deleteConfirm
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-red-500 hover:bg-red-600 focus:ring-red-400'
            } focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            {deleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : deleteConfirm ? (
              'Click again to confirm'
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>

      {deleteError && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{deleteError}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Run Details</h2>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            {/* Basic Info */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(run.date)} at {formatTime(run.startTime || run.date)}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">
                {run.type}
              </dd>
            </div>
            {run.terrain && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Terrain</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">
                  {run.terrain}
                </dd>
              </div>
            )}
            {run.shoes && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Shoes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {run.shoes.name || 'Unnamed Shoes'}
                  {run.shoes.distance && (
                    <span className="text-gray-500 ml-2">({(run.shoes.distance / 1000).toFixed(0)} km)</span>
                  )}
                </dd>
              </div>
            )}
            {run.notes && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                  {run.notes}
                </dd>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Run Stats</h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Distance</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {distanceKm} <span className="text-lg text-gray-500">km</span>
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Duration</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {formatDuration(run.duration)}
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Pace</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {pace} <span className="text-lg text-gray-500">/km</span>
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Calories</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {calories} <span className="text-lg text-gray-500">kcal</span>
                    </dd>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Stats */}
            <div className="bg-gray-50 px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Stats</h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Elevation Gain</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {elevationGain}
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Elevation Loss</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {elevationLoss}
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Cadence</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {cadence}
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Heart Rate</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {avgHeartRate}
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Max Heart Rate</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {maxHeartRate}
                    </dd>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather */}
            {(temperature !== '--' || humidity !== '--' || windSpeed !== '--' || conditions !== '--') && (
              <div className="bg-white px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Weather</h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {conditions !== '--' && (
                    <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Conditions</dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900">
                          {conditions}
                        </dd>
                      </div>
                    </div>
                  )}
                  {temperature !== '--' && (
                    <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Temperature</dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900">
                          {temperature}
                        </dd>
                      </div>
                    </div>
                  )}
                  {humidity !== '--' && (
                    <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Humidity</dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900">
                          {humidity}
                        </dd>
                      </div>
                    </div>
                  )}
                  {windSpeed !== '--' && (
                    <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Wind Speed</dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900">
                          {windSpeed}
                        </dd>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Map Placeholder */}
            {run.hasMap && (
              <div className="bg-gray-50 px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Route Map</h3>
                <div className="bg-white p-4 rounded-lg shadow h-64 flex items-center justify-center">
                  <p className="text-gray-500">Map view coming soon</p>
                </div>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          to="/runs"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Runs
        </Link>
      </div>
    </div>
  );
};

export default RunDetailPage;
