'use client'

import { usePrivacy } from '@/contexts/PrivacyContext';
import { useEffect } from 'react';

declare global {
    interface Window {
        dataLayer: any[] | undefined
        gtag: (...args: any[]) => void
    }
}

type GTagEventParams = {
    event_category?: string
    event_label?: string
    value?: number
    [key: string]: any
}

export default function AnalyticsScript() {

    const { consent } = usePrivacy();
    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ANALITIC || 'GA_MEASUREMENT_ID';

    useEffect(() => {
        if (consent.analytics && GA_MEASUREMENT_ID && typeof window !== 'undefined') {
            window.dataLayer = window.dataLayer || []

            window.gtag = function gtag(...args: any[]) {
                window.dataLayer?.push(args)
            }

            // Inicialização correta com tipagem adequada
            window.gtag('js', new Date())

            // Configuração com tipo específico
            window.gtag('config', GA_MEASUREMENT_ID, {
                page_path: window.location.pathname,
                send_page_view: true
            })
        }
    }, [consent.analytics, GA_MEASUREMENT_ID])

    return null
}