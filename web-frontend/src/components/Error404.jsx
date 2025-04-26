import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Error.css';
import { useTranslation } from 'react-i18next';
import ThisPageHead from './Header';
import kettlebell from '../assets/kettlebell.svg';

const Error404 = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const err_descr =
    "At TrainSync, we help you achieve your fitness goals with 💪 live coaching, 🏋️‍♂️ personal training, and ✍️ custom plans. Our 🍎 meal and 🌿 peptide programs are designed to rejuvenate your body and reverse aging. Start your journey now!";
  const err_keywords =
    "live coaching, personal training, fitness plans, custom meal plans, peptide therapy, reverse aging, rejuvenation programs, health and wellness, fitness transformation, anti-aging solutions";
  const err_title = "Train-Sync";

  return (
    <>
      <ThisPageHead
        title={err_title}
        description={err_descr}
        keywords={err_keywords}
        ogDescription={err_descr}
      />
      <div className="error-container">
        <div className="error-content">
          <div className="error-title">
            <span>4</span>
            <img src={kettlebell} alt="Kettlebell" className="kettlebell" />
            <span>4</span>
          </div>
          <p className="error-message">
            {t('errorPage.message')}
          </p>
          <button
            className="back-to-home-button"
            onClick={() => navigate('/')}
          >
            {t('errorPage.button')}
          </button>
        </div>
      </div>
    </>
  );
};

export default Error404;