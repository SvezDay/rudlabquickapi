process.env.NODE_ENV = 'dev';

let chai = require('chai');
let chaiHttp = require('chai-http');
let io = require('socket.io-client');
let server = require('../../../server');
let should = chai.should();
let expect = chai.expect;
chai.use(chaiHttp);

const path = require('path');

let formReg = {first:'bruce', last:'wayne', email:'bruce@wayne.com', password:'wayne'};
let formAuth = {email:'bruce@wayne.com', password:'wayne'};
let token;



describe('DOCUMENT ************************************************************* document-recall.spec.js',()=>{it('INIT',(done)=>{done()})})
describe('CLEAR DATABASE', ()=>{
  it('should return nothing', (done)=>{
    chai.request('http://localhost:3200')
    .delete('/dev/clear-database')
    .end((err, res)=>{
      res.should.have.status(200);
      res.body.should.be.a('object');
      done();
    })
  })
})
describe('CREATE BRUCE WAYNE', ()=>{
  it('should return object with token, exp, data.first for an Manual Register', (done)=>{
    chai.request('http://localhost:3200')
    .post('/manual_register')
    .send(formReg)
    .end((err, res)=>{
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('token');
      res.body.should.have.property('exp');
      res.body.should.have.property('data');
      res.body.data.should.have.property('first');
      // res.body.errors.pages.should.have.property('kind').eql('required');
      done();
    })
  })
  it('should object with token, exp, data.first for an Manual Authentication', (done)=>{
    chai.request('http://localhost:3200')
    .post('/manual_authenticate')
    .send(formAuth)
    .end((err, res)=>{
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('token');
      res.body.should.have.property('exp');
      res.body.should.have.property('data');
      res.body.data.should.have.property('first');
      token = res.body.token;
      done();
    })
  })
  it('should return empty list of document for validate the token in the api routes', (done)=>{
    chai.request('http://localhost:3200')
    .get('/api/document/get-main')
    .set('x-access-token',token)
    .send()
    .end((err, res)=>{
      res.should.have.status(200);
      // res.body.should.be.a('object');
      done();
    })
  })
})

