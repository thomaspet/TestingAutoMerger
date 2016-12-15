import { IUniSaveAction } from './../../../../framework/save/save';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UniStatusTrack } from '../../common/toolbar/statustrack';
import {IContextMenuItem} from 'unitable-ng2/main';

export interface IToolbarConfig {
    title?: string;
    subheads?: {
        title: string;
        classname?: string;
        link?: string;
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
}

export interface ICommentsConfig {
    entityName: string;
    entityID: number;
    // more?
}

@Component({
    selector: 'uni-toolbar',
    templateUrl: 'app/components/common/toolbar/toolbar.html'
})
export class UniToolbar {
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
}
