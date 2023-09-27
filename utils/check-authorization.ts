import {NextFunction, Request, Response} from "express";

export const checkAuthorization = (req: Request, res: Response, next: NextFunction) => {
    const authorizationHeader = req.rawHeaders.find((element, index) => {
        return element.toLowerCase() === 'authorization' && req.rawHeaders[index + 1];
    });

    if (authorizationHeader) {
        const authorizationValue = req.rawHeaders[req.rawHeaders.indexOf(authorizationHeader) + 1];
        if (authorizationValue && authorizationValue === "pss-this-is-my-secret") {
            console.log('Authorization header:', authorizationValue);
            res.send('Authorization header received');
        } else {
            res.status(400).send('Invalid authorization');
        }
    } else {
        res.status(400).send('Authorization header missing');
    }
}