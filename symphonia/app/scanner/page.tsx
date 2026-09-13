'use client'
import SymphoniaSidebar from "@/components/ui/Side-bar-modern"
import { TitlePage } from "@/components/ui/TitlePage"
import PianoBase from "@/components/ui/piano-base"
import SideMobile from "@/components/ui/mobile/bar_options"
import PianoMobile from "@/components/ui/mobile/pianoMobile"
import ContentMain from "@/components/ui/ContentMain"

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
            <ContentMain className="mt-4 px-4 lg:px-8 pb-24 lg:pb-10">
                <TitlePage title="Scanner" />
                <p className="text-sm text-slate-300 mt-2 mb-4">Jouez ou lancez la simulation pour illuminer les notes en rythme.</p>
                <div className="mt-6">
                    <PianoBase />
                </div>
                <div>
                </div>
            </ContentMain>
        </div>
    )
}