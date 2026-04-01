import { useState } from 'react';
import api from '../services/api';

const AddExpenseForm = ({ group, onCancel }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [customSplits, setCustomSplits] = useState({});

  const handleCustomSplitChange = (userId, value) => {
    setCustomSplits(prev => ({
      ...prev,
      [userId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    let splits = [];
    const totalMembers = group.members.length;
    
    if (splitType === 'equal') {
      const splitAmount = (parseFloat(amount) / totalMembers).toFixed(2);
      let sum = 0;
      splits = group.members.map((m, i) => {
        let val = parseFloat(splitAmount);
        if (i === totalMembers - 1) {
          val = parseFloat(amount) - sum;
        }
        sum += val;
        return { user: m._id, amount: val };
      });
    } else {
      let customSum = 0;
      splits = group.members.map(m => {
        const val = parseFloat(customSplits[m._id] || 0);
        customSum += val;
        return { user: m._id, amount: val };
      });
      if (Math.abs(customSum - parseFloat(amount)) > 0.05) {
        alert("Custom splits must equal the total amount");
        return;
      }
    }

    try {
      await api.post('/expenses', {
        groupId: group._id,
        description,
        totalAmount: parseFloat(amount),
        splits
      });
      onCancel();
    } catch (error) {
      console.error('Failed to add expense', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8 space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Add new expense</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input 
            type="text" 
            className="input" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            required placeholder="e.g. Dinner, Rent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (₹)</label>
          <input 
            type="number" 
            step="0.01"
            className="input" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            required placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Split Type</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={splitType === 'equal'} onChange={() => setSplitType('equal')} className="text-primary-600 focus:ring-primary-500" />
            <span className="text-sm">Equally</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={splitType === 'custom'} onChange={() => setSplitType('custom')} className="text-primary-600 focus:ring-primary-500" />
            <span className="text-sm">Custom Amount</span>
          </label>
        </div>
      </div>

      {splitType === 'custom' && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase font-semibold">Enter exactly how much each person owes:</p>
          {group.members.map(member => (
            <div key={member._id} className="flex items-center justify-between">
              <span className="text-sm font-medium">{member.username}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">₹</span>
                <input 
                  type="number"
                  step="0.01"
                  className="input py-1 w-24"
                  value={customSplits[member._id] || ''}
                  onChange={e => handleCustomSplitChange(member._id, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition font-medium">Cancel</button>
        <button type="submit" className="btn">Save Expense</button>
      </div>
    </form>
  );
};

export default AddExpenseForm;
