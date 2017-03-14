import {Component, ChangeDetectionStrategy} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Store} from '@ngrx/store';
import {ISelectConfig} from 'uniform-ng2/main';
import {i18nModule} from '../../../../../unientities';
import {TranslationsState} from '../../../reducers';
import * as translatableActions from '../../../translatable/actions';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/debounceTime';
import {Subscription} from 'rxjs/Subscription';
import * as fromTranslatable from '../../../translatable/reducer';
import {Observable} from 'rxjs/Observable';

interface i18nModuleItem {
    ID: number;
    Name: string;
}

@Component({
    selector: 'uni-translatables-filter',
    template: `
        <uni-select
            [config]="config"
            [items]="i18nModules"
            [value]="selectedModule"
            (valueChange)="select($event)">
        </uni-select>
        <input type="text" [formControl]="queryControl"/>
        <input type="checkbox" [checked]="includeAlreadyTranslated$ | async"/>
        <label (click)="toggleTranslatables()">
            Include already translated
        </label>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTranslatablesFilter {
    public i18nModules: i18nModuleItem[] = [];
    public selectedModule: i18nModuleItem;
    public queryControl: FormControl;
    public controlSubscription: Subscription;
    public includeAlreadyTranslated$: Observable<boolean>;
    public config: ISelectConfig = {
        displayProperty: 'Name'
    };

    constructor(private store: Store<TranslationsState>) {
        this.i18nModules = this.createi18nModuleItemArray();
        this.selectedModule = this.i18nModules[0];
        this.queryControl = new FormControl('');
        this.includeAlreadyTranslated$ = this.store.select('translatablesState')
            .map((state: fromTranslatable.State) => state.includeAlreadyTranslated);
        this.controlSubscription = this.queryControl.valueChanges
            .debounceTime(300)
            .subscribe((value) => {
                this.store.dispatch({
                    type: translatableActions.ActionTypes.FILER_BY_QUERY,
                    payload: value
                });
            });
    }

    private createi18nModuleItemArray() {
        const i18nModules: i18nModuleItem[] = [{
            ID: -1,
            Name: 'All modules'
        }];
        const keys = Object.keys(i18nModule);
        keys.forEach((key: string) => {
            if (Number(key) || key === '0') {
                i18nModules.push({
                    ID: Number(key),
                    Name: <string>i18nModule[key]
                });
            }
        });
        return i18nModules;
    }

    private select(item: i18nModuleItem) {
        this.store.dispatch({
            type: translatableActions.ActionTypes.FILER_BY_MODULE,
            payload: item.ID
        });
    }

    private toggleTranslatables() {
        this.store.dispatch({
            type: translatableActions.ActionTypes.TOGGLE_SHOW_JUST_TRANSLATED,
            payload: null
        });
    }

    public ngOnDestroy(){
        this.controlSubscription.unsubscribe();
    }
}
