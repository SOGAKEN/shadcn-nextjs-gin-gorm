"use client"

import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { Bell, Clipboard, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut } from "next-auth/react"
import mainLogo from "@/assets/logo.jpg"

const Header: React.FC = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div className="h-16 bg-black animate-pulse" />
  }

  if (status === "loading") {
    return <div className="h-16 bg-black animate-pulse" />
  }

  if (status === "unauthenticated") {
    router.push("/api/auth/signin")
    return null
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-black text-white">
      <div className="flex h-16 items-center justify-between px-[50px]">
        <Link href="/" className="flex items-center space-x-2">
          <Image src={mainLogo} alt="IncidentTolls Logo" width={40} height={40} />
          <span className="hidden font-bold sm:inline-block">IncidentTolls</span>
        </Link>

        <nav className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-sm font-medium text-white hover:text-gray-300">
              <Bell className="mr-2 h-4 w-4" />
              アラート
            </Button>
          </Link>
          <Link href="/work">
            <Button variant="ghost" size="sm" className="text-sm font-medium text-white hover:text-gray-300">
              <Clipboard className="mr-2 h-4 w-4" />
              作業連絡
            </Button>
          </Link>
        </nav>

        {session && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "ユーザーアバター"} />
                  <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem className="flex-col items-start">
                <div className="text-sm font-medium">{session.user?.name}</div>
                <div className="text-xs text-muted-foreground">{session.user?.email}</div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>ログアウト</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}

export default Header