/* eslint-disable no-restricted-imports */
import { useState, useEffect } from 'react';

import _ from 'lodash';
import { Car } from 'lucide-react';
import Papa from 'papaparse';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Home = () => {
  const [evTypeData, setEvTypeData] = useState([]);
  const [topCitiesData, setTopCitiesData] = useState([]);
  const [rangeByMakeData, setRangeByMakeData] = useState([]);
  const [yearData, setYearData] = useState([]);
  const [totalVehicles, setTotalVehicles] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to fetch using relative path
        const response = await fetch('/assets/Electric_Vehicle_Population_Data.csv');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();

        const parsedData = Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          error: (error) => {
            console.error('Papa Parse Error:', error);
            setError(error.message);
          }
        });

        if (parsedData.errors.length > 0) {
          console.warn('Parse warnings:', parsedData.errors);
        }

        const data = parsedData.data;
        console.log('Parsed data sample:', data.slice(0, 2)); // Debug log

        setTotalVehicles(data.length);

        // EV Type Distribution
        const evTypes = _.countBy(data, 'Electric Vehicle Type');
        setEvTypeData(Object.entries(evTypes).map(([name, value]) => ({
          name: name === 'Battery Electric Vehicle (BEV)' ? 'BEV' : 'PHEV',
          value
        })));

        // Top 10 Cities
        const cities = _(data)
          .groupBy('City')
          .map((group, city) => ({
            city,
            count: group.length
          }))
          .orderBy(['count'], ['desc'])
          .take(10)
          .value();
        setTopCitiesData(cities);

        // Range by Make
        const rangeData = _(data)
          .groupBy('Make')
          .map((group, make) => ({
            make,
            averageRange: _.meanBy(group, 'Electric Range')
          }))
          .orderBy(['averageRange'], ['desc'])
          .take(10)
          .value();
        setRangeByMakeData(rangeData);

        // Year Distribution
        const years = _(data)
          .groupBy('Model Year')
          .map((group, year) => ({
            year: parseInt(year),
            count: group.length
          }))
          .orderBy(['year'], ['asc'])
          .value();
        setYearData(years);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      }
    };

    fetchData();
  }, []);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold">Electric Vehicle Population Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVehicles.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EV Type Distribution */}
        <Card className="p-4">
          <CardHeader>
            <CardTitle>EV Type Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={evTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {evTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top 10 Cities */}
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Top 10 Cities by EV Population</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCitiesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="city" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Average Range by Make */}
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Top Makes by Average Range</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rangeByMakeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="make" angle={-45} textAnchor="end" height={100} />
                <YAxis label={{ value: 'Range (miles)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="averageRange" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Year Distribution */}
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Vehicle Distribution by Year</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;