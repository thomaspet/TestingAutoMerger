import { Component, Input, Output, EventEmitter, OnChanges, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { UniFieldLayout, FieldType, UniAutocompleteInput } from 'uniform-ng2/main';
import { ErrorService } from '../../../services/services';
import * as _ from 'lodash';

export interface IUniTagsConfig {
    description?: string;
    helpText?: string;
    lookupLabel?: string;
    truncate?: number;
    readOnly?: boolean;
    toolTip?: string;
    autoCompleteConfig?: ITagAutoComplete;
}

export interface ITag {
    linkID?: number;
    title: string;
}

export interface ITagAutoComplete {
    template: (obj: any) => string;
    source?: any[];
    search?: (query: string, ignoreFilter?: string) => Observable<any>;
    valueProperty: string;
    saveCallback: (tag: any) => Observable<ITag>;
    deleteCallback: (tag: ITag) => Observable<boolean>;
}

@Component({
    selector: 'uni-tags',
    template: `
    <div (clickOutside)="isOpen = false">
        <button type="button"
            class="tags_toggle"
            (click)="isOpen = !isOpen">
            {{config?.description || ''}}
            {{summary(tags)}}
        </button>

        <article class="tags_control"
            [attr.aria-expanded]="isOpen"
            [title]="config?.toolTip || ''">

            <small *ngIf="config?.helpText">{{config.helpText}}</small>

            <ul class="tags_list" 
                [attr.aria-readonly]="config?.readOnly"
                [attr.aria-busy]="listBusy">
                <li class="tags_tag"
                    *ngFor="let tag of tags">
                    {{tag.title}}
                    <button type="button"
                        class="tags_tag_removeBtn"
                        (click)="remove(tag)">
                        Delete {{tag.title}}
                    </button>
                </li>
            </ul>
            <section class="tags_lookup" *ngIf="config && !config.readOnly">
                <label>
                    {{config?.lookupLabel || 'Søk opp kategori'}}

                    <input *ngIf="!autoCompleteField" [(ngModel)]="newTag" (keydown.enter)="add(newTag)"/>
                    <button class="good"
                        *ngIf="!autoCompleteField"
                        type="button"
                        (click)="add(newTag)">
                        Legg til
                    </button>
                    <uni-autocomplete-input *ngIf="autoCompleteField"
                        [attr.aria-busy]="searchBusy"
                        [field]="autoCompleteField"
                        [model]="autoCompleteModel">
                    </uni-autocomplete-input>
                </label>
            </section>
        </article>
    </div>
    `
})
export class UniTags implements OnChanges {
    @Input() public config: IUniTagsConfig;
    @Input() public tags: ITag[];
    @Output() public tagsChange: EventEmitter<any> = new EventEmitter();
    @ViewChild(UniAutocompleteInput) public autoComplete: UniAutocompleteInput;

    private isOpen: boolean = false;
    private newTag: string = '';
    private autoCompleteModel: any = null;
    private autoCompleteField: UniFieldLayout;
    private searchBusy: boolean;
    private listBusy: boolean;
    private ignoreFilter: string;

    constructor(
        private errorService: ErrorService
    ) {

    }

    public ngOnChanges(change) {
        if (change['config']
            && this.config.autoCompleteConfig
            && this.config.autoCompleteConfig.search) {
            this.autoCompleteField = new UniFieldLayout();
            this.autoCompleteField.Property = '';
            this.autoCompleteField.FieldType = FieldType.AUTOCOMPLETE;
            this.autoCompleteField.Options = {
                template: this.config.autoCompleteConfig.template,
                source: this.config.autoCompleteConfig.source,
                search: (query) => this.config.autoCompleteConfig.search(query, this.ignoreFilter),
                valueProperty: this.config.autoCompleteConfig.valueProperty,
                events: { select: (model, value) => this.add(value) }
            };
        }

        if (change['tags']) {
            this.buildNewIgnoreFilter(this.tags);
        }
    }

    private summary(tags: ITag[]): string {
        let _tags: string[] = [];
        let _skipped: number = 0;
        let _truncate: number = 20;
        if (this.config && this.config.truncate) {
            _truncate = this.config.truncate;
        }

        this.tags.forEach((tagObj, i) => {
            let tag: string = tagObj.title;
            let currentString: string = _tags.join(', ');
            if (currentString.length + tag.length >= _truncate) {
                _skipped++;
            } else {
                _tags.push(tag);
            }
        });

        if (!_skipped) {
            return _tags.join(', ');
        } else {
            return _tags.join(', ') + ' og ' + _skipped + ' til…';
        }
    }

    public remove(tag: ITag): void {
        if (!this.config.readOnly) {
            Observable
                .of(true)
                .do(() => this.listBusy = true)
                .switchMap(isDeleted => {
                    let autoCompConfig = this.config.autoCompleteConfig;
                    return (autoCompConfig && autoCompConfig.deleteCallback)
                        ? autoCompConfig.deleteCallback(tag)
                        : Observable.of(isDeleted);
                })
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                .filter(isDeleted => isDeleted)
                .finally(() => this.listBusy = false)
                .subscribe(isDeleted => {
                    this.tags.splice(this.tags.findIndex(tg => tg.linkID ? tg.linkID === tag.linkID : tg.title === tag.title), 1);
                    this.tagsChange.emit(this.tags);
                    this.buildNewIgnoreFilter(this.tags);
                });
        }
    }

    public add(tag: any) {
        Observable
            .of(tag)
            .do(() => this.clearAutoComplete())
            .filter(newTag => !!newTag)
            .map(newTag => typeof newTag === 'string'
                ? {title: newTag}
                : newTag)
            .do(() => this.searchBusy = true)
            .switchMap(newTag => {
                let autoCompConfig = this.config.autoCompleteConfig;
                return (autoCompConfig && autoCompConfig.saveCallback)
                    ? autoCompConfig.saveCallback(newTag)
                    : Observable.of(newTag);
            })
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .finally(() => this.searchBusy = false)
            .subscribe((newTag) => this.handleNewTags(newTag));
    }

    private handleNewTags(tag: ITag) {
        if (!this.tags.some(tg => this.tagsEqual(tag, tg))) {
            this.tags.push(tag);
            this.newTag = '';
            this.tagsChange.emit(this.tags);
            this.buildNewIgnoreFilter(this.tags);
        }
    }

    private tagsEqual(tag1: ITag, tag2: ITag) {
        if (tag1.linkID && tag2.linkID) {
            return tag1.linkID === tag2.linkID;
        }

        if ((tag1.linkID || tag2.linkID)) {
            return false;
        }
        
        return tag1.title === tag2.title;
    }

    private clearAutoComplete(): void {
        if (this.autoCompleteField) {
            this.autoCompleteField = _.cloneDeep(this.autoCompleteField);
        }
    }

    private buildNewIgnoreFilter(tags: ITag[]) {
        this.ignoreFilter = tags.map(x => 'ID ne ' +  x.linkID).join(' and ');
    }

}
