import { createBrowserRouter, ScrollRestoration } from "react-router-dom";
import Layout from "../layout/Layout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";
import Hotels from "../pages/Hotels";
import HotelDetail from "../pages/HotelDetail";
import HotelOrders from "../pages/HotelOrders";
import Events from "../pages/events";
import EventOrders from "../pages/EventOrders";
import Tours from "../pages/Tours";
import TourDetail from "../pages/TourDetail";
import TourOrders from "../pages/TourOrders";
import RideOrders from "../pages/RideOrders";
import TransportationInfo from "../pages/TransportationInfo";
import Restaurants from "../pages/Restaurants";
import RestaurantDetail from "../pages/RestaurantDetail";
import RestaurantOrders from "../pages/RestaurantOrders";
import TableReservations from "../pages/TableReservations";
import TermsOfService from "../pages/TermsOfService";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import EventLog from "../pages/EventLog";
const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <>
                <ScrollRestoration />
                <Layout />
            </>
        ),
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "/register",
                element: <Register />,
            },
            {
                path: "/profile",
                element: <Profile />,
            },
            {
                path: "/hotels",
                element: <Hotels />,
            },
            {
                path: "/hotel/:id",
                element: <HotelDetail />,
            },
            {
                path: "/hotel-orders",
                element: <HotelOrders />,
            },
            {
                path: "/events",
                element: <Events />,
            },
            {
                path: "/event-orders",
                element: <EventOrders />,
            },
            {
                path: "/tours",
                element: <Tours />,
            },
            {
                path: "/tour/:id",
                element: <TourDetail />,
            },
            {
                path: "/tour-orders",
                element: <TourOrders />,
            },
            {
                path: "/ride-orders",
                element: <RideOrders />,
            },
            {
                path: "/transportation",
                element: <TransportationInfo />,
            },
            {
                path: "/restaurants",
                element: <Restaurants />,
            },
            {
                path: "/restaurants/:id",
                element: <RestaurantDetail />,
            },
            {
                path: "/restaurant-orders",
                element: <RestaurantOrders />,
            },
            {
                path: "/table-reservations",
                element: <TableReservations />,
            },
            {
                path: "/terms",
                element: <TermsOfService />,
            },
            {
                path: "/privacy",
                element: <PrivacyPolicy />,
            },
            {
                path: "/event-log",
                element: <EventLog />,
            },
            {
                path: "*",
                element: <NotFound />,
            },
        ],
    },
]);

export default router;
