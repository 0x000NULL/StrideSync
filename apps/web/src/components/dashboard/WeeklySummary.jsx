import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';

const WeeklySummary = ({ runs = [] }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processWeeklyData = () => {
      try {
        if (!runs.length) {
          setLoading(false);
          return;
        }

        // Get the last 7 days
        const today = new Date();
        const lastWeek = subDays(today, 6);
        
        // Create an array for the last 7 days
        const days = eachDayOfInterval({
          start: lastWeek,
          end: today
        });

        // Initialize data with all days of the week
        const weeklyData = days.map(day => ({
          name: format(day, 'EEE'),
          fullDate: format(day, 'yyyy-MM-dd'),
          distance: 0,
          duration: 0,
          runs: 0
        }));

        // Process runs and group by day
        runs.forEach(run => {
          if (!run.date) return;
          
          const runDate = new Date(run.date);
          const dayIndex = days.findIndex(day => isSameDay(day, runDate));
          
          if (dayIndex !== -1) {
            weeklyData[dayIndex].distance += parseFloat(run.distance || 0);
            weeklyData[dayIndex].duration += parseInt(run.duration || 0, 10) / 60;
            weeklyData[dayIndex].runs += 1;
          }
        });

        // Round values for display
        const formattedData = weeklyData.map(day => ({
          ...day,
          distance: parseFloat(day.distance.toFixed(1)),
          duration: parseFloat(day.duration.toFixed(1))
        }));

        setData(formattedData);
        setError(null);
      } catch (err) {
        console.error('Error processing weekly data:', err);
        setError('Failed to process weekly data');
      } finally {
        setLoading(false);
      }
    };

    processWeeklyData();
  }, [runs]);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Summary</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Summary</h3>
        <div className="h-64 flex items-center justify-center text-red-500">
          {error}
        </div>
      </div>
    );
  }

  if (!runs.length) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Summary</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No run data available for this week.
        </div>
      </div>
    );
  }

  const totalDistance = data.reduce((sum, day) => sum + day.distance, 0).toFixed(1);
  const totalDuration = Math.floor(data.reduce((sum, day) => sum + day.duration, 0));
  const totalRuns = data.reduce((sum, day) => sum + day.runs, 0);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Summary</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              stroke="#3B82F6"
              tickFormatter={(value) => `${value} km`}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#10B981"
              tickFormatter={(value) => `${value} min`}
              tick={{ fill: '#6b7280' }}
              hide={true}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'Distance (km)') return [`${value} km`, name];
                if (name === 'Duration (min)') return [`${value} min`, name];
                return [value, name];
              }}
              labelFormatter={(label) => {
                const dayData = data.find(d => d.name === label);
                return dayData ? dayData.fullDate : label;
              }}
            />
            <Legend />
            <Bar 
              yAxisId="left" 
              dataKey="distance" 
              name="Distance (km)" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              yAxisId="right" 
              dataKey="duration" 
              name="Duration (min)" 
              fill="#10B981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-md">
          <p className="text-sm font-medium text-gray-500">Total Distance</p>
          <p className="text-xl font-semibold text-gray-900">
            {totalDistance} km
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-md">
          <p className="text-sm font-medium text-gray-500">Total Time</p>
          <p className="text-xl font-semibold text-gray-900">
            {totalDuration} min
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-md">
          <p className="text-sm font-medium text-gray-500">Total Runs</p>
          <p className="text-xl font-semibold text-gray-900">
            {totalRuns}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeeklySummary;
