import {IUniSaveAction} from './../../../../framework/save/save';
import {Component, Input, Output, EventEmitter} from '@angular/core';
import {UniStatusTrack} from '../../common/toolbar/statustrack';
import {IContextMenuItem} from 'unitable-ng2/main';
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

@Component({
    selector: 'uni-toolbar',
    templateUrl: './toolbar.html'
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

    @Output()
    public tagsChange: EventEmitter<any> = new EventEmitter();

    @Output()
    public statusSelectEvent: EventEmitter<any> = new EventEmitter();

    public ngOnChanges() {
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
