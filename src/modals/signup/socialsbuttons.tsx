import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { useGoogleLogin } from "@react-oauth/google"
import {toast} from "react-hot-toast"

export function SocialLoginModal() {
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT
  const googleLogin = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      try {
        const response = await fetch(`${apiEndpoint}/auth/google`, { // Your backend route
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentialResponse), // Send the credential response
        });

        const data = await response.json();
        if (response.ok) {
          // Handle successful login (e.g., set user session)
          toast.success('Google login success:', data);
        } else {
          // Handle error
          toast.error('Google login error:', data);
        }
      } catch (error) {
        console.error('Google login error:', error);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
    },
  });

  return (
    <div className="flex flex-col space-y-4 ">
      <Button variant="outline" className="w-full">
        <Icons.github className="mr-2 h-4 w-4" />
        Sign up with GitHub
      </Button>
      <Button variant="outline" className="w-full"  onClick={() => googleLogin()}>
        <Icons.google className="mr-2 h-4 w-4" />
        Sign up with Google
      </Button>
      <Button variant="outline" className="w-full">
        <Icons.x className="mr-2 h-4 w-4" />
        Sign up with Twitter
      </Button>
    </div>
  )
}

