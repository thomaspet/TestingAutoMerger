import { Component, Input } from '@angular/core';
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
        find?: any;
        prev?: any;
        next?: any;
        add?: any;
    };
    contextmenu?: IContextMenuItem[];
    hide?: {
        breadcrumbs: boolean;
        statustrack: boolean;
        navigation: boolean;
        search: boolean;
        title: boolean;
    };
}

@Component({
    selector: 'uni-toolbar',
    templateUrl: 'app/components/common/toolbar/toolbar.html'
})
export class UniToolbar {
    @Input() public config: IToolbarConfig;
    public navigate(type: string, arg: any) {
        this.config.navigation[type](arg);
    }
}
