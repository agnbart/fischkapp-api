import {MongoClient} from "mongodb";

// export const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cardbase';
export const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb+srv://agnbart:agnbart2023@cluster0.z9lxqbj.mongodb.net/cardbase?retryWrites=true&w=majority';
export const client = new MongoClient(MONGODB_URI);
export const db = client.db('cardbase');
export const cardCollection = db.collection('cards');