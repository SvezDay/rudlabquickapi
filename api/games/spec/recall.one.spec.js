process.env.NODE_ENV = 'dev';

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../../server');
let should = chai.should();
chai.use(chaiHttp);

const path = require('path');

let formReg = {first:'bruce', last:'wayne', email:'bruce@wayne.com', password:'wayne'};
let formAuth = {email:'bruce@wayne.com', password:'wayne'};
let token;

let docs = {};


describe('GAMES ************************************************************* recall.one.spec.js',()=>{it('INIT',(done)=>{done()})})
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

describe('TEST WITH BLANK DOCUMENT CAS 1', ()=>{
  describe('CREATE docs',()=>{
    it('should create a document', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-document').set('x-access-token',token).send({model:'blank'})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
        res.body.should.have.property('exp');
        res.body.should.have.property('data');
        res.body.data.should.have.property('index');
        res.body.data.index.should.have.property('uuid');
        res.body.data.should.have.property('title');
        docs = res.body.data
        done();
      })
    })
    it('should create note 1', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({model:'blank', parent_uuid:docs.title.uuid, model:docs.index.model, code_label:3.1})
      .end((err, res)=>{
        docs.notes = [];
        docs.notes.push(res.body.data);
        done();
      })
    })
    it('should create note 2', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({model:'blank', parent_uuid:docs.notes[0].uuid, model:docs.index.model, code_label:3.1})
      .end((err, res)=>{
        docs.notes.push(res.body.data);
        done();
      })
    })

  })
  describe('ADD RECALLABLE',()=>{
    it('should update the state recallable to true', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/recall/update-recallable-state').set('x-access-token',token).send({'idx_uuid':docs.index.uuid, 'status':true, 'descendant':false})
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
  })
  describe('REMOVE RECALLABLE',()=>{
    it('should update the state recallable to false', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/recall/update-recallable-state').set('x-access-token',token).send({'idx_uuid':docs.index.uuid, 'status':false, 'descendant':false})
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
  })
})
describe('TEST WITH BLANK DOCUMENT CAS 2 nested', ()=>{
  describe('CREATE docs nested',()=>{
    it('should create a document nest', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-document').set('x-access-token',token).send({model:'blank', parent_uuid:docs.title.uuid})
      .end((err, res)=>{
        res.should.have.status(200);
        docs.title.descendant = []
        docs.title.descendant.push(res.body.data);
        done();
      })
    })
    it('should create note 1', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({model:'blank', parent_uuid:docs.title.descendant[0].title.uuid, model:docs.title.descendant[0].index.model, code_label:3.1})
      .end((err, res)=>{
        docs.title.descendant[0].notes = [];
        docs.title.descendant[0].notes.push(res.body.data);
        done();
      })
    })
    it('should create note 2', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({model:'blank', parent_uuid:docs.title.descendant[0].notes[0].uuid, model:docs.title.descendant[0].index.model, code_label:3.1})
      .end((err, res)=>{
        docs.title.descendant[0].notes.push(res.body.data);
        done();
      })
    })
  })
  describe('ADD RECALLABLE',()=>{
    it('should update the state recallable to true', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/recall/update-recallable-state').set('x-access-token',token).send({'idx_uuid':docs.index.uuid, 'status':true, 'descendant':true})
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
  })
  describe('RUN RECALL CARD',()=>{
    it('should return card', (done)=>{
      chai.request('http://localhost:3200')
      .get('/api/recall/run').set('x-access-token',token).set('idx_uuid',docs.index.uuid)
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.data.should.have.property('q');
        res.body.data.should.have.property('a');
        res.body.data.should.have.property('recall');
        done();
      })
    })
  })
  xdescribe('REMOVE RECALLABLE',()=>{
    it('should update the state recallable to false', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/recall/update-recallable-state').set('x-access-token',token).send({'idx_uuid':docs.index.uuid, 'status':false, 'descendant':false})
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
  })
})
xdescribe(' DELETE ', ()=>{
  describe('DELETE',()=>{
    it('should remove the first document', (done)=>{
      chai.request('http://localhost:3200')
      .delete('/api/document/delete-document').set('x-access-token',token).set('idx_uuid',docs.index.uuid)
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
  })
  describe('DELETE',()=>{
    it('should remove the first document', (done)=>{
      chai.request('http://localhost:3200')
      .delete('/api/document/delete-document').set('x-access-token',token).set('idx_uuid',docs.title.descendant[0].index.uuid)
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
  })
})
