const Group = require('../models/Group');
const User = require('../models/User');

const createGroup = async (req, res) => {
  const { name, members } = req.body; // members is array of user ids
  try {
    let allMembers = [req.user.id];
    if (members && members.length > 0) {
      allMembers = [...new Set([...allMembers, ...members])];
    }
    const group = await Group.create({
      name,
      members: allMembers,
      createdBy: req.user.id
    });
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id }).populate('members', 'username');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members', 'username');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMember = async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.members.includes(user._id)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    group.members.push(user._id);
    await group.save();

    const updatedGroup = await Group.findById(req.params.id).populate('members', 'username');
    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createGroup, getGroups, getGroupById, addMember };
