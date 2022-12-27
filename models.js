const mongoose = require('mongoose');
const { Schema } = mongoose;

const date = new Date() 
const RepliesSchema = new Schema({ 
  text: String,
  created_on: { type: Date, default: date },
  delete_password: String,
  reported: { type: Boolean, default: false}
  });


const ThreadSchema = new Schema({
  text:  String,
  created_on: { type: Date, default: date },
  bumped_on: { type: Date, default: date },
  reported: { type: Boolean, default: false},
  delete_password: String,
  replies: [RepliesSchema]
});

const BoardSchema = new Schema({
  name:  String,
  threads: [ThreadSchema]
})


const Replies =  mongoose.model("Replies", RepliesSchema);
const Thread =  mongoose.model("Thread", ThreadSchema);
const Board = mongoose.model("Board", BoardSchema);


exports.Board = Board;
exports.Thread = Thread;
exports.Replies = Replies;  