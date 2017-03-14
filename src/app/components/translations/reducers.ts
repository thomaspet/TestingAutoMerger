import {compose} from '@ngrx/core';
import {combineReducers} from '@ngrx/store';
import languagesReducer, * as fromLanguageReducer from './language/reducer';
import translatablesReducer, * as fromTranslatablesReducer from './translatable/reducer';
import translationsReducer, * as fromTranslationsReducer from './translation/reducer';

export interface TranslationsState {
    languagesState: fromLanguageReducer.State;
    translatablesState: fromTranslatablesReducer.State;
    translationsState: fromTranslationsReducer.State;
};

export default compose(combineReducers)({
    languagesState: languagesReducer,
    translatablesState: translatablesReducer,
    translationsState: translationsReducer
});
