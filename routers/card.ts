import {Router} from 'express';
import {CardClass, CreateCardPayload} from "../records/card.records";
import {cardCollection} from "../utils/db";
import {ObjectId} from "mongodb";

export const cardRouter = Router();

cardRouter
    .post('/', async (req, res) => {
        const {front, back, tags, author}: CreateCardPayload = req.body

        if (await CardClass.isFrontTaken(req.body.front)) {
            res.status(400).json({ error: 'Front already exists'});
            throw new Error("This front value already exists in database.")
        }
        try {
            const result = await cardCollection.insertOne({
                front,
                back,
                tags,
                author
            });
            console.log('Card added with ID:', result.insertedId);
            res.status(201).json({ insertedId: result.insertedId });
        } catch (err) {
            console.error('Error adding card to database:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })

    .put('/:id', async (req, res) => {
        const hash = req.params.id;

        let objectId;
        try {
            objectId = new ObjectId(hash);
        } catch (error) {
            res.status(400).json({ error: 'Invalid ObjectId' });
            return;
        }

        const existingCard = await cardCollection.findOne({ _id: objectId });

        if (!existingCard) {
            res.status(404).json({ error: 'Card not found in the database'});
            throw new Error("Card not found in the database.")
        }

        try {
            await cardCollection.updateOne({
                _id: objectId,
            },{$set: {
                    front: req.body.front,
                    back: req.body.back,
                    tags: req.body.tags,
                }})
            res.status(200).json({ id: hash });
        } catch (err) {
            console.error('Error modifyng card to database:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })
