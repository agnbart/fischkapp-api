import { expect } from 'chai';
import * as request from 'supertest';
import { app } from '../index';
import {cardCollection, client, db} from '../utils/db';
import {ObjectId} from "mongodb";
import {addMinutes} from "date-fns";
import {after, before} from "node:test";

let server: any;

let authToken: string;
authToken = 'pss-this-is-my-secret';

const fiveMinutesAgo = Math.floor(addMinutes(new Date(), -5).getTime() / 1000);

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

describe('3. DELETE /cards/:id', () => {
    it('should return status 404 if card does not exist', (done) => {
        const testCardId = '651bb5f31bd5745d1487e000';
        const testCardObjectId = new ObjectId(testCardId);
        request(app)
            .delete(`/cards/${testCardObjectId}`)
            .set('Authorization', authToken)
            .expect(404)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.status).to.equal(404);
                done();
            })
    })
});

describe('4. DELETE /cards/:id',() => {
    it('should return status 403 if card can not be deleted (oldest then 5 minutes)', (done) => {
        const testCardId = '651bb5ec1bd5745d1487e6d4';
        const testCardObjectId = new ObjectId(testCardId);
        const cardTime = testCardObjectId.getTimestamp().getTime() / 1000
        if (cardTime > fiveMinutesAgo) {
            request(app)
                .delete(`/cards/${testCardObjectId}`)
                .set('Authorization', authToken)
                .expect(403)
                .end(async (err, res) => {
                    if (err) return done(err);
                    await cardCollection.deleteOne({_id: testCardObjectId});
                    expect(res.status).to.equal(403);
                    done();
                });
        } else {
            done();
        }
    });
});

describe('5. DELETE /cards/:id',() => {
    it('should return status 204 if card can be deleted (newest then 5 minutes)', (done) => {
        const testCardId = '651bd60437504246bcb7c116';
        const testCardObjectId = new ObjectId(testCardId);
        const cardTime = testCardObjectId.getTimestamp().getTime() / 1000
        if (cardTime < fiveMinutesAgo) {
            request(app)
                .delete(`/cards/${testCardObjectId}`)
                .set('Authorization', authToken)
                .expect(204)
                .end(async (err, res) => {
                    if (err) return done(err);
                    await cardCollection.deleteOne({_id: testCardObjectId});
                    expect(res.status).to.equal(204);
                    done();
                });
        } else {
            done();
        }
    });
});
