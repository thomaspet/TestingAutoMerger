import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import * as languageActions from '../../language/actions';
import *  as fromLanguage from '../../language/reducer';
import {Observable} from 'rxjs';
import {Language} from '../../../../unientities';
import {TranslationsState} from '../../reducers';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {UniModules, TabService} from '../../../layout/navbar/tabstrip/tabService';

/**
 * Containers are called also smart components
 * Containers get data from state and distributes it
 * along their childrend.
 *
 * Usually using this pattern all childer use OnPush strategy
 * because they depend on inputs to be displayed
 * That will increase components performance because they disable "dirty checking"
 * and refreshing just runs when a new state is generated.
 *
 * Data retrieved form Store. Store is just a behaviourSubject object that
 * contains the state, so you can manage store as a normal Observable.
 * Store can also 'dipatch' new actions.
 */
@Component({
    selector: 'uni-languages-container',
    template: `
        <uni-toolbar [config]="toolbarConfig" 
                     [saveactions]="saveActions">
        </uni-toolbar>
        <section class="application">
            <uni-languages-list [languages]='languages$ | async'></uni-languages-list>
            <uni-add-language></uni-add-language>
            <uni-delete-language></uni-delete-language>
        </section>
    `
})
export class LanguagesContainer {
    private languages$: Observable<{}>;
    private toolbarConfig: IToolbarConfig;
    private saveActions: IUniSaveAction[];
    constructor(private tabService: TabService, private store: Store<TranslationsState>) {}

    public ngOnInit() {
        this.toolbarConfig = {
            title: 'Languages'
        };
        this.saveActions = [{
            label: 'Create new Language',
            action:  this.openModal.bind(this),
            main: true,
            disabled: false
        }];
        this.store.dispatch({
            type: languageActions.ActionTypes.RETRIEVE,
            payload: null
        });
        this.languages$ = this.getLanguages();
        this.tabService.addTab({
            name: 'Languages',
            url: '/admin/languages/',
            moduleID: UniModules.Translations,
            active: true
        });
    }

    private openModal(done: (message: string) => void) {
        this.store.dispatch({
            type: languageActions.ActionTypes.OPEN_LANGUAGE_MODAL,
            payload: new Language()
        });
        done('');

    }

    private getLanguages() {
        return this.store.select('languagesState')
            .map((state: fromLanguage.State) => state.languages);
    }
}
