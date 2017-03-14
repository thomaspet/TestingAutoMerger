import {Injectable} from '@angular/core';

import {Action} from '@ngrx/store';
import {Effect, Actions} from '@ngrx/effects';
import * as translationActions from './actions';
import * as translatableActions from '../translatable/actions';
import {ToastService, ToastType, ToastTime} from '../../../../framework/uniToast/toastService';
import {TranslationService} from './service';
import {Translation} from '../../../unientities';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';


@Injectable()
export class TranslationEffects {
    constructor(public actions$: Actions, public service: TranslationService, public toast: ToastService) {
    }

    @Effect()
    public retrieveOneTranslation: Observable<Action> = this.actions$
        .ofType(translationActions.ActionTypes.RETRIEVE_ONE)
        .switchMap((action: Action) => this.service.retrieveOne(action.payload.language.ID, action.payload.translatable.ID))
        .map((translation: Translation) => <Action>{
            type: translationActions.ActionTypes.RETRIEVE_ONE_SUCCESS,
            payload: translation
        })
        .catch(error => {
            this.toast.clear();
            console.error('ERROR RETRIEVING TRANSLATION: ', error);
            this.toast.addToast('Error retrieving translation!', ToastType.bad, ToastTime.short, error.toString());
            const action: Action = {type: translationActions.ActionTypes.RETRIEVE_ONE_FAIL, payload: error};
            return Observable.of(action);
        });

    @Effect()
    public createTranslation: Observable<Action> = this.actions$
        .ofType(translationActions.ActionTypes.CREATE)
        .do(() => this.toast.addToast('Updating translation...', ToastType.warn, ToastTime.short, ''))
        .map((action: Action) => action.payload)
        .switchMap((translation: Translation) => this.service.create(translation))
        .map((translation: Translation) => <Action>{
            type: translationActions.ActionTypes.CREATE_SUCCESS,
            payload: translation
        })
        .catch(error => {
            this.toast.clear();
            console.error('ERROR CREATING TRANSLATION: ', error);
            this.toast.addToast('Error creating translation!', ToastType.bad, ToastTime.short, error.toString());
            const action: Action = {type: translationActions.ActionTypes.CREATE_FAIL, payload: error};
            return Observable.of(action);
        });

    @Effect()
    public updateTranslation: Observable<Action> = this.actions$
        .ofType(translationActions.ActionTypes.UPDATE)
        .map((action: Action) => action.payload)
        .switchMap((translation: Translation) => this.service.update(translation))
        .map((translation: Translation) => <Action>{
            type: translationActions.ActionTypes.UPDATE_SUCCESS,
            payload: translation
        })
        .catch(error => {
            this.toast.clear();
            console.error('ERROR UPDATING TRANSLATION: ', error);
            this.toast.addToast('Error updating translation!', ToastType.bad, ToastTime.short, error.toString());
            const action: Action = {type: translationActions.ActionTypes.UPDATE_FAIL, payload: error};
            return Observable.of(action);
        });

    @Effect()
    public successCreateTranslation: Observable<Action> = this.actions$
        .ofType(translationActions.ActionTypes.CREATE_SUCCESS)
        .map((action: Action) => <Action>{
            type: translatableActions.ActionTypes.NEXT,
            payload: null
        });

    @Effect()
    public successUpdateTranslation: Observable<Action> = this.actions$
        .ofType(translationActions.ActionTypes.UPDATE_SUCCESS)
        .map((action: Action) => <Action>{
            type: translatableActions.ActionTypes.NEXT,
            payload: null
        });
}
