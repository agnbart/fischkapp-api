import {ObjectId} from "mongodb";
import {cardCollection} from "./db";
import {Response} from "express";

export const validateCardId = async (id: string, res: Response) => {
    let objectId;
    try {
        objectId = new ObjectId(id);
    } catch (error) {
        res.status(400).json({ error: 'Invalid ObjectId' });
        return null;
    }

    const existingCard = await cardCollection.findOne({ _id: objectId });
    if (!existingCard) {
        res.status(404).json({ error: 'Card not found in the database' });
        throw new Error('Card not found in the database');
    }

    return existingCard;
};