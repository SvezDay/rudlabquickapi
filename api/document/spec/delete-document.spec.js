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

describe('DOCUMENT ************************************************************* delete-document.spec.js',()=>{it('INIT',(done)=>{done()})})

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

xdescribe('TEST WITH BANK DOCUMENT CAS 1', ()=>{
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
    it('should create note', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({model:'blank', parent_uuid:docs.title.uuid, model:docs.index.model, code_label:3.1})
      .end((err, res)=>{
        docs.notes = [];
        docs.notes.push(res.body.data);
        done();
      })
    })
    it('should create a document in note', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-document').set('x-access-token',token).send({model:'blank', parent_uuid:docs.notes[0].uuid})
      .end((err, res)=>{
        docs.notes[0].descendant = [];
        docs.notes[0].descendant.push(res.body.data);
        done();
      })
    })
    it('should create a document', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-document').set('x-access-token',token).send({model:'blank', parent_uuid:docs.title.uuid})
      .end((err, res)=>{
        docs.title.descendant = []
        docs.title.descendant.push(res.body.data);
        done();
      })
    })
    it('should create note', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({model:'blank', parent_uuid:docs.title.descendant[0].title.uuid, model:docs.title.descendant[0].index.model, code_label:3.1})
      .end((err, res)=>{
        docs.title.descendant[0].notes = [];
        docs.title.descendant[0].notes.push(res.body.data);
        done();
      })
    })
    it('should create a document in note', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-document').set('x-access-token',token).send({model:'blank', parent_uuid:docs.title.descendant[0].notes[0].uuid})
      .end((err, res)=>{
        docs.title.descendant[0].notes[0].descendant = [];
        docs.title.descendant[0].notes[0].descendant.push(res.body.data);
        done();
      })
    })
    it('should create a document', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-document').set('x-access-token',token).send({model:'blank', parent_uuid:docs.title.descendant[0].title.uuid})
      .end((err, res)=>{
        docs.title.descendant[0].title.descendant = []
        docs.title.descendant[0].title.descendant.push(res.body.data)
        done();
      })
    })
  })
  describe('IDENTIFY THE DOCUMENT',()=>{
    it('update title value', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/document/update-title').set('x-access-token',token).send({idx_uuid:docs.index.uuid, up_uuid:docs.title.uuid, value:'title b1'})
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
    it('update title value', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/document/update-title').set('x-access-token',token).send({idx_uuid:docs.notes[0].descendant[0].index.uuid, up_uuid:docs.notes[0].descendant[0].title.uuid, value:'title b1 bis'})
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
    it('update title value', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/document/update-title').set('x-access-token',token).send({idx_uuid:docs.title.descendant[0].index.uuid, up_uuid:docs.title.descendant[0].title.uuid, value:'title b2'})
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
    it('update title value', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/document/update-title').set('x-access-token',token).send({idx_uuid:docs.title.descendant[0].notes[0].descendant[0].index.uuid, up_uuid:docs.title.descendant[0].notes[0].descendant[0].title.uuid, value:'title b2 bis'})
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
    it('update title value', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/document/update-title').set('x-access-token',token).send({idx_uuid:docs.title.descendant[0].title.descendant[0].index.uuid, up_uuid:docs.title.descendant[0].title.descendant[0].title.uuid, value:'title b3'})
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
  })
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
})
describe('TEST WITH BANK DOCUMENT CAS 2', ()=>{
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
    it('should create note', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({model:'blank', parent_uuid:docs.title.uuid, model:docs.index.model, code_label:3.1})
      .end((err, res)=>{
        docs.notes = [];
        docs.notes.push(res.body.data);
        done();
      })
    })
    it('should create a document in note', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-document').set('x-access-token',token).send({model:'blank', parent_uuid:docs.notes[0].uuid})
      .end((err, res)=>{
        docs.notes[0].descendant = [];
        docs.notes[0].descendant.push(res.body.data);
        done();
      })
    })
    it('should create a document', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-document').set('x-access-token',token).send({model:'blank', parent_uuid:docs.title.uuid})
      .end((err, res)=>{
        docs.title.descendant = []
        docs.title.descendant.push(res.body.data);
        done();
      })
    })
    it('should create note', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({model:'blank', parent_uuid:docs.title.descendant[0].title.uuid, model:docs.title.descendant[0].index.model, code_label:3.1})
      .end((err, res)=>{
        docs.title.descendant[0].notes = [];
        docs.title.descendant[0].notes.push(res.body.data);
        done();
      })
    })
    it('should create a document in note', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-document').set('x-access-token',token).send({model:'blank', parent_uuid:docs.title.descendant[0].notes[0].uuid})
      .end((err, res)=>{
        docs.title.descendant[0].notes[0].descendant = [];
        docs.title.descendant[0].notes[0].descendant.push(res.body.data);
        done();
      })
    })
    it('should create a document', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-document').set('x-access-token',token).send({model:'blank', parent_uuid:docs.title.descendant[0].title.uuid})
      .end((err, res)=>{
        docs.title.descendant[0].title.descendant = []
        docs.title.descendant[0].title.descendant.push(res.body.data)
        done();
      })
    })
  })
  describe('IDENTIFY THE DOCUMENT',()=>{
    it('update title value', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/document/update-title').set('x-access-token',token).send({idx_uuid:docs.index.uuid, up_uuid:docs.title.uuid, value:'title b1'})
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
    it('update title value', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/document/update-title').set('x-access-token',token).send({idx_uuid:docs.notes[0].descendant[0].index.uuid, up_uuid:docs.notes[0].descendant[0].title.uuid, value:'title b1 bis'})
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
    it('update title value', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/document/update-title').set('x-access-token',token).send({idx_uuid:docs.title.descendant[0].index.uuid, up_uuid:docs.title.descendant[0].title.uuid, value:'title b2'})
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
    it('update title value', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/document/update-title').set('x-access-token',token).send({idx_uuid:docs.title.descendant[0].notes[0].descendant[0].index.uuid, up_uuid:docs.title.descendant[0].notes[0].descendant[0].title.uuid, value:'title b2 bis'})
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
    it('update title value', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/document/update-title').set('x-access-token',token).send({idx_uuid:docs.title.descendant[0].title.descendant[0].index.uuid, up_uuid:docs.title.descendant[0].title.descendant[0].title.uuid, value:'title b3'})
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
  })
})
describe('TEST WITH BOOK DOCUMENT CAS 3', ()=>{
  describe('CREATE docs',()=>{
    it('should create a document', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-document').set('x-access-token',token).send({model:'book', parent_uuid:docs.title.descendant[0].title.uuid})
      .end((err, res)=>{
        docs.title.descendant[0].title.descendant.push(res.body.data);
        done();
      })
    })
    it('should create a document', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-document').set('x-access-token',token).send({model:'section-book', parent_uuid:docs.title.descendant[0].title.descendant[1].title.uuid})
      .end((err, res)=>{
        docs.title.descendant[0].title.descendant[1].title.descendant = []
        docs.title.descendant[0].title.descendant[1].title.descendant.push(res.body.data);
        done();
      })
    })
  })
})
describe(' DELETE ', ()=>{
  xdescribe('DELETE',()=>{
    it('should remove the first document', (done)=>{
      chai.request('http://localhost:3200')
      .delete('/api/document/delete-document').set('x-access-token',token).set('idx_uuid',docs.index.uuid)
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
  })
  xdescribe('DELETE',()=>{
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
