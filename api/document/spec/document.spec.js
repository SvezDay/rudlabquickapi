// process.env.NODE_ENV = 'dev';
//
// let chai = require('chai');
// let chaiHttp = require('chai-http');
// let server = require('../../../server');
// let should = chai.should();
// chai.use(chaiHttp);
//
// const path = require('path');
//
// let formReg = {first:'bruce', last:'wayne', email:'bruce@wayne.com', password:'wayne'};
// let formAuth = {email:'bruce@wayne.com', password:'wayne'};
// let token;
//
// let bookDoc;
// let freeDoc;
//
// /*
// 1
// //register
// //authenticate
// 2
// //create book document
// //create book note 'summary'
// //read book document
//   //> number of note === 2
// 3
// create free document
// read free document
//   > number of notes === 0
// create free note
// read free document
//   > number of note === 1
// 4
// create dico document
// read dico document
//   > number of notes === 0
// create dico note
// read dico document
//   > number of note === 1
// create dico note
// read dico document
//   > number of note === 2
// delete all
// */
//
// describe('====================================== spec/document', ()=>{})
//
// xdescribe('CLEAR DATABASE', ()=>{
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
// xdescribe('CREATE BRUCE WAYNE', ()=>{
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
// xdescribe('HANDLE BOOK DOCUMENT', ()=>{
//   let book = {};
//   it('should create and return a new book document', (done)=>{
//     chai.request('http://localhost:3200').post('/api/document/create-document').set('x-access-token',token)
//     .send({model: 'book'})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.be.a('object');
//       res.body.should.have.property('token');
//       res.body.should.have.property('exp');
//       res.body.should.have.property('data');
//       res.body.data.should.have.property('index');
//       res.body.data.should.have.property('title');
//       book = res.body.data;
//       done();
//     })
//   })
//   it('should create and return a new book note', (done)=>{
//     chai.request('http://localhost:3200').post('/api/document/create-note').set('x-access-token',token)
//     .send({'idx_uuid': book.index.uuid})
//     .send({model: 'book'})
//     .send({code_label: 5.8})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.be.a('object');
//       res.body.should.have.property('token');
//       res.body.should.have.property('exp');
//       res.body.should.have.property('data');
//       res.body.data.should.have.property('uuid');
//       res.body.data.should.have.property('value');
//       res.body.data.should.have.property('code_label');
//       res.body.data.code_label.should.equal(5.8);
//       done();
//     })
//   })
//   it('should read book document', (done)=>{
//     chai.request('http://localhost:3200').get('/api/document/read-document').set('x-access-token',token)
//     .set('idx_uuid', book.index.uuid)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.be.a('object');
//       res.body.should.have.property('token');
//       res.body.should.have.property('exp');
//       res.body.should.have.property('data');
//       res.body.data.should.have.property('index');
//       res.body.data.should.have.property('title');
//       res.body.data.should.have.property('notes');
//       res.body.data.notes.length.should.equal(2);
//       book = res.body.data;
//       done();
//     })
//   })
//
// })
// xdescribe('HANDLE FREE DOCUMENT', ()=>{
//   let free = {};
//   it('should create and return a new free document', (done)=>{
//     chai.request('http://localhost:3200').post('/api/document/create-document').set('x-access-token',token)
//     .send({model: 'free'})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.be.a('object');
//       res.body.should.have.property('token');
//       res.body.should.have.property('exp');
//       res.body.should.have.property('data');
//       res.body.data.should.have.property('index');
//       res.body.data.should.have.property('title');
//       free = res.body.data;
//       done();
//     })
//   })
//   it('should read free document', (done)=>{
//     chai.request('http://localhost:3200').get('/api/document/read-document').set('x-access-token',token)
//     .set('idx_uuid', free.index.uuid)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.be.a('object');
//       res.body.should.have.property('token');
//       res.body.should.have.property('exp');
//       res.body.should.have.property('data');
//       res.body.data.should.have.property('index');
//       res.body.data.should.have.property('title');
//       res.body.data.should.have.property('notes');
//       res.body.data.notes.length.should.equal(0);
//       done();
//     })
//   })
//   it('should create and return FIRST new free note', (done)=>{
//     chai.request('http://localhost:3200').post('/api/document/create-note').set('x-access-token',token)
//     .send({'idx_uuid': free.index.uuid})
//     .send({model: 'free'})
//     .send({code_label: 3.5})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.be.a('object');
//       res.body.should.have.property('token');
//       res.body.should.have.property('exp');
//       res.body.should.have.property('data');
//       res.body.data.should.have.property('uuid');
//       res.body.data.should.have.property('value');
//       res.body.data.should.have.property('code_label');
//       res.body.data.code_label.should.equal(3.5);
//       done();
//     })
//   })
//   it('should read free document', (done)=>{
//     chai.request('http://localhost:3200').get('/api/document/read-document').set('x-access-token',token)
//     .set('idx_uuid', free.index.uuid)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.be.a('object');
//       res.body.should.have.property('token');
//       res.body.should.have.property('exp');
//       res.body.should.have.property('data');
//       res.body.data.should.have.property('index');
//       res.body.data.should.have.property('title');
//       res.body.data.should.have.property('notes');
//       res.body.data.notes.length.should.equal(1);
//       free = res.body.data;
//       done();
//     })
//   })
//   it('should create and return SECOND new free note', (done)=>{
//     chai.request('http://localhost:3200').post('/api/document/create-note').set('x-access-token',token)
//     .send({'idx_uuid': free.index.uuid})
//     .send({model: 'free'})
//     .send({code_label: 3.5})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.be.a('object');
//       res.body.should.have.property('token');
//       res.body.should.have.property('exp');
//       res.body.should.have.property('data');
//       res.body.data.should.have.property('uuid');
//       res.body.data.should.have.property('value');
//       res.body.data.should.have.property('code_label');
//       res.body.data.code_label.should.equal(3.5);
//       done();
//     })
//   })
//   it('should read free document', (done)=>{
//     chai.request('http://localhost:3200').get('/api/document/read-document').set('x-access-token',token)
//     .set('idx_uuid', free.index.uuid)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.be.a('object');
//       res.body.should.have.property('token');
//       res.body.should.have.property('exp');
//       res.body.should.have.property('data');
//       res.body.data.should.have.property('index');
//       res.body.data.should.have.property('title');
//       res.body.data.should.have.property('notes');
//       res.body.data.notes.length.should.equal(2);
//       free = res.body.data;
//       done();
//     })
//   })
//
// })
