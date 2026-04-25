import { redirect } from "next/navigation";

export default function Home() {
  // This automatically redirects localhost:3000 to localhost:3000/login
  redirect("/login");
}