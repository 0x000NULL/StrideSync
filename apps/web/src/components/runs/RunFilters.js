const React = require('react');

const RunFilters = ({ filters, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    onChange(localFilters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      sort: '-date',
      type: '',
      terrain: '',
      minDistance: '',
      maxDistance: '',
      startDate: '',
      endDate: ''
    };
    setLocalFilters(resetFilters);
    onChange(resetFilters);
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Filters</h3>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isOpen ? 'Hide Filters' : 'Show Filters'}
            {isOpen ? (
              <svg className="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        {isOpen && (
          <form className="mt-4 space-y-4" onSubmit={handleApplyFilters}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Sort By */}
              <div className="sm:col-span-3">
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
                  Sort By
                </label>
                <select
                  id="sort"
                  name="sort"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={localFilters.sort}
                  onChange={handleInputChange}
                >
                  <option value="-date">Date (Newest First)</option>
                  <option value="date">Date (Oldest First)</option>
                  <option value="-distance">Distance (Longest First)</option>
                  <option value="distance">Distance (Shortest First)</option>
                  <option value="-duration">Duration (Longest First)</option>
                  <option value="duration">Duration (Shortest First)</option>
                </select>
              </div>

              {/* Run Type */}
              <div className="sm:col-span-3">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Run Type
                </label>
                <select
                  id="type"
                  name="type"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={localFilters.type}
                  onChange={handleInputChange}
                >
                  <option value="">All Types</option>
                  <option value="run">Run</option>
                  <option value="trail">Trail Run</option>
                  <option value="track">Track</option>
                  <option value="treadmill">Treadmill</option>
                  <option value="race">Race</option>
                  <option value="workout">Workout</option>
                </select>
              </div>

              {/* Terrain */}
              <div className="sm:col-span-3">
                <label htmlFor="terrain" className="block text-sm font-medium text-gray-700">
                  Terrain
                </label>
                <select
                  id="terrain"
                  name="terrain"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={localFilters.terrain}
                  onChange={handleInputChange}
                >
                  <option value="">All Terrains</option>
                  <option value="road">Road</option>
                  <option value="trail">Trail</option>
                  <option value="track">Track</option>
                  <option value="treadmill">Treadmill</option>
                </select>
              </div>

              {/* Distance Range */}
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">
                  Distance (km)
                </label>
                <div className="mt-1 grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="minDistance" className="sr-only">Min</label>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="number"
                        name="minDistance"
                        id="minDistance"
                        min="0"
                        step="0.1"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Min"
                        value={localFilters.minDistance || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="maxDistance" className="sr-only">Max</label>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="number"
                        name="maxDistance"
                        id="maxDistance"
                        min="0"
                        step="0.1"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Max"
                        value={localFilters.maxDistance || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Date Range
                </label>
                <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="startDate" className="sr-only">Start Date</label>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="date"
                        name="startDate"
                        id="startDate"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={localFilters.startDate || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="endDate" className="sr-only">End Date</label>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="date"
                        name="endDate"
                        id="endDate"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={localFilters.endDate || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reset Filters
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Apply Filters
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

module.exports = RunFilters;
