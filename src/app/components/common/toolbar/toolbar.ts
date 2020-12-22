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
import {ToolbarSharingStatus} from './sharing-status/sharing-status';
import {FeaturePermissionService} from '@app/featurePermissionService';
export {IToolbarValidation} from './toolbar-validation/toolbar-validation';
export {IToolbarSearchConfig} from './toolbarSearch';

export interface IToolbarSubhead {
    label?: string;
    title: string;
    classname?: string;
    link?: string;
    icon?: string;
    event?: () => void;
}

export interface ToolbarButton {
    label?: string;
    icon?: string;
    class?: string;
    action: () => any | Observable<any>;
    tooltip?: string;
}

export interface ToolbarDropdownButton {
    label: string;
    class?: string;
    items: { label: string, action: () => any }[];
}

export interface IToolbarCreateNewAction {
    label: string;
    action: () => void;
}

export interface StatusIndicator {
    label: string;
    class?: string;
    icon?: string;
    subStatuses?: {label: string, timestamp?: Date, status?: string}[];
    link?: string;
    outlined?: boolean;
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
    period?: Date;
    infoBannerConfig?: IInfoBannerConfig;
    payments?: any[];
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

export interface IInfoBannerConfig {
    message: string;
    link: string;
    action: () => void;
}

@Component({
    selector: 'uni-toolbar',
    templateUrl: './toolbar.html'
})
export class UniToolbar {
    @ViewChild(ToolbarSharingStatus) sharingStatus: ToolbarSharingStatus;
    @ViewChild(UniSave) save: UniSave;

    @Input() tags: ITag[];
    @Input() tagConfig: IUniTagsConfig;
    @Input() config: IToolbarConfig;
    @Input() saveactions: IUniSaveAction[];
    @Input() contextmenu: IContextMenuItem[];
    @Input() statustrack: IStatus[];
    @Input() showFullStatustrack: boolean;
    @Input() customStatus: StatusIndicator;
    @Input() commentsConfig: ICommentsConfig;
    @Input() searchConfig: IToolbarSearchConfig;
    @Input() selectConfig: any;
    @Input() subheads: IToolbarSubhead[];
    @Input() validationMessages: IToolbarValidation[];
    @Input() dropdownButton: ToolbarDropdownButton;

    @Output() tagsChange = new EventEmitter();
    @Output() tagsBusy: EventEmitter<boolean> = new EventEmitter();

    @Output() statusSelectEvent = new EventEmitter();
    @Output() selectValueChanged = new EventEmitter();

    @Output() monthChange = new EventEmitter();

    searchVisible: boolean;
    canShowChat = true;

    uniSelectConfig: ISelectConfig = {
        displayProperty: '_DisplayName',
        searchable: false,
        hideDeleteButton: true
    };

    constructor(
        private errorService: ErrorService,
        private permissionService: FeaturePermissionService
    ) {
        this.canShowChat = this.permissionService.canShowUiFeature('ui.chat');
    }

    ngOnChanges(changes) {
        if (changes['selectConfig']) {
            this.selectConfig = cloneDeep(this.selectConfig);
        }
    }

    refreshSharingStatuses() {
        if (this.sharingStatus) {
            this.sharingStatus.loadStatuses();
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
        // Use setTimeout to allow any change event from a previously focused input to be handled first.
        // (in case the button is used for saving something)
        setTimeout(() => {
            if (!button['_busy']) {
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
        });
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
