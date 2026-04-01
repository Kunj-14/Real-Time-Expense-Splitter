import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import AddExpenseForm from '../components/AddExpenseForm';
import SettlementSummary from '../components/SettlementSummary';
import { ArrowLeft, Plus, Receipt, UserPlus } from 'lucide-react';

const GroupDetailPage = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [memberError, setMemberError] = useState('');
  const { socket } = useSocket();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('expenses');

  useEffect(() => {
    fetchGroupData();
    fetchExpenses();

    if (socket) {
      socket.emit('join_group', id);

      socket.on('new_expense', (expense) => {
        setExpenses(prev => {
          const exists = prev.find(e => e._id === expense._id);
          if (exists) return prev;
          return [expense, ...prev];
        });
      });
    }

    return () => {
      if (socket) {
        socket.emit('leave_group', id);
        socket.off('new_expense');
      }
    };
  }, [id, socket]);

  const fetchGroupData = async () => {
    try {
      const { data } = await api.get(`/groups/${id}`);
      setGroup(data);
    } catch (error) {
      console.error('Failed to fetch group', error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError('');
    try {
      const { data } = await api.post(`/groups/${id}/members`, { username: newMemberUsername });
      setGroup(data);
      setShowAddMember(false);
      setNewMemberUsername('');
    } catch (error) {
      setMemberError(error.response?.data?.message || 'Failed to add member');
    }
  };

  const fetchExpenses = async () => {
    try {
      const { data } = await api.get(`/expenses/group/${id}`);
      setExpenses(data);
    } catch (error) {
      console.error('Failed to fetch expenses', error);
    }
  };

  if (!group) return <div className="p-8 text-center text-gray-500">Loading group...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center text-gray-500 hover:text-primary-600 mb-6 font-medium transition">
        <ArrowLeft size={16} className="mr-1" /> Back to Groups
      </Link>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{group.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Members: {group.members.map(m => m.username).join(', ')}
          </p>
        </div>
        <div className="flex flex-col items-end">
          {!showAddForm && !showAddMember && (
            <div className="flex items-center gap-3">
              <button onClick={() => setShowAddMember(true)} className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm">
                <UserPlus size={18} /> Add Member
              </button>
              <button onClick={() => setShowAddForm(true)} className="btn flex items-center gap-2 shadow-sm">
                <Plus size={18} /> Add Expense
              </button>
            </div>
          )}
          {showAddMember && (
            <form onSubmit={handleAddMember} className="flex items-end gap-2">
              <div className="text-left">
                <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
                <input 
                  type="text" 
                  className="input py-1.5 px-3 text-sm" 
                  value={newMemberUsername} 
                  onChange={(e) => setNewMemberUsername(e.target.value)} 
                  required 
                  placeholder="Enter username"
                />
              </div>
              <button type="submit" className="btn py-1.5 px-3 text-sm">Add</button>
              <button type="button" onClick={() => { setShowAddMember(false); setMemberError(''); }} className="text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-md transition text-sm font-medium">Cancel</button>
            </form>
          )}
          {memberError && <p className="text-red-500 text-xs mt-2">{memberError}</p>}
        </div>
      </div>

      {showAddForm && (
        <AddExpenseForm group={group} onCancel={() => setShowAddForm(false)} />
      )}

      <div className="mb-6 flex space-x-2 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('expenses')}
          className={`py-2 px-4 font-medium border-b-2 transition-colors ${activeTab === 'expenses' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Expenses Feed
        </button>
        <button 
          onClick={() => setActiveTab('settlements')}
          className={`py-2 px-4 font-medium border-b-2 transition-colors ${activeTab === 'settlements' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Balances & Settlements
        </button>
      </div>

      {activeTab === 'expenses' ? (
        <div className="space-y-4">
          {expenses.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
              No expenses yet. Add one to get started!
            </div>
          ) : (
            expenses.map(expense => (
              <div key={expense._id} className={`bg-white p-5 rounded-xl shadow-sm border transition-all ${expense.settled ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${expense.settled ? 'bg-green-100 text-green-600' : 'bg-primary-100 text-primary-600'}`}>
                      <Receipt size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{expense.description}</h3>
                      <p className="text-sm text-gray-500">
                        Paid by <span className="font-semibold text-gray-700">{expense.paidBy.username}</span> on {new Date(expense.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">₹{expense.totalAmount.toFixed(2)}</div>
                  </div>
                </div>
                
                {!expense.settled && (
                  <div className="mt-4 pt-3 border-t border-gray-100 text-sm">
                    {(() => {
                      const mySplit = expense.splits.find(s => s.user._id === user._id || s.user === user._id);
                      if (expense.paidBy._id === user._id || expense.paidBy === user._id) {
                        return <span className="text-green-600 font-medium">You paid. You are owed ₹{ (expense.totalAmount - (mySplit?.amount || 0)).toFixed(2) }</span>
                      } else if (mySplit && mySplit.amount > 0) {
                        return <span className="text-red-500 font-medium">You owe ₹{mySplit.amount.toFixed(2)}</span>
                      } else {
                        return <span className="text-gray-500">Not involved</span>
                      }
                    })()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <SettlementSummary groupId={id} expenses={expenses} />
      )}
    </div>
  );
};

export default GroupDetailPage;
