import {cardCollection, client, db} from "../utils/db";
import {app} from "../index";
import {expect} from "chai";
import * as request from "supertest";
import {CreateCardPayload} from "../records/card.records";
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

describe('3. POST /cards', () => {
    it('should return status 201 if the card with the correct fields is created (front, back, tags, author', (done) => {
        const testCard = {
            front: 'Front of testing card',
            back: 'Back of testing card',
            tags: ['testtag', 'testtag2'],
            author: 'testauthor'
        };
        request(app)
            .post(`/cards`)
            .send(testCard)
            .set('Authorization', authToken)
            .expect(201)
            .end(async(err,res) => {
                if (err) return done(err);
                const createdCard = await cardCollection.findOne({ front: testCard.front });
                expect(createdCard).to.exist;
                expect(createdCard.front).to.equal(testCard.front);
                expect(createdCard.back).to.equal(testCard.back);
                expect(createdCard.tags).to.deep.equal(testCard.tags);
                expect(createdCard.author).to.equal(testCard.author);
                expect(res.status).to.equal(201);
                done();
            });
        });
});

describe('4. POST /cards', () => {
    it('should return status 400 when card with specific front value already exists', (done) => {
        const testCard = {
            front: 'Front of testing card',
            back: 'Back of testing card',
            tags: ['testtag', 'testtag2'],
            author: 'testauthor'
        };
        request(app)
            .post(`/cards`)
            .send(testCard)
            .set('Authorization', authToken)
            .expect(400)
            .end(async(err,res) => {
                if (err) return done(err);
                expect(res.status).to.equal(400);
                done();
            });
        });
});
