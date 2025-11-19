import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Star, Award, TrendingUp, Target, Book, Medal } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const TrainingGamification = () => {
  const [trainings, setTrainings] = useState([]);
  const [myTrainings, setMyTrainings] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [activeTab, setActiveTab] = useState('available');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchTrainings();
    fetchMyTrainings();
    fetchLeaderboard();
    fetchMyStats();
  }, []);

  const fetchTrainings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/trainings?isActive=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrainings(response.data.trainings);
    } catch (error) {
      console.error('Error fetching trainings:', error);
    }
  };

  const fetchMyTrainings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/user/trainings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyTrainings(response.data.trainings);
    } catch (error) {
      console.error('Error fetching my trainings:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/leaderboard?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchMyStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/leaderboard/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const enrollInTraining = async (trainingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/training/${trainingId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Successfully enrolled in training!');
      fetchMyTrainings();
    } catch (error) {
      console.error('Error enrolling:', error);
      toast.error(error.response?.data?.message || 'Failed to enroll');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      safety_procedures: '🛡️',
      equipment_operation: '⚙️',
      emergency_response: '🚨',
      health_hazards: '⚕️',
      compliance: '📋',
      first_aid: '🩹',
      communication: '💬',
      leadership: '👥',
      technical_skills: '🔧'
    };
    return icons[category] || '📚';
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const filteredTrainings = selectedCategory === 'all' 
    ? trainings 
    : trainings.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-4">🎓 Training & Development Center</h2>
        
        {myStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="text-yellow-300" size={20} />
                <span className="text-sm opacity-90">Rank</span>
              </div>
              <p className="text-2xl font-bold">{getRankBadge(myStats.rank)}</p>
            </div>
            
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Star className="text-yellow-300" size={20} />
                <span className="text-sm opacity-90">Points</span>
              </div>
              <p className="text-2xl font-bold">{myStats.totalPoints}</p>
            </div>
            
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="text-green-300" size={20} />
                <span className="text-sm opacity-90">Level</span>
              </div>
              <p className="text-2xl font-bold">{myStats.level}</p>
            </div>
            
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Book className="text-blue-300" size={20} />
                <span className="text-sm opacity-90">Completed</span>
              </div>
              <p className="text-2xl font-bold">{myStats.statistics.trainingsCompleted}</p>
            </div>
            
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Award className="text-pink-300" size={20} />
                <span className="text-sm opacity-90">Badges</span>
              </div>
              <p className="text-2xl font-bold">{myStats.badges.length}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-6 py-3 font-semibold ${activeTab === 'available' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Available Courses
        </button>
        <button
          onClick={() => setActiveTab('my-trainings')}
          className={`px-6 py-3 font-semibold ${activeTab === 'my-trainings' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          My Trainings
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-6 py-3 font-semibold ${activeTab === 'leaderboard' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          🏆 Leaderboard
        </button>
      </div>

      {/* Available Trainings Tab */}
      {activeTab === 'available' && (
        <div>
          {/* Category Filter */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <label className="block text-sm font-semibold mb-2">Filter by Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="safety_procedures">Safety Procedures</option>
              <option value="equipment_operation">Equipment Operation</option>
              <option value="emergency_response">Emergency Response</option>
              <option value="health_hazards">Health Hazards</option>
              <option value="compliance">Compliance</option>
              <option value="first_aid">First Aid</option>
              <option value="communication">Communication</option>
              <option value="leadership">Leadership</option>
              <option value="technical_skills">Technical Skills</option>
            </select>
          </div>

          {/* Training Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrainings.map((training) => (
              <div key={training._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{getCategoryIcon(training.category)}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getDifficultyColor(training.difficulty)}`}>
                    {training.difficulty}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg mb-2">{training.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{training.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span>⏱️ {training.duration} min</span>
                  <span>⭐ {training.points} pts</span>
                  <span className="capitalize">{training.type}</span>
                </div>

                {training.isMandatory && (
                  <div className="mb-3">
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded">
                      MANDATORY
                    </span>
                  </div>
                )}

                <button
                  onClick={() => enrollInTraining(training._id)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Enroll Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Trainings Tab */}
      {activeTab === 'my-trainings' && (
        <div className="space-y-4">
          {myTrainings.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow-md text-center">
              <Book className="mx-auto mb-4 text-gray-400" size={64} />
              <h3 className="text-xl font-semibold mb-2">No Trainings Enrolled</h3>
              <p className="text-gray-600 mb-4">Start learning by enrolling in available courses</p>
              <button
                onClick={() => setActiveTab('available')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Browse Courses
              </button>
            </div>
          ) : (
            myTrainings.map((training) => (
              <div key={training._id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getCategoryIcon(training.category)}</span>
                      <h3 className="font-bold text-lg">{training.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{training.description}</p>
                  </div>
                  
                  {training.completed && (
                    <div className="text-green-600 flex flex-col items-center gap-1">
                      <Award size={32} />
                      <span className="text-xs font-semibold">Completed</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress: {training.progress}%</span>
                    {training.score && <span>Score: {training.score}%</span>}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${training.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${training.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <span>⏱️ {training.duration} min</span>
                  <span>⭐ {training.points} pts</span>
                  {training.certificateIssued && (
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <Medal size={16} />
                      Certificate Earned
                    </span>
                  )}
                </div>

                {!training.completed && (
                  <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Continue Training
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            Top Performers
          </h3>
          
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry._id}
                className={`p-4 rounded-lg flex items-center gap-4 ${
                  index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300' : 'bg-gray-50'
                }`}
              >
                <div className="text-3xl font-bold w-12 text-center">
                  {getRankBadge(entry.rank)}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{entry.userId?.name || 'Unknown'}</h4>
                  <p className="text-sm text-gray-600">{entry.userId?.role || 'Worker'}</p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <Star className="text-yellow-500" size={18} />
                    <span className="font-bold text-xl">{entry.totalPoints}</span>
                  </div>
                  <p className="text-sm text-gray-600">Level {entry.level}</p>
                </div>
                
                <div className="text-center px-4">
                  <div className="text-sm text-gray-600">Completed</div>
                  <div className="font-bold">{entry.statistics.trainingsCompleted}</div>
                </div>

                {entry.badges.length > 0 && (
                  <div className="flex gap-1">
                    {entry.badges.slice(0, 3).map((badge, idx) => (
                      <Award key={idx} className="text-purple-500" size={20} />
                    ))}
                    {entry.badges.length > 3 && (
                      <span className="text-xs text-gray-600">+{entry.badges.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingGamification;
