import * as translation from './actions';
import {Translation} from '../../../unientities';
import {Action} from '@ngrx/store';

export interface State {
    translation: Translation;
    loadingTranslation: boolean;
};

const initialState: State = {
    translation: null,
    loadingTranslation: false
};

export default function (state = initialState, action: Action): State {
    switch (action.type) {
        case translation.ActionTypes.RETRIEVE_ONE: {
            return Object.assign({}, state, {
                loadingTranslation: true,
            });
        }
        case translation.ActionTypes.RETRIEVE_ONE_SUCCESS: {
            return Object.assign({}, state, {
                loadingTranslation: false,
                translation: action.payload
            });
        }
        case translation.ActionTypes.RETRIEVE_ONE_FAIL: {
            return Object.assign({}, state, {
                translation: null
            });
        }
        case translation.ActionTypes.CREATE: {
            return state;
        }
        case translation.ActionTypes.CREATE_SUCCESS: {
            return Object.assign({}, state, {
                translation: null
            });
        }
        case translation.ActionTypes.CREATE_FAIL: {
            return state;
        }
        case translation.ActionTypes.UPDATE: {
            return state;
        }
        case translation.ActionTypes.UPDATE_SUCCESS: {
            return Object.assign({}, state, {
                translation: null
            });
        }
        case translation.ActionTypes.UPDATE_FAIL: {
            return state;
        }
        case translation.ActionTypes.SET_TRANSLATION: {
            return Object.assign({}, state, {
                translation: action.payload
            });
        }
        default: {
            return state;
        }
    }
}
