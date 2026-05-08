'use client'
import SymphoniaSidebar from "@/components/ui/Side-bar-modern"
import { TitlePage } from "@/components/ui/TitlePage"
import PianoBase from "@/components/ui/piano-base"

export default function ScannerPage() {
    return(
            <div className="flex min-h-screen">
            <SymphoniaSidebar/>
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