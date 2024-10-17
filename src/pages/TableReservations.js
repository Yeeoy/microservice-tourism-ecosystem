import React, { useState, useEffect } from "react";
import { get, patch, del } from "../utils/api";
import { showToast } from "../utils/toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    CalendarIcon,
    ClockIcon,
    UserGroupIcon,
    TrashIcon,
    ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const TableReservations = () => {
    const { t } = useTranslation();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [restaurants, setRestaurants] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            const response = await get("/api/restaurant/table-reservations/");
            if (response.code === 200 && response.data) {
                setReservations(response.data);
                fetchRestaurants(response.data);
            } else {
                throw new Error(response.msg || t("failedToGetReservations"));
            }
        } catch (err) {
            showToast.error(err.message || t("failedToGetReservations"));
        } finally {
            setLoading(false);
        }
    };

    const fetchRestaurants = async (reservations) => {
        const uniqueRestaurantIds = [
            ...new Set(
                reservations.map((reservation) => reservation.restaurant)
            ),
        ];
        const restaurantPromises = uniqueRestaurantIds.map(async (id) => {
            try {
                const response = await get(`/api/restaurant/restaurants/${id}/`);
                if (response.code === 200 && response.data) {
                    return { [id]: response.data.name };
                }
            } catch (err) {
                console.error(t("failedToGetRestaurant", { id }), err);
            }
            return null;
        });

        const restaurantResults = await Promise.all(restaurantPromises);
        const newRestaurants = Object.assign(
            {},
            ...restaurantResults.filter(Boolean)
        );
        setRestaurants(newRestaurants);
    };

    const cancelReservation = async (reservationId) => {
        try {
            const response = await patch(
                `/api/restaurant/table-reservations/${reservationId}/`,
                {
                    reservation_status: "Canceled",
                }
            );
            if (response.code === 200 && response.data) {
                setReservations(
                    reservations.map((reservation) =>
                        reservation.id === reservationId
                            ? { ...reservation, reservation_status: "Canceled" }
                            : reservation
                    )
                );
                showToast.success(t("reservationCancelledSuccessfully"));
            } else {
                throw new Error(response.msg || t("failedToCancelReservation"));
            }
        } catch (err) {
            showToast.error(err.message || t("failedToCancelReservation"));
        }
    };

    const deleteReservation = async (reservationId) => {
        try {
            await del(`/api/restaurant/table-reservations/${reservationId}/`);
            setReservations(
                reservations.filter(
                    (reservation) => reservation.id !== reservationId
                )
            );
            showToast.success(t("reservationDeletedSuccessfully"));
        } catch (err) {
            showToast.error(t("failedToDeleteReservation"));
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center mb-6">
                <button
                    onClick={handleGoBack}
                    className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition duration-300 mr-4">
                    <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                </button>
                <h1 className="text-3xl font-bold text-gray-800">
                    {t("myTableReservations")}
                </h1>
            </div>
            {reservations.length > 0 ? (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t("restaurant")}
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t("dateTime")}
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t("guests")}
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t("status")}
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t("actions")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reservations.map((reservation) => (
                                <tr
                                    key={reservation.id}
                                    className={
                                        reservation.reservation_status ===
                                        "Canceled"
                                            ? "bg-gray-100"
                                            : ""
                                    }>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {restaurants[
                                                reservation.restaurant
                                            ] || t("loading")}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                                            {reservation.reservation_date}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                                            {reservation.reservation_time}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm font-medium text-gray-900">
                                            <UserGroupIcon className="h-5 w-5 text-blue-500 mr-2" />
                                            {reservation.number_of_guests}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                reservation.reservation_status ===
                                                "Confirmed"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}>
                                            {reservation.reservation_status ===
                                            "Confirmed"
                                                ? t("confirmed")
                                                : t("cancelled")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {reservation.reservation_status ===
                                        "Confirmed" ? (
                                            <button
                                                onClick={() =>
                                                    cancelReservation(
                                                        reservation.id
                                                    )
                                                }
                                                className="text-indigo-600 hover:text-indigo-900">
                                                {t("cancelReservation")}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    deleteReservation(
                                                        reservation.id
                                                    )
                                                }
                                                className="text-red-600 hover:text-red-900">
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center text-gray-600 bg-white p-8 rounded-lg shadow-md">
                    <p className="text-xl mb-4">{t("noTableReservations")}</p>
                    <a
                        href="/restaurants"
                        className="text-blue-500 hover:text-blue-700 transition duration-300">
                        {t("reserveTableNow")} →
                    </a>
                </div>
            )}
        </div>
    );
};

export default TableReservations;
