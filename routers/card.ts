import {Router} from 'express';
import {addMinutes} from 'date-fns'
import {CardClass, CreateCardPayload, UpdateCardPayload} from "../records/card.records";
import {cardCollection} from "../utils/db";
import {ObjectId} from "mongodb";
import {validateCardId} from "../utils/card-search-by-id";

export const cardRouter = Router();

cardRouter
    .get('/', async (req, res) => {
        try {
            const cardsCursor = await cardCollection.find({}).sort({_id: -1});
            const cards = await cardsCursor.toArray();

            if (cards.length === 0) {
                return res.status(404).json({ error: 'No cards found' });
            }
            res.status(200).json(cards);
        } catch (error) {
            console.error('Error fetching cards:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })

    .get('/author/:author', async (req, res) => {
        const author = decodeURIComponent(req.params.author);

        try {
            const cardsCursor = await cardCollection.find({author: author}).sort({_id: -1});
            const cards = await cardsCursor.toArray();

            if (cards.length === 0) {
                return res.status(404).json({ error: 'No cards found' });
            }
            res.status(200).json(cards);
        } catch (error) {
            console.error('Error fetching cards:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })

    .get('/tags/:tag', async (req, res) => {
        const tag = decodeURIComponent(req.params.tag);

        try {
            const cardsCursor = await cardCollection.find({tags: {$in:[tag]}}).sort({_id: -1});
            const cards = await cardsCursor.toArray();

            if (cards.length === 0) {
                return res.status(404).json({ error: 'No cards found' });
            }
            res.status(200).json(cards);
        } catch (error) {
            console.error('Error fetching cards:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })

    .delete('/:id', async (req, res) => {
        const cardId = req.params.id;
        const existingCard = await validateCardId(cardId, res);
        const cardObjectId = new ObjectId(cardId);

        const olderThanTimestamp = Math.floor(addMinutes(new Date(), -5).getTime() / 1000);
        try {
            if (cardObjectId.getTimestamp().getTime() / 1000 > olderThanTimestamp) {
                res.status(403).json("The card cannot be removed. It was established in the last 5 minutes.");
                return;
            }
            await cardCollection.deleteOne({_id: cardObjectId});
            res.status(200).json({success: 'The card has been deleted'})
        } catch(err) {
            console.error('Error deleting card from database:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })

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
        const cardId = req.params.id
        const existingCard = await validateCardId(cardId, res);
        const cardObjectId = new ObjectId(cardId)
        const {front, back, tags}: UpdateCardPayload = req.body;
        try {
            await cardCollection.updateOne({
                _id: cardObjectId,
            },{$set: {
                    front: front,
                    back: back,
                    tags: tags,
                }})
            res.status(200).json({ id: cardId });
        } catch (err) {
            console.error('Error modifyng card to database:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })
