import UserProfile from "@/components/auth/userprofil/page";
import InstrumentCard from "@/components/ui/InstrumentCard";
import SearchBar from "@/components/ui/search-bar-modern";
import SymphoniaSidebar from "@/components/ui/Side-bar-modern";
import { TitlePage } from "@/components/ui/TitlePage";

export default function InstrumentPage() {
  return (
    <div className="flex min-h-screen ">
      <SymphoniaSidebar />
      <main className="flex-1 ml-80 mt-4 ">
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
