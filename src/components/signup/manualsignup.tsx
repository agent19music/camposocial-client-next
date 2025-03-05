"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

interface CreateAccountProps {
  onClose: () => void
}

const CreateAccount: React.FC<CreateAccountProps> = ({ onClose }) => {
  interface User {
    email: string
    username: string
    password: string
    first_name: string
    last_name: string
    category: string
  }

  const [category, setCategory] = useState("open")
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)

  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [course, setCourse] = useState("")

  const router = useRouter()
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible)
  }
  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible)
  }

  const addUser = async (e: React.FormEvent<HTMLFormElement>, userData: User, confirmPassword: string) => {
    e.preventDefault()

    const { email, username, password, first_name, last_name, category } = userData

    // Check if passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    try {
      const response = await fetch(`${apiEndpoint}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
          first_name,
          last_name,
          category,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Your account has been created successfully!")

        router.push("/login")
      } else if (response.status === 409) {
        toast.error("Username or password already exists")
      } else if (response.status === 500) {
        toast.error(`An error occurred: ${data.message}`)
      } else if (response.status === 400) {
        toast.error(`Oops ! ${data.message}`)
      }
    } catch (error: any) {
      // Using any here as the error type is unknown
      console.error("Error:", error)
      toast.error(`A network error occurred: ${error.message}`)
    }
  }

  return (
    <div>
      <Button variant="ghost" className="absolute right-2 top-2" onClick={onClose}>
      </Button>
      <form
        onSubmit={(e) =>
          addUser(
            e,
            { email, username, password, first_name: firstName, last_name: lastName, category },
            confirmPassword,
          )
        }
      >
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-8 p-7">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First name</Label>
                <Input
                  id="first-name"
                  placeholder="Max"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input
                  id="last-name"
                  placeholder="Robinson"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Course</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{category ? category : "Open"}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Enrolled Course</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={category} onValueChange={setCategory}>
                    <DropdownMenuRadioItem value="sw">Software Development</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="ui/ux">UI/UX Design</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="ds">Data Science</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="cybersec">Cyber Security</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe23"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={togglePasswordVisibility}
                >
                  {passwordVisible ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                  <span className="sr-only">{passwordVisible ? "Hide password" : "Show password"}</span>
                </button>
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="confirmpassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmpassword"
                  type={confirmPasswordVisible ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {confirmPasswordVisible ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                  <span className="sr-only">{confirmPasswordVisible ? "Hide password" : "Show password"}</span>
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Create an account
            </Button>
          </div>
        </CardContent>
      </form>
    </div>
  )
}

export default CreateAccount

