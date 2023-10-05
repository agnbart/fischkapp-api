import { expect } from 'chai';
import * as request from 'supertest';
import { app } from '../index';
import {cardCollection, client, db} from '../utils/db';
import {after, before} from "node:test";

let server: any;

let authToken: string;
authToken = 'pss-this-is-my-secret';

before(async () => {
    await client.connect();
    server = app.listen();
});

after(async () => {
    await server.close();
    await client.close(true);
});

describe('1. Database Connection', () => {
    it('should connect to the database', () => {
        expect(db).to.exist;
    });
});

describe('2. Authorization', () => {
    it('should return status 200 with valid authorization', (done) => {
        request(app)
            .get('/cards')
            .set('Authorization', authToken)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
});

describe('3. GET /cards', () => {
    it('should return status 200 if the order of cards is correct (from the newest to the oldest)', (done) => {
        request(app)
            .get(`/cards`)
            .set('Authorization', authToken)
            .expect(200)
            .end(async (err, res) => {
                if (err) return done(err);
                expect(res.status).to.equal(200);

                const cardsFromDb = await cardCollection.find().sort({_id: -1}).toArray();
                const responseCardIds = res.body.map((card: any) => card._id.toString());
                const dbCardIds = cardsFromDb.map((card: any) => card._id.toString());

                expect(responseCardIds).to.deep.equal(dbCardIds);

                done();
            });
    });
});

describe('4. GET /cards', () => {
    it('should return status 200 if number of cards is correct (3 cards)', (done) => {
        const expectedNumberOfCards = 3;
        request(app)
            .get(`/cards`)
            .set('Authorization', authToken)
            .expect(200)
            .end(async(err,res) => {
                if (err) return done(err);
                expect(res.status).to.equal(200);
                const numberOfCards = await cardCollection.countDocuments();
                expect(numberOfCards).to.equal(expectedNumberOfCards);
                done();
        });
    });
});

describe('5. GET /cards/author/:author', () => {
    it('should return status 200 if return an array of flashcards written by the requested author in the correct order (John Doe)', (done) => {
        const authorName = 'John Doe';
        request(app)
            .get(`/cards/author/${authorName}`)
            .set('Authorization', authToken)
            .expect(200)
            .end(async (err, res) => {
                if (err) return done(err);
                expect(res.status).to.equal(200);
                expect(res.body).to.be.an('array');
                res.body.forEach((card: any) => {
                    expect(card.author).to.equal(authorName);
                })
                const sortedCards = res.body.sort((a: any, b: any) => {
                    return parseInt(b._id.toString().substring(0, 8), 16) - parseInt(a._id.toString().substring(0, 8), 16);
                });
                expect(res.body).to.deep.equal(sortedCards);
                done();
            })
    })
});

describe('6. GET /cards/author/:author', () => {
   it('should return status 200 if number of cards written by requested author is correct (John Doe, 1 card)', (done) => {
       const authorName = 'John Doe';
       const expectedNumberOfCards = 1;
       request(app)
           .get(`/cards/author/${authorName}`)
           .set('Authorization', authToken)
           .expect(200)
           .end(async (err,res) => {
               if (err) return done(err);
               expect(res.statusCode).to.equal(200)
               expect(res.body).to.be.an('array');
               res.body.forEach((card: any) => {
                   expect(card.author).to.equal(authorName)
               });
               const numberOfCards = res.body.length
               expect(numberOfCards).to.equal(expectedNumberOfCards);
               done();
           });
   });
});

describe('7. GET /cards/tags/:tag', () => {
    it('should return status 200 if number of cards with the request tag is correct (tag1)', (done) => {
        const tag = 'tag1';
        const expectedNumberOfCards = 1;
        request(app)
            .get(`/cards/tags/${tag}`)
            .set('Authorization', authToken)
            .expect(200)
            .end(async (err, res) => {
                if (err) return done(err);
                expect(res.statusCode).to.equal(200);
                const cardsWithTag = res.body.filter((card: any) => card.tags.includes(tag));
                expect(cardsWithTag.length).to.equal(expectedNumberOfCards);
                done();
            })
    })
})