import { useGetQuery } from "@/core/hooks/use_query_actions"
import type { AdminUser } from "../types/auth.types"

export const useAuth = () => {
    return useGetQuery<AdminUser>({
        url: 'auth/admin/me',
        key: ['adminauth'],
    })

    // return { admin, isLoading }
}