import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {IUniSaveAction, UniSave} from '@uni-framework/save/save';
import {IStatus} from '../../common/toolbar/statustrack';
import {IUniTagsConfig, ITag} from './tags';
import {ISelectConfig} from '@uni-framework/ui/uniform';
import {IToolbarSearchConfig} from './toolbarSearch';
import {IToolbarValidation} from './toolbar-validation/toolbar-validation';
import {Observable} from 'rxjs';
import {cloneDeep} from 'lodash';
import {finalize, take} from 'rxjs/operators';
import {ErrorService} from '@app/services/services';
export {IToolbarValidation} from './toolbar-validation/toolbar-validation';
export {IToolbarSearchConfig} from './toolbarSearch';

export interface IToolbarSubhead {
    label?: string;
    title: string;
    classname?: string;
    link?: string;
    event?: () => void;
}

export interface ToolbarButton {
    label?: string;
    icon?: string;
    class?: string;
    action: () => any | Observable<any>;
}

export interface IToolbarCreateNewAction {
    label: string;
    action: () => void;
}

export interface StatusIndicator {
    label: string;
    class: string;
    tooltip: string;
}

export interface IToolbarConfig {
    title?: string;
    subheads?: IToolbarSubhead[];
    statustrack?: IStatus[];
    sharingStatusConfig?: {entityType: string, entityID: number};
    navigation?: {
        find?: (query: string) => void;
        prev?: () => void;
        next?: () => void;
        add?: IToolbarCreateNewAction | (() => void);
    };
    contextmenu?: IContextMenuItem[];
    saveactions?: IUniSaveAction[];
    hideBreadcrumbs?: boolean;
    omitFinalCrumb?: boolean;
    entityID?: any;
    entityType?: string;
    showSharingStatus?: boolean;
    numberSeriesTasks?: any;
    buttons?: ToolbarButton[];
    hideDisabledActions?: boolean;
}

export interface ICommentsConfig {
    entityType: string;
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

export interface IContextMenuItem {
    label: string;
    action: (item?: any) => void | Observable<any>;
    disabled?: (item?: any) => boolean;
}

@Component({
    selector: 'uni-toolbar',
    templateUrl: './toolbar.html'
})
export class UniToolbar {
    @ViewChild(UniSave) save: UniSave;

    @Input() tags: ITag[];
    @Input() tagConfig: IUniTagsConfig;
    @Input() config: IToolbarConfig;
    @Input() saveactions: IUniSaveAction[];
    @Input() contextmenu: IContextMenuItem[];
    @Input() statustrack: IStatus[];
    @Input() commentsConfig: ICommentsConfig;
    @Input() searchConfig: IToolbarSearchConfig;
    @Input() selectConfig: any;
    @Input() subheads: IToolbarSubhead[];
    @Input() validationMessages: IToolbarValidation[];

    @Output() tagsChange = new EventEmitter();
    @Output() tagsBusy: EventEmitter<boolean> = new EventEmitter();

    @Output() statusSelectEvent = new EventEmitter();
    @Output() selectValueChanged = new EventEmitter();

    searchVisible: boolean;

    uniSelectConfig: ISelectConfig = {
        displayProperty: '_DisplayName',
        searchable: false,
        hideDeleteButton: true
    };

    constructor(private errorService: ErrorService) {}

    ngOnChanges(changes) {
        if (changes['selectConfig']) {
            this.selectConfig = cloneDeep(this.selectConfig);
        }
    }

    public toggleSearch() {
        if (this.searchConfig) {
            this.searchVisible = !this.searchVisible;
        }
    }

    public onCreateNewClick() {
        const newAction: IToolbarCreateNewAction | (() => void) = this.config.navigation.add;
        if (typeof newAction === 'function') {
            newAction();
        } else {
            newAction.action();
        }
    }

    customButtonClick(button: ToolbarButton) {
        const result = button.action();
        if (result && result.subscribe) {
            button['_busy'] = true;
            result.pipe(
                take(1),
                finalize(() => button['_busy'] = false)
            ).subscribe(
                () => {},
                err => this.errorService.handle(err)
            );
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

    public tagsBusyEvent(busy) {
        this.tagsBusy.emit(busy);
    }

    public selectValueSelected(selectedItem) {
        this.selectValueChanged.emit(selectedItem);
    }

    public triggerSubheadEvent(subhead) {
        if (subhead.event) {
            return subhead.event();
        }
    }

    public triggerSaveAction(action: IUniSaveAction) {
        if (!action) {
            return;
        }
        this.save.onSave(action);
    }
}
