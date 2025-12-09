import TenantApplicationViewerPage from "@/pages/applications/TenantApplicationViewerPage.tsx";
import ChatPage from "@/pages/ChatPage.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CheckoutForm, Return } from "./components/bookings/Checkout";
import ApplicationsOverviewPage from "./pages/applications/ApplicationsOverviewPage";
import AuthenticationCodePage from "./pages/AuthenticationCodePage";
import HomePage from "./pages/HomePage";
import ListingCreationPage from "./pages/listings/ListingCreationPage";
import ListingPage from "./pages/listings/ListingPage";
import ListingsPage from "./pages/listings/ListingsPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import RenterOverviewPage from "./pages/overview/RenterOverviewPage";
import TenantOverviewPage from "./pages/overview/TenantOverviewPage";
import RegistrationPage from "./pages/RegistrationPage";
import UserProfilePage from "./pages/UserProfilePage";
import Layout from "./routes/layout";
import PrivateRoute from "./routes/privateRoute";

/**
 * The main component that represents the React application.
 * It handles routing and renders different pages based on the current URL.
 */
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/chat" element={<ChatPage />} />
            {/* Renter routes */}
            <Route path="sublet/" element={<TenantOverviewPage />} />
            <Route path="bookings" />
            <Route
              path="sublet/listings/create"
              element={<ListingCreationPage />}
            />
            <Route path="/sublet/overview" element={<RenterOverviewPage />} />
            <Route
              path="sublet/applications/:listingId"
              element={<ApplicationsOverviewPage />}
            />
            {/* Tenant routes */}
            <Route path="/overview" element={<TenantOverviewPage />} />
            <Route
              path="/overview/application/:applicationId"
              element={<TenantApplicationViewerPage />}
            />

            <Route path="/me" element={<UserProfilePage />} />
          </Route>

          {/* Payment related routes */}
          <Route path="/checkout" element={<CheckoutForm />} />
          <Route path="/return" element={<Return />} />

          {/* Listing routes */}
          <Route path="listings" element={<ListingsPage />} />
          <Route path="listings/:listingId" element={<ListingPage />} />

          {/* Auth routes */}
          <Route path="login" element={<LoginPage />} />
          <Route path="verify" element={<AuthenticationCodePage />} />
          <Route path="signup" element={<RegistrationPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
