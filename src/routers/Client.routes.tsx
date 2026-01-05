import { Route } from "react-router-dom"
import { PrivateRoute } from "../protected/PrivateRoute";
import Competitions from "../pages/client/Competitions";
import EventCheckoutPage from "../pages/client/EventCheckout";

const ClientRoutes = () => {
    return (
        // <Routes>
        <>
            <Route path="/competitions" element={
                <PrivateRoute userType="user">
                    <Competitions />
                </PrivateRoute>
            } />
            <Route path="/event/:id/checkout" element={
                <PrivateRoute userType="user" >
                    <EventCheckoutPage />
                </PrivateRoute>
            }
            />
            </>
        // </Routes>
    )
}

export default ClientRoutes;