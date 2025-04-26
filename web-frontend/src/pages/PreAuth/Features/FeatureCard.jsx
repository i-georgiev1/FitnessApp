import React from 'react';
import PropTypes from 'prop-types';
import '../../../styles/FeatureCard.css';

const CardItem = ({ iconClass, title, description }) => {
    return (
        <div className="single-item">
            <div className="item-box">
                <div className="icon-area">
                    <i className={iconClass}></i>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
        </div>
    );
};

CardItem.propTypes = {
    iconClass: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
};

export default CardItem;