xdescribe('TEST DOCUMENT - RECALL FLOW #A', ()=>{
  let docs = {};
  // Prérequis::
  // 1 document vide
  describe('CREATE DOCUMENTS PREREQUIS',()=>{
    it('should create a document', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-document').set('x-access-token',token).send({model:'blank'})
      .end((err, res)=>{
        res.should.have.status(200);
        docs = res.body.data;
        done();
      })
    })
  })
  describe('CALL THE RECALL METHODS',()=>{
    it('should flow A', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/recall/update-recallable-state').set('x-access-token',token).send({'idx_uuid':docs.index.uuid, 'status':'true', 'descendant':false})
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
    it('should check flow A with no recallable document', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      MATCH (p)-[*]->(is:Index)-[:Has]->(ts:Title{recallable:true})
      RETURN count(is)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({query:query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(0);
        done();
      })
    })
  })
  describe('DELETE PREREQUIS', ()=>{
    it('should delete document', (done)=>{
      chai.request('http://localhost:3200')
      .delete('/api/document/delete-document').set('x-access-token',token).set('idx_uuid',docs.index.uuid)
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
    it('should have no document', (done)=>{
      chai.request('http://localhost:3200')
      .get('/api/document/get-main').set('x-access-token',token)
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.length.should.equal(0);
        done();
      })
    })
  })
})
xdescribe('TEST DOCUMENT - RECALL FLOW #B & #D', ()=>{
  let docs = {};
  // Prérequis::
  // 1 document 2 notes for at least 1 recall
  describe('CREATE DOCUMENTS PREREQUIS',()=>{
    it('should create a document', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-document').set('x-access-token',token).send({model:'blank'})
      .end((err, res)=>{
        res.should.have.status(200);
        docs = res.body.data;
        done();
      })
    })
    it('should create first note', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({parent_uuid:docs.title.uuid, model:'blank', code_label:5.1}) // code_label:principe
      .end((err, res)=>{
        res.should.have.status(200);
        docs.notes = [];
        docs.notes.push(res.body.data);
        done();
      })
    })
    it('should create second note', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({parent_uuid:docs.notes[0].uuid, model:'blank', code_label:5.2}) // code_label:definition
      .end((err, res)=>{
        res.should.have.status(200);
        docs.notes.push(res.body.data);
        done();
      })
    })
  })
  describe('CALL THE RECALL METHODS',()=>{
    it('should flow B', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/recall/update-recallable-state').set('x-access-token',token).send({'idx_uuid':docs.index.uuid, 'status':'true', 'descendant':false})
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
    it('should check flow B with a recallable document', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      MATCH (p)-[*]->(is:Index)-[:Has]->(ts:Title{recallable:true})
      RETURN count(is)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({'query':query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(1);
        done();
      })
    })
    it('should check flow B with one recall', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      MATCH (p)-[:Recall]->(ir:IndexRecall)-[:Recall]->(r:Recall)
      RETURN count(r)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({'query':query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(6);
        done();
      })
    })
  })
  describe('DELETE PREREQUIS AS FLOW #D', ()=>{
    it('should delete document', (done)=>{
      chai.request('http://localhost:3200')
      .delete('/api/document/delete-document').set('x-access-token',token).set('idx_uuid',docs.index.uuid)
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
    it('should have no document', (done)=>{
      chai.request('http://localhost:3200')
      .get('/api/document/get-main').set('x-access-token',token)
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.length.should.equal(0);
        done();
      })
    })
    it('should check flow D with no recallable document', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      MATCH (p)-[*]->(is:Index)-[:Has]->(ts:Title{recallable:true})
      RETURN count(is)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({'query':query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(0);
        done();
      })
    })
    it('should check flow D with no recall', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      MATCH (p)-[:Recall]->(ir:IndexRecall)-[:Recall]->(r:Recall)
      RETURN count(r)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({'query':query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(0);
        done();
      })
    })
  })
})
xdescribe('TEST DOCUMENT - RECALL FLOW #B & #E', ()=>{
  let docs = {};
  // Prérequis::
  // 1 document 2 notes for at least 1 recall
  describe('CREATE DOCUMENTS PREREQUIS',()=>{
    it('should create a document', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-document').set('x-access-token',token).send({model:'blank'})
      .end((err, res)=>{
        res.should.have.status(200);
        docs = res.body.data;
        done();
      })
    })
    it('should create first note', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({parent_uuid:docs.title.uuid, model:'blank', code_label:5.1}) // code_label:principe
      .end((err, res)=>{
        res.should.have.status(200);
        docs.notes = [];
        docs.notes.push(res.body.data);
        done();
      })
    })
    it('should create second note', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({parent_uuid:docs.notes[0].uuid, model:'blank', code_label:5.2}) // code_label:definition
      .end((err, res)=>{
        res.should.have.status(200);
        docs.notes.push(res.body.data);
        done();
      })
    })
  })
  describe('CALL THE RECALL METHODS',()=>{
    it('should flow B', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/recall/update-recallable-state').set('x-access-token',token).send({'idx_uuid':docs.index.uuid, 'status':'true', 'descendant':false})
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
    it('should check flow B with a recallable document', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      MATCH (p)-[*]->(is:Index)-[:Has]->(ts:Title{recallable:true})
      RETURN count(is)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({'query':query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(1);
        done();
      })
    })
    it('should check flow B with one recall', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      MATCH (p)-[:Recall]->(ir:IndexRecall)-[:Recall]->(r:Recall)
      RETURN count(r)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({'query':query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(6);
        done();
      })
    })
  })
  describe('DELETE PREREQUIS AS FLOW #E', ()=>{
    it('should delete note', (done)=>{
      chai.request('http://localhost:3200')
      .delete('/api/document/delete-note').set('x-access-token',token).set('note_uuid',docs.notes[0].uuid)
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
    it('should have one document', (done)=>{
      chai.request('http://localhost:3200')
      .get('/api/document/get-main').set('x-access-token',token)
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.length.should.equal(1);
        done();
      })
    })
    it('should check flow E with one recallable document', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      MATCH (p)-[*]->(is:Index)-[:Has]->(ts:Title{recallable:true})
      RETURN count(is)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({'query':query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(1);
        done();
      })
    })
    it('should check flow D with 2 recall', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      MATCH (p)-[:Recall]->(ir:IndexRecall)-[:Recall]->(r:Recall)
      RETURN count(r)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({'query':query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(2);
        done();
      })
    })
    it('should delete document', (done)=>{ // delete this document for the other test
      chai.request('http://localhost:3200')
      .delete('/api/document/delete-document').set('x-access-token',token).set('idx_uuid',docs.index.uuid)
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
  })
})
xdescribe('TEST DOCUMENT - RECALL FLOW #B & #F', ()=>{
  let docs = {};
  // Prérequis::
  // 1 document 2 notes recallable where one will be update to be undefined
  //
  describe('CREATE DOCUMENTS PREREQUIS',()=>{
    it('should create a document', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-document').set('x-access-token',token).send({model:'blank'})
      .end((err, res)=>{
        res.should.have.status(200);
        docs = res.body.data;
        done();
      })
    })
    it('should create first note', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({parent_uuid:docs.title.uuid, model:'blank', code_label:5.1}) // code_label:principe
      .end((err, res)=>{
        res.should.have.status(200);
        docs.notes = [];
        docs.notes.push(res.body.data);
        done();
      })
    })
    it('should create second note', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({parent_uuid:docs.notes[0].uuid, model:'blank', code_label:5.2}) // code_label:definition
      .end((err, res)=>{
        res.should.have.status(200);
        docs.notes.push(res.body.data);
        done();
      })
    })
  })
  describe('CALL THE RECALL METHODS',()=>{
    it('should flow B', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/recall/update-recallable-state').set('x-access-token',token).send({'idx_uuid':docs.index.uuid, 'status':'true', 'descendant':false})
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
    it('should check flow B with a recallable document', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      MATCH (p)-[*]->(is:Index)-[:Has]->(ts:Title{recallable:true})
      RETURN count(is)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({'query':query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(1);
        done();
      })
    })
    it('should check flow B with one recall', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      MATCH (p)-[:Recall]->(ir:IndexRecall)-[:Recall]->(r:Recall)
      RETURN count(r)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({'query':query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(6);
        done();
      })
    })
  })
  describe('UPDATE DOCUMENTS PREREQUIS',()=>{
    it('should delete note', (done)=>{
      chai.request('http://localhost:3200')
      .delete('/api/document/delete-note').set('x-access-token',token).set('note_uuid',docs.notes[0].uuid)
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
    it('should check flow B with a recallable document', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      MATCH (p)-[*]->(is:Index)-[:Has]->(ts:Title{recallable:true})
      RETURN count(is)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({'query':query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(1);
        done();
      })
    })
    it('should check flow B with one recall', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      MATCH (p)-[:Recall]->(ir:IndexRecall)-[:Recall]->(r:Recall)
      RETURN count(r)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({'query':query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(2);
        done();
      })
    })
  })
  describe('DELETE PREREQUIS AS FLOW #E', ()=>{
    it('should delete document', (done)=>{ // delete this document for the other test
      chai.request('http://localhost:3200')
      .delete('/api/document/delete-document').set('x-access-token',token).set('idx_uuid',docs.index.uuid)
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
  })
})
xdescribe('TEST DOCUMENT - RECALL FLOW #B & #G', ()=>{
  let docs = {};
  // Prérequis::
  // 1 document 1 note recallable and 1 note undefined, who will be update to be recallable later
  //
  describe('CREATE DOCUMENTS PREREQUIS',()=>{
    it('should create a document', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-document').set('x-access-token',token).send({model:'blank'})
      .end((err, res)=>{
        res.should.have.status(200);
        docs = res.body.data;
        done();
      })
    })
    it('should create first note', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({parent_uuid:docs.title.uuid, model:'blank', code_label:5.1}) // code_label:principe
      .end((err, res)=>{
        res.should.have.status(200);
        docs.notes = [];
        docs.notes.push(res.body.data);
        done();
      })
    })

  })
  describe('CALL THE RECALL METHODS',()=>{
    it('should flow B', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/recall/update-recallable-state').set('x-access-token',token).send({'idx_uuid':docs.index.uuid, 'status':'true', 'descendant':false})
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
    it('should check flow B with a recallable document', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      MATCH (p)-[*]->(is:Index)-[:Has]->(ts:Title{recallable:true})
      RETURN count(is)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({'query':query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(1);
        done();
      })
    })
    it('should check flow B with one recall', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      MATCH (p)-[:Recall]->(ir:IndexRecall)-[:Recall]->(r:Recall)
      RETURN count(r)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({'query':query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(2);
        done();
      })
    })
  })
  describe('DELETE PREREQUIS AS FLOW #E', ()=>{
    it('should create second note', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({parent_uuid:docs.notes[0].uuid, model:'blank', code_label:5.2}) // code_label:definition
      .end((err, res)=>{
        res.should.have.status(200);
        docs.notes.push(res.body.data);
        done();
      })
    })
    it('should have one document', (done)=>{
      chai.request('http://localhost:3200')
      .get('/api/document/get-main').set('x-access-token',token)
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.length.should.equal(1);
        done();
      })
    })
    it('should check flow E with one recallable document', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      MATCH (p)-[*]->(is:Index)-[:Has]->(ts:Title{recallable:true})
      RETURN count(is)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({'query':query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(1);
        done();
      })
    })
    it('should check flow E with 2 recall', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      MATCH (p)-[:Recall]->(ir:IndexRecall)-[:Recall]->(r:Recall)
      RETURN count(r)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({'query':query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(2);
        done();
      })
    })
    it('should delete document', (done)=>{ // delete this document for the other test
      chai.request('http://localhost:3200')
      .delete('/api/document/delete-document').set('x-access-token',token).set('idx_uuid',docs.index.uuid)
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
  })
})
xdescribe('TEST DOCUMENT - RECALL FLOW #C', ()=>{
  let docs = {};
  // Prérequis::
  // 1 document 2 notes for at least 1 recall
  describe('CREATE DOCUMENTS PREREQUIS',()=>{
    it('should create a document', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-document').set('x-access-token',token).send({model:'blank'})
      .end((err, res)=>{
        res.should.have.status(200);
        docs = res.body.data;
        done();
      })
    })
    it('should create first note', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({parent_uuid:docs.title.uuid, model:'blank', code_label:5.1}) // code_label:principe
      .end((err, res)=>{
        res.should.have.status(200);
        docs.notes = [];
        docs.notes.push(res.body.data);
        done();
      })
    })
    it('should create second note', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({parent_uuid:docs.notes[0].uuid, model:'blank', code_label:5.2}) // code_label:definition
      .end((err, res)=>{
        res.should.have.status(200);
        docs.notes.push(res.body.data);
        done();
      })
    })
  })
  describe('CALL THE RECALL METHODS',()=>{
    it('should flow C update recallable state to true', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/recall/update-recallable-state').set('x-access-token',token).send({'idx_uuid':docs.index.uuid, 'status':true, 'descendant':false})
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
    it('should check flow C with a recallable document', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      MATCH (p)-[*]->(is:Index)-[:Has]->(ts:Title{recallable:true})
      RETURN count(is)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({'query':query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(1);
        done();
      })
    })
    it('should check flow C with one recall', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      MATCH (p)-[:Recall]->(ir:IndexRecall)-[:Recall]->(r:Recall)
      RETURN count(r)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({'query':query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(6);
        done();
      })
    })
    it('should flow C  update recallable state to false', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/recall/update-recallable-state').set('x-access-token',token).send({'idx_uuid':docs.index.uuid, 'status':false, 'descendant':false})
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
    it('should check flow C with no recall', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      OPTIONAL MATCH (p)-[:Recall]->(ir:IndexRecall)-[:Recall]->(r:Recall)
      RETURN count(r)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({'query':query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(0);
        done();
      })
    })
    it('should check flow C with no recallable document', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      MATCH (p)-[*]->(is:Index)-[:Has]->(ts:Title{recallable:true})
      RETURN count(is)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({'query':query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(0);
        done();
      })
    })
  })
  describe('DELETE PREREQUIS', ()=>{
    it('should delete document', (done)=>{
      chai.request('http://localhost:3200')
      .delete('/api/document/delete-document').set('x-access-token',token).set('idx_uuid',docs.index.uuid)
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
    it('should have no document', (done)=>{
      chai.request('http://localhost:3200')
      .get('/api/document/get-main').set('x-access-token',token)
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.length.should.equal(0);
        done();
      })
    })
  })
})

