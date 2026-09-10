'use client'
import SymphoniaSidebar from "@/components/ui/Side-bar-modern"
import { TitlePage } from "@/components/ui/TitlePage"
import PianoBase from "@/components/ui/piano-base"
import SideMobile from "@/components/ui/mobile/bar_options"
import PianoMobile from "@/components/ui/mobile/pianoMobile"

export default function ScannerPage() {
    return(
            <div className="flex-1 lg:flex h-auto">
            <div className="hidden lg:block">
                    <SymphoniaSidebar />
                  </div>
                  <div className="block lg:hidden">
                    <SideMobile/>
                    <PianoMobile/>
                  </div>
            <main className="flex-1 ml-80 mt-4">
                <TitlePage title="Scanner" />
                <div className="mt-[10%]">
                    <PianoBase />
                </div>
                <div>
                </div>
            </main>
        </div>
    )
}