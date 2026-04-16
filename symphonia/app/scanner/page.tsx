'use client'
import SymphoniaSidebar from "@/components/ui/Side-bar-modern"
import { TitlePage } from "@/components/ui/TitlePage"

export default function ScannerPage() {
    return(
        <div className="flex min-h-screen">
            <SymphoniaSidebar/>
            <main className="flex-1 ml-80 mt-4">
                <TitlePage title="Scanner" />
            </main>
        </div>
    )
}