import React, { useState, useEffect, useContext } from "react";
import { get, post } from "../utils/api";
import { showToast } from "../utils/toast";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../context/authContext";
import {
    TruckIcon,
    MapPinIcon,
    ExclamationTriangleIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    ClockIcon,
    UserIcon,
    MagnifyingGlassIcon,
    ArrowRightIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { CSSTransition, TransitionGroup } from "react-transition-group";

const TransportationInfo = () => {
    const { t } = useTranslation();
    const [providers, setProviders] = useState([]);
    const [routePlans, setRoutePlans] = useState([]);
    const [trafficUpdates, setTrafficUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentUpdateIndex, setCurrentUpdateIndex] = useState(0);
    const [direction, setDirection] = useState("next");
    const [bookingDate, setBookingDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [bookingTime, setBookingTime] = useState(
        new Date().toTimeString().slice(0, 5)
    );
    const [bookingStatus, setBookingStatus] = useState("idle"); // 'idle', 'loading', 'success', 'error'
    const [isBooked, setIsBooked] = useState(false);
    const [bookingComplete, setBookingComplete] = useState(false);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchTransportationData();
        if (user) {
            checkBookingStatus();
        }
    }, [user]);

    useEffect(() => {
        if (trafficUpdates.length > 0) {
            const interval = setInterval(() => {
                setDirection("next");
                setCurrentUpdateIndex(
                    (prevIndex) => (prevIndex + 1) % trafficUpdates.length
                );
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [trafficUpdates]);

    const fetchTransportationData = async () => {
        try {
            const [providersRes, routesRes, updatesRes] = await Promise.all([
                get("/api/local-transportation/transportation-provider/"),
                get("/api/local-transportation/route-planning/"),
                get("/api/local-transportation/traffic-update/"),
            ]);

            if (providersRes.code === 200) setProviders(providersRes.data);
            if (routesRes.code === 200) setRoutePlans(routesRes.data);
            if (updatesRes.code === 200) setTrafficUpdates(updatesRes.data);
        } catch (error) {
            showToast.error(t("failedToFetchTransportationInfo"));
        } finally {
            setLoading(false);
        }
    };

    const handleProviderSelect = (provider) => {
        setSelectedProvider(provider);
    };

    const handleRouteSelect = (route) => {
        setSelectedRoute(route);
    };

    const checkBookingStatus = async () => {
        // 这里需要实现检查预订状态的逻辑
        // 由于API没有提供检查预订状态的端点，这里暂时留空
        // 实际应用中，你可能需要向后端请求当前用户的预订状态
    };

    const handleBooking = async () => {
        if (!user) {
            showToast.error(t("pleaseLoginToBook"));
            return;
        }

        if (!selectedProvider || !selectedRoute) {
            showToast.error(t("pleaseSelectProviderAndRoute"));
            return;
        }

        setBookingStatus("loading");
        try {
            const response = await post(
                "/api/local-transportation/ride-booking/",
                {
                    pickup_location: selectedRoute.start_location,
                    drop_off_location: selectedRoute.end_location,
                    ride_date: bookingDate,
                    pickup_time: bookingTime,
                    estimated_fare: (
                        parseFloat(selectedProvider.base_fare) +
                        parseFloat(selectedRoute.distance) *
                            parseFloat(selectedProvider.price_per_km)
                    ).toFixed(2),
                    booking_status: true,
                    user_id: user.id,
                    provider_id: selectedProvider.id,
                }
            );

            if (response.code === 201 && response.data) {
                setBookingStatus("success");
                setIsBooked(true);
                setBookingComplete(true);
                showToast.success(t("bookingSuccessful"));
            } else {
                throw new Error(response.msg || t("bookingFailed"));
            }
        } catch (err) {
            setBookingStatus("error");
            showToast.error(err.message || t("bookingFailed"));
        }
    };

    const handleResetBooking = () => {
        setBookingComplete(false);
        setIsBooked(false);
        setSelectedProvider(null);
        setSelectedRoute(null);
        setBookingDate(new Date().toISOString().split("T")[0]);
        setBookingTime(new Date().toTimeString().slice(0, 5));
    };

    const filteredProviders = providers.filter(
        (provider) =>
            provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            provider.service_type
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
    );

    const filteredRoutes = routePlans.filter(
        (route) =>
            route.start_location
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            route.end_location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-12 mt-8 text-center text-gray-800">
                {t("transportationInfo")}
            </h1>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-3/4">
                    {/* 搜索栏 */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder={t("searchProvidersOrRoutes")}
                            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>

                    {/* 交通更新 */}
                    <div className="mb-4">
                        <div className="relative overflow-hidden h-10">
                            <TransitionGroup>
                                <CSSTransition
                                    key={currentUpdateIndex}
                                    timeout={500}
                                    classNames="fade">
                                    <div className="absolute w-full">
                                        {trafficUpdates.length > 0 && (
                                            <div className="flex justify-between items-center p-2 bg-red-100 rounded-lg border border-red-200 h-10">
                                                <div className="flex items-center flex-1 mr-4">
                                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                                                    <p className="font-semibold text-gray-800 truncate">
                                                        {
                                                            trafficUpdates[
                                                                currentUpdateIndex
                                                            ].update_message
                                                        }
                                                    </p>
                                                </div>
                                                <p className="text-sm text-black-600 font-bold whitespace-nowrap  px-2 py-1 rounded">
                                                    {new Date(
                                                        trafficUpdates[
                                                            currentUpdateIndex
                                                        ].update_time
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CSSTransition>
                            </TransitionGroup>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 交通提供商 */}
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-2xl font-semibold mb-4 flex items-center text-gray-800">
                                <TruckIcon className="h-6 w-6 mr-2 text-blue-500" />
                                {t("transportationProviders")}
                            </h2>
                            <div className="space-y-4">
                                {filteredProviders.map((provider) => (
                                    <div
                                        key={provider.id}
                                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                                            selectedProvider?.id === provider.id
                                                ? "bg-blue-50 border-blue-500 shadow-lg"
                                                : "hover:shadow-md hover:bg-gray-50"
                                        }`}
                                        onClick={() =>
                                            handleProviderSelect(provider)
                                        }>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-lg text-blue-600">
                                                    {provider.name}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {provider.service_type}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-lg text-green-600">
                                                    {t("currency")}
                                                    {provider.base_fare}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {t("currency")}
                                                    {provider.price_per_km}/km
                                                </p>
                                            </div>
                                        </div>
                                        {selectedProvider?.id ===
                                            provider.id && (
                                            <div className="mt-2 text-sm text-blue-500 flex items-center">
                                                <CheckCircleIcon className="h-5 w-5 mr-1" />
                                                {t("selected")}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 路线规划 */}
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-2xl font-semibold mb-4 flex items-center text-gray-800">
                                <MapPinIcon className="h-6 w-6 mr-2 text-green-500" />
                                {t("routePlanning")}
                            </h2>
                            <div className="space-y-4">
                                {filteredRoutes.map((route) => (
                                    <div
                                        key={route.id}
                                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                                            selectedRoute?.id === route.id
                                                ? "bg-green-50 border-green-500 shadow-lg"
                                                : "hover:shadow-md hover:bg-gray-50"
                                        }`}
                                        onClick={() =>
                                            handleRouteSelect(route)
                                        }>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-lg text-green-600">
                                                    {route.start_location}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {route.end_location}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-lg text-blue-600">
                                                    {route.distance} km
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {route.estimated_time} {t("minutes")}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedRoute?.id === route.id && (
                                            <div className="mt-2 text-sm text-green-500 flex items-center">
                                                <CheckCircleIcon className="h-5 w-5 mr-1" />
                                                {t("selected")}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:w-1/4">
                    {/* 乘车预订 */}
                    <div className="sticky top-20 bg-white shadow-lg rounded-lg p-6 relative">
                        <h2 className="text-2xl font-semibold mb-4 flex items-center text-gray-800">
                            <CalendarIcon className="h-6 w-6 mr-2 text-purple-500" />
                            {t("rideBooking")}
                        </h2>
                        {selectedProvider && selectedRoute ? (
                            <div className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-bold text-xl text-blue-700 mb-2">
                                        {selectedProvider.name}
                                    </h3>
                                    <p className="text-sm text-blue-600">
                                        {selectedProvider.service_type}
                                    </p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <h3 className="font-bold text-lg text-green-700 mb-2">
                                        {t("routeInfo")}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-green-600">
                                                {selectedRoute.start_location}
                                            </p>
                                            <ArrowRightIcon className="h-4 w-4 text-green-500 my-1" />
                                            <p className="text-sm font-semibold text-green-600">
                                                {selectedRoute.end_location}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-green-600">
                                                {selectedRoute.distance} km
                                            </p>
                                            <p className="text-sm text-green-600">
                                                {selectedRoute.estimated_time}{" "}
                                                {t('minutes')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <h3 className="font-bold text-lg text-yellow-700 mb-2">
                                        {t("costEstimate")}
                                    </h3>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-yellow-600">
                                            {t("total")}
                                        </p>
                                        <p className="text-2xl font-bold text-yellow-600">
                                            {t("currency")}
                                            {(
                                                parseFloat(
                                                    selectedProvider.base_fare
                                                ) +
                                                parseFloat(
                                                    selectedRoute.distance
                                                ) *
                                                    parseFloat(
                                                        selectedProvider.price_per_km
                                                    )
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {t("baseFare")}: {t("currency")}
                                        {selectedProvider.base_fare} +{" "}
                                        {t("mileageFee")}: {t("currency")}
                                        {(
                                            parseFloat(selectedRoute.distance) *
                                            parseFloat(
                                                selectedProvider.price_per_km
                                            )
                                        ).toFixed(2)}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-lg text-gray-700">
                                        {t("bookingTime")}
                                    </h3>
                                    <div className="flex space-x-2">
                                        <input
                                            type="date"
                                            value={bookingDate}
                                            onChange={(e) =>
                                                setBookingDate(e.target.value)
                                            }
                                            className="flex-1 p-2 border rounded-md"
                                        />
                                        <input
                                            type="time"
                                            value={bookingTime}
                                            onChange={(e) =>
                                                setBookingTime(e.target.value)
                                            }
                                            className="flex-1 p-2 border rounded-md"
                                        />
                                    </div>
                                </div>
                                {isBooked ? (
                                    <div
                                        className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
                                        role="alert">
                                        <strong className="font-bold">
                                            {t("booked")}！
                                        </strong>
                                        <span className="block sm:inline">
                                            {" "}
                                            {t("bookingSuccessMessage")}
                                        </span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleBooking}
                                        disabled={
                                            bookingStatus === "loading" ||
                                            isBooked
                                        }
                                        className={`w-full ${
                                            bookingStatus === "loading" ||
                                            isBooked
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-blue-500 hover:bg-blue-600"
                                        } text-white py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center text-lg font-semibold`}>
                                        {bookingStatus === "loading"
                                            ? t("booking")
                                            : t("confirmBooking")}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-600">
                                {t("pleaseSelectProviderAndRoute")}
                            </p>
                        )}

                        {/* Overlay for successful booking */}
                        <div
                            className={`absolute inset-0 bg-gray-900 bg-opacity-50 flex flex-col items-center justify-center rounded-lg transition-opacity duration-300 ease-in-out ${
                                bookingComplete
                                    ? "opacity-100"
                                    : "opacity-0 pointer-events-none"
                            }`}>
                            <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
                            <p className="text-white text-xl font-bold mb-4">
                                {t("bookingComplete")}
                            </p>
                            <button
                                onClick={handleResetBooking}
                                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300">
                                {t("bookAgain")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransportationInfo;
