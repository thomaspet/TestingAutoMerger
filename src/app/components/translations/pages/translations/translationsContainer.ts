import {Component} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Store} from '@ngrx/store';

import * as translatableActions from '../../translatable/actions';
import * as languageActions from '../../language/actions';
import * as translationActions from '../../translation/actions';

import * as fromTranslation from  '../../translation/reducer';
import * as fromLanguage from '../../language/reducer';
import * as fromTranslatable from '../../translatable/reducer';

import {TranslationsState} from '../../reducers';

import {Language, Translation, Translatable} from '../../../../unientities';
import {KeyCodes} from '../../../../services/common/keyCodes';

import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {UniModules, TabService} from '../../../layout/navbar/tabstrip/tabService';

import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';

@Component({
    selector: 'uni-translations-container',
    template: `
        <uni-toolbar 
            [config]="toolbarConfig"
            [saveactions]="saveActions"
        ></uni-toolbar>
        <section class="application">
            <section class="splitview">
                <nav class="splitview_list" [attr.aria-busy]="loadingList$ | async">
                    <uni-translatables-filter></uni-translatables-filter>
                    <uni-translatables-list 
                        [translatables]="translatables$ | async"
                        [language]="language$ | async"
                        [selectedTranslatable]="translatable$ | async"
                        (selectTranslatable)="select($event)"
                    ></uni-translatables-list>
                </nav>
                <main class="splitview_detail" [attr.aria-busy]="loadingDetail$ | async">
                    <uni-translation-detail 
                        *ngIf="(translatable$ | async) && (translation$ |async)"
                        [translatable]="translatable$ | async" 
                        [translation]="translation$ | async">                        
                    </uni-translation-detail>                
                </main>
            </section>
        </section>
    `
})
export class TranslationsContainer {
    private toolbarConfig: IToolbarConfig;
    private saveActions: IUniSaveAction[];
    public language$: Observable<Language>;
    public loadingDetail$: Observable<boolean>;
    public loadingList$: Observable<boolean>;
    public translation$: Observable<Translation>;
    public translatable$: Observable<Translatable>;
    public selectedTranslatable$: Observable<Translatable>;
    public translatables$: Observable<Translatable[]>;
    public translation: Translation;
    public language: Language;
    public translatable: Translatable;
    public subscriptions: Subscription[] = [];

    constructor(
        private route: ActivatedRoute,
        private tabService: TabService,
        private store: Store<TranslationsState>) {

        this.route.params
            .subscribe((params) => {
                this.store.dispatch({
                    type: languageActions.ActionTypes.RETRIEVE_ONE,
                    payload: +params['id']
                });
                this.store.dispatch({
                    type: translatableActions.ActionTypes.RETRIEVE,
                    payload: +params['id']
                });
            });

        this.translatable$ = this.store.select('translatablesState')
            .map((state: fromTranslatable.State) => state.currentTranslatable);

        this.translatables$ = this.store.select('translatablesState')
            .map((state: fromTranslatable.State) => state.filteredTranslatables);

        this.language$ = this.store.select('languagesState')
            .map((state: fromLanguage.State) => state.currentLanguage);

        this.subscriptions.push(
            this.language$
                .filter((language: Language) => !!language)
                .subscribe((language: Language) => {
                    this.createToolbarConfig(language);
                })
        );

        this.loadingList$ = this.store.select('translatablesState')
            .map((state: fromTranslatable.State) => state.loadingTranslatables);

        this.loadingDetail$ = this.store.select('translationsState')
            .map((state: fromTranslation.State) => state.loadingTranslation);

        /**
         *
         * Get values of translation, translatable and language to be availabe in toolbar
         */
        this.translation$ = this.store.select('translationsState')
            .map((state: fromTranslation.State) => state.translation);

        this.subscriptions.push(
            this.translation$.subscribe((translation: Translation) => this.translation = translation)
        );
        this.subscriptions.push(
            this.language$.subscribe((language: Language) => this.language = language)
        );
        this.subscriptions.push(
            this.translatable$.subscribe((translatable: Translatable) => this.translatable = translatable)
        );
    }

    private createToolbarConfig(language: Language) {
        this.toolbarConfig = {
            title: 'Translations of ' + language.Name + '(' + language.Code + ')'
        };
        this.saveActions = [
            {
                label: 'skip (Esc)',
                action: this.skip.bind(this),
                main: false,
                disabled: false
            },
            {
                label: 'Approve (Enter)',
                action: this.approve.bind(this),
                main: true,
                disabled: false
            }
        ];
        this.tabService.addTab({
            name: 'Translate ' + language.Code,
            url: '/admin/languages/' + language.ID + '/translations',
            moduleID: UniModules.Translations,
            active: true
        });
    }

    public ngAfterViewInit() {
        this.subscriptions.push(
            Observable.fromEvent(document, 'keydown')
                .subscribe((event: KeyboardEvent) => {
                    if (event.keyCode === KeyCodes.ENTER) {
                        this.approve(() => {});
                    }
                })
        );
    };

    private approve(done: (message: string) => void) {
        this.translation.LanguageID = this.language.ID;
        this.translation.TranslatableID = this.translatable.ID;

        let actionType: string;
        if (this.translation.ID === 0) {
            actionType = translationActions.ActionTypes.CREATE;
        } else {
            actionType = translationActions.ActionTypes.UPDATE;
        }
        this.store.dispatch({
            type: actionType,
            payload: this.translation
        });
        done('Approving translation');
    }

    private skip(done: (message: string) => void) {
        this.store.dispatch({
            type: translatableActions.ActionTypes.NEXT,
            payload: null
        });
        done('');
    }

    private select(translatable: Translatable) {
        this.store.dispatch({
            type: translatableActions.ActionTypes.SET_CURRENT_TRANSLATABLE,
            payload: translatable
        });
        this.store.dispatch({
            type: translationActions.ActionTypes.RETRIEVE_ONE,
            payload: {
                translatable: translatable,
                language: this.language
            }
        });
    }

    public ngOnDestroy() {
        this.subscriptions.forEach((s: Subscription) => s.unsubscribe());
    }
}