describe('TEST DOCUMENT - RECALL WITH BIG DICO IMPORTED', function(){
  this.timeout(15000)
  let docs = {};
  // Prérequis::
  // 1 document 1 note recallable and 1 note undefined, who will be update to be recallable later
  describe('IMPORT DICO',()=>{

    it('should import dico', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/games/update-brut-data').set('x-access-token',token).send({file:'ef4.data.js'})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.have.property('index');
        docs = res.body.data;
        done();
      })
    })
    xit('should check with a recallable document', (done)=>{
      let query = `
      MATCH (i:Index)
      RETURN COUNT(i) `;
      chai.request('http://localhost:3200').post('/dev/query').set('x-access-token',token).send({query:query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data[0].should.equal(1);
        docs = res.body.data[0];
        done();
      })
    })
  })
  describe('CALL THE RECALL METHODS',()=>{
    it('should flow', (done)=>{
      var options = {
        transports: ['websocket'],
        'force new connection': true,
        path: '/games'
      };
      // let socket = io('http://localhost:3200/', options);
      let socket = io('http://localhost:3200/games');
      socket.on('connect', ()=>{
        socket.emit('update-recallable-state', {idx_uuid:docs.index.uuid, status:'true', descendant:false, token:token});
        socket.on('update-recallable-state-response', (s) => {
          console.log('check connect',s)
          // s.should.equal('ongoing');
          if(s=="successed"){
            socket.close();
            done();
            setTimeout(done, 15000);
          }
        });
      })
      // chai.request('http://localhost:3200')
      // .put('/api/recall/update-recallable-state').set('x-access-token',token).send({'idx_uuid':docs.index.uuid, 'status':'true', 'descendant':false})
      // .end((err, res)=>{
      //   // console.log('err:', err)
      //   res.should.have.status(200);
      //   done();
      // })
    })
    it('should check recallable document', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      MATCH (p)-[*]->(is:Index)-[:Has]->(ts:Title{recallable:'true'})
      RETURN count(is)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({'query':query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(1);
        done();
      })
    })
    it('should check recall', (done)=>{
      let query = `
      MATCH (p:Person{email:'bruce@wayne.com'})
      MATCH (p)-[:Recall]->(ir:IndexRecall)-[:Recall]->(r:Recall)
      RETURN count(r)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({'query':query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.be.an('array')
        res.body.data[0].should.equal(499);
        done();
      })
    })
  })
  describe('DELETE PREREQUIS', ()=>{
    it('should delete the document', (done)=>{
      chai.request('http://localhost:3200')
      .delete('/api/document/delete-document').set('x-access-token',token).set('idx_uuid',docs.index.uuid) // code_label:definition
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
    it('should have no document', (done)=>{
      setTimeout(()=>{
        let query = `
        MATCH (i:Index) RETURN count(i)
        `;
        chai.request('http://localhost:3200')
        .post('/dev/query').set('x-access-token',token).send({query:query})
        .end((err, res)=>{
          res.should.have.status(200);
          res.body.data[0].should.equal(0);
          done();
        })
      }, 1000);
    })
    it('should have no recall', (done)=>{
      let query = `
      MATCH (rs:Recall) RETURN count(rs)
      `;
      chai.request('http://localhost:3200')
      .post('/dev/query').set('x-access-token',token).send({query:query})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data[0].should.equal(0);
        done();
      })
    })
  })

})
