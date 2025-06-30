'use client'
import { useState, useEffect } from "react"
import { Bell, ChevronRight, Eye, UserX, VolumeX, Trash2, ArrowLeft,Plus, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from "@/components/header"
import { Calendar, PartyPopper, Home } from "lucide-react";
import SideNav from "@/components/sidenav"
import toast from "react-hot-toast"



export default function ProfileSettings() {
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const eventLinks = [
    { label: "Calendar", icon: <Calendar className="h-4 w-4" />, onClick: () => toast.success("calendar") },
    { label: "Create Event", icon: <Plus className="h-4 w-4" />, onClick: () => toast.success("create") },
    { label: "My Events", icon: <List className="h-4 w-4" />, onClick: () => toast.success("myEvents") },
  ]


  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768)
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  const sections = [
    { id: "notifications", title: "Notifications", icon: Bell },
    { id: "privacy", title: "Privacy", icon: Eye },
    { id: "accounts", title: "Accounts", icon: UserX },
    { id: "delete", title: "Delete Account", icon: Trash2 },
  ]

  const renderContent = (id: string) => {
    switch (id) {
      case "notifications":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <Switch id="push-notifications" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch id="email-notifications" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="message-notifications">Message Notifications</Label>
              <Switch id="message-notifications" />
            </div>
          </div>
        )
      case "privacy":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tag-settings">Who can tag you?</Label>
              <RadioGroup defaultValue="everyone" id="tag-settings" className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="everyone" id="everyone" />
                  <Label htmlFor="everyone">Everyone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="followers" id="followers" />
                  <Label htmlFor="followers">Followers only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nobody" id="nobody" />
                  <Label htmlFor="nobody">Nobody</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="private-account">Private Account</Label>
              <Switch id="private-account" />
            </div>
          </div>
        )
      case "accounts":
        return (
          <div className="space-y-4">
            <div>
              <Label>Blocked Accounts</Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span>@blockeduser1</span>
                  <Button variant="outline" size="sm">Unblock</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>@blockeduser2</span>
                  <Button variant="outline" size="sm">Unblock</Button>
                </div>
              </div>
            </div>
            <div>
              <Label>Muted Accounts</Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span>@muteduser1</span>
                  <Button variant="outline" size="sm">Unmute</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>@muteduser2</span>
                  <Button variant="outline" size="sm">Unmute</Button>
                </div>
              </div>
            </div>
          </div>
        )
      case "delete":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. Please enter your username to confirm.
            </p>
            <Input
              placeholder="Enter your username"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
            />
            <Button variant="destructive" disabled={deleteConfirmation !== "username"}>
              Delete Account
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  if (isMobile) {
    return (
      <div className="w-screen h-screen flex flex-col lg:container  p-4">
      <Header />
    
      {/* Main content with the two side navs and center content */}
      <div className="flex  flex-col md:flex-row">
        {/* Left SideNav */}
        <SideNav links={eventLinks} />
      <Card className="w-full max-w-md mx-auto mt-5">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage your account settings and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          {activeSection ? (
            <div>
              <Button
                variant="ghost"
                className="mb-4 p-0"
                onClick={() => setActiveSection(null)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h2 className="text-lg font-semibold mb-4">{sections.find(s => s.id === activeSection)?.title}</h2>
              {renderContent(activeSection)}
            </div>
          ) : (
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => setActiveSection(section.id)}
                  >
                    <span className="flex items-center">
                      <section.icon className="mr-2 h-4 w-4" />
                      {section.title}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen flex flex-col lg:container  p-4">
    <Header />
  
    {/* Main content with the two side navs and center content */}
    <div className="flex  flex-col md:flex-row">
      {/* Left SideNav */}
        <div className="md:w-64 flex-shrink-0">
                <SideNav links = {eventLinks} />
              </div>
    <Card className="w-full max-w-3xl mx-auto mt-5">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Manage your account settings and preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {sections.map((section) => (
              <TabsTrigger key={section.id} value={section.id}>
                <section.icon className="mr-2 h-4 w-4" />
                {section.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {sections.map((section) => (
            <TabsContent key={section.id} value={section.id}>
              <Card>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>Manage your {section.title.toLowerCase()} settings</CardDescription>
                </CardHeader>
                <CardContent>{renderContent(section.id)}</CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
    </div>
    </div>
  )
}