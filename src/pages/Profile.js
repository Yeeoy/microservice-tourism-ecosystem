import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authContext';
import { get, patch } from '../utils/api';
import { showToast } from '../utils/toast';
import { useTranslation } from 'react-i18next';
import { UserIcon, EnvelopeIcon, LockClosedIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const { t } = useTranslation();
  const { user, setUser } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await get('/api/customUser/me/');
      if (response.code === 200 && response.data) {
        setName(response.data.name);
        setEmail(response.data.email);
      } else {
        throw new Error(response.msg || t('failedToGetUserInfo'));
      }
    } catch (err) {
      showToast.error(err.message || t('failedToGetUserInfo'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = { name };
      if (password) {
        updateData.password = password;
      }
      const response = await patch('/api/customUser/me/', updateData);
      if (response.code === 200 && response.data) {
        setUser({ ...user, name: response.data.name });
        showToast.success(t('profileUpdateSuccess'));
        setIsEditing(false);
        setPassword('');
      } else {
        throw new Error(response.msg || t('updateFailed'));
      }
    } catch (err) {
      showToast.error(err.message || t('updateFailed'));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-4xl font-extrabold mb-10 text-center text-gray-800">{t('profile')}</h1>
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="p-8">
          <div className="mb-8">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
              {t('email')}
            </label>
            <div className="flex items-center bg-gray-100 rounded-lg p-2">
              <EnvelopeIcon className="h-6 w-6 text-gray-500 mr-3" />
              <input
                className="bg-transparent w-full text-gray-700 focus:outline-none"
                id="email"
                type="email"
                value={email}
                disabled
              />
            </div>
          </div>
          <div className="mb-8">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="name">
              {t('name')}
            </label>
            <div className="flex items-center bg-gray-100 rounded-lg p-2">
              <UserIcon className="h-6 w-6 text-gray-500 mr-3" />
              {isEditing ? (
                <input
                  className="bg-transparent w-full text-gray-700 focus:outline-none"
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              ) : (
                <p className="text-gray-700">{name}</p>
              )}
            </div>
          </div>
          {isEditing && (
            <div className="mb-8">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                {t('newPassword')}
              </label>
              <div className="flex items-center bg-gray-100 rounded-lg p-2">
                <LockClosedIcon className="h-6 w-6 text-gray-500 mr-3" />
                <input
                  className="bg-transparent w-full text-gray-700 focus:outline-none"
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('leaveBlankIfUnchanged')}
                />
              </div>
            </div>
          )}
          <div className="flex items-center justify-center mt-10">
            {isEditing ? (
              <>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline flex items-center mr-4 transition duration-300"
                  type="button"
                  onClick={handleSubmit}
                >
                  <CheckIcon className="h-5 w-5 mr-2" />
                  {t('save')}
                </button>
                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline flex items-center transition duration-300"
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setPassword('');
                  }}
                >
                  <XMarkIcon className="h-5 w-5 mr-2" />
                  {t('cancel')}
                </button>
              </>
            ) : (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline flex items-center transition duration-300"
                type="button"
                onClick={() => setIsEditing(true)}
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                {t('edit')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
