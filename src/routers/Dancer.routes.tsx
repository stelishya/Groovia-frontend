import { Route } from "react-router-dom"
import { PrivateRoute } from "../protected/PrivateRoute";
import InstructorWorkshops from "../pages/dancer/InstructorWorkshops";
import WorkshopDetails from "../pages/dancer/WorkshopDetails";
import WorkshopCheckoutPage from "../pages/dancer/WorkshopCheckoutPage";
import CompetitionDetails from "../pages/dancer/CompetitionDetails";
import CompetitionCheckoutPage from "../pages/dancer/CompetitionCheckout";

const DancerRoutes = () => {
    return (
        // <Routes>
        <>
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
            <Route path="/competition/:id" element={
                <PrivateRoute userType="user" >
                    <CompetitionDetails />
                </PrivateRoute>
            }
            />
            <Route path="/competition/:id/checkout" element={
                <PrivateRoute userType="user" >
                    <CompetitionCheckoutPage />
                </PrivateRoute>
            }
            />
            </>
        // </Routes>
    )
}

export default DancerRoutes
