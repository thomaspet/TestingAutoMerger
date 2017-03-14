import * as language from './actions';
import {Language} from '../../../unientities';
import {Action} from '@ngrx/store';

/**
 * This state represents all the information that language
 * needs to communicate to the components
 */
export interface State {
    loadingList: boolean;
    loadingCurrent: boolean;
    languages: Language[];
    enabledLanguages: Language[];
    currentLanguage: Language;
    isModalOpen: boolean;
    isDeleteModalOpen: boolean;
};

/**
 *  we define the initial state of the app
 *  That will be returned in the default case
 */
const initialState: State = {
    loadingList: false,
    loadingCurrent: false,
    languages: [],
    enabledLanguages: [],
    currentLanguage: null,
    isModalOpen: false,
    isDeleteModalOpen: false
};

/**
 * A reducer is function that receives the state of the application
 * and an action (an action has a type and a payload)
 * and it generates a complete new state (inmutability)
 */
export default function (state = initialState, action: Action): State {
    switch (action.type) {
        case language.ActionTypes.RETRIEVE: {
            return Object.assign({}, state, {
                loading: true,
            });    
        }
        case language.ActionTypes.RETRIEVE_SUCCESS: {
            return Object.assign({}, state, {
                loading: false,
                languages: action.payload
            });
        }
        case language.ActionTypes.RETRIEVE_FAIL: {
            return Object.assign({}, state, {
                languages: action.payload
            });
        }
        case language.ActionTypes.RETRIEVE_ONE: {
            return state;
        }
        case language.ActionTypes.RETRIEVE_ONE_SUCCESS: {
            return Object.assign({}, state, {
                currentLanguage: action.payload
            });
        }
        case language.ActionTypes.RETRIEVE_ONE_FAIL: {
            return Object.assign({}, state, {
                currentLanguage: null
            });
        }
        case language.ActionTypes.CREATE: {
            return Object.assign({}, state, {
                isModalOpen: true,
                currentLanguage: action.payload
            });
        }
        case language.ActionTypes.CREATE_SUCCESS: {
            return Object.assign({}, state, {
                languages: [...state.languages, action.payload],
                currentLanguage: null,
                isModalOpen: false
            });
        }
        case language.ActionTypes.CREATE_FAIL: {
            return Object.assign({}, state, {
                isModalOpen: true
            });
        }

        case language.ActionTypes.UPDATE: {
            return Object.assign({}, state, {
                isModalOpen: true,
                currentLanguage: action.payload
            });
        }
        case language.ActionTypes.UPDATE_SUCCESS: {
            const index = state.languages.indexOf(action.payload);
            if (index >= 0) {
                state.languages[index] = action.payload
            }
            return Object.assign({}, state, {
                languages: [...state.languages],
                currentLanguage: null,
                isModalOpen: false
            });
        }
        case language.ActionTypes.UPDATE_FAIL: {
            return Object.assign({}, state, {
                isModalOpen: true
            });
        }

        case language.ActionTypes.DELETE: {
            return state;
        }
        case language.ActionTypes.DELETE_SUCCESS: {
            return Object.assign({}, state, {
                currentLanguage: null,
                isDeleteModalOpen: false
            });
        }
        case language.ActionTypes.DELETE_FAIL: {
            return Object.assign({}, state, {
                currentLanguage: null,
                isDeleteModalOpen: true
            });
        }

        case language.ActionTypes.ENABLE: {
            return state;
        }
        case language.ActionTypes.ENABLE_SUCCESS: {
            return state;
        }
        case language.ActionTypes.ENABLE_FAIL: {
            return state;
        }

        case language.ActionTypes.DISABLE: {
            return state;
        }
        case language.ActionTypes.DISABLE_SUCCESS: {
            return state;
        }
        case language.ActionTypes.DISABLE_FAIL: {
            return state;
        }
        case language.ActionTypes.OPEN_LANGUAGE_MODAL: {
            return Object.assign({}, state, {
                currentLanguage: action.payload,
                isModalOpen: true
            });
        }
        case language.ActionTypes.CLOSE_LANGUAGE_MODAL: {
            return Object.assign({}, state, {
                currentLanguage: null,
                isModalOpen: false
            });
        }
        case language.ActionTypes.OPEN_DELETE_LANGUAGE_MODAL: {
            return Object.assign({}, state, {
                currentLanguage: action.payload,
                isDeleteModalOpen: true
            });
        }
        case language.ActionTypes.CLOSE_DELETE_LANGUAGE_MODAL: {
            return Object.assign({}, state, {
                currentLanguage: null,
                isDeleteModalOpen: false
            });
        }
        case language.ActionTypes.SET_CURRENT_LANGUAGE: {
            return Object.assign({}, state, {
                currentLanguage: action.payload
            });
        }
        default: {
            return state;
        }
    }
}
