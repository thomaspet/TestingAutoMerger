import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UniStatusTrack } from '../../common/toolbar/statustrack';
import {IContextMenuItem} from 'unitable-ng2/main';

export interface IToolbarConfig {
    title?: string;
    subheads?: {
        title: string;
        classname?: string;
    }[];
    statustrack?: UniStatusTrack.IStatus[];
    navigation?: {
        find?: (query: string) => void;
        prev?: () => void;
        next?: () => void;
        add?: () => void;
    };
    contextmenu?: IContextMenuItem[];
    hideBreadcrumbs?: boolean;
}

@Component({
    selector: 'uni-toolbar',
    templateUrl: 'app/components/common/toolbar/toolbar.html'
})
export class UniToolbar {
    @Input() public config: IToolbarConfig;
    @Output() public statusSelectEvent: EventEmitter<any> = new EventEmitter();
    public navigate(type: string, arg: any) {
        this.config.navigation[type](arg);
    }
    public selectStatus(event) {
        this.statusSelectEvent.emit(event);
    }
}
