const React = require('react');
const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = require('recharts');

// Mock data - in a real app, this would come from your API
const generateMockData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    name: day,
    distance: Math.floor(Math.random() * 15) + 1, // 1-15 km
    duration: Math.floor(Math.random() * 90) + 20, // 20-110 minutes
  }));
};

const WeeklySummary = () => {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // const response = await axios.get('/api/v1/runs/weekly-summary');
        // setData(response.data);
        
        // For now, use mock data
        setTimeout(() => {
          setData(generateMockData());
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching weekly summary:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Weekly Summary</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Your running activity this week
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'distance') return [`${value} km`, 'Distance'];
                  if (name === 'duration') return [`${value} min`, 'Duration'];
                  return [value, name];
                }}
              />
              <Bar 
                yAxisId="left" 
                dataKey="distance" 
                name="Distance (km)" 
                fill="#8884d8" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                yAxisId="right" 
                dataKey="duration" 
                name="Duration (min)" 
                fill="#82ca9d" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-md">
            <p className="text-sm font-medium text-gray-500">Total Distance</p>
            <p className="text-xl font-semibold text-gray-900">
              {data.reduce((sum, day) => sum + day.distance, 0).toFixed(1)} km
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-md">
            <p className="text-sm font-medium text-gray-500">Total Time</p>
            <p className="text-xl font-semibold text-gray-900">
              {Math.floor(data.reduce((sum, day) => sum + day.duration, 0) / 60)}h {data.reduce((sum, day) => sum + day.duration, 0) % 60}m
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

module.exports = WeeklySummary;
