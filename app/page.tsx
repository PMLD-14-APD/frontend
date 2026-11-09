
import { redirect } from "next/navigation";
import { getCurrentUser } from "../lib/auth";
import LoginPage from "../components/auth/LoginPage";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LoginPage />;
}
