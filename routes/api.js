'use strict';
const BoardModel = require('../models').Board;
const ThreadModel = require('../models').Thread;
const RepliesModel = require('../models').Replies;
const mongoose = require('mongoose');
const bcrypt = require("bcrypt")
const saltRounds = 10;

module.exports = function (app) {
   
  app.route('/api/threads/:board')
    .post(async function (req, res){
        let board = req.body.board
        const text = req.body.text
        const delete_password = req.body.delete_password
        let hash_password = bcrypt.hashSync(delete_password, saltRounds);

        if (!board) {
          board = req.params.board
        }
      
        const new_thread = new ThreadModel({
            text: text,
            delete_password: hash_password,
            replies: []
        })

        BoardModel.findOne({name: board}, (err, board_data) => {
          if (!board_data) {
            const new_board = new BoardModel({
              name: board,
              threads: []
            })
            new_board.threads.push(new_thread);
            new_board.save((err, data) => {
              if (err || !data) {
                console.log(err)
                res.send("error updating database")
                return
              }
              else {
                return res.json(new_thread)
              }
            })
          }
          else {
            board_data.threads.push(new_thread);
            board_data.save((err, data) => {
              if (err || !data) {
                console.log(err)
                res.send("error updating database")
                return
              }
              else {
                return res.json(new_thread)
              }
            })
          }
        })
    })

    .get(async function (req, res){
      const board = req.params.board
      
      BoardModel.findOne({name: board}, (err, board_data) => {
        if (err || !board_data) {
          res.json("Invalid board")
          return
        }
        
        const sorted = board_data.threads.sort((a,b) => b.bumped_on - a.bumped_on)

        const result = sorted.slice(0,10)

        result.forEach((thread) => {
          thread.reported = undefined
          thread.delete_password = undefined
          thread.replies.sort((a, b) => {
            return b.created_on - a.created_on
          })

          thread.replies = thread.replies.slice(0,3)
          thread.replies.forEach((reply) => {
            reply.reported = undefined
            reply.delete_password  = undefined
          })
        })

        return res.json(result)
      })
    })

    .delete(async function (req, res){
      const board = req.params.board
      const thread_id = req.body.thread_id
      const delete_password = req.body.delete_password

      BoardModel.findOne({ name: board}, (err, board_data) => {
          if (!board_data) {
            res.send("Invalid board")
            return
          }
          
          const thread = board_data.threads.id(thread_id)

          if (!thread) {
            res.json("Invalid thread id")
            return
          }

          if (bcrypt.compareSync(delete_password, thread.delete_password)) {
            thread.remove()
          }
          else {
            res.send("incorrect password")
            return
          }
          board_data.save((err, data) => {
            if (err || !data) {
              console.log(err)
              res.send("error updating database")
              return
            }
            else {
              res.send("success")
              return
            }
          })  
      })
          
    })

    .put(async function (req, res){
      const board = req.params.board
      const thread_id = req.body.thread_id

      BoardModel.findOne({ name: board}, (err, board_data) => {
          if (!board_data) {
            res.send("Invalid board")
            return
          }
          
          const thread = board_data.threads.id(thread_id)

          if (!thread) {
            res.json("Invalid thread id")
            return
          }

          thread.reported = true
          board_data.save((err, data) => {
            if (err || !data) {
              console.log(err)
              res.send("error updating database")
              return
            }
            else {
              res.send("reported")
              return
            }
          })
      })
    })
    
    
  app.route('/api/replies/:board')
    .post(async function (req, res){
        const board = req.params.board
        const text = req.body.text
        const delete_password = req.body.delete_password
        const hash_reply_password = bcrypt.hashSync(delete_password, saltRounds);
        const thread_id = req.body.thread_id 
        const date = new Date()

        const new_reply = new RepliesModel({
          text: text,
          delete_password: hash_reply_password,
          created_on: date
        })

        BoardModel.findOne({ name: board}, (err, board_data) => {
          if (!board_data) {
            res.send("Invalid board")
            return
          }
          
          const thread = board_data.threads.id(thread_id)

          if (!thread) {
            res.json("Invalid thread id")
            return
          }
          thread.replies.push(new_reply)
          thread.bumped_on = date
          board_data.save((err, data) => {
            if (err || !data) {
              console.log(err)
              res.send("error updating database")
              return
            }
            else {
              return res.json(data)
            }
          })
        })
      })
    

    .get(async function (req, res){
        const board = req.params.board
        const thread_id = req.query.thread_id

        if (!thread_id) {
          thread_id = req.query.thread_id
        }

        BoardModel.findOne({name: board}, (err, board_data) => {
          if (err || !board_data) {
          res.json("Invalid board")
            return
          }

          
          const thread = board_data.threads.id(thread_id)
          if (!thread) {
            res.json("Invalid thread id")
            return
          }
          
          thread.reported = undefined
          thread.delete_password = undefined

          thread.replies.forEach((reply) => {
            reply.reported = undefined
            reply.delete_password  = undefined
          })
          return res.json(thread)
        })  
    })

    .delete(async function (req, res){
      const board = req.params.board
      const thread_id = req.body.thread_id
      const reply_id = req.body.reply_id
      const delete_password = req.body.delete_password

      BoardModel.findOne({ name: board}, (err, board_data) => {
          if (!board_data) {
            res.send("Invalid board")
            return
          }
          
          const thread = board_data.threads.id(thread_id)

          if (!thread) {
            res.json("Invalid thread id")
            return
          }

          const reply = thread.replies.id(reply_id)

          if (!reply) {
            res.json("Invalid reply id")
            return
          }
          
          if (bcrypt.compareSync(delete_password, reply.delete_password)) {
            reply.text = "[deleted]"
            
          }
          else {
            res.send("incorrect password")
            return
          }
          board_data.save((err, data) => {
              if (err || !data) {
                console.log(err)
                res.send("error updating database")
                return
              }
              else {
                res.send("success")
                return
              }
          })  
      })
    })

    .put(async function (req, res){
      const board = req.params.board
      const thread_id = req.body.thread_id
      const reply_id = req.body.reply_id

      BoardModel.findOne({ name: board}, (err, board_data) => {
          if (!board_data) {
            res.send("Invalid board")
            return
          }
          
          const thread = board_data.threads.id(thread_id)

          if (!thread) {
            res.json("Invalid thread id")
            return
          }

          const reply = thread.replies.id(reply_id)

          if (!reply) {
            res.json("Invalid reply id")
            return
          }

          reply.reported = true
          board_data.save((err, data) => {
            if (err || !data) {
              console.log(err)
              res.send("error updating database")
              return
            }
            else {
              res.send("reported")
              return
            }
          })
      })
    })
           





  
};
