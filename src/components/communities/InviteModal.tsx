"use client"

import { useState, useEffect, useContext, useCallback } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, Copy, Trash2, Clock, Check } from "lucide-react"
import { CommunityContext } from "@/context/CommunityContext"
import { CommunityInvite, InviteModalProps } from "@/types"
import toast from "react-hot-toast"
import { Colors } from "@/constants/Colors"

export default function InviteModal({ isOpen, onClose, communitySlug }: InviteModalProps) {
    const { createInvite, getInvites, revokeInvite } = useContext(CommunityContext)!
    const [isLoading, setIsLoading] = useState(false)
    const [invites, setInvites] = useState<CommunityInvite[]>([])
    const [expiryOption, setExpiryOption] = useState("none")
    const [copyingId, setCopyingId] = useState<string | null>(null)

    const fetchInvites = useCallback(async () => {
        const data = await getInvites(communitySlug)
        setInvites(data)
    }, [getInvites, communitySlug])

    useEffect(() => {
        if (isOpen) {
            fetchInvites()
        }
    }, [isOpen, fetchInvites])

    const handleCreate = async () => {
        setIsLoading(true)
        try {
            const newInvite = await createInvite(communitySlug, expiryOption)
            if (newInvite) {
                // Refresh list
                await fetchInvites()
                // Reset form
                setExpiryOption("none")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleRevoke = async (token: string) => {
        if (!confirm("Are you sure you want to delete this invite link? Users will no longer be able to use it.")) return

        const success = await revokeInvite(token)
        if (success) {
            await fetchInvites()
        }
    }

    const handleCopy = (url: string, id: string) => {
        const fullUrl = `${window.location.origin}${url}`
        navigator.clipboard.writeText(fullUrl)
        setCopyingId(id)
        toast.success("Link copied to clipboard!")
        setTimeout(() => setCopyingId(null), 2000)
    }

    const formatExpiry = (isoString: string | null) => {
        if (!isoString) return "Never expires"
        return new Date(isoString).toLocaleDateString() + " " + new Date(isoString).toLocaleTimeString()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Invite People</DialogTitle>
                    <DialogDescription>
                        Create invite links to share with others.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Create New Invite */}
                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                        <h4 className="font-medium text-sm">Create New Link</h4>
                        <div className="flex gap-4 items-end">
                            <div className="flex-1 space-y-2">
                                <Label>Expires in</Label>
                                <Select value={expiryOption} onValueChange={setExpiryOption}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Never</SelectItem>
                                        <SelectItem value="12h">12 Hours</SelectItem>
                                        <SelectItem value="7d">7 Days</SelectItem>
                                        <SelectItem value="21d">21 Days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleCreate} disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Generate Link
                            </Button>
                        </div>
                    </div>

                    {/* Active Invites List */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                            Active Invites
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{invites.length}</span>
                        </h4>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                            {invites.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No active invite links. Create one above!
                                </p>
                            ) : (
                                invites.map((invite) => (
                                    <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                                        <div className="space-y-1 overflow-hidden mr-4">
                                            <div className="text-sm font-medium truncate flex items-center gap-2">
                                                {window.location.origin}{invite.url}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Expires: {formatExpiry(invite.expires_at)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleCopy(invite.url, invite.id)}
                                            >
                                                {copyingId === invite.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                <span className="sr-only">Copy</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleRevoke(invite.token)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="sr-only">Revoke</span>
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
