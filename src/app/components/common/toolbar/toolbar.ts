import { IUniSaveAction } from './../../../../framework/save/save';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UniStatusTrack } from '../../common/toolbar/statustrack';
import { IContextMenuItem } from 'unitable-ng2/main';
import { UniFieldLayout, FieldType } from 'uniform-ng2/main';
import { Observable } from 'rxjs/Observable';

export interface IToolbarConfig {
    title?: string;
    subheads?: {
        title: string;
        classname?: string;
        link?: string;
        event?: () => void;
    }[];
    statustrack?: UniStatusTrack.IStatus[];
    navigation?: {
        find?: (query: string) => void;
        prev?: () => void;
        next?: () => void;
        add?: () => void;
    };
    contextmenu?: IContextMenuItem[];
    saveactions?: IUniSaveAction[];
    hideBreadcrumbs?: boolean;
    omitFinalCrumb?: boolean;
    entityID?: any;
    entityType?: string;
}

export interface ICommentsConfig {
    entityName: string;
    entityID: number;
    // more?
}

export interface IAutoCompleteConfig {
    template: (obj: any) => string;
    events: {
        select: (model, value) => void;
    };
    source?: any[];
    search?: (query: string) => Observable<any>;
    valueProperty: string;
}

@Component({
    selector: 'uni-toolbar',
    templateUrl: 'app/components/common/toolbar/toolbar.html'
})
export class UniToolbar {
    @Input()
    public tags: any;

    @Input()
    public tagConfig: any;

    @Input()
    public config: IToolbarConfig;

    @Input()
    public saveactions: IUniSaveAction[];

    @Input()
    public contextmenu: IContextMenuItem[];

    @Input()
    public statustrack: UniStatusTrack.IStatus[];

    @Input()
    public commentsConfig: ICommentsConfig;

    @Input()
    public autocompleteConfig: IAutoCompleteConfig;

    @Input()
    public autocompleteModel: any = {};

    @Output()
    public tagsChange: EventEmitter<any> = new EventEmitter();

    @Output()
    public statusSelectEvent: EventEmitter<any> = new EventEmitter();

    @Output()
    public autocompleteReadyEvent: EventEmitter<any> = new EventEmitter();

    @Output()
    public autocompleteChangeEvent: EventEmitter<any> = new EventEmitter();

    @Output()
    public autocompleteFocusEvent: EventEmitter<any> = new EventEmitter();
    private autocompleteField: UniFieldLayout;

    public ngOnChanges(change) {
        if (this.config) {
            if (this.config.saveactions) {
                console.warn(`
                    ATTN. DEVELOPERS
                    For change detection reasons some fields has been moved out of toolbar config and into separate inputs.
                    See example below. Ask Anders or Jørgen if you have any questions.
                    <uni-toolbar [saveactions]="foo"
                                 [contextmenu]="bar"
                                 [statustrack]="baz"
                                 [config]="config">
                    </uni-toolbar>
                `);
            }
        }

        if (change['autocompleteConfig']) {
            this.autocompleteField = new UniFieldLayout();
            this.autocompleteField.Property = '';
            this.autocompleteField.FieldType = FieldType.AUTOCOMPLETE;
            this.autocompleteField.Options = this.autocompleteConfig;
        }
    }

    public navigate(type: string, arg: any) {
        this.config.navigation[type](arg);
    }

    public selectStatus(event) {
        this.statusSelectEvent.emit(event);
    }

    public tagsChangeEvent(tags) {
        this.tagsChange.emit(tags);
    }

    private triggerSubheadEvent(subhead) {
        if (subhead.event) {
            return subhead.event();
        }
    }
}
