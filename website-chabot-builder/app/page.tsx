"use client"
import { useSession } from "next-auth/react";
export default function Home() {
    const {data: session, status} = useSession()
    console.log("session ", session)
  return (
    <div>
      This is going to be the landing page for this!
    </div>
  );
}

