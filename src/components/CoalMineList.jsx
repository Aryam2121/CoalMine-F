import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const CoalMineList = () => {
  const [coalMines, setCoalMines] = useState([]);

  useEffect(() => {
    const fetchCoalMines = async () => {
      try {
        const response = await axios.get('/api/coalmine');
        setCoalMines(response.data);
      } catch (error) {
        console.error('Error fetching coal mines:', error);
      }
    };

    fetchCoalMines();
  }, []);

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Coal Mines</h2>
      <table className="w-full table-auto">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Location</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {coalMines.map((mine) => (
            <tr key={mine._id}>
              <td className="py-2 px-4 border-b">{mine.name}</td>
              <td className="py-2 px-4 border-b">{`Lat: ${mine.location.latitude}, Lng: ${mine.location.longitude}`}</td>
              <td className="py-2 px-4 border-b">
                <Link to={`/coalmine/${mine._id}`} className="text-blue-600">
                  View on Map
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CoalMineList;
