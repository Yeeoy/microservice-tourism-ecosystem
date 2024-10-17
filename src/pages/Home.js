import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { get } from "../utils/api";
import { showToast } from "../utils/toast";
import { useTranslation } from "react-i18next";
import {
    CalendarIcon,
    MapPinIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    GlobeAltIcon,
    BoltIcon,
    SparklesIcon,
    ChevronRightIcon,
    StarIcon,
    HomeIcon,
    TicketIcon,
    TagIcon,
} from "@heroicons/react/24/solid";
import defaultHotelImage from "../assets/images/default-hotel.jpg";

const Home = () => {
    const { t } = useTranslation();
    const [featuredHotels, setFeaturedHotels] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [popularTours, setPopularTours] = useState([]);
    const [topRestaurants, setTopRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedContent();
    }, []);

    const fetchFeaturedContent = async () => {
        try {
            setLoading(true);
            const [hotelsResponse, eventsResponse, toursResponse, restaurantsResponse] = await Promise.all([
                get("/api/accommodation/accommodations/"),
                get('/api/event-organizers/event/'),
                get('/api/information-center/destinations/'),
                get('/api/restaurant/restaurants/')
            ]);

            if (hotelsResponse.code === 200 && hotelsResponse.data) {
                setFeaturedHotels(hotelsResponse.data.slice(0, 4));
            }
            if (eventsResponse.code === 200 && eventsResponse.data) {
                setUpcomingEvents(eventsResponse.data.slice(0, 4));
            }
            if (toursResponse.code === 200 && toursResponse.data) {
                setPopularTours(toursResponse.data.slice(0, 4));
            }
            if (restaurantsResponse.code === 200 && restaurantsResponse.data) {
                setTopRestaurants(restaurantsResponse.data.slice(0, 4));
            }
        } catch (err) {
            showToast.error(t("failedToLoadContent"));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    return (
        <div className="bg-gray-50">
            {/* Hero Section */}
            <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <video autoPlay loop muted className="object-cover w-full h-full">
                        <source src="/videos/welcome.mp4" type="video/mp4" />
                    </video>
                </div>
                <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
                <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-down">{t('welcomeToTravelMate')}</h1>
                    <p className="text-xl md:text-2xl mb-10 animate-fade-in-up">{t('exploreWorldCreateMemories')}</p>
                    <Link
                        to="/tours"
                        className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-lg animate-pulse"
                    >
                        {t('startYourJourney')}
                    </Link>
                </div>
            </section>

            {/* 将所有其他部分包裹在一个新的 div 中 */}
            <div className="bg-gray-50">
                {/* Featured Hotels */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">{t('featuredHotels')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {featuredHotels.map((hotel) => (
                                <Link to={`/hotel/${hotel.id}`} key={hotel.id} className="block group">
                                    <div className="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 group-hover:shadow-xl transform group-hover:-translate-y-1">
                                        <div className="relative h-56 overflow-hidden">
                                            <img src={hotel.img_url || defaultHotelImage} alt={hotel.name} className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black bg-opacity-20 transition duration-300 group-hover:bg-opacity-30"></div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-semibold mb-2 text-gray-800">{hotel.name}</h3>
                                            <div className="flex items-center mb-2">
                                                <MapPinIcon className="h-5 w-5 text-blue-500 mr-2" />
                                                <span className="text-sm text-gray-600">{hotel.location}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                                                <span className="text-sm text-gray-600">{hotel.star_rating} {t('stars')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            <Link to="/hotels" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition duration-300 text-lg">
                                {t('viewAllHotels')} 
                                <ChevronRightIcon className="h-5 w-5 ml-2" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Upcoming Events */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">{t('upcomingEvents')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {upcomingEvents.map((event) => (
                                <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 hover:shadow-xl">
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold mb-4 text-gray-800">{event.name}</h3>
                                        <div className="flex items-center mb-3 text-gray-600">
                                            <CalendarIcon className="h-5 w-5 text-blue-500 mr-3" />
                                            <span className="text-sm">{new Date(event.event_date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center mb-3 text-gray-600">
                                            <MapPinIcon className="h-5 w-5 text-red-500 mr-3" />
                                            <span className="text-sm">{event.venue}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <TicketIcon className="h-5 w-5 text-green-500 mr-3" />
                                            <span className="text-sm">{t('startingFrom')} ${event.entry_fee}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            <Link to="/events" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition duration-300 text-lg">
                                {t('viewAllEvents')} 
                                <ChevronRightIcon className="h-5 w-5 ml-2" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Popular Tours */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">{t('popularTours')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {popularTours.map((tour) => (
                                <Link to={`/tour/${tour.id}`} key={tour.id} className="block group">
                                    <div className="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 group-hover:shadow-xl transform group-hover:-translate-y-1 h-full flex flex-col">
                                        <div className="relative h-56 overflow-hidden">
                                            <img src={tour.img_url || defaultHotelImage} alt={tour.name} className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black bg-opacity-20 transition duration-300 group-hover:bg-opacity-30"></div>
                                        </div>
                                        <div className="p-6 flex-grow flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-xl font-semibold mb-3 text-gray-800 line-clamp-2">{tour.name}</h3>
                                                <div className="flex items-center mb-3 text-gray-600">
                                                    <MapPinIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                                                    <span className="text-sm truncate">{tour.location}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center text-gray-600 mt-2">
                                                <TagIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                                <span className="text-sm truncate">{tour.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            <Link to="/tours" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition duration-300 text-lg">
                                {t('viewAllTours')} 
                                <ChevronRightIcon className="h-5 w-5 ml-2" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Top Restaurants */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">{t('topRestaurants')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {topRestaurants.map((restaurant) => (
                                <Link to={`/restaurants/${restaurant.id}`} key={restaurant.id} className="block group">
                                    <div className="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 group-hover:shadow-xl transform group-hover:-translate-y-1">
                                        <div className="relative h-56 overflow-hidden">
                                            <img src={restaurant.img_url || defaultHotelImage} alt={restaurant.name} className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black bg-opacity-20 transition duration-300 group-hover:bg-opacity-30"></div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-semibold mb-3 text-gray-800">{restaurant.name}</h3>
                                            <div className="flex items-center mb-3 text-gray-600">
                                                <MapPinIcon className="h-5 w-5 text-blue-500 mr-2" />
                                                <span className="text-sm">{restaurant.location}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <GlobeAltIcon className="h-5 w-5 text-green-500 mr-2" />
                                                <span className="text-sm">{restaurant.cuisine_type}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            <Link to="/restaurants" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition duration-300 text-lg">
                                {t('viewAllRestaurants')} 
                                <ChevronRightIcon className="h-5 w-5 ml-2" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Why Choose TravelMate */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-bold mb-16 text-center text-gray-800">{t('whyChooseTravelMate')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="text-center">
                                <div className="bg-blue-100 rounded-full p-6 inline-block mb-6">
                                    <GlobeAltIcon className="h-12 w-12 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-semibold mb-4 text-gray-800">{t('globalDestinations')}</h3>
                                <p className="text-gray-600 leading-relaxed">{t('exploreWorldwideAttractionsDescription')}</p>
                            </div>
                            <div className="text-center">
                                <div className="bg-green-100 rounded-full p-6 inline-block mb-6">
                                    <BoltIcon className="h-12 w-12 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-semibold mb-4 text-gray-800">{t('quickBooking')}</h3>
                                <p className="text-gray-600 leading-relaxed">{t('simpleBookingProcessDescription')}</p>
                            </div>
                            <div className="text-center">
                                <div className="bg-purple-100 rounded-full p-6 inline-block mb-6">
                                    <SparklesIcon className="h-12 w-12 text-purple-600" />
                                </div>
                                <h3 className="text-2xl font-semibold mb-4 text-gray-800">{t('qualityExperience')}</h3>
                                <p className="text-gray-600 leading-relaxed">{t('carefullySelectedServicesDescription')}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;