'use client'
import SymphoniaSidebar from "@/components/ui/Side-bar-modern"
import { TitlePage } from "@/components/ui/TitlePage"
import PianoBase from "@/components/ui/piano-base"
import SideMobile from "@/components/ui/mobile/bar_options"
import PianoMobile from "@/components/ui/mobile/pianoMobile"
import FileUploadBtn from "@/components/ui/scannerBtn"


export default function ScannerPage() {
    const handleFileSelect = (file: File) => {
    console.log("Partition importée :", file.name)
  }
    return(
            <div className="flex-1 lg:flex h-auto">
            <div className="hidden lg:block">
                    <SymphoniaSidebar />
                  </div>
                  <div className="block lg:hidden">
                    <SideMobile/>
                    {/* <PianoMobile/> */}
                  </div>
            <main className="flex-1 ml-80 mt-4">
                <div className="flex items-center justify-between">
          <TitlePage title="Scanner" />
          
          {/* Intégration du composant FileUploadBtn */}
          <FileUploadBtn onFileSelect={handleFileSelect} />
        </div>
                <div className="mt-[10%]">
                    <PianoBase />
                </div>
                <div>
                </div>
            </main>
        </div>
    )
}