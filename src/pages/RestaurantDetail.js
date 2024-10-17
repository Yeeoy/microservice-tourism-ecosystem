import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { get, post } from "../utils/api";
import { showToast } from "../utils/toast";
import { useTranslation } from 'react-i18next';
import { AuthContext } from "../context/authContext";
import {
    MapPinIcon,
    ClockIcon,
    PhoneIcon,
    ArrowLeftIcon,
    PlusIcon,
    MinusIcon,
    CalendarIcon,
    UserGroupIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/solid";
import defaultRestaurantImage from "../assets/images/default-restaurant.jpg";
const RestaurantDetail = () => {
    const { t } = useTranslation();
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState({});
    const [totalPrice, setTotalPrice] = useState(0);
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const today = new Date().toISOString().split("T")[0];
    const [reservationDate, setReservationDate] = useState(today);

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
    ).padStart(2, "0")}`;
    const [reservationTime, setReservationTime] = useState(currentTime);

    const [numberOfGuests, setNumberOfGuests] = useState(1);
    const [reservationComplete, setReservationComplete] = useState(false);

    useEffect(() => {
        fetchRestaurantDetail();
        fetchMenu();
    }, [id]);

    useEffect(() => {
        calculateTotalPrice();
    }, [selectedItems]);

    const fetchRestaurantDetail = async () => {
        try {
            setLoading(true);
            const response = await get(`/api/restaurant/restaurants/${id}/`);
            if (response.code === 200 && response.data) {
                setRestaurant(response.data);
            } else {
                throw new Error(response.msg || t("failedToGetRestaurantDetails"));
            }
        } catch (err) {
            showToast.error(err.message || t("failedToGetRestaurantDetails"));
        } finally {
            setLoading(false);
        }
    };

    const fetchMenu = async () => {
        try {
            const response = await get(
                `/api/restaurant/menus/get_menu_by_restaurant/${id}/`
            );
            if (response.code === 200 && response.data) {
                setMenu(response.data);
            } else {
                throw new Error(response.msg || t("failedToGetMenu"));
            }
        } catch (err) {
            console.error(t("failedToGetMenu"), err);
            showToast.error(t("failedToGetMenu"));
        }
    };

    const calculateTotalPrice = async () => {
        const items = Object.entries(selectedItems)
            .filter(([_, quantity]) => quantity > 0)
            .map(([itemId, quantity]) => ({
                menu_item_id: parseInt(itemId),
                quantity,
            }));

        if (items.length === 0) {
            setTotalPrice(0);
            return;
        }

        try {
            const response = await post(
                "/api/restaurant/online-orders/calculate-price/",
                { items }
            );
            if (response.code === 200 && response.data) {
                setTotalPrice(response.data.total_price);
            } else {
                throw new Error(response.msg || t("failedToCalculatePrice"));
            }
        } catch (err) {
            console.error(t("failedToCalculatePrice"), err);
            showToast.error(t("failedToCalculatePrice"));
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleAddItem = (itemId) => {
        setSelectedItems((prev) => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1,
        }));
    };

    const handleRemoveItem = (itemId) => {
        setSelectedItems((prev) => ({
            ...prev,
            [itemId]: Math.max((prev[itemId] || 0) - 1, 0),
        }));
    };

    const isOrderEmpty = Object.values(selectedItems).every(
        (quantity) => quantity === 0
    );

    const handleConfirmOrder = async () => {
        if (!user) {
            showToast.error(t("pleaseLoginToOrder"));
            return;
        }

        const orderItems = Object.entries(selectedItems)
            .filter(([_, quantity]) => quantity > 0)
            .map(([itemId, quantity]) => ({
                menu_item_id: parseInt(itemId),
                quantity,
            }));

        if (orderItems.length === 0) {
            showToast.error(t("pleaseSelectAtLeastOneItem"));
            return;
        }

        const currentDate = new Date();
        const orderData = {
            order_items: orderItems,
            order_date: currentDate.toISOString().split("T")[0],
            order_time: currentDate.toTimeString().split(" ")[0],
            order_status: "Confirmed",
            user_id: user.id,
            restaurant: parseInt(id),
        };

        try {
            const response = await post(
                "/api/restaurant/online-orders/",
                orderData
            );
            if (response.code === 201 && response.data) {
                showToast.success(t("orderSubmittedSuccessfully"));
                setSelectedItems({});
                setTotalPrice(0);
            } else {
                throw new Error(response.msg || t("failedToSubmitOrder"));
            }
        } catch (err) {
            showToast.error(err.message || t("failedToSubmitOrder"));
        }
    };

    const isReservationEmpty =
        !reservationDate || !reservationTime || numberOfGuests < 1;

    const handleReservation = async () => {
        if (!user) {
            showToast.error(t("pleaseLoginToReserve"));
            return;
        }

        if (isReservationEmpty) {
            showToast.error(t("pleaseCompleteAllReservationFields"));
            return;
        }

        const reservationData = {
            reservation_date: reservationDate,
            reservation_time: reservationTime,
            number_of_guests: numberOfGuests,
            reservation_status: "Confirmed",
            restaurant: parseInt(id),
            user_id: user.id,
        };

        try {
            const response = await post(
                "/api/restaurant/table-reservations/",
                reservationData
            );
            if (response.code === 201 && response.data) {
                showToast.success(t("reservationSuccessful"));
                setReservationComplete(true);
            } else {
                throw new Error(response.msg || t("reservationFailed"));
            }
        } catch (err) {
            showToast.error(err.message || t("reservationFailed"));
        }
    };

    const handleResetReservation = () => {
        setReservationComplete(false);
        setReservationDate(today);
        setReservationTime(currentTime);
        setNumberOfGuests(1);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!restaurant) {
        return <div className="text-center mt-8">{t("restaurantNotFound")}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center mb-6 mt-6">
                <button
                    onClick={handleGoBack}
                    className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition duration-300 mr-4">
                    <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                </button>
                <h1 className="text-3xl font-bold text-gray-800">
                    {restaurant.name}
                </h1>
            </div>
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/3">
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="relative h-96">
                            <img
                                src={restaurant.img_url || defaultRestaurantImage}
                                alt={restaurant.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = defaultRestaurantImage;
                                }}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                                <div className="flex items-center text-white">
                                    <MapPinIcon className="h-5 w-5 mr-2" />
                                    <span>{restaurant.location}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="flex items-center bg-gray-100 p-4 rounded-lg">
                                    <ClockIcon className="h-8 w-8 text-blue-500 mr-3" />
                                    <div>
                                        <h3 className="font-semibold">
                                            {t("openingHours")}
                                        </h3>
                                        <p>{restaurant.opening_hours}</p>
                                    </div>
                                </div>
                                <div className="flex items-center bg-gray-100 p-4 rounded-lg">
                                    <PhoneIcon className="h-8 w-8 text-green-500 mr-3" />
                                    <div>
                                        <h3 className="font-semibold">
                                            {t("contactInfo")}
                                        </h3>
                                        <p>{restaurant.contact_info}</p>
                                    </div>
                                </div>
                            </div>
                            {menu.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-4">
                                        {t("menu")}
                                    </h3>
                                    <div className="space-y-4">
                                        {menu.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
                                                <div>
                                                    <h4 className="font-semibold">
                                                        {item.item_name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        {item.description}
                                                    </p>
                                                    <p className="text-lg font-bold text-blue-600">
                                                        {t("currency")}{item.price}
                                                    </p>
                                                </div>
                                                <div className="flex items-center">
                                                    <button
                                                        onClick={() =>
                                                            handleRemoveItem(
                                                                item.id
                                                            )
                                                        }
                                                        className="bg-red-500 text-white p-2 rounded-full">
                                                        <MinusIcon className="h-5 w-5" />
                                                    </button>
                                                    <span className="mx-3 text-lg font-semibold">
                                                        {selectedItems[
                                                            item.id
                                                        ] || 0}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            handleAddItem(
                                                                item.id
                                                            )
                                                        }
                                                        className="bg-green-500 text-white p-2 rounded-full">
                                                        <PlusIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {menu.length === 0 && (
                                <div className="text-center text-gray-600 py-8">
                                    <p>{t("noMenuAvailable")}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="lg:w-1/3">
                    <div className="bg-white shadow-lg rounded-lg p-6 relative overflow-hidden">
                        <div className={`absolute inset-0 bg-gray-900 bg-opacity-50 flex flex-col items-center justify-center rounded-lg transition-opacity duration-300 ease-in-out ${
                            reservationComplete ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}>
                            <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
                            <p className="text-white text-xl font-bold mb-4">{t("reservationComplete")}</p>
                            <button
                                onClick={handleResetReservation}
                                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                            >
                                {t("reserveAgain")}
                            </button>
                        </div>
                        <h2 className="text-2xl font-bold mb-4">{t("tableReservation")}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t("reservationDate")}
                                </label>
                                <input
                                    type="date"
                                    value={reservationDate}
                                    onChange={(e) =>
                                        setReservationDate(e.target.value)
                                    }
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t("reservationTime")}
                                </label>
                                <input
                                    type="time"
                                    value={reservationTime}
                                    onChange={(e) =>
                                        setReservationTime(e.target.value)
                                    }
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t("numberOfGuests")}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={numberOfGuests}
                                    onChange={(e) =>
                                        setNumberOfGuests(
                                            parseInt(e.target.value)
                                        )
                                    }
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleReservation}
                            className={`mt-6 w-full py-2 px-4 rounded-lg transition duration-300 ${
                                isReservationEmpty
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-500 text-white hover:bg-blue-600"
                            }`}
                            disabled={isReservationEmpty || reservationComplete}
                        >
                            {isReservationEmpty ? t("pleaseFillReservationInfo") : t("confirmReservation")}
                        </button>
                    </div>
                    {menu.length > 0 && (
                        <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
                            <h2 className="text-2xl font-bold mb-4">
                                {t("yourOrder")}
                            </h2>
                            <div className="mb-4 space-y-2">
                                {Object.entries(selectedItems).map(
                                    ([itemId, quantity]) => {
                                        if (quantity > 0) {
                                            const item = menu.find(
                                                (i) => i.id === parseInt(itemId)
                                            );
                                            return (
                                                <div
                                                    key={itemId}
                                                    className="flex justify-between">
                                                    <span>
                                                        {item.item_name} x{" "}
                                                        {quantity}
                                                    </span>
                                                    <span>
                                                        {t("currency")}
                                                        {(
                                                            parseFloat(
                                                                item.price
                                                            ) * quantity
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }
                                )}
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center text-xl font-bold">
                                    <span>{t("total")}</span>
                                    <span>{t("currency")}{totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                            <button
                                className={`w-full py-2 px-4 rounded-lg mt-4 transition duration-300 ${
                                    isOrderEmpty
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-500 text-white hover:bg-blue-600"
                                }`}
                                onClick={handleConfirmOrder}
                                disabled={isOrderEmpty}>
                                {isOrderEmpty ? t("pleaseSelectDishes") : t("submitOrder")}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RestaurantDetail;