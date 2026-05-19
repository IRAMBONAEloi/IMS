import type {Request , Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';

export interface authRequest extends Request{
    user?:{
        id: number;
        email: string;
        role: string;
    };
}


export const authenticateToken = (req: authRequest , res:Response, next: NextFunction) =>{

    const authHeader = req.headers['authorization'];
    const token  =  authHeader && authHeader.split(' ')[1];

    if (!token){

        return res.status(401).json({message: 'Access token required'});
    }

    try{

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            id: number;
            email: string;
            role: string;
        };

        req.user =decoded;
        next();

    } catch (error){
        return res.status(403).json({message: 'Invalid or expired token'});
    }
};


export const requireAdmin = (req: authRequest, res: Response, next: NextFunction)=>{

    if (req.user?.role !== 'ADMIN'){
        return res.status(403).json({message: 'Admin access required'});
    }
    next();
};