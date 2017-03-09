import {Injectable} from '@angular/core';

import {Action, Store} from '@ngrx/store';
import {Effect, Actions} from '@ngrx/effects';
import * as translatable from './actions';
import * as translation from '../translation/actions';

import {ToastService, ToastType, ToastTime} from '../../../../framework/uniToast/toastService';
import {TranslatableService} from './service';
import {Translatable} from '../../../unientities';
import {TranslationsState} from '../reducers';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/take';
import * as fromLanguage from '../language/reducer';


@Injectable()
export class TranslatableEffects {
    constructor(
        public store: Store<TranslationsState>,
        public actions$: Actions,
        public service: TranslatableService,
        public toast: ToastService) {
    }

    @Effect()
    public retrieveTranslatable: Observable<Action> = this.actions$
        .ofType(translatable.ActionTypes.RETRIEVE)
        .switchMap((action: Action) => this.service.retrieve(action.payload))
        .map((translatables: Translatable[]) => <Action>{
            type: translatable.ActionTypes.RETRIEVE_SUCCESS,
            payload: translatables
        })
        .catch(error => {
            this.toast.clear();
            console.error('ERROR RETRIEVING LANGUAGES: ', error);
            this.toast.addToast('Error retrieving translatables!', ToastType.bad, ToastTime.short, error.toString());
            const action: Action = {type: translatable.ActionTypes.RETRIEVE_FAIL, payload: error};
            return Observable.of(action);
        });

    @Effect()
    public retrieveSuccessTranslatable: Observable<Action> = this.actions$
        .ofType(translatable.ActionTypes.RETRIEVE_SUCCESS)
        .map(() => <Action>{type: translatable.ActionTypes.SET_CURRENT_TRANSLATABLE, payload: 0});

    @Effect()
    public nextTranslatable: Observable<Action> = this.actions$
        .ofType(translatable.ActionTypes.NEXT)
        .switchMap(() => this.store.take(1)) // if not it is fired each time store is updated, so just take one value
        .map((state: TranslationsState) => {
            return {
                language: state.languagesState.currentLanguage,
                translatable: state.translatablesState.currentTranslatable
            };
        })
        .map(payload => <Action>{
            type: translation.ActionTypes.RETRIEVE_ONE,
            payload: payload
        });
}

