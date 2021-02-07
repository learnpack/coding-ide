import React from 'react';
import ReactDOM from 'react-dom';
import '../styles/index.scss';
import TagManager from 'react-gtm-module';

import Home from './home.js';

const tagManagerArgs = {
    gtmId: 'GTM-WCVQ4KJ',
    auth: 'UziHoBlMGYrHZqefka0uXg',
    env: 'env-1'
};

TagManager.initialize(tagManagerArgs);

//render your react application
ReactDOM.render(
    <Home />,
    document.querySelector('#app')
);