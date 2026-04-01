import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';

const DashboardPage = () => {
  const [groups, setGroups] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data } = await api.get('/groups');
      setGroups(data);
    } catch (error) {
      console.error('Failed to fetch groups', error);
    }
  };

  const handleSearch = async (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length > 2) {
      try {
        const { data } = await api.get(`/auth/users?search=${e.target.value}`);
        setSearchResults(data);
      } catch (error) {
        console.error('Error searching users', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/groups', {
        name: groupName,
        members: selectedMembers.map(m => m._id)
      });
      setShowCreate(false);
      setGroupName('');
      setSelectedMembers([]);
      setSearchTerm('');
      fetchGroups();
    } catch (error) {
      console.error('Failed to create group', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Users className="text-primary-600" /> My Groups
        </h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn flex items-center gap-2">
          <Plus size={20} /> Create Group
        </button>
      </div>

      {showCreate && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">New Group</h2>
          <form onSubmit={createGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
              <input 
                type="text" 
                className="input" 
                value={groupName} 
                onChange={(e) => setGroupName(e.target.value)} 
                required placeholder="e.g. Weekend Trip, Apartment"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invite Members</label>
              <div className="relative">
                <input 
                  type="text" 
                  className="input" 
                  onChange={handleSearch} 
                  value={searchTerm}
                  placeholder="Search username..." 
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map(user => (
                      <div 
                        key={user._id} 
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                        onClick={() => {
                          if (!selectedMembers.find(m => m._id === user._id)) {
                            setSelectedMembers([...selectedMembers, user]);
                          }
                          setSearchTerm('');
                          setSearchResults([]);
                        }}
                      >
                        {user.username}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedMembers.map(member => (
                  <span key={member._id} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 border border-primary-200">
                    {member.username}
                    <button type="button" onClick={() => setSelectedMembers(selectedMembers.filter(m => m._id !== member._id))} className="text-primary-500 hover:text-primary-800">&times;</button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition font-medium">Cancel</button>
              <button type="submit" className="btn">Save Group</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map(group => (
          <Link key={group._id} to={`/groups/${group._id}`} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-primary-300 transition-all flex flex-col h-full group">
            <h3 className="text-xl font-semibold text-gray-800 group-hover:text-primary-600 mb-2">{group.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{group.members.length} members</p>
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-primary-600 font-medium">
              View details &rarr;
            </div>
          </Link>
        ))}
        {groups.length === 0 && !showCreate && (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
            No groups yet. Create one to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
