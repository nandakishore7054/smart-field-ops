const User = require('./users.model');

async function getActiveWorkers() {
  return User.find({ role: 'worker', status: 'active' })
    .select('name email role status profilePicture phone createdAt updatedAt')
    .sort({ name: 1 })
    .lean();
}

module.exports = {
  getActiveWorkers,
};