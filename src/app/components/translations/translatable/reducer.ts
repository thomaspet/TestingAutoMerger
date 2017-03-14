import * as translatable from './actions';
import {Translatable, i18nModule} from '../../../unientities';
import {Action} from '@ngrx/store';

export interface State {
    languageID: number;
    loadingTranslatables: boolean;
    translatables: Translatable[];
    currentTranslatable: Translatable;
    filteredTranslatables: Translatable[];
    query: string;
    module: number;
    includeAlreadyTranslated: boolean;
};

const initialState: State = {
    languageID: -1,
    loadingTranslatables: false,
    translatables: [],
    currentTranslatable: null,
    filteredTranslatables: [],
    query: '',
    module: -1,
    includeAlreadyTranslated: false
};

const includeAlreadyTranslated = (include: boolean, list: Translatable[]): Translatable[] => {
    if (include === false) {
        list = list.filter((t: Translatable) => {
            return t.Translations.length === 0;
        });
    }
    return list;
};
const filterTranslatables = (state: State) => {
    let filteredList: Translatable[] = state.translatables;
    if (state.module !== -1) {
        filteredList = filteredList.filter((item: Translatable) => {
            return (item.Module === state.module);
        });
    }
    if (state.query !== '') {
        filteredList = filteredList.filter((item: Translatable) => {
            return item.Value.toLowerCase().indexOf(state.query.toLowerCase()) > -1;
        });
    }
    return includeAlreadyTranslated(state.includeAlreadyTranslated, filteredList);
};
export default function (state = initialState, action: Action): State {
    switch (action.type) {
        case translatable.ActionTypes.RETRIEVE: {
            return Object.assign({}, state, {
                loadingTranslatables: true,
            });
        }
        case translatable.ActionTypes.RETRIEVE_SUCCESS: {
            return Object.assign({}, state, {
                loadingTranslatables: false,
                translatables: action.payload,
                filteredTranslatables: filterTranslatables(Object.assign(state, {translatables: action.payload}))
            });
        }
        case translatable.ActionTypes.RETRIEVE_FAIL: {
            return Object.assign({}, state, {
                translatables: action.payload,
                filteredTranslatables: []
            });
        }
        case translatable.ActionTypes.SET_CURRENT_TRANSLATABLE: {
            if (Number(action.payload) >= 0) {
                return Object.assign({}, state, {
                    currentTranslatable: state.filteredTranslatables[action.payload]
                });
            } else {
                return Object.assign({}, state, {
                    currentTranslatable: action.payload
                });
            }
        }
        case translatable.ActionTypes.FILER_BY_MODULE: {
            return Object.assign({}, state, {
                module: action.payload,
                filteredTranslatables: filterTranslatables(Object.assign(state, {module: action.payload}))
            });
        }
        case translatable.ActionTypes.FILER_BY_QUERY: {
            return Object.assign({}, state, {
                query: action.payload,
                filteredTranslatables: filterTranslatables(Object.assign(state, {query: action.payload}))
            });
        }
        case translatable.ActionTypes.NEXT: {
            const index = state.filteredTranslatables.indexOf(state.currentTranslatable);
            if (index < state.filteredTranslatables.length - 1) {
                return Object.assign({}, state, {
                    currentTranslatable: state.filteredTranslatables[index + 1]
                });
            }
            return state;
        }
        case translatable.ActionTypes.TOGGLE_SHOW_JUST_TRANSLATED: {
            return Object.assign({}, state, {
                includeAlreadyTranslated: !state.includeAlreadyTranslated,
                filteredTranslatables: filterTranslatables(Object.assign(state, {includeAlreadyTranslated: !state.includeAlreadyTranslated}))
            });
        }
        default: {
            return state;
        }
    }
}
