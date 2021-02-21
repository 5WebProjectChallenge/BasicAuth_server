/*
    Creating user resolvers it will resolve incoming api calls
    Query is for fetching data from Db
    Mutation is for creating deleting content in DB
*/

import { User } from "../entites/User";
import { MyContext } from "src/types";
import { Ctx, Query, Resolver } from "type-graphql";

@Resolver()
export class UserResolver{

    @Query(()=>User,{nullable:true})
    async getAuthUser(@Ctx() {req} : MyContext): Promise<User | undefined>{
        if(!req.session.userId){
            return undefined
        }
        const user = await User.findOne({id:req.session.userId})
        return user
    }   
}