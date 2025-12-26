'use client'
import { useState, useEffect, useContext } from "react"
import { Bell, ChevronRight, Eye, UserX, Trash2, ArrowLeft, Plus, List, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from "@/components/header"
import { Calendar } from "lucide-react"
import SideNav from "@/components/sidenav"
import toast from "react-hot-toast"
import { AuthContext } from "@/context/authcontext"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface Settings {
  notifications: {
    push: boolean
    email: boolean
    messages: boolean
  }
  privacy: {
    who_can_tag: string
    is_private: boolean
  }
}

interface BlockedUser {
  id: number
  username: string
  display_name: string
  avatar: string | null
  blocked_at: string
}

export default function ProfileSettings() {
  const { currentUser, logout } = useContext(AuthContext)
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [settings, setSettings] = useState<Settings>({
    notifications: { push: true, email: true, messages: true },
    privacy: { who_can_tag: 'everyone', is_private: false }
  })

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

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!apiEndpoint) return
      try {
        const response = await fetch(`${apiEndpoint}/settings`, {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSettings()
  }, [apiEndpoint])

  // Fetch blocked users
  useEffect(() => {
    const fetchBlockedUsers = async () => {
      if (!apiEndpoint) return
      try {
        const response = await fetch(`${apiEndpoint}/friends/blocked`, {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setBlockedUsers(data.blocked_users || [])
        }
      } catch (error) {
        console.error('Error fetching blocked users:', error)
      }
    }
    fetchBlockedUsers()
  }, [apiEndpoint])

  // Save notification setting
  const updateNotificationSetting = async (key: keyof Settings['notifications'], value: boolean) => {
    if (!apiEndpoint) return

    const newSettings = {
      ...settings,
      notifications: { ...settings.notifications, [key]: value }
    }
    setSettings(newSettings)

    try {
      const response = await fetch(`${apiEndpoint}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notifications: newSettings.notifications })
      })
      if (response.ok) {
        toast.success('Setting updated')
      } else {
        toast.error('Failed to update setting')
        // Revert on error
        setSettings(settings)
      }
    } catch (error) {
      toast.error('Failed to update setting')
      setSettings(settings)
    }
  }

  // Save privacy setting
  const updatePrivacySetting = async (key: keyof Settings['privacy'], value: string | boolean) => {
    if (!apiEndpoint) return

    const newSettings = {
      ...settings,
      privacy: { ...settings.privacy, [key]: value }
    }
    setSettings(newSettings)

    try {
      const response = await fetch(`${apiEndpoint}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ privacy: newSettings.privacy })
      })
      if (response.ok) {
        toast.success('Setting updated')
      } else {
        toast.error('Failed to update setting')
        setSettings(settings)
      }
    } catch (error) {
      toast.error('Failed to update setting')
      setSettings(settings)
    }
  }

  // Unblock user
  const unblockUser = async (userId: number) => {
    if (!apiEndpoint) return

    try {
      const response = await fetch(`${apiEndpoint}/friends/${userId}/unblock`, {
        method: 'POST',
        credentials: 'include'
      })
      if (response.ok) {
        setBlockedUsers(blockedUsers.filter(u => u.id !== userId))
        toast.success('User unblocked')
      } else {
        toast.error('Failed to unblock user')
      }
    } catch (error) {
      toast.error('Failed to unblock user')
    }
  }

  // Delete account
  const handleDeleteAccount = async () => {
    if (!apiEndpoint || !currentUser || deleteConfirmation !== currentUser.username) return

    setIsSaving(true)
    try {
      const response = await fetch(`${apiEndpoint}/deleteuser`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (response.ok) {
        toast.success('Account deleted')
        logout()
      } else {
        toast.error('Failed to delete account')
      }
    } catch (error) {
      toast.error('Failed to delete account')
    } finally {
      setIsSaving(false)
    }
  }

  const sections = [
    { id: "notifications", title: "Notifications", icon: Bell },
    { id: "privacy", title: "Privacy", icon: Eye },
    { id: "accounts", title: "Accounts", icon: UserX },
    { id: "delete", title: "Delete Account", icon: Trash2 },
  ]

  const renderContent = (id: string) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )
    }

    switch (id) {
      case "notifications":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <Switch
                id="push-notifications"
                checked={settings.notifications.push}
                onCheckedChange={(checked) => updateNotificationSetting('push', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch
                id="email-notifications"
                checked={settings.notifications.email}
                onCheckedChange={(checked) => updateNotificationSetting('email', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="message-notifications">Message Notifications</Label>
              <Switch
                id="message-notifications"
                checked={settings.notifications.messages}
                onCheckedChange={(checked) => updateNotificationSetting('messages', checked)}
              />
            </div>
          </div>
        )
      case "privacy":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tag-settings">Who can tag you in Yaps?</Label>
              <RadioGroup
                value={settings.privacy.who_can_tag}
                onValueChange={(value) => updatePrivacySetting('who_can_tag', value)}
                id="tag-settings"
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="everyone" id="everyone" />
                  <Label htmlFor="everyone">Everyone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="followers" id="followers" />
                  <Label htmlFor="followers">People you follow only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nobody" id="nobody" />
                  <Label htmlFor="nobody">Nobody</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="private-account">Private Account</Label>
              <Switch
                id="private-account"
                checked={settings.privacy.is_private}
                onCheckedChange={(checked) => updatePrivacySetting('is_private', checked)}
              />
            </div>
          </div>
        )
      case "accounts":
        return (
          <div className="space-y-4">
            <div>
              <Label>Blocked Accounts</Label>
              <div className="mt-2 space-y-2">
                {blockedUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No blocked accounts</p>
                ) : (
                  blockedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.display_name || user.username}</p>
                          <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unblockUser(user.id)}
                      >
                        Unblock
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )
      case "delete":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. Please enter your username <strong>@{currentUser?.username}</strong> to confirm.
            </p>
            <Input
              placeholder="Enter your username"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
            />
            <Button
              variant="destructive"
              disabled={deleteConfirmation !== currentUser?.username || isSaving}
              onClick={handleDeleteAccount}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
          <SideNav links={eventLinks} />
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