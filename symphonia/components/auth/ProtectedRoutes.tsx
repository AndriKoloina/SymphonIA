'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProtectedRoutes({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

    useEffect(() => {
        const token = localStorage.getItem('symphonia_token')
        const user = localStorage.getItem('symphonia_user')

        if(!token || !user) {
            router.push('/auth/login')
        }
        else {
            setIsAuthorized(true)
        }
    }, [router])

    if(isAuthorized === null) return null

    return <>{children}</>
}