import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-gray-800 text-white py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            {t("quickLinks")}
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/"
                                    className="text-gray-300 hover:text-white transition duration-300">
                                    {t("home")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/hotels"
                                    className="text-gray-300 hover:text-white transition duration-300">
                                    {t("hotels")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/restaurants"
                                    className="text-gray-300 hover:text-white transition duration-300">
                                    {t("restaurants")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/events"
                                    className="text-gray-300 hover:text-white transition duration-300">
                                    {t("events")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/tours"
                                    className="text-gray-300 hover:text-white transition duration-300">
                                    {t("tours")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/transportation"
                                    className="text-gray-300 hover:text-white transition duration-300">
                                    {t("transportation")}
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            {t("contactUs")}
                        </h3>
                        <ul className="space-y-2 text-gray-300">
                            <li>
                                {t("address")}: {t("companyAddress")}
                            </li>
                            <li>
                                {t("phone")}: {t("companyPhone")}
                            </li>
                            <li>
                                {t("email")}: {t("companyEmail")}
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            {t("followUs")}
                        </h3>
                        <div className="flex space-x-4">
                            <a
                                href="#"
                                className="text-gray-300 hover:text-white transition duration-300">
                                <FaFacebook size={24} />
                            </a>
                            <a
                                href="#"
                                className="text-gray-300 hover:text-white transition duration-300">
                                <FaTwitter size={24} />
                            </a>
                            <a
                                href="#"
                                className="text-gray-300 hover:text-white transition duration-300">
                                <FaInstagram size={24} />
                            </a>
                            <a
                                href="#"
                                className="text-gray-300 hover:text-white transition duration-300">
                                <FaLinkedin size={24} />
                            </a>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            {t("legalInfo")}
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/terms"
                                    className="text-gray-300 hover:text-white transition duration-300">
                                    {t("termsOfService")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/privacy"
                                    className="text-gray-300 hover:text-white transition duration-300">
                                    {t("privacyPolicy")}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-700 pt-4 text-center text-sm text-gray-400">
                    <p>
                        &copy; 2024 TravelMate. {t("allRightsReserved")}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
