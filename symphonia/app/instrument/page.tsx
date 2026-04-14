import InstrumentCard from "@/components/ui/InstrumentCard";
import SearchBar from "@/components/ui/search-bar-modern";
import SymphoniaSidebar from "@/components/ui/Side-bar-modern";
import { TitlePage } from "@/components/ui/TitlePage";

export default function InstrumentPage(){
    return(
      <div className="flex min-h-screen overflow-hidden ">
           <SymphoniaSidebar />
           <main className="flex-1 ml-80 p-8 pb-32">
       
             <div className="flex items-center justify-between mb-10 gap-8">
               <TitlePage title="Instrument" />
               <div className="flex-1 max-w-xl">
                 <SearchBar placeholder="Rechercher dans votre bibliothèque..." />
               </div>
             </div>
           < div>
                <InstrumentCard/>
              </div>
             
     
           
             
           </main>
         </div>
    )
}