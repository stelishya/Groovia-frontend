import { Route } from "react-router-dom"
import { PrivateRoute } from "../protected/PrivateRoute";
import InstructorWorkshops from "../pages/dancer/InstructorWorkshops";
import WorkshopDetails from "../pages/dancer/WorkshopDetails";
import WorkshopCheckoutPage from "../pages/dancer/WorkshopCheckoutPage";
import CompetitionDetails from "../pages/dancer/CompetitionDetails";
import CompetitionCheckoutPage from "../pages/dancer/CompetitionCheckout";
import UserLayout from "../components/shared/UserLayout";

const DancerRoutes = () => {
    return (
        <Route element={
            <PrivateRoute userType="user" >
                <UserLayout />
            </PrivateRoute>
        }>
            <Route path="/workshops" element={<InstructorWorkshops />} />
            <Route path="/workshop/:id" element={<WorkshopDetails />} />
            <Route path="/workshop/:id/checkout" element={<WorkshopCheckoutPage />} />
            <Route path="/competition/:id" element={<CompetitionDetails />} />
            <Route path="/competition/:id/checkout" element={<CompetitionCheckoutPage />} />
        </Route>
    )
}

export default DancerRoutes
