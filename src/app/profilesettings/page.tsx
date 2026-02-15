'use client'
import { useState, useEffect, useContext } from "react"
import { Bell, Eye, UserX, Loader2, Settings2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import Header from "@/components/header"
import toast from "react-hot-toast"
import { AuthContext } from "@/context/authcontext"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import FilterPills, { FilterPill } from "@/components/filter-pills"
import { motion, AnimatePresence } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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
  const { currentUser, logout,authToken } = useContext(AuthContext)
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [activeTab, setActiveTab] = useState("notifications")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [settings, setSettings] = useState<Settings>({
    notifications: { push: true, email: true, messages: true },
    privacy: { who_can_tag: 'everyone', is_private: false }
  })

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
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
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
    { id: "notifications", title: "Notifications", icon: Bell, description: "Manage your notification preferences" },
    { id: "privacy", title: "Privacy", icon: Eye, description: "Control who can interact with you" },
    { id: "accounts", title: "Blocked", icon: UserX, description: "Manage blocked accounts" },
    { id: "account-management", title: "Account", icon: Settings2, description: "Manage your account status" },
  ]

  // Filter pills for navigation
  const filterPills: FilterPill[] = sections.map((section) => ({
    id: section.id,
    label: section.title,
    active: activeTab === section.id,
  }))

  const handleFilterSelect = (filterId: string) => {
    setActiveTab(filterId)
  }

  const renderContent = (id: string) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    }

    const currentSection = sections.find(s => s.id === id)

    switch (id) {
      case "notifications":
        return (
          <Card className="border-muted/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#ff9013]" />
                {currentSection?.title}
              </CardTitle>
              <CardDescription>{currentSection?.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <Label htmlFor="push-notifications" className="text-base font-medium">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => updateNotificationSetting('push', checked)}
                  className="data-[state=checked]:bg-[#4A90E2]"
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <Label htmlFor="email-notifications" className="text-base font-medium">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive important updates via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => updateNotificationSetting('email', checked)}
                  className="data-[state=checked]:bg-[#4A90E2]"
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <Label htmlFor="message-notifications" className="text-base font-medium">Message Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified when you receive new messages</p>
                </div>
                <Switch
                  id="message-notifications"
                  checked={settings.notifications.messages}
                  onCheckedChange={(checked) => updateNotificationSetting('messages', checked)}
                  className="data-[state=checked]:bg-[#4A90E2]"
                />
              </div>
            </CardContent>
          </Card>
        )
      case "privacy":
        return (
          <Card className="border-muted/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#ff9013]" />
                {currentSection?.title}
              </CardTitle>
              <CardDescription>{currentSection?.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-xl bg-muted/30">
                <Label htmlFor="tag-settings" className="text-base font-medium">Who can tag you in Yaps?</Label>
                <p className="text-sm text-muted-foreground mb-4">Control who can mention you in posts</p>
                <RadioGroup
                  value={settings.privacy.who_can_tag}
                  onValueChange={(value) => updatePrivacySetting('who_can_tag', value)}
                  id="tag-settings"
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="everyone" id="everyone" className="border-[#ff9013] text-[#ff9013]" />
                    <Label htmlFor="everyone" className="cursor-pointer flex-1">Everyone</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="followers" id="followers" className="border-[#ff9013] text-[#ff9013]" />
                    <Label htmlFor="followers" className="cursor-pointer flex-1">People you follow only</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="nobody" id="nobody" className="border-[#ff9013] text-[#ff9013]" />
                    <Label htmlFor="nobody" className="cursor-pointer flex-1">Nobody</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <Label htmlFor="private-account" className="text-base font-medium">Private Account</Label>
                  <p className="text-sm text-muted-foreground">Only approved followers can see your yaps</p>
                </div>
                <Switch
                  id="private-account"
                  checked={settings.privacy.is_private}
                  onCheckedChange={(checked) => updatePrivacySetting('is_private', checked)}
                  className="data-[state=checked]:bg-[#4A90E2]"
                />
              </div>
            </CardContent>
          </Card>
        )
      case "accounts":
        return (
          <Card className="border-muted/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-[#ff9013]" />
                {currentSection?.title}
              </CardTitle>
              <CardDescription>{currentSection?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {blockedUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <UserX className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No blocked accounts</h3>
                  <p className="text-muted-foreground max-w-sm">
                    When you block someone, they won&apos;t appear here until you unblock them.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {blockedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-muted">
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-[#ff9013] to-orange-600 text-white">
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.display_name || user.username}</p>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unblockUser(user.id)}
                        className="rounded-full hover:bg-[#ff9013] hover:text-white hover:border-[#ff9013] transition-all"
                      >
                        Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      case "account-management":
        return (
          <Card className="border-muted/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-[#ff9013]" />
                Account Management
              </CardTitle>
              <CardDescription>Manage your account status</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full space-y-3">
                {/* Deactivate Account */}
                <AccordionItem value="deactivate" className="border rounded-xl overflow-hidden">
                  <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/30">
                    <span className="font-medium text-left">Deactivate Account</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Temporarily hide your profile and content. You can reactivate anytime by logging back in.
                      </p>
                      <Button
                        variant="outline"
                        disabled
                        className="w-full opacity-50 cursor-not-allowed"
                      >
                        Deactivate Account (Coming Soon)
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Delete Account */}
                <AccordionItem value="delete" className="border rounded-xl overflow-hidden">
                  <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-destructive/5">
                    <span className="font-medium text-left flex items-center gap-2">
                      <span className="text-destructive">Delete Account</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all data. This cannot be undone.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Enter your username <strong className="text-foreground">@{currentUser?.username}</strong> to confirm.
                      </p>
                      <Input
                        placeholder="Enter your username"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        className="bg-muted/50"
                      />
                      <Button
                        variant="destructive"
                        disabled={deleteConfirmation !== currentUser?.username || isSaving}
                        onClick={handleDeleteAccount}
                        className="w-full"
                      >
                        {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Delete Account
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-screen h-screen lg:container mx-auto p-4">
      <Header />
      <main className="mobile-content-padding lg:pb-4">
        {/* Filter Pills - Mobile */}
        <div className="lg:hidden">
          <FilterPills
            filters={filterPills}
            onFilterSelect={handleFilterSelect}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Center content */}
          <div className="flex-1 flex flex-col gap-4 lg:gap-6">
            {/* Desktop Filter Pills */}
            <div className="hidden lg:block">
              <FilterPills
                filters={filterPills}
                onFilterSelect={handleFilterSelect}
              />
            </div>

            {/* Settings Content */}
            <div className="w-full max-w-2xl mx-auto">
              <AnimatePresence mode="wait">
                {sections.map((section) => (
                  activeTab === section.id && (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {renderContent(section.id)}
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right sidebar placeholder for desktop alignment */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="sticky top-4 space-y-4">
              {/* Info card about settings */}
              <Card className="border-muted/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences and privacy settings to customize your CampoSocial experience.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}