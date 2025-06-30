'use client'
import React from 'react'
import Header from '@/components/header'
import SideNav from '@/components/sidenav'
import { Search,Home,Calendar, PartyPopper } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import ProfileEditor from '@/components/editprofile'

export default function UserProfile() {
  const router = useRouter();

  const eventLinks = [
    { label: "Coming Soon", icon: <Home className="h-4 w-4" />, onClick: () => router.push("/comingsoon") },
    { label: "Social Events", icon: <Calendar className="h-4 w-4" />, onClick: () => router.push("/social-events") },
    { label: "Fun Events", icon: <PartyPopper className="h-4 w-4" />, onClick: () => router.push("/fun-events") },
  ];

  return (
    <div className="w-screen h-screen lg:container mx-auto p-4">
    <Header />
    <div className="flex flex-col md:flex-row">
      {/* Left SideNav */}
      <div className="md:w-64 flex-shrink-0">
          <SideNav links = {eventLinks} />
        </div>
    {/* Center content */}
    <div className="flex-1 flex flex-col gap-4 p-4 lg:gap-6 lg:p-2 justify-center items-center ">
      
   <ProfileEditor />
    </div>
  </div>
</div>
  )
}
