/*
    Creating user resolvers it will resolve incoming api calls
    Query is for fetching data from Db
    Mutation is for creating deleting content in DB
*/

import { User } from "../entity/User";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon from "argon2";
import { COOKIE_NAME } from "../constants";

@InputType()
class UsernamePasswordTypes {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(()=>User,{nullable:true})
  user?:User

  @Field(()=>FieldError,{nullable:true})
  errors:[FieldError]
}

@ObjectType()
class AuthResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: [FieldError];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async getAuthUser(@Ctx() { req }: MyContext): Promise<User | undefined> {
    if (!req.session.userId) {
      return undefined;
    }
    const user = await User.findOne({ id: req.session.userId });
    return user;
  }

  @Mutation(() => AuthResponse, { nullable: true })
  async signUp(
    @Ctx() { req }: MyContext,
    @Arg("details") details: UsernamePasswordTypes
  ): Promise<AuthResponse> {
    const { password, username } = details;
    const hasedPassword = await argon.hash(password);
    console.log("hasedPassword",hasedPassword)
    const user = await User.create({
      username,
      password: hasedPassword
    });
    
    try {
      await user.save();
      req.session.userId = user.id;
      console.log("USER CREATED",user)
      return {user}
    } catch (e) {
      return {
        errors: [
          {
            field: "username",
            message: "username already taken",
          },
        ],
      };
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Ctx() { req }: MyContext,
    @Arg("details") details: UsernamePasswordTypes
  ): Promise<AuthResponse> {
    const { username, password } = details;

    const user = await User.findOne({ username });
    console.log("user",user)
    // check if user exist
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "user not found",
          },
        ],
      };
    }
    console.log("isValid",user.password)

    const isValid = await argon.verify(user.password, password);
    console.log("isValid",isValid)
    // check if password is valid
    if (!isValid) {
      return {
        errors: [
          {
            field: "password",
            message: "auth error",
          },
        ],
      };
    }

    req.session.userId = user.id;
    console.log("HERE")
    return { user };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext) {
    try {
      const response = await req.session.destroy();

      if (response.console.error()) {
        return res.send(false);
      }
      res.clearCookie(COOKIE_NAME);
      return true;
    } catch (e) {
      return false;
    }
  }
}
