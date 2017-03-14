import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';
import {Effect, Actions} from '@ngrx/effects';
import * as language from './actions';

import {ToastService, ToastType, ToastTime} from '../../../../framework/uniToast/toastService';
import {LanguageService} from '../services';
import {Language} from '../../../unientities';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';

/**
 * LANGUAGE EFFECTS
 *
 * An effect is a transtion between to actions.
 * An effect is listening for actions of one type
 * When this action is dispatched the effect start a list of actions
 * In most cases effects are using to call services and modify data
 * Once the effect is done it returns a new action for the reducer
 */
@Injectable()
export class LanguageEffects {
    constructor(
        public actions$: Actions, // Observable of actions
        public service: LanguageService,
        public toast: ToastService) {}

    /**
     * This effect is listening for RETRIEVE action
     * It calls the LanguageService to retrieve languages
     * It returns RETRIEVE_SUCCESS or RETRIEVE_FAIL
     * those actions are managed by the language reducer
     */
    @Effect()
    public retrieveLanguage: Observable<Action> = this.actions$
        .ofType(language.ActionTypes.RETRIEVE)
        .switchMap(() => this.service.retrieve())
        .map((languages: Language[]) => <Action>{type: language.ActionTypes.RETRIEVE_SUCCESS, payload: languages})
        .catch(error => {
            this.toast.clear();
            console.error('ERROR RETRIEVING LANGUAGES: ', error);
            this.toast.addToast('Error retrieving languages!', ToastType.bad, ToastTime.short, error.toString());
            const action: Action = {type: language.ActionTypes.RETRIEVE_FAIL, payload: error};
            return Observable.of(action);
        });

    @Effect()
    public retrieveOneLanguage: Observable<Action> = this.actions$
        .ofType(language.ActionTypes.RETRIEVE_ONE)
        .switchMap((action: Action) => this.service.retrieveOne(action.payload))
        .map((languages: Language[]) => <Action>{type: language.ActionTypes.RETRIEVE_ONE_SUCCESS, payload: languages})
        .catch(error => {
            this.toast.clear();
            console.error('ERROR RETRIEVING LANGUAGE: ', error);
            this.toast.addToast('Error retrieving language!', ToastType.bad, ToastTime.short, error.toString());
            const action: Action = {type: language.ActionTypes.RETRIEVE_ONE_FAIL, payload: error};
            return Observable.of(action);
        });

    @Effect()
    public createLanguage: Observable<Action> = this.actions$
        .ofType(language.ActionTypes.CREATE)
        .map((action: Action) => action.payload)
        .switchMap((lang: Language) => this.service.create(lang))
        .map((lang: Language) => <Action>{type: language.ActionTypes.CREATE_SUCCESS, payload: lang})
        .catch(error => {
            this.toast.clear();
            console.error('ERROR CREATING LANGUAGE: ', error);
            this.toast.addToast('Error creating language!', ToastType.bad, ToastTime.short, error.toString());
            const action: Action = {type: language.ActionTypes.CREATE_FAIL, payload: error};
            return Observable.of(action);
        });

    @Effect()
    public updateLanguage: Observable<Action> = this.actions$
        .ofType(language.ActionTypes.UPDATE)
        .map((action: Action) => action.payload)
        .switchMap((lang: Language) => this.service.update(lang))
        .map((lang: Language) => <Action>{type: language.ActionTypes.UPDATE_SUCCESS, payload: lang})
        .catch(error => {
            this.toast.clear();
            console.error('ERROR UPDATING LANGUAGE: ', error);
            this.toast.addToast('Error updating language!', ToastType.bad, ToastTime.short, error.toString());
            const action: Action = {type: language.ActionTypes.UPDATE_FAIL, payload: error};
            return Observable.of(action);
        });

    @Effect()
    public deleteLanguage: Observable<Action> = this.actions$
        .ofType(language.ActionTypes.DELETE)
        .map((action: Action) => action.payload)
        .switchMap((lang: Language) => this.service.remove(lang))
        .map((lang: Language) => <Action>{type: language.ActionTypes.DELETE_SUCCESS, payload: lang})
        .catch(error => {
            this.toast.clear();
            console.error('ERROR DELETING LANGUAGE: ', error);
            const action: Action = {type: language.ActionTypes.DELETE_FAIL, payload: error};
            return Observable.of(action);
        });

    /**
     * This effects listen for DELETE_SUCCESS
     * Once data is deleted REST API doesn't return which
     * language is deleted so we can' remove it from the list
     * then best approach is to refresh the list of languages
     */
    @Effect()
    public deleteSuccessLanguage: Observable<Action> = this.actions$
        .ofType(language.ActionTypes.DELETE_SUCCESS)
        .map((action) => <Action>{type: language.ActionTypes.DELETE_SUCCESS, payload: action.payload});
}
