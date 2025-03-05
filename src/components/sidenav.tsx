import type React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface NavLink {
  label: string
  icon: React.ReactNode
  onClick: () => void
  badgeCount?: number
}

interface SideNavProps {
  links: NavLink[]
  variant?: "default" | "compact"
}

export default function SideNav({ links, variant = "default" }: SideNavProps) {
  return (
    <nav className={cn("grid items-start px-2 text-sm font-medium lg:px-4", variant === "compact" ? "gap-1" : "gap-2")}>
      {links.map((link, index) => (
        <Button
          key={index}
          variant="ghost"
          className={cn(
            "justify-start text-muted-foreground transition-all hover:text-primary",
            variant === "compact" ? "px-2 py-1.5" : "px-3 py-2",
          )}
          onClick={link.onClick}
        >
          {link.icon}
          {link.label && <span className="ml-3">{link.label}</span>}
          {link.badgeCount !== undefined && (
            <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
              {link.badgeCount}
            </Badge>
          )}
        </Button>
      ))}
    </nav>
  )
}

