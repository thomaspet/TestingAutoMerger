import {Component, Input, Output, EventEmitter, OnChanges, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {UniFieldLayout, FieldType, UniFormAutocomplete} from '../../../../framework/ui/uniform';
import {ErrorService} from '../../../services/services';
import * as _ from 'lodash';

export interface IUniTagsConfig {
    description?: string;
    helpTextOnEmpty?: string;
    helpText?: string;
    lookupLabel?: string;
    truncate?: number;
    readOnly?: boolean;
    toolTip?: string;
    readOnlyMessage?: string;
    autoCompleteConfig?: ITagAutoComplete;
    template?: (obj: ITag) => string;
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
        <section (clickOutside)="isOpen = false">
            <span class="tags-toggle" (click)="isOpen = !isOpen">
                <i class="material-icons">
                    {{isOpen ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}}
                </i>
                {{config?.description || ''}} {{tagsSummary()}}
            </span>
            <section class="tags-dropdown" *ngIf="isOpen">
                <p *ngIf="config?.helpText" style="margin-top: 0;">
                    {{config.helpText}}
                </p>
                <ul class="tag-list" [attr.aria-busy]="removeBusy">
                    <li *ngFor="let tag of tags">
                        {{config.template ? config.template(tag) : tag.title}}
                        <i class="material-icons" *ngIf="config && !config.readOnly" (click)="remove(tag)">
                            close
                        </i>
                    </li>
                </ul>
                <section class="tags_lookup" *ngIf="config && !config.readOnly">
                    <label>
                        {{config?.lookupLabel || 'Legg til'}}
                        <uniform-autocomplete *ngIf="autoCompleteField"
                            [attr.aria-busy]="searchBusy"
                            [field]="autoCompleteField"
                            [model]="autoCompleteModel"
                            (readyEvent)="searchReady()">
                        </uniform-autocomplete>
                    </label>
                </section>
            </section>
        </section>
    `
})
export class UniTags implements OnChanges {
    @Input() public config: IUniTagsConfig;
    @Input() public tags: ITag[];
    @Output() public tagsChange: EventEmitter<any> = new EventEmitter();
    @Output() public tagsBusy: EventEmitter<boolean> = new EventEmitter();
    @ViewChild(UniFormAutocomplete, { static: false }) public autoComplete: UniFormAutocomplete;

    public isOpen: boolean = false;
    public helpText: string;
    public autoCompleteModel: any = null;
    public autoCompleteField: UniFieldLayout;
    public searchBusy: boolean;
    public removeBusy: boolean;
    private ignoreFilter: string;

    constructor(private errorService: ErrorService) {}

    public ngOnChanges(change) {
        if (change['config']
            && this.config.autoCompleteConfig
            && this.config.autoCompleteConfig.search
        ) {
            this.autoCompleteField = new UniFieldLayout();
            this.autoCompleteField.Property = '';
            this.autoCompleteField.FieldType = FieldType.AUTOCOMPLETE;
            this.autoCompleteField.Options = {
                template: this.config.autoCompleteConfig.template,
                source: this.config.autoCompleteConfig.source,
                search: (query: string) => this.config.autoCompleteConfig.search(query, this.ignoreFilter),
                valueProperty: this.config.autoCompleteConfig.valueProperty,
                events: { select: (model: any, value: any) => this.add(value) }
            };
        }

        if (change['tags']) {
            this.buildNewIgnoreFilter(this.tags);
        }

        this.helpText = this.getHelpText(this.config, this.tags);
    }

    public searchReady() {
        this.autoComplete.focus();
    }

    public tagsSummary(): string {
        const tagCount = (this.tags && this.tags.length) || 0;
        return tagCount === 1 ? tagCount + ' kategori' : tagCount + ' kategorier';
    }

    public remove(tag: ITag): void {
        const config = this.config.autoCompleteConfig;
        if (config && config.deleteCallback) {
            this.setRemoveBusy(true);
            config.deleteCallback(tag)
                .finally(() => this.setRemoveBusy(false))
                .subscribe(
                    () => {
                        this.tags.splice(
                            this.tags.findIndex(tg => tg.linkID ? tg.linkID === tag.linkID : tg.title === tag.title), 1
                        );
                        this.tagsChange.emit(this.tags);
                        this.buildNewIgnoreFilter(this.tags);
                    },
                    err => this.errorService.handle(err)
            );
        }
    }

    public add(tag: any) {
        const config = this.config.autoCompleteConfig;
        this.setSearchBusy(true);

        const saveObservable = config && config.saveCallback
            ? config.saveCallback(tag)
            : Observable.of(tag);

        saveObservable.subscribe(
            res => this.handleNewTags(res),
            err => { this.errorService.handle(err); this.setSearchBusy(false); },
            () => this.setSearchBusy(false)
        );
    }

    private setSearchBusy(busy: boolean) {
        this.searchBusy = busy;
        this.tagsBusy.next(this.searchBusy || this.removeBusy);
    }

    private setRemoveBusy(busy: boolean) {
        this.removeBusy = busy;
        this.tagsBusy.next(this.searchBusy || this.removeBusy);
    }

    private getHelpText(config: IUniTagsConfig, tag: ITag[]): string {
        if (!config) {
            return '';
        }
        if (!config.helpTextOnEmpty) {
            return config.helpText;
        }
        if (!tag || !tag.length) {
            return config.helpTextOnEmpty;
        }
        return config.helpText;
    }

    private handleNewTags(tag: ITag) {
        if (!this.tags.some(tg => this.tagsEqual(tag, tg))) {
            this.tags.push(tag);
            this.tagsChange.emit(this.tags);
            this.buildNewIgnoreFilter(this.tags);
            if (this.autoComplete && this.autoComplete.control) {
                this.autoComplete.control.setValue('');
            }
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

    private buildNewIgnoreFilter(tags: ITag[]) {
        this.ignoreFilter = tags.map(x => 'ID ne ' +  x.linkID).join(' and ');
    }
}
