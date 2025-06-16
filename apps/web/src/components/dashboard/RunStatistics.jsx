import React from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell 
} from 'recharts';
import { format, subWeeks, eachDayOfInterval, isWithinInterval } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const RunStatistics = ({ runs = [] }) => {
  if (!runs.length) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Run Statistics</h3>
        <div className="text-center text-gray-500 py-8">
          No run data available. Log some runs to see your statistics!
        </div>
      </div>
    );
  }


  // Prepare data for distance over time chart
  const last30Days = eachDayOfInterval({
    start: subWeeks(new Date(), 4),
    end: new Date()
  });

  const distanceByDay = last30Days.map(day => {
    const dayRuns = runs.filter(run => {
      const runDate = new Date(run.date);
      return (
        runDate.getDate() === day.getDate() &&
        runDate.getMonth() === day.getMonth() &&
        runDate.getFullYear() === day.getFullYear()
      );
    });

    const totalDistance = dayRuns.reduce((sum, run) => sum + (run.distance || 0), 0);

    return {
      date: format(day, 'MMM d'),
      distance: totalDistance
    };
  });

  // Prepare data for pace distribution
  const paceData = runs
    .filter(run => run.pace)
    .map(run => ({
      name: format(new Date(run.date), 'MMM d'),
      pace: run.pace / 60 // Convert to minutes
    }))
    .slice(-7); // Last 7 runs

  // Calculate weekly mileage
  const weeklyMileage = [];
  const now = new Date();
  
  for (let i = 3; i >= 0; i--) {
    const weekStart = subWeeks(now, i + 1);
    const weekEnd = subWeeks(now, i);
    
    const weekRuns = runs.filter(run => {
      const runDate = new Date(run.date);
      return isWithinInterval(runDate, { start: weekStart, end: weekEnd });
    });
    
    weeklyMileage.push({
      name: `Week ${4 - i}`,
      distance: weekRuns.reduce((sum, run) => sum + (run.distance || 0), 0)
    });
  }

  // Calculate run type distribution
  const runTypes = runs.reduce((acc, run) => {
    const type = run.type || 'Other';
    if (!acc[type]) {
      acc[type] = 0;
    }
    acc[type] += 1;
    return acc;
  }, {});

  const runTypeData = Object.entries(runTypes).map(([name, value]) => ({
    name,
    value,
    percentage: Math.round((value / runs.length) * 100)
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distance Over Time (Last 30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={distanceByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'km', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value} km`, 'Distance']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="distance" 
                  name="Distance (km)" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Mileage (Last 4 Weeks)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyMileage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'km', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value} km`, 'Distance']} />
                <Legend />
                <Bar dataKey="distance" name="Distance (km)" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pace Trends (Last 7 Runs)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={paceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'min/km', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value.toFixed(2)} min/km`, 'Pace']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="pace" 
                  name="Pace (min/km)" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Run Type Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={runTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                >
                  {runTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} runs (${props.payload.percentage}%)`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunStatistics;
