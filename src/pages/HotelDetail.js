import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { get, post, del } from "../utils/api";
import { showToast } from "../utils/toast";
import { useTranslation } from "react-i18next";
import {
    StarIcon,
    MapPinIcon,
    PhoneIcon,
    ClockIcon,
    HomeIcon,
    CurrencyDollarIcon,
    TrashIcon,
    ArrowLeftIcon,
} from "@heroicons/react/24/solid";
import defaultHotelImage from "../assets/images/default-hotel.jpg";
import { AuthContext } from "../context/authContext";
import BookingModule from "../components/BookingModule";

const HotelDetail = () => {
    const { t } = useTranslation();
    const [hotel, setHotel] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newReview, setNewReview] = useState("");
    const [newRating, setNewRating] = useState(0);
    const [roomTypes, setRoomTypes] = useState({});
    const [guestServices, setGuestServices] = useState([]);
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const userId = localStorage.getItem("user_id");
    const navigate = useNavigate();

    useEffect(() => {
        fetchHotelDetail();
        fetchHotelReviews();
        fetchGuestServices();
    }, [id]);

    const fetchHotelDetail = async () => {
        try {
            const response = await get(
                `/api/accommodation/accommodations/${id}/`
            );
            if (response.code === 200 && response.data) {
                setHotel(response.data);
                fetchRoomTypes(response.data.types);
            } else {
                throw new Error(response.msg || t("failedToGetHotelDetails"));
            }
        } catch (err) {
            showToast.error(err.message || t("failedToGetHotelDetails"));
        }
    };

    const fetchRoomTypes = async (types) => {
        const typePromises = types.map(async (typeId) => {
            try {
                const response = await get(
                    `/api/accommodation/room-types/${typeId}/`
                );
                if (response.code === 200 && response.data) {
                    return { [typeId]: response.data };
                }
            } catch (err) {
                console.error(t("failedToGetRoomType", { id: typeId }), err);
            }
            return null;
        });

        const typeResults = await Promise.all(typePromises);
        const newRoomTypes = Object.assign({}, ...typeResults.filter(Boolean));
        setRoomTypes(newRoomTypes);
    };

    const fetchHotelReviews = async () => {
        try {
            const response = await get(
                `/api/accommodation/feedback-reviews/accommodation/${id}/`
            );
            if (response.code === 200 && response.data) {
                // 直接使用 response.data，不需要额外的过滤
                setReviews(response.data);
            } else {
                throw new Error(response.msg || t("failedToGetReviews"));
            }
        } catch (err) {
            showToast.error(err.message || t("failedToGetReviews"));
        } finally {
            setLoading(false);
        }
    };

    const fetchGuestServices = async () => {
        try {
            const response = await get(
                `/api/accommodation/guest-services/guestService/${id}/`
            );
            if (response.code === 200 && response.data) {
                setGuestServices(response.data);
            } else {
                throw new Error(response.msg || t("failedToGetGuestServices"));
            }
        } catch (err) {
            console.error(t("failedToGetGuestServices"), err);
            showToast.error(t("failedToGetGuestServices"));
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            showToast.error(t("pleaseLoginToComment"));
            return;
        }
        if (newRating === 0) {
            showToast.error(t("pleaseSelectRating"));
            return;
        }
        try {
            const response = await post(
                "/api/accommodation/feedback-reviews/",
                {
                    rating: newRating,
                    review: newReview,
                    date: new Date().toISOString().split("T")[0],
                    accommodation_id: parseInt(id),
                    user_id: parseInt(userId), // 使用 userId 而不是 user.id
                }
            );
            if (response.code === 201 && response.data) {
                showToast.success(t("reviewSubmitted"));
                setReviews((prevReviews) => [response.data, ...prevReviews]);
                setNewReview("");
                setNewRating(0);
            } else {
                throw new Error(response.msg || t("submitReviewFailed"));
            }
        } catch (err) {
            showToast.error(err.message || t("submitReviewFailed"));
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm(t("confirmDeleteReview"))) {
            try {
                await del(`/api/accommodation/feedback-reviews/${reviewId}/`);
                setReviews((prevReviews) =>
                    prevReviews.filter((review) => review.id !== reviewId)
                );
                showToast.success(t("reviewDeleted"));
            } catch (err) {
                console.error(t("errorDeletingReview"), err);
                if (err.message === "Network Error") {
                    showToast.error(t("networkError"));
                } else {
                    showToast.error(t("deleteReviewFailed"));
                }
            }
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    if (loading) {
        return <div className="text-center mt-8">{t("loading")}</div>;
    }

    if (!hotel) {
        return <div className="text-center mt-8">{t("hotelNotFound")}</div>;
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
                    {hotel.name}
                </h1>
            </div>
            <div className="flex flex-col lg:flex-row gap-8">
                {/* 左侧：酒店信息 */}
                <div className="lg:w-2/3">
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="relative h-96">
                            <img
                                src={hotel.img_url || defaultHotelImage}
                                alt={hotel.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = defaultHotelImage;
                                }}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                                <div className="flex items-center text-white">
                                    <MapPinIcon className="h-5 w-5 mr-2" />
                                    <span>{hotel.location}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                {[...Array(hotel.star_rating)].map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        className="h-6 w-6 text-yellow-400"
                                    />
                                ))}
                                <span className="ml-2 text-gray-600 text-lg">
                                    ({hotel.star_rating} {t("stars")})
                                </span>
                            </div>
                            <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                                {hotel.description ||
                                    t("defaultHotelDescription")}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="flex items-center bg-gray-100 p-4 rounded-lg">
                                    <HomeIcon className="h-8 w-8 text-blue-500 mr-3" />
                                    <div>
                                        <h3 className="font-semibold">
                                            {t("totalRooms")}
                                        </h3>
                                        <p>{hotel.total_rooms}</p>
                                    </div>
                                </div>
                                <div className="flex items-center bg-gray-100 p-4 rounded-lg">
                                    <CurrencyDollarIcon className="h-8 w-8 text-green-500 mr-3" />
                                    <div>
                                        <h3 className="font-semibold">
                                            {t("types")}
                                        </h3>
                                        <p>
                                            {hotel.types
                                                .map(
                                                    (typeId) =>
                                                        roomTypes[typeId]
                                                            ?.room_type
                                                )
                                                .join(", ")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center bg-gray-100 p-4 rounded-lg">
                                    <ClockIcon className="h-8 w-8 text-purple-500 mr-3" />
                                    <div>
                                        <h3 className="font-semibold">
                                            {t("checkInOutTime")}
                                        </h3>
                                        <p>
                                            {t("checkIn")}:{" "}
                                            {hotel.check_in_time}
                                        </p>
                                        <p>
                                            {t("checkOut")}:{" "}
                                            {hotel.check_out_time}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center bg-gray-100 p-4 rounded-lg">
                                    <PhoneIcon className="h-8 w-8 text-red-500 mr-3" />
                                    <div>
                                        <h3 className="font-semibold">
                                            {t("contactInfo")}
                                        </h3>
                                        <p>{hotel.contact_info}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-4">
                                    {t("facilitiesAndServices")}
                                </h3>
                                <div className="bg-gray-100 p-4 rounded-lg">
                                    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                        {hotel.amenities
                                            .split(",")
                                            .map((amenity, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-center">
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                                                    <span className="text-gray-700 text-sm">
                                                        {amenity.trim()}
                                                    </span>
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 客房服务 */}
                    <div className="mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-2xl font-semibold mb-4">
                                {t("roomService")}
                            </h3>
                            {guestServices.length > 0 ? (
                                <ul className="space-y-4">
                                    {guestServices.map((service) => (
                                        <li
                                            key={service.id}
                                            className="flex items-center justify-between border-b pb-4">
                                            <div>
                                                <h4 className="text-lg font-medium">
                                                    {service.service_name}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    {service.availability_hours}
                                                </p>
                                            </div>
                                            <div className="text-lg font-semibold">
                                                ${service.price}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-600">
                                    {t("noRoomServiceInfo")}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 右侧：预订模块和评论 */}
                <div className="lg:w-1/3">
                    <BookingModule
                        hotelId={id}
                        roomTypes={roomTypes}
                        isLoggedIn={!!user}
                    />
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4">
                                {t("reviews")}
                            </h2>

                            {/* 添加评论表单 */}
                            {user && (
                                <form
                                    onSubmit={handleSubmitReview}
                                    className="mb-8">
                                    <h3 className="text-xl font-semibold mb-4">
                                        {t("addReview")}
                                    </h3>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            {t("rating")}
                                        </label>
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <StarIcon
                                                    key={star}
                                                    className={`h-8 w-8 cursor-pointer ${
                                                        star <= newRating
                                                            ? "text-yellow-400"
                                                            : "text-gray-300"
                                                    }`}
                                                    onClick={() =>
                                                        setNewRating(star)
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label
                                            htmlFor="review"
                                            className="block text-gray-700 text-sm font-bold mb-2">
                                            {t("review")}
                                        </label>
                                        <textarea
                                            id="review"
                                            rows="4"
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            value={newReview}
                                            onChange={(e) =>
                                                setNewReview(e.target.value)
                                            }
                                            required></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
                                        {t("submitReview")}
                                    </button>
                                </form>
                            )}

                            {/* 评论列表 */}
                            <h3 className="text-xl font-semibold mb-4">
                                {t("userReviews")}
                            </h3>
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="mb-4 pb-4 border-b border-gray-200 last:border-b-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center">
                                                {[...Array(review.rating)].map(
                                                    (_, i) => (
                                                        <StarIcon
                                                            key={i}
                                                            className="h-5 w-5 text-yellow-400"
                                                        />
                                                    )
                                                )}
                                                <span className="ml-2 text-gray-600">
                                                    ({review.rating} {t("stars")})
                                                </span>
                                            </div>
                                            {userId && parseInt(userId) === review.user_id && (
                                                <button
                                                    onClick={() =>
                                                        handleDeleteReview(
                                                            review.id
                                                        )
                                                    }
                                                    className="text-red-500 hover:text-red-700">
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-gray-700 mb-2">
                                            {review.review}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {t("reviewDate")}: {review.date}
                                            {userId && parseInt(userId) === review.user_id ? (
                                                <span className="ml-2 text-blue-500">
                                                    ({t("self")})
                                                </span>
                                            ) : (
                                                <span className="ml-2 text-gray-500">
                                                    ({t("anonymous")})
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-600">
                                    {t("noReviews")}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelDetail;
