import UserProfile from "@/components/auth/userprofil/page";
import InstrumentCard from "@/components/ui/InstrumentCard";
import SearchBar from "@/components/ui/search-bar-modern";
import SymphoniaSidebar from "@/components/ui/Side-bar-modern";
import { TitlePage } from "@/components/ui/TitlePage";
import SideMobile from "@/components/ui/mobile/bar_options";

export default function InstrumentPage() {
  return (
    <div className="flex-1 lg:flex h-auto ">
      <div className="hidden lg:block">
        <SymphoniaSidebar />
      </div>
      <div className="block lg:hidden">
        <SideMobile/>
      </div>
      <main className="flex-1 ml-0 lg:ml-80 mt-4 px-4 lg:px-8">
        <div className="flex">
          <TitlePage title="Instrument" />
        </div>
        <div >
          <InstrumentCard />
        </div>
      </main>
    </div>
  );
}
