import { applyMiddleware, createStore, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reduxReducers/index';

// export default createStore(rootReducer, applyMiddleware(logger)); // When no redux-logger
const middlewares = [thunk];

if (__DEV__) {
    const { logger } = require('redux-logger');

    middlewares.push(logger);
}

const store = compose(applyMiddleware(...middlewares))(createStore)(rootReducer);
export default store;
