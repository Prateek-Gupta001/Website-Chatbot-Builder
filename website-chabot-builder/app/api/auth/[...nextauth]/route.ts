import NextAuth from "next-auth"
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/db/prisma";
import { redirect } from "next/navigation";
import { signOut } from "next-auth/react";



export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET|| ""
  })

  ],
  callbacks:{
    signIn: async ({user , account , profile})=> {
      console.log("User , account and profile are ", user , account, profile)
      if(!user.email || !user.name)
      {
        return false
      }
      try{
          //create a record if it doesn't exist.
          const record = await prisma.users.upsert({
            where:{
              email: user.email 
            },
            update: {},
            create:{
              name: user.name, 
              image: user.image || "",
              email: user.email,
              planExpires:  new Date("2035-09-23T10:00:00.000Z"),
              planId: "68d133410e9701485aafc6c0"
            }
          })
          // get the record and store it in the id.. i.e the session itself. 
          return true

        }catch(err)
        {
          console.log("Getting this error while trying to upsert in prisma ", err)
          return false
        }  
    },
    jwt: async ({token, user, profile}) => {
        console.log("token ", token)
        console.log("user ", user)
        console.log("profile  ", profile)
        const record = await prisma.users.findUnique({
          where:{
            email: token.email || ""
          }
        })
        //@ts-ignore
        token.id = record.id
        return token;
    },
    session: async ({ session, token, user }:any) => {
      console.log("Session is ", session)
      session.user.id = token.id
      console.log("updated session is ", session)
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET, // Make sure you have this in .env.local
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }






