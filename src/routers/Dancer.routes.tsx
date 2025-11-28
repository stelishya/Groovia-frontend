import { Route, Routes } from "react-router-dom"
import { PrivateRoute } from "../protected/PrivateRoute";
import InstructorWorkshops from "../pages/dancer/InstructorWorkshops";
import WorkshopDetails from "../pages/dancer/WorkshopDetails";
import WorkshopCheckoutPage from "../pages/dancer/WorkshopCheckoutPage";

const DancerRoutes = () => {
    return (
        <Routes>
            <Route path="/workshops" element={
                <PrivateRoute userType="user" >
                    <InstructorWorkshops />
                </PrivateRoute>
            }
            />
            <Route path="/workshop/:id" element={
                <PrivateRoute userType="user" >
                    <WorkshopDetails />
                </PrivateRoute>
            }
            />
            <Route path="/workshop/:id/checkout" element={
                <PrivateRoute userType="user" >
                    <WorkshopCheckoutPage />
                </PrivateRoute>
            }
            />
        </Routes>
    )
}

export default DancerRoutes
