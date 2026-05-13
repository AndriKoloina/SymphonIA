import Reac from "react"
import type { UserProfileProps } from "@/types/play_interface"

interface UserProfile extends UserProfileProps {}

export default function UserProfile({ profilePicture, username, email }: UserProfile) {
    return(
        <div className="flex item gap-3 mr-[1rem] mb-5">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-600 to-fuchsia-600 p-[2px]">
                <div className="bg-gray-950 dark:bg-gray-950 h-full w-full rounded-full p-0.5">
                    <img src={profilePicture} alt={email} className="h-full w-full rounded-full object-cover"/>
                </div>
            </div>
            <span className="text-sm italic mt-2 text-gray-500 text-white/90 dark:text-gray-100 tracking-tight">
                {username}
            </span>
        </div>
    )
}