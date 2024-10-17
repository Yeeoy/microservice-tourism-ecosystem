import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, MapPinIcon, HomeIcon, CurrencyDollarIcon, ClockIcon, PhoneIcon } from '@heroicons/react/24/solid';
import defaultHotelImage from '../assets/images/default-hotel.jpg';

const HotelCard = ({ hotel, roomTypes }) => {
  return (
    <Link to={`/hotel/${hotel.id}`} className="block">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden transition duration-300 hover:shadow-xl transform hover:-translate-y-1">
        <div className="relative h-64">
          <img
            src={defaultHotelImage}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <h2 className="text-2xl font-bold text-white mb-1">
              {hotel.name}
            </h2>
            <div className="flex items-center text-white">
              <MapPinIcon className="h-5 w-5 mr-2" />
              <span className="text-sm">{hotel.location}</span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center mb-2">
            {[...Array(hotel.star_rating)].map((_, i) => (
              <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
            ))}
            <span className="ml-2 text-sm text-gray-600">
              ({hotel.star_rating} 星级)
            </span>
          </div>
          <div className="flex items-center mb-2 text-sm text-gray-600">
            <HomeIcon className="h-5 w-5 text-blue-500 mr-2" />
            <span>房间总数: {hotel.total_rooms}</span>
          </div>
          <div className="flex items-center mb-2 text-sm text-gray-600">
            <CurrencyDollarIcon className="h-5 w-5 text-green-500 mr-2" />
            <span>类型: {hotel.types.map(typeId => roomTypes[typeId]?.room_type).join(', ')}</span>
          </div>
          <div className="flex items-center mb-2 text-sm text-gray-600">
            <ClockIcon className="h-5 w-5 text-purple-500 mr-2" />
            <span>入住: {hotel.check_in_time}, 退房: {hotel.check_out_time}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <PhoneIcon className="h-5 w-5 text-red-500 mr-2" />
            <span>{hotel.contact_info}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
