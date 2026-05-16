import type {Request , Response} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {prisma} from '../index.js';


export class AuthController {
    async login (req: Request, res: Response) {
        try{
             console.log('Full request body:', req.body);
            const {email, password} = req.body;
            const user = await prisma.user.findUnique({where: {email}
            
            });
            
            if (!user){
                return res.status (404).json({message:'Invalid credentials'});

            }

            const isValidPassword = await bcrypt.compare(password, user.password);


            if (!isValidPassword){
                return res.status(404).json({message:'Invalid credentials' });
            }


            const token = jwt.sign({id:user.id, email:user.email, role:user.role},
                process.env.JWT_SECRET as string, {expiresIn:'7d'}
            );

            res.json({
                message:'Login successful',
                token,
                user: {
                    id:user.id,
                    email:user.email,
                    name:user.name,
                    role:user.role
                }
            });
        }catch(error){
            console.error('Error details', error);
           
            res.status(500).json({message:'Server error' });
            
        }    
    }


    async register (req: Request, res: Response) {
        try{
            console.log('Register request body:', req.body);
            const {name, email, password} = req.body;
            const existingUser = await prisma.user.findUnique({where: {email}});

            if (existingUser){
                return res.status(400).json({message:'Email already in use' });
            }


            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role:'STAFF'
                }
            });


            const token = jwt.sign({id:newUser.id, email:newUser.email, role:newUser.role},
                process.env.JWT_SECRET as string, {expiresIn:'7d'}
            );
            res.status(201).json({
                message:'Registration successful',
                token,
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role
                }
            });
        }catch(error){
            console.error('Register error details', error);
            res.status(500).json({message:'Server error' });
        }
    }

}