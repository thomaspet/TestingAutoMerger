import {Component, EventEmitter, Output, ChangeDetectionStrategy} from '@angular/core';
import {Language} from '../../../../../unientities';
import {Store} from '@ngrx/store';
import *  as fromLanguage from '../../../language/reducer';
import * as languageActions from '../../../language/actions';
import {Observable} from 'rxjs/Observable';
import {TranslationsState} from '../../../reducers';
import {Subscription} from 'rxjs';

@Component({
    selector: 'uni-add-language',
    template: `
        <dialog class="uniModal" [attr.open]="isOpen$ | async">
            <article class="uniModal_bounds">
                <button (click)="onReject()" class="closeBtn"></button>
                <article class="modal-content">
                    <input [(ngModel)]="language.Name" placeholder="Name"/>
                    <input [(ngModel)]="language.Code" placeholder="Code"/>
                    <footer> 
                        <button (click)="onAccept()" class="good">{{actionMode()}} Language</button>
                        <button (click)="onReject()" class="bad">Cancel</button>
                    </footer>
                </article>
            </article>
        </dialog>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddLanguageComponent {
    public language: Language = new Language();
    private isOpen$: Observable<{}>;
    private currentLanguageSubscription: Subscription;

    constructor(private store: Store<TranslationsState>) {
        this.isOpen$ = this.getIsModalOpen();
        this.currentLanguageSubscription = this.subscribeToCurrentLanguage();
    }

    public actionMode() {
        return this.language.ID ? 'Edit' : 'Add';
    }

    public onAccept() {
        if (!this.language.ID) {
            this.store.dispatch({
                type: languageActions.ActionTypes.CREATE,
                payload: this.language
            });
        } else {
            this.store.dispatch({
                type: languageActions.ActionTypes.UPDATE,
                payload: this.language
            });
        }
    }

    public onReject() {
        this.store.dispatch({
            type: languageActions.ActionTypes.CLOSE_LANGUAGE_MODAL,
            payload: null
        });
    }

    private getIsModalOpen() {
        return this.store.select('languagesState')
            .map((state: fromLanguage.State) => state.isModalOpen);
    }

    private subscribeToCurrentLanguage() {
        return this.store
            .select('languagesState')
            .map((state: fromLanguage.State) => state.currentLanguage)
            .subscribe((language: Language) => {
                this.language = language || new Language();
            });
    }

    private ngOnDestroy() {
        this.currentLanguageSubscription.unsubscribe();
    }
}
