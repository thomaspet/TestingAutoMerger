import {Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, OnChanges, AfterViewInit} from '@angular/core';
import {IUniSaveAction, UniSave} from './../../../../framework/save/save';
import {IStatus} from '../../common/toolbar/statustrack';
import {IContextMenuItem} from '../../../../framework/ui/unitable/index';
import {UniFieldLayout, FieldType} from '../../../../framework/ui/uniform/index';
import {IUniTagsConfig, ITag} from './tags';
import {ISelectConfig} from '../../../../framework/ui/uniform/index';
import {IToolbarSearchConfig} from './toolbarSearch';
import {IToolbarValidation} from './toolbar-validation/toolbar-validation';
import {Observable} from 'rxjs';
declare const _; // lodash

export {IToolbarValidation} from './toolbar-validation/toolbar-validation';
export {IToolbarSearchConfig} from './toolbarSearch';

export interface IToolbarSubhead {
    label?: string;
    title: string;
    classname?: string;
    link?: string;
    event?: () => void;
}

export interface IToolbarCreateNewAction {
    label: string;
    action: () => void;
}

export interface IToolbarConfig {
    title?: string;
    subheads?: IToolbarSubhead[];
    statustrack?: IStatus[];
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
    numberSeriesTasks?: any;
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

export interface IShareAction {
    label: string;
    action: () => Observable<any>;
    disabled?: () => boolean;
}

@Component({
    selector: 'uni-toolbar',
    templateUrl: './toolbar.html'
})
export class UniToolbar implements OnInit, OnChanges {
    @ViewChild('toolbarRight') private toolbarRight;

    @ViewChild(UniSave) private save: UniSave;

    @Input() public tags: ITag[];
    @Input() public tagConfig: IUniTagsConfig;
    @Input() public config: IToolbarConfig;
    @Input() public shareActions: IShareAction[];
    @Input() public saveactions: IUniSaveAction[];
    @Input() public contextmenu: IContextMenuItem[];
    @Input() public statustrack: IStatus[];
    @Input() public commentsConfig: ICommentsConfig;
    @Input() public autocompleteConfig: IAutoCompleteConfig;
    @Input() public autocompleteModel: any = {};
    @Input() public searchConfig: IToolbarSearchConfig;
    @Input() public selectConfig: any;
    @Input() public subheads: IToolbarSubhead[];
    @Input() public validationMessages: IToolbarValidation[];

    @Output()
    public tagsChange: EventEmitter<any> = new EventEmitter();
    @Output()
    public tagsBusy: EventEmitter<boolean> = new EventEmitter();

    @Output()
    public statusSelectEvent: EventEmitter<any> = new EventEmitter();

    @Output()
    public autocompleteReadyEvent: EventEmitter<any> = new EventEmitter();

    @Output()
    public autocompleteChangeEvent: EventEmitter<any> = new EventEmitter();

    @Output()
    public autocompleteFocusEvent: EventEmitter<any> = new EventEmitter();

    @Output()
    public selectValueChanged: EventEmitter<any> = new EventEmitter();

    private autocompleteField: UniFieldLayout;
    public searchVisible: boolean;

    public uniSelectConfig: ISelectConfig = {
        displayProperty: '_DisplayName',
        searchable: false,
        hideDeleteButton: true
    };

    public ngOnInit() {
        Observable.fromEvent(window, 'resize')
            .throttleTime(200)
            .subscribe(event => {
                if (window.innerWidth <= 1100 && this.toolbarRight) {
                    const container = this.toolbarRight.nativeElement;
                    const tools = container.querySelector('#toolbar-tools');
                    const save = container.querySelector('#toolbar-save');

                    const width = Math.max(
                        tools && tools.clientWidth,
                        save && save.clientWidth
                    );

                    container.setAttribute('style', `flex-basis: ${width + 'px'};`);
                }
            });
    }

    public ngOnChanges(change) {
        if (this.config) {
            if (this.config.saveactions) {
                console.warn(`
                    ATTN. DEVELOPERS
                    For change detection reasons some fields has been moved out `
                    + `of toolbar config and into separate inputs.
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

        if (change['selectConfig']) {
            this.selectConfig = _.cloneDeep(this.selectConfig);
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
