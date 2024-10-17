import React, { useState, useEffect, useContext } from "react";
import { get, post } from "../utils/api";
import { showToast } from "../utils/toast"; // 导入封装的 toast
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    TicketIcon,
    TagIcon,
    MagnifyingGlassIcon,
    LockClosedIcon,
    CheckCircleIcon
} from "@heroicons/react/24/solid";
import { AuthContext } from "../context/authContext";

function Events() {
    const { t, i18n } = useTranslation(); // 添加 i18n
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [promotions, setPromotions] = useState({});
    const [participants, setParticipants] = useState({});
    const [prices, setPrices] = useState({});
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingStatus, setBookingStatus] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [registrationComplete, setRegistrationComplete] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            handleSearch();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, events]); // 添加 events 作为依赖项

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const eventsResponse = await get('/api/event-organizers/event/');
            if (eventsResponse.code === 200 && eventsResponse.data) {
                setEvents(eventsResponse.data);
                setFilteredEvents(eventsResponse.data);
                fetchPromotions();
            } else {
                throw new Error(eventsResponse.msg || t('failedToGetEvents'));
            }
        } catch (err) {
            showToast.error(err.message || t('failedToGetEvents'));
        } finally {
            setLoading(false);
        }
    };

    const fetchPromotions = async () => {
        try {
            const promotionsResponse = await get('/api/event-organizers/event-promotion/');
            if (promotionsResponse.code === 200 && promotionsResponse.data) {
                const promotionsMap = {};
                promotionsResponse.data.forEach(promo => {
                    promotionsMap[promo.event] = promo;
                });
                setPromotions(promotionsMap);
            } else {
                throw new Error(promotionsResponse.msg || t('failedToGetPromotions'));
            }
        } catch (err) {
            showToast.error(err.message || t('failedToGetPromotions'));
        }
    };

    const handleSearch = () => {
        if (searchTerm.trim() === "") {
            setFilteredEvents(events);
        } else {
            const filtered = events.filter(
                (event) =>
                    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredEvents(filtered);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(i18n.language, options);
    };

    const handleEventSelect = async (eventId) => {
        setSelectedEvent(eventId);
        setParticipants(prev => ({ ...prev, [eventId]: 1 }));
        if (user) {
            try {
                await handleParticipantChange(eventId, 1);
            } catch (error) {
                console.error('选择活动时计算价格失败:', error);
            }
        }
    };

    const handleParticipantChange = async (eventId, change) => {
        const newParticipants = {
            ...participants,
            [eventId]: Math.max(1, (participants[eventId] || 0) + change)
        };
        setParticipants(newParticipants);

        try {
            const response = await post('/api/event-organizers/venue-booking/calculate-price/', {
                event: eventId,
                number_of_tickets: newParticipants[eventId]
            });

            if (response.code === 200 && response.data) {
                const { ticket_price, number_of_tickets, discount, base_amount, total_amount, discount_amount } = response.data;
                setPrices(prevPrices => ({
                    ...prevPrices,
                    [eventId]: {
                        ticketPrice: ticket_price,
                        numberOfTickets: number_of_tickets,
                        discount: discount,
                        baseAmount: base_amount,
                        totalAmount: total_amount,
                        discountAmount: discount_amount
                    }
                }));
            } else {
                throw new Error(response.msg || t('failedToCalculatePrice'));
            }
        } catch (err) {
            showToast.error(err.message || t('failedToCalculatePrice'));
        }
    };

    const handleSubmit = async (eventId) => {
        if (!user) {
            showToast.error(t('pleaseLoginToRegister'));
            return;
        }

        const price = prices[eventId];
        const promotion = promotions[eventId];

        if (!price) {
            showToast.error(t('pleaseSelectParticipants'));
            return;
        }

        try {
            setBookingStatus(prev => ({ ...prev, [eventId]: 'loading' }));
            const response = await post("/api/event-organizers/venue-booking/", {
                booking_date: new Date().toISOString(),
                booking_status: true,
                number_of_tickets: participants[eventId],
                event_id: eventId,
                promotion_id: promotion ? promotion.id : null
            });

            if (response.code === 201 && response.data) {
                setBookingStatus(prev => ({ ...prev, [eventId]: 'success' }));
                showToast.success(t('registrationSuccess'));
                setRegistrationComplete(true);
            } else {
                throw new Error(response.msg || t('registrationFailed'));
            }
        } catch (err) {
            setBookingStatus(prev => ({ ...prev, [eventId]: 'error' }));
            showToast.error(err.message || t('registrationFailed'));
        }
    };

    const handleResetRegistration = () => {
        setRegistrationComplete(false);
        setSelectedEvent(null);
        setParticipants({});
        setPrices({});
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-12 mt-8 text-center text-gray-800">{t('exploreEvents')}</h1>
            <div className="mb-8 flex justify-center">
                <div className="relative w-full max-w-xl">
                    <input
                        type="text"
                        placeholder={t('searchEventPlaceholder')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
            </div>
            <div className="space-y-8">
                {filteredEvents.map((event) => {
                    const promotion = promotions[event.id];
                    const price = prices[event.id];
                    const isSelected = selectedEvent === event.id;

                    return (
                        <div key={event.id} className="bg-white shadow-lg rounded-lg overflow-hidden transition duration-300 hover:shadow-xl relative">
                            <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-4">
                                <h2 className="text-2xl font-bold text-white">{event.name}</h2>
                            </div>
                            <div className="flex flex-col lg:flex-row transition-all duration-300 ease-in-out">
                                {/* 左侧：时间和基本信息 */}
                                <div className={`p-6 transition-all duration-300 ease-in-out ${isSelected ? 'lg:w-1/2' : 'lg:w-2/3'} border-b lg:border-b-0 lg:border-r border-gray-200`}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="flex items-center bg-gray-100 p-4 rounded-lg">
                                            <CalendarIcon className="h-8 w-8 text-blue-500 mr-3" />
                                            <div>
                                                <h3 className="font-semibold">{t('date')}</h3>
                                                <p>{formatDate(event.event_date)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center bg-gray-100 p-4 rounded-lg">
                                            <ClockIcon className="h-8 w-8 text-purple-500 mr-3" />
                                            <div>
                                                <h3 className="font-semibold">{t('time')}</h3>
                                                <p>{event.start_time} - {event.end_time}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center bg-gray-100 p-4 rounded-lg">
                                            <MapPinIcon className="h-8 w-8 text-red-500 mr-3" />
                                            <div>
                                                <h3 className="font-semibold">{t('venue')}</h3>
                                                <p>{event.venue}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center bg-gray-100 p-4 rounded-lg">
                                            <UserGroupIcon className="h-8 w-8 text-green-500 mr-3" />
                                            <div>
                                                <h3 className="font-semibold">{t('maxParticipants')}</h3>
                                                <p>{event.max_participants}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mb-6 text-lg leading-relaxed">{event.description}</p>
                                </div>

                                {/* 中间：报名信息 */}
                                <div className={`p-6 transition-all duration-300 ease-in-out ${isSelected ? 'lg:w-1/4' : 'lg:w-1/3'} ${isSelected ? 'border-r border-gray-200' : ''}`}>
                                    <div className="mb-6">
                                        <div className="flex items-center bg-gray-100 p-4 rounded-lg mb-4">
                                            <TicketIcon className="h-8 w-8 text-blue-500 mr-3" />
                                            <div>
                                                <h3 className="font-semibold">{t('entryFee')}</h3>
                                                <p className="text-xl font-bold text-blue-600">{t('currency')}{event.entry_fee}</p>
                                            </div>
                                        </div>
                                        {promotion && (
                                            <div className="flex items-center bg-yellow-100 p-4 rounded-lg mb-4">
                                                <TagIcon className="h-8 w-8 text-yellow-600 mr-3" />
                                                <div>
                                                    <h3 className="font-semibold">{t('promotionInfo')}</h3>
                                                    <p className="text-sm">{formatDate(promotion.promotion_start_date)} - {formatDate(promotion.promotion_end_date)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {!isSelected ? (
                                        <button 
                                            onClick={() => handleEventSelect(event.id)}
                                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
                                        >
                                            {t('selectEvent')}
                                        </button>
                                    ) : user ? (
                                        <div>
                                            <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg mb-4">
                                                <button 
                                                    onClick={() => handleParticipantChange(event.id, -1)}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-l-lg transition duration-300"
                                                >
                                                    -
                                                </button>
                                                <input 
                                                    type="number" 
                                                    value={participants[event.id]} 
                                                    onChange={(e) => handleParticipantChange(event.id, parseInt(e.target.value) - participants[event.id])}
                                                    className="w-16 text-center border-t border-b border-gray-300 py-2"
                                                />
                                                <button 
                                                    onClick={() => handleParticipantChange(event.id, 1)}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-r-lg transition duration-300"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button 
                                                onClick={() => handleSubmit(event.id)}
                                                className={`w-full font-bold py-3 px-4 rounded-lg transition duration-300 ${
                                                    bookingStatus[event.id] === 'loading' 
                                                        ? 'bg-gray-400 cursor-not-allowed' 
                                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                                }`}
                                                disabled={bookingStatus[event.id] === 'loading'}
                                            >
                                                {bookingStatus[event.id] === 'loading' 
                                                    ? t('registering')
                                                    : price 
                                                        ? t('registerWithPrice', { price: price.totalAmount })
                                                        : t('register')
                                                }
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <LockClosedIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                            <p className="text-gray-600 mb-2">{t('pleaseLoginToRegister')}</p>
                                            <button 
                                                onClick={() => navigate('/login')}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                                            >
                                                {t('goToLogin')}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* 右侧：价格详情 */}
                                {isSelected && price && user && (
                                    <div className="p-6 lg:w-1/4 transition-all duration-300 ease-in-out">
                                        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                                            <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">{t('priceDetails')}</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">{t('unitPrice')}</span>
                                                    <span className="font-semibold">{t('currency')}{price.ticketPrice}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">{t('quantity')}</span>
                                                    <span className="font-semibold">{price.numberOfTickets}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">{t('originalTotal')}</span>
                                                    <span className="font-semibold">{t('currency')}{price.baseAmount}</span>
                                                </div>
                                                {price.discountAmount > 0 && (
                                                    <>
                                                        <div className="flex justify-between items-center text-orange-600">
                                                            <span>{t('discount')}</span>
                                                            <span className="font-bold">{(price.discount * 100).toFixed(0)}%</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-green-600">
                                                            <span>{t('discountAmount')}</span>
                                                            <span className="font-bold">- {t('currency')}{price.discountAmount}</span>
                                                        </div>
                                                    </>
                                                )}
                                                <div className="mt-4 pt-4 border-t border-gray-300">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-lg font-bold text-blue-600">{t('totalPayable')}</span>
                                                        <span className="text-2xl font-bold text-blue-600">{t('currency')}{price.totalAmount}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* 添加遮罩层 */}
                            {registrationComplete && isSelected && (
                                <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex flex-col items-center justify-center rounded-lg transition-opacity duration-300 ease-in-out">
                                    <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
                                    <p className="text-white text-xl font-bold mb-4">{t("registrationComplete")}</p>
                                    <button
                                        onClick={handleResetRegistration}
                                        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                                    >
                                        {t("registerAgain")}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Events;