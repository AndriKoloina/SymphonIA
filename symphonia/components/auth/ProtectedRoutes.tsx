'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const  protected_routes = ['/home', '/instrument', '/library', '/scanner', '/parameter', '/studio', '/users', '/playlists', '/transcriptions', '/favorites']

export default function ProtectedRoutes({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

    const isPathProtected = protected_routes.some(route => pathname.startsWith(route))
    const isAuthPage = pathname.startsWith('/auth')

    /* eslint-disable react-hooks/set-state-in-effect --
       Garde d'authentification : lecture du localStorage + redirection
       nécessairement post-montage (pas de SSR). Motif volontaire. */
    useEffect(() => {
        const token = localStorage.getItem('symphonia_token')
        const user = localStorage.getItem('symphonia_user')

        if (isPathProtected) {
            if (!token || !user) {
                if (!isAuthPage) {
                    router.push('/auth/login')
                }
                setIsAuthorized(false)
            } 
            else {
                setIsAuthorized(true)
            }
        } else {
            setIsAuthorized(true)
        }
    }, [router, pathname, isPathProtected, isAuthPage])
    /* eslint-enable react-hooks/set-state-in-effect */

    if (isAuthPage) {
        return <>{children}</>
    }

    if(isAuthorized === null && isPathProtected) return null

    return <>{children}</>
}