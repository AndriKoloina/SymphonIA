import { 
  HomeIcon, 
  DocumentMagnifyingGlassIcon, 
  RectangleStackIcon, 
  MicrophoneIcon, 
  CpuChipIcon,
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
        label: 'Studio', 
        icon: MicrophoneIcon ,
        path:"/studio"
    },
    { 
        id: 5, 
        label: 'Instrument', 
        icon: CpuChipIcon,
        path:"/instrument"
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
 }
]
