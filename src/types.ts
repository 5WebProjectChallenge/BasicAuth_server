import { Request, Response } from 'express'

export type MyContext = {
    req:Request  & {session:any},
    res:Response 
}