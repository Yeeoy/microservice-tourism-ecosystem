import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../utils/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import {
    MapPinIcon,
    ClockIcon,
    PhoneIcon,
    MagnifyingGlassIcon,
    TagIcon
} from '@heroicons/react/24/solid';
import defaultRestaurantImage from "../assets/images/default-restaurant.jpg";

const Restaurants = () => {
    const { t } = useTranslation();
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRestaurants();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            handleSearch();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, restaurants]);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const response = await get('/api/restaurant/restaurants/');
            if (response.code === 200 && response.data) {
                setRestaurants(response.data);
                setFilteredRestaurants(response.data);
            } else {
                throw new Error(response.msg || '获取餐厅信息失败');
            }
        } catch (err) {
            toast.error(err.message || '获取餐厅信息失败');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (searchTerm.trim() === '') {
            setFilteredRestaurants(restaurants);
        } else {
            const filtered = restaurants.filter(
                (restaurant) =>
                    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    restaurant.cuisine_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    restaurant.location.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredRestaurants(filtered);
        }
    };

    if (loading) {
        return <div className="text-center mt-8">加载中...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-12 mt-8 text-center text-gray-800">
                {t('exploreRestaurants')}
            </h1>
            <div className="mb-8 flex justify-center">
                <div className="relative w-full max-w-xl">
                    <input
                        type="text"
                        placeholder={t('searchRestaurantPlaceholder')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
            </div>
            {filteredRestaurants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredRestaurants.map((restaurant) => (
                        <Link
                            to={`/restaurants/${restaurant.id}`}
                            key={restaurant.id}
                            className="block"
                        >
                            <div className="bg-white shadow-lg rounded-lg overflow-hidden transition duration-300 hover:shadow-xl transform hover:-translate-y-1">
                                <div className="relative h-64">
                                    <img
                                        src={restaurant.img_url || defaultRestaurantImage}
                                        alt={restaurant.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = defaultRestaurantImage;
                                        }}
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                                        <h2 className="text-2xl font-bold text-white mb-1">
                                            {restaurant.name}
                                        </h2>
                                        <div className="flex items-center text-white">
                                            <MapPinIcon className="h-5 w-5 mr-2" />
                                            <span className="text-sm">{restaurant.location}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center mb-2">
                                        <TagIcon className="h-5 w-5 text-blue-500 mr-2" />
                                        <span className="text-sm text-gray-600">
                                            {restaurant.cuisine_type}
                                        </span>
                                    </div>
                                    <div className="flex items-center mb-2 text-sm text-gray-600">
                                        <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        <span>{t('openingHours')}: {restaurant.opening_hours}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        <span>{t('contact')}: {restaurant.contact_info}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-600 text-xl">
                    {t('noRestaurantsFound')}
                </p>
            )}
        </div>
    );
};

export default Restaurants;
