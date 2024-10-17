// app/components/Header.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/api/auth/signin");
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <header className="flex items-center justify-between bg-gray-800 text-white p-4">
      {/* 左端: ロゴ */}
      <div className="flex-shrink-0">
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={50} height={50} />
        </Link>
      </div>

      {/* 中央: アラートと作業連絡ボタン */}
      <div className="flex space-x-4">
        <Link
          href="/alerts"
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
        >
          アラート
        </Link>
        <Link
          href="/tasks"
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded"
        >
          作業連絡
        </Link>
      </div>

      {/* 右端: ログイン中のユーザー名 */}
      <div className="flex items-center">
        <span className="mr-4">{session?.user?.email}</span>
        <button
          onClick={handleSignOut}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
        >
          ログアウト
        </button>
      </div>
    </header>
  );
};

export default Header;
