import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get, post } from '../utils/api';
import { showToast } from '../utils/toast';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/authContext';
import {
    MapPinIcon,
    ClockIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    UserIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    ClipboardDocumentListIcon
} from '@heroicons/react/24/solid';
import defaultTourImage from "../assets/images/default-tour.jpg";

const TourDetail = () => {
    const { t } = useTranslation();
    const [tour, setTour] = useState(null);
    const [destination, setDestination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingStatus, setBookingStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
    const [isBooked, setIsBooked] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchTourDetail();
        if (user) {
            checkBookingStatus();
        }
    }, [id, user]);

    const fetchTourDetail = async () => {
        try {
            setLoading(true);
            const tourResponse = await get(`/api/information-center/tours/${id}/`);
            if (tourResponse.code === 200 && tourResponse.data) {
                setTour(tourResponse.data);
                fetchDestinationDetail(tourResponse.data.destination);
            } else {
                throw new Error(tourResponse.msg || t('failedToGetTourDetails'));
            }
        } catch (err) {
            showToast.error(err.message || t('failedToGetTourDetails'));
            setLoading(false);
        }
    };

    const fetchDestinationDetail = async (destinationId) => {
        try {
            const destinationResponse = await get(`/api/information-center/destinations/${destinationId}/`);
            if (destinationResponse.code === 200 && destinationResponse.data) {
                setDestination(destinationResponse.data);
            } else {
                throw new Error(destinationResponse.msg || t('failedToGetDestinationDetails'));
            }
        } catch (err) {
            console.error(t('failedToGetDestinationDetails'), err);
        } finally {
            setLoading(false);
        }
    };

    const checkBookingStatus = async () => {
        try {
            const response = await get('/api/information-center/tour-bookings/');
            if (response.code === 200 && response.data) {
                const userBookings = response.data.filter(booking => 
                    booking.user_id === parseInt(user.id) && 
                    booking.tour_id === parseInt(id) &&
                    booking.booking_status === true
                );
                setIsBooked(userBookings.length > 0);
            } else {
                throw new Error(response.msg || t('failedToCheckBookingStatus'));
            }
        } catch (err) {
            console.error(t('failedToCheckBookingStatus'), err);
            showToast.error(t('failedToCheckBookingStatus'));
        }
    };

    const handleBooking = async () => {
        if (!user) {
            showToast.error(t('pleaseLoginToBook'));
            return;
        }

        if (isBooked) {
            showToast.info(t('alreadyBooked'));
            return;
        }

        setBookingStatus('loading');
        try {
            const response = await post('/api/information-center/tour-bookings/', {
                total_price: tour.price_per_person,
                booking_status: true,
                payment_status: true,
                tour_id: tour.id,
                user_id: user.id
            });

            if (response.code === 201 && response.data) {
                setBookingStatus('success');
                setIsBooked(true);
                showToast.success(t('bookingSuccessful'));
            } else {
                throw new Error(response.msg || t('bookingFailed'));
            }
        } catch (err) {
            setBookingStatus('error');
            showToast.error(err.message || t('bookingFailed'));
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    if (!tour || !destination) {
        return <div className="text-center mt-8">{t('tourInfoNotFound')}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center mb-6 mt-6">
                <button
                    onClick={handleGoBack}
                    className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition duration-300 mr-4"
                >
                    <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                </button>
                <h1 className="text-3xl font-bold text-gray-800">{tour.name}</h1>
            </div>
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/3">
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="relative h-96">
                            <img
                                src={destination.img_url || defaultTourImage}
                                alt={tour.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = defaultTourImage;
                                }}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                                <div className="flex items-center text-white">
                                    <MapPinIcon className="h-5 w-5 mr-2" />
                                    <span>{destination.location}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 mb-6 text-lg leading-relaxed">{destination.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="flex items-center bg-gray-100 p-4 rounded-lg">
                                    <ClockIcon className="h-8 w-8 text-blue-500 mr-3" />
                                    <div>
                                        <h3 className="font-semibold">{t('duration')}</h3>
                                        <p>{tour.duration} {t('minutes')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center bg-gray-100 p-4 rounded-lg">
                                    <UserGroupIcon className="h-8 w-8 text-green-500 mr-3" />
                                    <div>
                                        <h3 className="font-semibold">{t('maxCapacity')}</h3>
                                        <p>{tour.max_capacity} {t('people')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center bg-gray-100 p-4 rounded-lg">
                                    <CalendarIcon className="h-8 w-8 text-purple-500 mr-3" />
                                    <div>
                                        <h3 className="font-semibold">{t('tourDate')}</h3>
                                        <p>{tour.tour_date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center bg-gray-100 p-4 rounded-lg">
                                    <UserIcon className="h-8 w-8 text-red-500 mr-3" />
                                    <div>
                                        <h3 className="font-semibold">{t('guide')}</h3>
                                        <p>{tour.guide_name}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-4">{t('destinationInfo')}</h3>
                                <div className="bg-gray-100 p-4 rounded-lg">
                                    <p className="mb-2"><span className="font-semibold">{t('openingHours')}：</span>{destination.opening_hours}</p>
                                    <p><span className="font-semibold">{t('contactInfo')}：</span>{destination.contact_info}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:w-1/3">
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <h2 className="text-2xl font-bold mb-4">{t('bookingInfo')}</h2>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">{t('price')}</h3>
                            <p className="text-3xl font-bold text-blue-600">{t('currency')}{tour.price_per_person} <span className="text-sm text-gray-600">/ {t('person')}</span></p>
                        </div>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">{t('tourType')}</h3>
                            <p className="text-gray-700">{tour.tour_type}</p>
                        </div>
                        {isBooked ? (
                            <div>
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                                    <CheckCircleIcon className="h-6 w-6 inline-block mr-2" />
                                    <strong className="font-bold">{t('booked')}！</strong>
                                    <span className="block sm:inline"> {t('bookingSuccessMessage')}</span>
                                </div>
                                <button 
                                    onClick={() => navigate('/tour-orders')} // 假设tour orders页面的路由是'/tour-orders'
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                                >
                                    <ClipboardDocumentListIcon className="h-5 w-5 inline-block mr-2" />
                                    {t('viewTourOrder')}
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={handleBooking}
                                disabled={bookingStatus === 'loading' || isBooked}
                                className={`w-full ${
                                    bookingStatus === 'loading' || isBooked
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-blue-500 hover:bg-blue-600'
                                } text-white py-2 px-4 rounded-lg transition duration-300`}
                            >
                                {bookingStatus === 'loading' ? t('booking') : t('bookNow')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TourDetail;
