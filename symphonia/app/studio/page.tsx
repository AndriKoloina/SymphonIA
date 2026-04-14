import UserProfile from "@/components/auth/userprofil/page";
import PianoBase from "@/components/ui/piano-base";
import SymphoniaSidebar from "@/components/ui/Side-bar-modern";
import { TitlePage } from "@/components/ui/TitlePage";

export default function StudioPage(){
     const profileData = {
  profilePicture: "/user.png",
  username: "Klwnn",
  email: "koloina@example.com"
  }

    return(
        <div className="flex min-h-screen">
              <SymphoniaSidebar/>
              <main className="flex-1 ml-80 mt-4">
                <div className="flex">
                  <TitlePage
                  title="Studio"
                />
                  <UserProfile
                          profilePicture={profileData.profilePicture}
                          username={profileData.username}
                          email=  {profileData.email}
                        />
                        
                </div>
                <div>
                    <PianoBase/>
                </div>
                
              </main>
              
        
            </div>
    )
}
