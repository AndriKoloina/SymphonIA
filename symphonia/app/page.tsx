
import SideMobile from "@/components/ui/mobile/bar_options";
import LoginForm from "./auth/login/page";
import SongCardMobile from "@/components/ui/mobile/songCardsMobile";
import LecteurSonMobile from "@/components/ui/mobile/LecteurSonMobile";
export default function Home() {
  return (
    <div>
      <main>
          <LoginForm/>
          {/* <LecteurSonMobile/> */}
      </main>
    </div>
  )
}
