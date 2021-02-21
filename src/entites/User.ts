import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@ObjectType() // To convert class to type-graphql Object As graphql need entity to be graphql type
@Entity()
export class User extends BaseEntity{
    
    @Field(()=> Int) // To expose this feild adding this
    @PrimaryGeneratedColumn()
    id!:number

    @Field(()=>String)
    @Column({unique:true})
    username!:string

    @Column(()=>String)
    password!:string

    @Field(()=>String)
    @CreateDateColumn()
    createdAt = new Date()

    @Field(()=>String)
    @UpdateDateColumn()
    updatedAt = new Date()
}