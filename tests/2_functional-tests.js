const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let thread_id; 
let reply_id;

suite('Functional Tests', function() {

   suite('/api/threads/{board} POST', function() {

      test("Creating a new thread", function(done) {
      chai
          .request(server)
          .post("/api/threads/test-board")
          .send({
            text: "FreeCode",
            delete_password: "1111"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.text, "FreeCode");
            assert.equal(res.body.reported, false);
            thread_id = res.body._id;
            done();
          });
      });

   })

    suite('/api/threads/{board} GET', function() {

      test("Viewing the 10 most recent threads with 3 replies each", function(done) {
      chai
          .request(server)
          .get("/api/threads/test-board")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body[0].text, "FreeCode");
            done();
          });
      }); 
   })

   suite('/api/threads/{board} PUT', function() {

      test("Reporting a thread", function(done) {
      chai
          .request(server)
          .put("/api/threads/test-board")
          .send({
            thread_id: thread_id
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "reported");
            done();
          });
      }); 
   })
  
  
   suite('/api/replies/{board} POST', function() {

      test("Creating a new reply", function(done) {
      chai
          .request(server)
          .post("/api/replies/test-board")
          .send({
            text: "Reply",
            thread_id: thread_id,
            delete_password: "1111"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.threads[res.body.threads.length -1].replies[0].text, "Reply");
            reply_id = res.body.threads[res.body.threads.length -1].replies[0]._id;
            done();
          });
      });
   })

   suite('/api/replies/{board} GET', function() {

      test("Viewing a single thread with all replies:", function(done) {
      chai
          .request(server)
          .get("/api/replies/test-board")
          .query({
            thread_id: thread_id
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.text, "FreeCode")
            assert.equal(res.body.replies[0].text, "Reply")
            done();
          });
      });
   })

   suite('/api/replies/{board} PUT', function() {

      test("Reporting a reply:", function(done) {
      chai
          .request(server)
          .put("/api/replies/test-board")
          .send({
            thread_id: thread_id,
            reply_id: reply_id
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "reported")
            done();
          });
      });
   })

  
   suite('/api/replies/{board} DELETE', function() {

      test("Deleting a reply with the incorrect password:", function(done) {
      chai
          .request(server)
          .delete("/api/replies/test-board")
          .send({
            thread_id: thread_id,
            reply_id: reply_id,
            delete_password: "0000"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "incorrect password")
            done();
          });
      });

      test("Deleting a reply with the incorrect password:", function(done) {
      chai
          .request(server)
          .delete("/api/replies/test-board")
          .send({
            thread_id: thread_id,
            reply_id: reply_id,
            delete_password: "1111"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success")
            done();
          });
      });

     
   })

   
suite('/api/threads/{board} DELETE', function() {

      test("Deleting a thread with the incorrect password", function(done) {
      chai
          .request(server)
          .delete("/api/threads/test-board")
          .send({
            thread_id: thread_id, delete_password: "0000"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "incorrect password");
            done();
          });
      }); 

      test("Deleting a thread with the correct password", function(done) {
      chai
          .request(server)
          .delete("/api/threads/test-board")
          .send({
            thread_id: thread_id, delete_password: "1111"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success");
            done();
          });
      }); 

   })










  

  
});
