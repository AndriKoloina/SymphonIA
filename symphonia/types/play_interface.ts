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
    duration: string
    onPlay: () => void
    dateCreated: string
}

export interface SearchBarProps {
  placeholder?: string
  onChange?: (value: string) => void
}

export interface ScrollSectionPage {
    title : string
    children: React.ReactNode
}