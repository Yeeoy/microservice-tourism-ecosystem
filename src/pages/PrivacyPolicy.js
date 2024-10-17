import React from 'react';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
    const { t } = useTranslation();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">{t('privacyPolicy')}</h1>
            <div className="prose max-w-none">
                <h2>{t('privacyPolicyIntro')}</h2>
                <p>{t('privacyPolicyContent1')}</p>
                <h2>{t('informationWeCollect')}</h2>
                <p>{t('privacyPolicyContent2')}</p>
                <h2>{t('howWeUseInformation')}</h2>
                <p>{t('privacyPolicyContent3')}</p>
                <h2>{t('informationSharing')}</h2>
                <p>{t('privacyPolicyContent4')}</p>
                <h2>{t('dataProtection')}</h2>
                <p>{t('privacyPolicyContent5')}</p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
