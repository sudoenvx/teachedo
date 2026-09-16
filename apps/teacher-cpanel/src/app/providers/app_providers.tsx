import { RouterProvider } from "react-router-dom"
import { AppQueryClientProvider } from "./query_client_provider"
import { NotificationProvider } from "./notification-provider"
import { ErrorBoundaryProvider } from "./error_boundary_provider"
import router from "../router"

export const AppProviders = () => {
    return (
        <ErrorBoundaryProvider>
            <NotificationProvider>
                <AppQueryClientProvider>
                    <RouterProvider router={router} />
                </AppQueryClientProvider>
            </NotificationProvider>
        </ErrorBoundaryProvider>
    )
}