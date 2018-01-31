import {Component, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {IUniSaveAction, UniSave} from './../../../../framework/save/save';
import {IStatus} from '../../common/toolbar/statustrack';
import {IContextMenuItem} from '../../../../framework/ui/unitable/index';
import {UniFieldLayout, FieldType} from '../../../../framework/ui/uniform/index';
import {Observable} from 'rxjs/Observable';
import {IUniTagsConfig, ITag} from './tags';
import {ISelectConfig} from '../../../../framework/ui/uniform/index';
import {VideoMappingService} from '../../../services/services';
import {IToolbarSearchConfig} from './toolbarSearch';
declare const _; // lodash

export {IToolbarSearchConfig} from './toolbarSearch';
export interface IToolbarConfig {
    title?: string;
    subheads?: {
        title: string;
        classname?: string;
        link?: string;
        event?: () => void;
    }[];
    statustrack?: IStatus[];
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
export class UniToolbar {
    @ViewChild('toolbarExtras')
    private extrasElement: ElementRef;
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
    @Input() public selectConfig: any = {};

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

    @Output()
    public selectValueChanged: EventEmitter<any> = new EventEmitter();

    private autocompleteField: UniFieldLayout;
    public videoURLResolver: Promise<string|null>;

    public uniSelectConfig: ISelectConfig = {
        displayProperty: '_DisplayName',
        searchable: false
    };

    constructor(private videoMappingService: VideoMappingService) {}

    public ngOnInit() {
        this.videoURLResolver = this.videoMappingService.getVideo(window.location.href);
    }

    public ngOnChanges(change) {
        if (this.config) {
            this.checkExtrasOverflow();

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

    public ngAfterViewInit() {
        Observable.fromEvent(window, 'resize')
            .throttleTime(250)
            .subscribe(() => {
                this.checkExtrasOverflow();
            });
    }

    public checkExtrasOverflow() {
        let extras: HTMLElement = this.extrasElement && this.extrasElement.nativeElement;
        if (extras && extras.scrollHeight > extras.clientHeight) {
            extras.style.position = 'absolute';
            extras.style.top = '0';
            extras.style.left = '18%';
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
