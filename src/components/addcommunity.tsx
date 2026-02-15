"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import CreateCommunityModal from "@/components/communities/CreateCommunityModal"
import { useCommunity } from "@/context/CommunityContext"

export default function AddCommunity() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const communityContext = useCommunity()
    const { fetchCommunities, fetchMyCommunities } = communityContext || {}

    const handleGroupCreated = () => {
        if (fetchCommunities) fetchCommunities()
        if (fetchMyCommunities) fetchMyCommunities()
    }

    return (
        <>
            <Button
                onClick={() => setIsModalOpen(true)}
                variant="ghost"
                className="w-full justify-start text-sm font-medium hover:bg-accent rounded-lg h-10"
            >
                <Users className="w-4 h-4 mr-2" />
                Create Community
            </Button>

            <CreateCommunityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onGroupCreated={handleGroupCreated}
            />
        </>
    )
}
