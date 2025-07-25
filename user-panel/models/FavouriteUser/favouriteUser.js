const mongoose = require('mongoose');

const favouriteUserSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userAuth',
    required: true,
    index: true
  },
  favouriteUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userAuth',
    required: true
  }
}, {
  indexes: [{ key: { userId: 1, favouriteUserId: 1 }, unique: true }] // Prevent duplicates
});

module.exports = mongoose.model('FavouriteUser', favouriteUserSchema);