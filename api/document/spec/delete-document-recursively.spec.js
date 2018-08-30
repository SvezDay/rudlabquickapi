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
// let docs = [];
// let book = {};
//
//
// describe('====================================== spec/delete-document-recursively', ()=>{})
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
// xdescribe('TEST WITH BANK DOCUMENT', ()=>{
//   describe('CREATE i1, i2, i3',()=>{
//     it('should create a document', (done)=>{
//       chai.request('http://localhost:3200')
//       .post('/api/document/create-document').set('x-access-token',token).send({model:'blank'})
//       .end((err, res)=>{
//         res.should.have.status(200);
//         res.body.should.be.a('object');
//         res.body.should.have.property('token');
//         res.body.should.have.property('exp');
//         res.body.should.have.property('data');
//         res.body.data.should.have.property('index');
//         res.body.data.index.should.have.property('uuid');
//         res.body.data.should.have.property('title');
//         docs = Object.assign(docs, {i1:res.body.data});
//         docs.i1.notes = [];
//         docs.i1.title.descendant = [];
//         docs.i1.title.should.have.property('descendant');
//         done();
//       })
//     })
//     it('should create a document', (done)=>{
//       chai.request('http://localhost:3200')
//       .post('/api/document/create-document').set('x-access-token',token).send({model:'blank'})
//       .end((err, res)=>{
//         docs.i2 = res.body.data;
//         done();
//       })
//     })
//     it('should create a document', (done)=>{
//       chai.request('http://localhost:3200')
//       .post('/api/document/create-document').set('x-access-token',token).send({model:'blank'})
//       .end((err, res)=>{
//         docs.i3 = res.body.data;
//         done();
//       })
//     })
//   })
//   describe('CREATE i1t1',()=>{
//     it('should create i1t1', (done)=>{
//       chai.request('http://localhost:3200')
//       .post('/api/document/create-document').set('x-access-token',token).send({model:'blank', parent_uuid:docs.i1.title.uuid})
//       .end((err, res)=>{
//         res.should.have.status(200);
//         docs.i1.title.descendant.push(res.body.data);
//         done();
//       })
//     })
//     it('should create i1n1', (done)=>{
//       chai.request('http://localhost:3200')
//       .post('/api/document/create-note').set('x-access-token',token).send({model:'blank', parent_uuid:docs.i1.title.uuid, model:docs.i1.index.model, code_label:3.1})
//       .end((err, res)=>{
//         res.should.have.status(200);
//         docs.i1.notes.push(res.body.data);
//         done();
//       })
//     })
//     it('should create i1n1i1', (done)=>{
//       chai.request('http://localhost:3200')
//       .post('/api/document/create-document').set('x-access-token',token).send({model:'blank', parent_uuid:docs.i1.notes[0].uuid})
//       .end((err, res)=>{
//         res.should.have.status(200);
//         docs.i1.notes[0].descendant = [];
//         docs.i1.notes[0].descendant.push(res.body.data);
//         done();
//       })
//     })
//     it('should create i1t1i1', (done)=>{
//       chai.request('http://localhost:3200')
//       .post('/api/document/create-document').set('x-access-token',token).send({model:'blank', parent_uuid:docs.i1.title.descendant[0].title.uuid})
//       .end((err, res)=>{
//         res.should.have.status(200);
//         docs.i1.title.descendant[0].title.descendant = [];
//         docs.i1.title.descendant[0].title.descendant.push(res.body.data);
//         done();
//       })
//     })
//   })
//   describe('IDENTIFY THE DOCUMENT',()=>{
//   it('update title value', (done)=>{
//     chai.request('http://localhost:3200')
//     .put('/api/document/update-title').set('x-access-token',token).send({idx_uuid:docs.i1.index.uuid, up_uuid:docs.i1.title.uuid, value:'title of docs-i1'})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('update title value', (done)=>{
//     chai.request('http://localhost:3200')
//     .put('/api/document/update-title').set('x-access-token',token).send({idx_uuid:docs.i2.index.uuid, up_uuid:docs.i2.title.uuid, value:'title of docs-i2'})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('update title value', (done)=>{
//     chai.request('http://localhost:3200')
//     .put('/api/document/update-title').set('x-access-token',token).send({idx_uuid:docs.i3.index.uuid, up_uuid:docs.i3.title.uuid, value:'title of docs-i3'})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('update i1 t1 value', (done)=>{
//     chai.request('http://localhost:3200')
//     .put('/api/document/update-title').set('x-access-token',token).send({idx_uuid:docs.i1.title.descendant[0].index.uuid, up_uuid:docs.i1.title.descendant[0].title.uuid, value:'title of docs-i1t1'})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('update i1 t1 t1 value', (done)=>{
//     chai.request('http://localhost:3200')
//     .put('/api/document/update-title').set('x-access-token',token).send({idx_uuid:docs.i1.title.descendant[0].title.descendant[0].index.uuid, up_uuid:docs.i1.title.descendant[0].title.descendant[0].title.uuid, value:'title of docs-i1t1t1'})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('update i1 n1 value', (done)=>{
//     chai.request('http://localhost:3200')
//     .put('/api/document/update-title').set('x-access-token',token).send({idx_uuid:docs.i1.notes[0].descendant[0].index.uuid, up_uuid:docs.i1.notes[0].descendant[0].title.uuid, value:'title of docs-i1 n1'})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//
// })
//   describe('DELETE',()=>{
//     it('should delete i1 and descendant', (done)=>{
//       chai.request('http://localhost:3200')
//       .delete('/api/document/delete-document-recursively').set('x-access-token',token).set('idx_uuid',docs.i1.index.uuid)
//       .end((err, res)=>{
//         res.should.have.status(200);
//         done();
//       })
//     })
//   })
//   describe('CHECK',()=>{
//     it('should return only two document', (done)=>{
//       chai.request('http://localhost:3200')
//       .get('/api/document/get-main').set('x-access-token',token)
//       .end((err, res)=>{
//         res.should.have.status(200);
//         res.body.data.length.should.equal(2);
//         done();
//       })
//     })
//     it('should return only two document in all the db', (done)=>{
//       chai.request('http://localhost:3200')
//       .get('/dev/all-document').set('x-access-token',token)
//       .end((err, res)=>{
//         res.should.have.status(200);
//         res.body.data.length.should.equal(2);
//         done();
//       })
//     })
//
//   })
// })
//
// describe('TEST WITH ONE BOOK AND SECTIONS', ()=>{
//   describe('CREATE BOOK',()=>{
//     it('should create a book', (done)=>{
//       chai.request('http://localhost:3200')
//       .post('/api/document/create-document').set('x-access-token',token).send({model:'book'})
//       .end((err, res)=>{
//         res.should.have.status(200);
//         res.body.should.be.a('object');
//         res.body.should.have.property('token');
//         res.body.should.have.property('exp');
//         res.body.should.have.property('data');
//         res.body.data.should.have.property('index');
//         res.body.data.index.should.have.property('uuid');
//         res.body.data.should.have.property('title');
//         book = res.body.data;
//         done();
//       })
//     })
//     it('should read extend book', (done)=>{
//       chai.request('http://localhost:3200')
//       .get('/api/document/read-extend-document').set('x-access-token',token).set('idx_uuid',book.index.uuid)
//       .end((err, res)=>{
//         res.should.have.status(200);
//         res.body.data.should.have.property('notes');
//         res.body.data.notes.length.should.equal(1);
//         book = res.body.data;
//         done();
//       })
//     })
//     it('should create a section', (done)=>{
//       chai.request('http://localhost:3200')
//       .post('/api/document/create-document').set('x-access-token',token).send({model:'section-book', parent_uuid:book.title.uuid})
//       .end((err, res)=>{
//         book.title.descendant.push(res.body.data);
//         done();
//       })
//     })
//     it('should create note in section', (done)=>{
//       chai.request('http://localhost:3200')
//       .post('/api/document/create-note').set('x-access-token',token).send({model:'section-book', parent_uuid:book.title.descendant[0].title.uuid, code_label:5.1})
//       .end((err, res)=>{
//         book.title.descendant[0].notes = []
//         book.title.descendant[0].notes.push(res.body.data);
//         done();
//       })
//     })
//     it('should create a section', (done)=>{
//       chai.request('http://localhost:3200')
//       .post('/api/document/create-document').set('x-access-token',token).send({model:'section-book', parent_uuid:book.title.descendant[0].title.uuid})
//       .end((err, res)=>{
//         book.title.descendant[0].title.descendant = [];
//         book.title.descendant[0].title.descendant.push(res.body.data);
//         done();
//       })
//     })
//
//
//   })
//   xdescribe('DELETE',()=>{
//     it('should delete i1 and descendant', (done)=>{
//       chai.request('http://localhost:3200')
//       .delete('/api/document/delete-document-recursively').set('x-access-token',token).set('idx_uuid',book.index.uuid)
//       .end((err, res)=>{
//         res.should.have.status(200);
//         done();
//       })
//     })
//   })
//   xdescribe('CHECK',()=>{
//     it('should return only two document', (done)=>{
//       chai.request('http://localhost:3200')
//       .get('/api/document/get-main').set('x-access-token',token)
//       .end((err, res)=>{
//         res.should.have.status(200);
//         res.body.data.length.should.equal(0);
//         done();
//       })
//     })
//     it('should return only two document in all the db', (done)=>{
//       chai.request('http://localhost:3200')
//       .get('/dev/all-document').set('x-access-token',token)
//       .end((err, res)=>{
//         res.should.have.status(200);
//         res.body.data.length.should.equal(0);
//         done();
//       })
//     })
//
//   })
// })
