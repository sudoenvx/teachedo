import { LayoutDashboard, Settings } from "lucide-react"
import { type IconType } from "react-icons"
import { useLocation } from "react-router-dom"

export type AppRoute = {
    path: string
    label: string
    description?: string
    icon: IconType
}


export const Routes: Record<string, AppRoute> = {
    "/": {
        path: "/",
        label: "لوحة التحكم",
        description: "متابعة و ادارة المدرسين",
        icon: LayoutDashboard,
    },


    "/settings": {
        path: "/settings",
        label: "الاعدادات",
        description: "تحكم في اعدادات النظام",
        icon: Settings,
    }
}

export const useRouteContext = () => {
    const { pathname } = useLocation()

    return Routes[pathname] as AppRoute | null
}
