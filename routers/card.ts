import {Router} from 'express';
import {addMinutes} from 'date-fns'
import {CardClass, CreateCardPayload, UpdateCardPayload} from "../records/card.records";
import {cardCollection} from "../utils/db";
import {ObjectId} from "mongodb";
import {validateCardId} from "../utils/card-search-by-id";

export const cardRouter = Router();

cardRouter
    /**
     * @swagger
     * /cards:
     *  get:
     *    summary: Get all cards
     *    description: Returns a list of all cards
     *    security:
     *      - APIKeyAuth: []
     *    responses:
     *      200:
     *        description: A list of all cards
     *      400:
     *        description: No cards found
     *      500:
     *        description: Internal Server Error
     */
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
    /**
     * @swagger
     * /cards/author/{author}:
     *   get:
     *     summary: Get cards of author
     *     description: Return a list of cards made by a specific author
     *     parameters:
     *       - in: path
     *         name: author
     *         required: true
     *         description: The author's name
     *         schema:
     *           type: string
     *     security:
     *       - APIKeyAuth: []
     *     responses:
     *       200:
     *         description: A list of cards made by the specified author
     *       404:
     *         description: No cards found for the specified author
     *       500:
     *         description: Internal Server Error
     */
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
    /**
     * @swagger
     * /cards/tags/{tag}:
     *  get:
     *    summary: Get cards of tag
     *    description: Return a list of rads with tag
     *    parameters:
     *      - in: path
     *        name: tag
     *        required: true
     *        description: The tag
     *        schema:
     *          type: string
     *    security:
     *      - APIKeyAuth: []
     *    responses:
     *      200:
     *        description: Return a list of rads with tag
     *      404:
     *        description: No cards found
     *      500:
     *        description: Internal Server Error
     */
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
    /**
     * @swagger
     * /cards/{id}:
     *  delete:
     *    summary: Delete a card by ID
     *    description: Delete a card by its unique ID
     *    parameters:
     *      - in: path
     *        name: id
     *        required: true
     *        description: ID of the card to delete
     *        schema:
     *          type: string
     *          format: uuid
     *    security:
     *      - APIKeyAuth: []
     *    responses:
     *      204:
     *        description: Card successfully
     *      403:
     *        description: Unable to delete the card (older than 5 minutes)
     *      404:
     *        description: Card not found
     *      500:
     *        description: Internal Server Error
     */
    .delete('/:id', async (req, res) => {
        const cardId = req.params.id;
        const existingCard = await validateCardId(cardId, res);
        const cardObjectId = new ObjectId(cardId);

        const olderThanTimestamp = Math.floor(addMinutes(new Date(), -5).getTime() / 1000);
        try {
            if (cardObjectId.getTimestamp().getTime() / 1000 > olderThanTimestamp) {
                res.status(403).json("The card cannot be removed. It was created more then 5 minutes.");
                return;
            }
            await cardCollection.deleteOne({_id: cardObjectId});
            res.status(204).json({success: 'The card has been deleted'})
        } catch(err) {
            console.error('Error deleting card from database:', err);
            res.status(404).json({ error: 'Card does not exist' });
        }
    })

    /**
     * @swagger
     * /cards:
     *   post:
     *     summary: Create a new card
     *     description: Create a new card with the provided details.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               front:
     *                 type: string
     *                 description: The front side of the card.
     *               back:
     *                 type: string
     *                 description: The back side of the card.
     *               tags:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Tags associated with the card.
     *               author:
     *                 type: string
     *                 description: The author of the card.
     *             required:
     *               - front
     *               - back
     *               - author
     *     security:
     *      - APIKeyAuth: []
     *     responses:
     *       201:
     *         description: Card created successfully.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 insertedId:
     *                   type: string
     *                   description: The ID of the newly created card.
     *       400:
     *         description: Bad request. Front value already exists.
     *       500:
     *         description: Internal Server Error.
     */
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

    /**
     * @swagger
     * /cards/{id}:
     *   put:
     *     summary: Update a card
     *     description: Update an existing card with the provided details.
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: ID of the card to update
     *         schema:
     *           type: string
     *           format: objectId
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               front:
     *                 type: string
     *                 description: The updated front side of the card.
     *               back:
     *                 type: string
     *                 description: The updated back side of the card.
     *               tags:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Updated tags associated with the card.
     *             required:
     *               - front
     *               - back
     *     security:
     *      - APIKeyAuth: []
     *     responses:
     *       200:
     *         description: Card updated successfully.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   description: The ID of the updated card.
     *       500:
     *         description: Internal Server Error.
     */

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
