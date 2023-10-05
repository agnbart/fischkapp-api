import {cardCollection, client, db} from "../utils/db";
import {app} from "../index";
import {expect} from "chai";
import * as request from "supertest";
import {ObjectId} from "mongodb";
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

describe('3. PUT /cards/:id', () => {
    it('should return status 200 and the updated flashcard if the function updates the requested flashcard with the correct fields',  (done) => {
        const testCardId = '651a6a899a7cfe29a9c25001';
        const testMongoID = new ObjectId(testCardId);
        const newData = {
            front: 'Updated front of testing card 1',
            back: 'Updated back of testing card',
            tags: ['updated1', 'updated2'],
            author: 'Updated author of testing card'
        };

        console.log(newData);

        request(app)
            .put(`/cards/${testMongoID}`)
            .send(newData)
            .set('Authorization', authToken)
            .expect(200)
            .end(async (err, res) => {
                if (err) return done(err);
                const updatedCard = await cardCollection.findOne({_id: testMongoID});
                expect(updatedCard).to.exist;
                expect(updatedCard.front).to.equal(newData.front);
                expect(updatedCard.back).to.equal(newData.back);
                expect(updatedCard.tags).to.equal(newData.tags);
                expect(updatedCard.author).to.equal(newData.author);
                expect(res.status).to.equal(200);
                expect(res.body).to.deep.equal(updatedCard);
                done();
            });
    });
});
