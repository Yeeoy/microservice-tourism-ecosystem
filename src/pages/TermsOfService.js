import React from 'react';
import { useTranslation } from 'react-i18next';

const TermsOfService = () => {
    const { t } = useTranslation();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">{t('termsOfService')}</h1>
            <div className="prose max-w-none">
                <h2>{t('termsOfServiceIntro')}</h2>
                <p>{t('termsOfServiceContent1')}</p>
                <h2>{t('useOfService')}</h2>
                <p>{t('termsOfServiceContent2')}</p>
                <h2>{t('userAccounts')}</h2>
                <p>{t('termsOfServiceContent3')}</p>
                <h2>{t('intellectualProperty')}</h2>
                <p>{t('termsOfServiceContent4')}</p>
                <h2>{t('limitationOfLiability')}</h2>
                <p>{t('termsOfServiceContent5')}</p>
            </div>
        </div>
    );
};

export default TermsOfService;
