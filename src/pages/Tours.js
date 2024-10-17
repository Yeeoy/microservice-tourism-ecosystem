import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../utils/api';
import { showToast } from '../utils/toast';
import { useTranslation } from 'react-i18next';
import {
    MapPinIcon,
    ClockIcon,
    PhoneIcon,
    MagnifyingGlassIcon,
    TagIcon
} from '@heroicons/react/24/solid';
import defaultTourImage from "../assets/images/default-tour.jpg";
const Tours = () => {
    const { t } = useTranslation();
    const [destinations, setDestinations] = useState([]);
    const [filteredDestinations, setFilteredDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDestinations();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            handleSearch();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, destinations]);

    const fetchDestinations = async () => {
        try {
            setLoading(true);
            const response = await get('/api/information-center/destinations/');
            if (response.code === 200 && response.data) {
                setDestinations(response.data);
                setFilteredDestinations(response.data);
            } else {
                throw new Error(response.msg || t('failedToGetDestinations'));
            }
        } catch (err) {
            showToast.error(err.message || t('failedToGetDestinations'));
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (searchTerm.trim() === '') {
            setFilteredDestinations(destinations);
        } else {
            const filtered = destinations.filter(
                (destination) =>
                    destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    destination.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    destination.location.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredDestinations(filtered);
        }
    };

    if (loading) {
        return <div className="text-center mt-8">{t('loading')}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-12 mt-8 text-center text-gray-800">
                {t('exploreTourDestinations')}
            </h1>
            <div className="mb-8 flex justify-center">
                <div className="relative w-full max-w-xl">
                    <input
                        type="text"
                        placeholder={t('searchDestinationPlaceholder')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
            </div>
            {filteredDestinations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredDestinations.map((destination) => (
                        <Link
                            to={`/tour/${destination.id}`}
                            key={destination.id}
                            className="block"
                        >
                            <div className="bg-white shadow-lg rounded-lg overflow-hidden transition duration-300 hover:shadow-xl transform hover:-translate-y-1">
                                <div className="relative h-64">
                                    <img
                                        src={destination.img_url || defaultTourImage}
                                        alt={destination.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = defaultTourImage;
                                        }}
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                                        <h2 className="text-2xl font-bold text-white mb-1">
                                            {destination.name}
                                        </h2>
                                        <div className="flex items-center text-white">
                                            <MapPinIcon className="h-5 w-5 mr-2" />
                                            <span className="text-sm">{destination.location}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center mb-2">
                                        <TagIcon className="h-5 w-5 text-blue-500 mr-2" />
                                        <span className="text-sm text-gray-600">
                                            {destination.category}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">{destination.description}</p>
                                    <div className="flex items-center mb-2 text-sm text-gray-600">
                                        <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        <span>{destination.opening_hours}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        <span>{destination.contact_info}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-600 text-xl">
                    {t('noDestinationsFound')}
                </p>
            )}
        </div>
    );
};

export default Tours;
