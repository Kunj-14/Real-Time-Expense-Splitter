import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle } from 'lucide-react';

const SettlementSummary = ({ groupId, expenses }) => {
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState({});
  const { user } = useAuth();
  const [loadingObj, setLoadingObj] = useState({});

  useEffect(() => {
    fetchSettlements();
  }, [expenses]);

  const fetchSettlements = async () => {
    try {
      const { data } = await api.get(`/expenses/group/${groupId}/settlement`);
      setTransactions(data);
      
      const groupData = await api.get(`/groups/${groupId}`);
      const userMap = {};
      groupData.data.members.forEach(m => {
        userMap[m._id] = m.username;
      });
      setUsers(userMap);
    } catch (error) {
      console.error('Error fetching settlements', error);
    }
  };

  const markSettled = async (from, to, amount, index) => {
    setLoadingObj({ ...loadingObj, [index]: true });
    try {
      await api.post(`/expenses/group/${groupId}/settle`, { from, to, amount });
    } catch (error) {
      console.error('Failed to settle', error);
    } finally {
      setLoadingObj({ ...loadingObj, [index]: false });
    }
  };

  if (transactions.length === 0) {
    return <div className="text-center py-6 text-green-600 font-medium bg-green-50 rounded-lg border border-green-200">All debts are settled!</div>;
  }

  return (
    <div className="space-y-3">
      {transactions.map((t, index) => {
        const isMyDebt = t.from === user._id;
        const isOwedToMe = t.to === user._id;

        return (
          <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-sm text-gray-800">
                  <span className={`font-semibold ${isMyDebt ? 'text-red-600' : ''}`}>{users[t.from] === user.username ? 'You' : users[t.from]}</span>
                   {' '}owes{' '}
                  <span className={`font-semibold ${isOwedToMe ? 'text-green-600' : ''}`}>{users[t.to] === user.username ? 'You' : users[t.to]}</span>
                </span>
                <span className="text-xl font-bold text-gray-900">₹{t.amount.toFixed(2)}</span>
              </div>
            </div>
            
            {(isMyDebt || isOwedToMe) && (
              <button 
                onClick={() => markSettled(t.from, t.to, t.amount, index)}
                disabled={loadingObj[index]}
                className="flex items-center gap-2 text-sm bg-primary-50 text-primary-700 hover:bg-primary-100 px-3 py-1.5 rounded-md font-medium transition disabled:opacity-50"
              >
                {loadingObj[index] ? 'Settling...' : (
                  <>
                    <CheckCircle size={16} /> Record Cash Payment
                  </>
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SettlementSummary;
