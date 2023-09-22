import {cardCollection, db} from "../utils/db";

export interface CreateCardPayload {
    front: string;
    back: string;
    tags: string[];
    author: string;
}

export interface UpdateCardPayload {
    front: string;
    back: string;
    tags: string[];
}

export class CardClass implements CreateCardPayload{
    public front: string;
    public back: string;
    public tags: string[];
    public author: string;

    constructor(obj: CreateCardPayload) {
        const {front, back, tags, author} = obj;

        this.front = obj.front;
        this.back = obj.back;
        this.tags = obj.tags
        this.author = obj.author
    }

    static async isFrontTaken(front: string): Promise<boolean> {
        const existingCard = await cardCollection.findOne({ front});
        return existingCard !== null;
    }

}