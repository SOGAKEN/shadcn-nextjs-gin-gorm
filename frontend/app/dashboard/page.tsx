"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IncidentDashboard } from "@/components/Incident-dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<{ email: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.accessToken) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setUserData(data.user))
        .catch((err) => console.error(err));
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <p>読み込み中...</p>;
  }

  if (status === "unauthenticated") {
    return null; // ミドルウェアがリダイレクトを処理するため、ここでは何も表示しない
  }

  return (
    <>
      <div>
        <h1>ダッシュボード</h1>
        {userData ? (
          <p>ようこそ、{userData.email}さん</p>
        ) : (
          <p>ユーザー情報を取得中...</p>
        )}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          ログアウト
        </button>
      </div>
      <IncidentDashboard />
    </>
  );
}
