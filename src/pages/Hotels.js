import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { get } from "../utils/api";
import { showToast } from "../utils/toast";
import { useTranslation } from "react-i18next";
import {
    StarIcon,
    MapPinIcon,
    HomeIcon,
    CurrencyDollarIcon,
    MagnifyingGlassIcon,
    ClockIcon,
    PhoneIcon,
} from "@heroicons/react/24/solid";
import defaultHotelImage from "../assets/images/default-hotel.jpg";

const Hotels = () => {
    const { t } = useTranslation();
    const [hotels, setHotels] = useState([]);
    const [filteredHotels, setFilteredHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roomTypes, setRoomTypes] = useState({});

    useEffect(() => {
        fetchHotels();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            handleSearch();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, hotels, roomTypes]);

    const fetchHotels = async () => {
        try {
            setLoading(true);
            const response = await get("/api/accommodation/accommodations/");
            if (response.code === 200 && response.data) {
                setHotels(response.data);
                setFilteredHotels(response.data);
                fetchRoomTypes(response.data);
            } else {
                throw new Error(response.msg || t("failedToGetHotels"));
            }
        } catch (err) {
            showToast.error(err.message || t("failedToGetHotels"));
        } finally {
            setLoading(false);
        }
    };

    const fetchRoomTypes = async (hotels) => {
        const types = new Set(hotels.flatMap((hotel) => hotel.types));
        const typePromises = Array.from(types).map(async (typeId) => {
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

    const handleSearch = () => {
        if (searchTerm.trim() === "") {
            setFilteredHotels(hotels);
        } else {
            const filtered = hotels.filter(
                (hotel) =>
                    hotel.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    hotel.location
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    hotel.types.some((typeId) =>
                        roomTypes[typeId]?.room_type
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                    )
            );
            setFilteredHotels(filtered);
        }
    };

    if (loading) {
        return <div className="text-center mt-8">{t("loading")}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-12 mt-8 text-center text-gray-800">
                {t("exploreOurHotels")}
            </h1>
            <div className="mb-8 flex justify-center">
                <div className="relative w-full max-w-xl">
                    <input
                        type="text"
                        placeholder={t("searchHotelPlaceholder")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
            </div>
            {filteredHotels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredHotels.map((hotel) => (
                        <Link
                            to={`/hotel/${hotel.id}`}
                            key={hotel.id}
                            className="block">
                            <div className="bg-white shadow-lg rounded-lg overflow-hidden transition duration-300 hover:shadow-xl transform hover:-translate-y-1">
                                <div className="relative h-64">
                                    <img
                                        src={hotel.img_url || defaultHotelImage}
                                        alt={hotel.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = defaultHotelImage;
                                        }}
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                                        <h2 className="text-2xl font-bold text-white mb-1">
                                            {hotel.name}
                                        </h2>
                                        <div className="flex items-center text-white">
                                            <MapPinIcon className="h-5 w-5 mr-2" />
                                            <span className="text-sm">
                                                {hotel.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center mb-2">
                                        {[...Array(hotel.star_rating)].map(
                                            (_, i) => (
                                                <StarIcon
                                                    key={i}
                                                    className="h-5 w-5 text-yellow-400"
                                                />
                                            )
                                        )}
                                        <span className="ml-2 text-sm text-gray-600">
                                            ({hotel.star_rating} {t("stars")})
                                        </span>
                                    </div>
                                    <div className="flex items-center mb-2 text-sm text-gray-600">
                                        <HomeIcon className="h-5 w-5 text-blue-500 mr-2" />
                                        <span>
                                            {t("totalRooms")}:{" "}
                                            {hotel.total_rooms}
                                        </span>
                                    </div>
                                    <div className="flex items-center mb-2 text-sm text-gray-600">
                                        <CurrencyDollarIcon className="h-5 w-5 text-green-500 mr-2" />
                                        <span>
                                            {t("types")}:{" "}
                                            {hotel.types
                                                .map(
                                                    (typeId) =>
                                                        roomTypes[typeId]
                                                            ?.room_type
                                                )
                                                .join(", ")}
                                        </span>
                                    </div>
                                    <div className="flex items-center mb-2 text-sm text-gray-600">
                                        <ClockIcon className="h-5 w-5 text-purple-500 mr-2" />
                                        <span>
                                            {t("checkIn")}:{" "}
                                            {hotel.check_in_time},{" "}
                                            {t("checkOut")}:{" "}
                                            {hotel.check_out_time}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <PhoneIcon className="h-5 w-5 text-red-500 mr-2" />
                                        <span>{hotel.contact_info}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-600 text-xl">
                    {t("noHotelsFound")}
                </p>
            )}
        </div>
    );
};

export default Hotels;
