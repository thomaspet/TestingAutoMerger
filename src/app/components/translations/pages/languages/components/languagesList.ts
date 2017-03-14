import {Component, Input, ChangeDetectionStrategy} from '@angular/core';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import * as languageActions from '../../../language/actions';
import *  as fromLanguage from '../../../language/reducer';
import {Language} from '../../../../../unientities';
import {TranslationsState} from '../../../reducers';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'uni-languages-list',
    template: `
        <div class="languagesContainer">
            <h1>Thank you for helping us translate Uni Economy!</h1>
            <p> 
                Below the current languages we are in the process of 
                translating with the end user enabled languages marked in green
            </p>
            <ul class="languagesList" [attr.aria-busy]="loading$ | async">
                <li *ngFor="let language of languages;">
                    <span>{{language.Code}} - {{language.Name}}</span>
                    <small>{{language._translatedPercentage}}% translated</small>
                    <button (click)="edit(language)">Edit</button>
                    <button class="good" (click)="translate(language)">Translate</button>
                    <button class="closeBtn" (click)="remove(language)">Remove</button>
                </li>
            </ul>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguagesListComponent {
    @Input() public languages: Language[];
    private loading$: Observable<boolean>;
    constructor(private router: Router, private store: Store<TranslationsState>) {
        this.loading$ = this.store.select('languagesState')
            .map((state: fromLanguage.State) => state.loadingList);
    }

    public edit(language: Language) {
        this.store.dispatch({
            type: languageActions.ActionTypes.OPEN_LANGUAGE_MODAL,
            payload: language
        });
    }

    public translate(language: Language) {
        this.store.dispatch({
            type: languageActions.ActionTypes.SET_CURRENT_LANGUAGE,
            payload: language
        });
        this.router.navigateByUrl('/admin/languages/' + language.ID + '/translations');
    }

    public remove(language: Language) {
        this.store.dispatch({
            type: languageActions.ActionTypes.OPEN_DELETE_LANGUAGE_MODAL,
            payload: language
        });
    }
}
