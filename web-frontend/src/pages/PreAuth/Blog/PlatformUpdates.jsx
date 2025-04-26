import React from 'react';
import '../../../styles/PlatformUpdates.css';

const PlatformUpdates = () => {
    const updates = [
        {
            title: 'Bug Fixes',
            date: ' 05, 1099',
            content: 'Several bugs have been fixed to improve the overall user experience.',
        },
        {
            title: 'Platform Release',
            date: ' 05, 1099',
            content: 'Welcome to Train Sync. Transform your fitness journey.',
        },
        // Make with database 
    ];

    return (
        <div className="platform-updates-container">
            <h1 className="platform-updates-title">Platform Updates</h1>
            {updates.map((update, index) => (
                <div className="platform-updates-card" key={index}>
                    <h2 className="platform-updates-card-title">{update.title}</h2>
                    <p className="platform-updates-card-date">{update.date}</p>
                    <p className="platform-updates-card-content">{update.content}</p>
                </div>
            ))}
        </div>
    );
};

export default PlatformUpdates;