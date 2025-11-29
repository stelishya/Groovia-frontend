import { Route, Routes } from "react-router-dom"
import { PrivateRoute } from "../protected/PrivateRoute";
import Competitions from "../pages/client/Competitions";

const ClientRoutes = () => {
    return (
        <Routes>
            <Route path="/competitions" element={
                <PrivateRoute userType="user">
                    <Competitions />
                </PrivateRoute>
            } />
        </Routes>
    )
}

export default ClientRoutes;