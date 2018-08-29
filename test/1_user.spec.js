process.env.NODE_ENV = 'dev';

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
chai.use(chaiHttp);

const path = require('path');

let formReg = {first:'bruce', last:'wayne', email:'bruce@wayne.com', password:'wayne'};
let formAuth = {email:'bruce@wayne.com', password:'wayne'};
let token;
let firstFreeDoc, secondFreeDoc, thirdDico;

//
// describe('CLEAR DATABASE', ()=>{
//   it('should return nothing', (done)=>{
//     chai.request('http://localhost:3200')
//     .delete('/dev/clear-database')
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.be.a('object');
//       // Object.keys(res.body).length.should.be(null);
//       done();
//     })
//   })
// })
//
// describe('CREATE BRUCE WAYNE', ()=>{
//   it('should return object with token, exp, data.first for an Manual Register', (done)=>{
//     chai.request('http://localhost:3200')
//     .post('/manual_register')
//     .send(formReg)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.be.a('object');
//       res.body.should.have.property('token');
//       res.body.should.have.property('exp');
//       res.body.should.have.property('data');
//       res.body.data.should.have.property('first');
//       // res.body.errors.should.have.property('first');
//       // res.body.errors.pages.should.have.property('kind').eql('required');
//       done();
//     })
//   })
//   it('should object with token, exp, data.first for an Manual Authentication', (done)=>{
//     chai.request('http://localhost:3200')
//     .post('/manual_authenticate')
//     .send(formAuth)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.be.a('object');
//       res.body.should.have.property('token');
//       res.body.should.have.property('exp');
//       res.body.should.have.property('data');
//       res.body.data.should.have.property('first');
//       token = res.body.token;
//       done();
//     })
//   })
//   it('should return empty list of document for validate the token in the api routes', (done)=>{
//     chai.request('http://localhost:3200')
//     .get('/api/document/get-main')
//     .set('x-access-token',token)
//     .send()
//     .end((err, res)=>{
//       res.should.have.status(200);
//       // res.body.should.be.a('object');
//       done();
//     })
//   })
// })
//
// describe('DELETE BRUCE WAYNE ACCOUNT', ()=>{
//   it('should delete the account', (done)=>{
//     chai.request('http://localhost:3200')
//     .delete('/api/user/delete-account')
//     .set('x-access-token',token)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('the database should be clear', (done)=>{
//     chai.request('http://localhost:3200')
//     .get('/dev/node-list')
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.equal(0);
//       done();
//     })
//   })
// })
