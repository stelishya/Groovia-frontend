import { Route } from "react-router-dom"
import { PrivateRoute } from "../protected/PrivateRoute";
import Competitions from "../pages/client/Competitions";
import EventCheckoutPage from "../pages/client/EventCheckout";
import UserLayout from "../components/shared/UserLayout";

const ClientRoutes = () => {
    return (
        <Route element={
            <PrivateRoute userType="user">
                <UserLayout />
            </PrivateRoute>
        }>
            <Route path="/competitions" element={<Competitions />} />
            <Route path="/event/:id/checkout" element={<EventCheckoutPage />} />
        </Route>
    )
}

export default ClientRoutes;