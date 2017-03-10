import {Component, EventEmitter, Output, ChangeDetectionStrategy} from '@angular/core';
import {Language} from '../../../../../unientities';
import {Store} from '@ngrx/store';
import *  as fromLanguage from '../../../language/reducer';
import * as languageActions from '../../../language/actions';
import {Observable} from 'rxjs/Observable';
import {TranslationsState} from '../../../reducers';
import {Subscription} from 'rxjs';

@Component({
    selector: 'uni-delete-language',
    template: `
        <dialog class="uniModal" [attr.open]="isOpen$ | async">
            <article class="uniModal_bounds">
                <button (click)="onReject()" class="closeBtn"></button>
                <article class="modal-content">
                    <h1>Are you sure you want to delete this language?</h1>
                    <p>{{language?.Code}} - {{language?.Name}}</p>
                    <footer> 
                        <button (click)="onAccept()" class="good">Yes</button>
                        <button (click)="onReject()" class="bad">No</button>
                    </footer>
                </article>
            </article>
        </dialog>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteLanguageComponent {
    public language: Language = new Language();
    private isOpen$: Observable<{}>;
    private currentLanguageSubscription: Subscription;

    constructor(private store: Store<TranslationsState>) {
        this.isOpen$ = this.getIsModalOpen();
        this.currentLanguageSubscription = this.subscribeToCurrentLanguage();
    }

    public onAccept() {
        this.store.dispatch({
            type: languageActions.ActionTypes.DELETE,
            payload: this.language
        });
    }

    public onReject() {
        this.store.dispatch({
            type: languageActions.ActionTypes.CLOSE_DELETE_LANGUAGE_MODAL,
            payload: null
        });
    }

    private getIsModalOpen() {
        return this.store.select('languagesState')
            .filter((state: fromLanguage.State) => !!state)
            .map((state: fromLanguage.State) => state.isDeleteModalOpen);
    }

    private subscribeToCurrentLanguage() {
        return this.store
            .select('languagesState')
            .filter((state: fromLanguage.State) => !!state)
            .map((state: fromLanguage.State) => state.currentLanguage)
            .subscribe((language: Language) => {
                this.language = language || new Language();
            });
    }

    private ngOnDestroy() {
        this.currentLanguageSubscription.unsubscribe();
    }
}
