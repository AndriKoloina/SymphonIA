import {
  HomeIcon,
  DocumentMagnifyingGlassIcon,
  RectangleStackIcon,
  CpuChipIcon,
  UsersIcon,
  MicrophoneIcon,
  QueueListIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

export const OptionsMenu = [
    {
        id:1,
        label: "Accueil",
        icon: HomeIcon,
        path:"/home"
    },
    { 
        id: 2, 
        label: 'Scanner', 
        icon: DocumentMagnifyingGlassIcon,
        path:"/scanner"
    },
    { 
        id: 3, 
        label: 'Bibliothèque', 
        icon: RectangleStackIcon, 
        path:"/library"
    },
    { 
        id: 4, 
        label: 'Instrument', 
        icon: CpuChipIcon,
        path:"/instrument"
    },
    {
        id: 5,
        label: 'Utilisateurs',
        icon: UsersIcon,
        path:"/users"
    },
    {
        id: 6,
        label: 'Studio',
        icon: MicrophoneIcon,
        path:"/studio"
    },
    {
        id: 7,
        label: 'Playlists',
        icon: QueueListIcon,
        path:"/playlists"
    },
    {
        id: 8,
        label: 'Transcriptions',
        icon: ClipboardDocumentListIcon,
        path:"/transcriptions"
    },
    {
        id: 9,
        label: 'Favoris',
        icon: HeartIcon,
        path:"/favorites"
    }
]

export const OptionsMenuMobile = [
    {
        id:1,
        label: "Accueil",
        icon: HomeIcon,
        path:"/home"
    },
    { 
        id: 2, 
        label: 'Scanner', 
        icon: DocumentMagnifyingGlassIcon,
        path:"/scanner"
    },
    { 
        id: 3, 
        label: 'Bibliothèque', 
        icon: RectangleStackIcon, 
        path:"/library"
    },
    { 
        id: 4, 
        label: 'Instrument', 
        icon: CpuChipIcon,
        path:"/instrument"
    },
    {
        id: 5,
        label: 'Utilisateurs',
        icon: UsersIcon,
        path:"/users"
    },
    {
        id: 6,
        label: 'Studio',
        icon: MicrophoneIcon,
        path:"/studio"
    },
    {
        id: 7,
        label: 'Playlists',
        icon: QueueListIcon,
        path:"/playlists"
    },
    {
        id: 8,
        label: 'Transcriptions',
        icon: ClipboardDocumentListIcon,
        path:"/transcriptions"
    },
    {
        id: 9,
        label: 'Favoris',
        icon: HeartIcon,
        path:"/favorites"
    }
]
