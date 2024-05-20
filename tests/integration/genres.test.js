const request = require('supertest');
const mongoose = require("mongoose")
const {Genre} = require('../../models/genre');
const {User} = require('../../models/users');
let server;

describe('/api/genres', () => {
    beforeEach(() => {
        server = require('../../index');
    });
    afterEach(async () => {
        server.close();
        await Genre.deleteMany({});                
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('GET /', () => {
        it('should return all the genres', async () => {
            await Genre.collection.insertMany([
                { name: 'g1'},
                { name: 'g2'}
            ]);
            const res = await request(server).get('/api/genres');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name==='g1')).toBeTruthy();
            expect(res.body.some(g => g.name==='g2')).toBeTruthy();
        });        
    });

    describe('GET /:id', () => {
        it('should return the genre with passed id', async () => {
            const genre = new Genre ({ name: 'genre1'});
            await genre.save();

            const res = await request(server).get(`/api/genres/${genre._id}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name);
        }); 
        
        it('should return status 404 in case of invalid id', async () => {
            const res = await request(server).get(`/api/genres/1`);

            expect(res.status).toBe(404);
        });
    });

    describe('POST /', () => {
        let token;
        let name;
        
        const exec = async () => {
            return request(server)
            .post('/api/genres')
            .set('x-auth-token', token)
            .send({ name: name });
        }

        beforeEach(() => {
            const user = new User();
            token = user.GenerateAuthToken();
            name = 'genre1';
        });

        it('should return 401 if client is not logged in', async () => {
            token = '';

            const res = await exec();
            expect(res.status).toBe(401);
        }); 
        
        it('should return 400 if genre is less than 5 characters', async () => {
            name = 'g1';

            const res = await exec();            
            expect(res.status).toBe(400);
        }); 

        it('should save the genre if its valid', async () => {
            await exec();
            
            const genre = await Genre.find({ name: 'genre1'});
            expect(genre).not.toBeNull();
        });
        
        it('should return the genre if its valid', async () => {
            const res = await exec();
            
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre1');
        }); 
        
    });

    describe('DELETE /:id', () => {
        let token; 
        let genre; 
        let id; 
    
        const exec = async () => {
          return await request(server)
            .delete('/api/genres/' + id)
            .set('x-auth-token', token)
            .send();
        }
    
        beforeEach(async () => {
          // Before each test we need to create a genre and 
          // put it in the database.      
          genre = new Genre({ name: 'genre1' });
          await genre.save();
          
          id = genre._id; 
          const userObj = new User({isAdmin: true});
          token = userObj.GenerateAuthToken();     
        })
    
        it('should return 401 if client is not logged in', async () => {
          token = ''; 
    
          const res = await exec();
    
          expect(res.status).toBe(401);
        });
    
        it('should return 403 if the user is not an admin', async () => {
            const userObj = new User();
            token = userObj.GenerateAuthToken();   
    
          const res = await exec();
    
          expect(res.status).toBe(403);
        });
    
        it('should return 404 if id is invalid', async () => {
          id = 1; 
          
          const res = await exec();
    
          expect(res.status).toBe(404);
        });
    
        it('should return 404 if no genre with the given id was found', async () => {
          id = mongoose.Types.ObjectId();
    
          const res = await exec();
    
          expect(res.status).toBe(404);
        });
    
        it('should delete the genre if input is valid', async () => {
          await exec();
    
          const genreInDb = await Genre.findById(id);
    
          expect(genreInDb).toBeNull();
        });
    
        it('should return the removed genre', async () => {
          const res = await exec();
    
          expect(res.body).toHaveProperty('_id', genre._id.toHexString());
          expect(res.body).toHaveProperty('name', genre.name);
        });
      }); 
      
      describe('PUT /:id', () => {
        let token; 
        let newName; 
        let genre; 
        let id; 
    
        const exec = async () => {
          return await request(server)
            .put('/api/genres/' + id)
            .set('x-auth-token', token)
            .send({ name: newName });
        }
    
        beforeEach(async () => {
          // Before each test we need to create a genre and 
          // put it in the database.      
          genre = new Genre({ name: 'genre1' });
          await genre.save();
          
          const userObj = new User();
          token = userObj.GenerateAuthToken();     
          id = genre._id; 
          newName = 'updatedName'; 
        })
    
        it('should return 401 if client is not logged in', async () => {
          token = ''; 
    
          const res = await exec();
    
          expect(res.status).toBe(401);
        });
    
        it('should return 400 if genre is less than 5 characters', async () => {
          newName = '1234'; 
          
          const res = await exec();
    
          expect(res.status).toBe(400);
        });
    
        it('should return 400 if genre is more than 50 characters', async () => {
          newName = new Array(52).join('a');
    
          const res = await exec();
    
          expect(res.status).toBe(400);
        });
    
        it('should return 404 if id is invalid', async () => {
          id = 1;
    
          const res = await exec();
    
          expect(res.status).toBe(404);
        });
    
        it('should return 404 if genre with the given id was not found', async () => {
          id = mongoose.Types.ObjectId();
    
          const res = await exec();
    
          expect(res.status).toBe(404);
        });
    
        it('should update the genre if input is valid', async () => {
          await exec();
    
          const updatedGenre = await Genre.findById(genre._id);
    
          expect(updatedGenre.name).toBe(newName);
        });
    
        it('should return the updated genre if it is valid', async () => {
          const res = await exec();
    
          expect(res.body).toHaveProperty('_id');
          expect(res.body).toHaveProperty('name', newName);
        });
      }); 
});

