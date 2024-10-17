import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid';
import defaultHotelImage from '../assets/images/default-hotel.jpg';

const HotelCardHome = ({ hotel }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden flex">
      <div className="w-1/3">
        <img 
          src={defaultHotelImage}
          alt={hotel.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-2/3 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">{hotel.name}</h2>
          <div className="flex items-center mb-2">
            <MapPinIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span>{hotel.location}</span>
          </div>
          <div className="flex items-center mb-2">
            {[...Array(hotel.star_rating)].map((_, i) => (
              <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
            ))}
            <span className="ml-2 text-gray-600">({hotel.star_rating} 星级)</span>
          </div>
          <p className="text-gray-600 mb-2">房间总数: {hotel.total_rooms}</p>
          <p className="text-gray-600 mb-2">类型: {hotel.type}</p>
        </div>
        <div className="flex justify-end">
          <Link 
            to={`/hotel/${hotel.id}`} 
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            查看详情
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelCardHome;