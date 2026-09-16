import { RouterProvider } from "react-router-dom"
import { AppQueryClientProvider } from "./query_client_provider"
import { NotificationProvider } from "./notification-provider"
import { ErrorBoundaryProvider } from "./error_boundary_provider"
import { ToastProvider } from '@teachedo/ui'
import router from "../router"

export const AppProviders = () => {
    return (
        <ErrorBoundaryProvider>
            <ToastProvider>
                <NotificationProvider>
                    <AppQueryClientProvider>
                        <RouterProvider router={router} />
                    </AppQueryClientProvider>
                </NotificationProvider>
            </ToastProvider>
        </ErrorBoundaryProvider>
    )
}