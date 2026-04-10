import type { TitlePageProps } from "@/types/play_interface"

interface TitlePage extends TitlePageProps {}
export const TitlePage = ({ title }: TitlePageProps) => {
    return (
        <div className="w-full flex items-right justify-right italic mb-5">
            <h1 className="text-l font-bold uppercase">{title}</h1>
        </div>
    )
}