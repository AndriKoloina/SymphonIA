export interface PlayButtonInterface {
    isPlaying : boolean,
    onToggle: () => void
    label?: string
}

export interface StatCardProps {
    title: string
    value: string | number
    subtext?: string
    icon: React.ElementType
    colorClass: string
}

export interface TitlePageProps {
    title: string
}

export interface UserProfileProps {
    profilePicture: string
    username: string
    email: string
}

export interface SongCardProps {
    title: string
    coverImage: string
    duration: string
    onPlay: () => void
}