import {Component, ViewChild, Input, Output, EventEmitter, OnInit, OnChanges} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {WorkerService} from '../../../services/timetracking/workerService';
import {Router, ActivatedRoute} from '@angular/router';
import {IUniSaveAction} from '../../../../framework/save/save';
import {UniForm, UniFieldLayout, FieldType} from '../../../../framework/ui/uniform/index';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {getDeepValue, trimLength} from '../../common/utils/utils';
import {ErrorService} from '../../../services/services';
import {UniModalService, ConfirmActions} from '../../../../framework/uni-modal';
import {BehaviorSubject} from 'rxjs';
import {Observable} from 'rxjs';

export interface IViewConfig {
    labels?: {
        single?: string;
        plural?: string;
        createNew?: string;
        ask_delete?: string;
    };
    moduleID: UniModules;
    baseUrl: string;
    title?: string;
    titleProperty?: string;
    // tab: View | { label: string, url: string };
    data: {
        route: string;
        model?: string;
        expand?: string;
        factory?: () => {}
        check?: (item: any) => void
        checkObs?: (item: any) => Observable<any>
    };
    tableConfig?: any;
    formFields?: Array<any>;
}

enum IAction {
    Save = 0,
    Delete = 1
}

const labels = {
    'action_save': 'Lagre',
    'action_delete': 'Slett',
    'deleted_ok': 'Sletting ok',
    'error': 'En feil oppstod',
    'err_loading': 'Feil ved lasting',
    'err_save': 'Feil ved lagring',
    'err_delete': 'Feil ved sletting',
    'ask_delete': 'Er du sikker på at du vil slette aktuell post? (Obs: Kan ikke angres)',
    'ask_delete_title': 'Slette?',
    'msg_saved': 'Lagret',
    'ask_save': 'Vil lagre før du fortsetter?',
    'ask_save_title': 'Lagre endringer?'
};

export interface IResult {
    success: boolean;
    msg?: string;
}

export interface IAfterSaveInfo {
    entity: any;
    promise: Promise<IResult>;
}

@Component({
    selector: 'genericdetail',
    templateUrl: './detail.html'

})
export class GenericDetailview implements OnInit, OnChanges {
    @Input() public viewconfig: IViewConfig;
    @Input() public hiddenform: boolean;
    @Output() public itemChanged: EventEmitter<any> = new EventEmitter();
    @Output() public afterSave: EventEmitter<IAfterSaveInfo> = new EventEmitter<IAfterSaveInfo>();
    @ViewChild(UniForm, { static: true }) public form: UniForm;

    public busy: boolean = true;
    public isDirty: boolean = false;
    public title: any;
    public subTitle: any;
    public ID: number;
    public current$: BehaviorSubject<any> = new BehaviorSubject(null);
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public toolbarConfig: any = { title: '' };

    public actions: IUniSaveAction[] = [
        { label: labels.action_save, action: (done) => this.save(done), main: true, disabled: false },
        { label: labels.action_delete, action: (done) => this.delete(done), main: false, disabled: true}
    ];

    constructor(
        private workerService: WorkerService,
        private route: ActivatedRoute,
        private tabService: TabService,
        private toastService: ToastService,
        private router: Router,
        private errorService: ErrorService,
        private modalService: UniModalService
    ) {
        this.route.params.subscribe(params => this.ID = +params['id']);
    }

    public ngOnInit() {
        if (this.viewconfig) {
            this.fields$.next(this.viewconfig.formFields);
        }
    }

    public ngOnChanges() {
        if (this.viewconfig) {
            this.fields$.next(this.viewconfig.formFields);
        }
    }

    private initToolbar(title: string, subTitle: string) {
        this.toolbarConfig = {
            title: title,
            subheads: [
                {title: subTitle}
            ],
            navigation: {
                prev: () => this.navigate('prev'),
                next: () => this.navigate('next'),
                add: () => {
                    this.onCreateNew();
                }
            },
            contextmenu: [
                { label: labels.action_delete,
                    action: () => {
                        this.onDelete();
                    }
                }
            ]
        };

    }

    public onReady() {
        this.loadCurrent(this.ID);
    }

    public onDelete() {
        this.delete();
    }

    public onShowList() {
        if (this.viewconfig && this.viewconfig.baseUrl) {
            this.router.navigateByUrl(this.viewconfig.baseUrl);
        }
    }

    private navigate(direction = 'next'): Promise<any> {

        this.busy = true;

        let params = 'model=' + this.viewconfig.data.model;
        let resultFld = 'minid';

        if (direction === 'next') {
            params += '&select=min(id)&filter=deleted eq \'false\'' + (this.ID ? ' and id gt ' + this.ID : '');
        } else {
            params += '&select=max(id)&filter=deleted eq \'false\'' + (this.ID ? ' and id lt ' + this.ID : '');
            resultFld = 'maxid';
        }

        return new Promise((resolve, reject) => {
            this.workerService.getStatistics(params)
                .finally( () => this.busy = false )
                .do(() => {
                    this.fields$
                        .getValue()
                        .forEach((field: UniFieldLayout) => {
                            if (field.FieldType !== FieldType.AUTOCOMPLETE) {
                                return;
                            }
                            this.form.updateField(field.Property, field);
                    });
                })
                .subscribe((data) => {
                const items = data.Data;
                if (items && items.length > 0) {
                    const key = items[0][resultFld];
                    if (key) {
                        this.loadCurrent(key);
                        resolve(true);
                    }
                }
            });
        });
    }

    public onChange() {
        this.flagDirty();
    }

    public onCreateNew() {
        this.loadCurrent(0);
    }

    public canDeactivate() {
        return this.checkSave();
    }

    private checkSave(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!this.isDirty) {
                resolve(true);
                return;
            }

            this.modalService.confirm({
                header: labels.ask_save_title,
                message: labels.ask_save,
                buttonLabels: {
                    accept: 'Lagre',
                    reject: 'Forkast',
                    cancel: 'Avbryt'
                }
            }).onClose.subscribe(response => {
                switch (response) {
                    case ConfirmActions.ACCEPT:
                        this.save(undefined)
                            .then(success => resolve(true))
                            .catch(() => resolve(false));
                    break;
                    case ConfirmActions.REJECT:
                        resolve(true); // discard changes
                    break;
                    default:
                        resolve(false);
                    break;
                }
            });
        });
    }

    public flagDirty(dirty = true) {
        this.isDirty = dirty;
        this.enableAction(IAction.Save, true);
    }

    private loadCurrent(id: number, updateTitle = true) {
        if (id) {
            this.busy = true;
            this.workerService.getByID(id, this.viewconfig.data.route, this.viewconfig.data.expand)
                .finally(() => this.busy = false)
                .switchMap(item => this.viewconfig.data.checkObs
                    ? this.viewconfig.data.checkObs(item)
                    : Observable.of(item))
                .subscribe((item: any) => {
                    this.ID = item.ID;
                    if (item) {
                        if (this.viewconfig.data && this.viewconfig.data.check) {
                            this.viewconfig.data.check(item);
                        }
                        this.current$.next(item);
                        this.enableAction(IAction.Delete);
                        this.itemChanged.emit(item);
                    }
                    if (updateTitle) {
                        this.updateTitle();
                    }
                    this.flagDirty(false);
                    this.busy = false;
                    this.initToolbar(this.title, this.subTitle);
                },
                err => this.errorService.handle(err)
                );
        } else {
            this.ID = 0;
            if (this.viewconfig.data && this.viewconfig.data.factory) {
                this.current$.next(this.viewconfig.data.factory());
                this.current$.getValue().ID = this.ID;
            }
            this.enableAction(IAction.Delete, false);
            this.busy = false;
            this.flagDirty(false);
            if (updateTitle) {
                this.updateTitle(this.viewconfig.labels.createNew);
            }
            this.itemChanged.emit(this.current$.getValue());
        }
        this.initToolbar(this.title, this.subTitle === this.title ? '' : this.subTitle );
    }

    private enableAction(actionID: IAction, enable = true) {
        this.actions[actionID].disabled = !enable;
    }

    private updateTitle(fallbackTitle?: string) {
        if (this.viewconfig) {
            const nameProp = this.viewconfig.titleProperty || 'Name';
            this.title = this.ID && this.current$.getValue()
                ? getDeepValue(this.current$.getValue(), nameProp)
                : fallbackTitle || '';
            this.subTitle = this.ID ? ` (nr. ${this.ID})` : this.viewconfig.labels.createNew;
            const tabTitle = !this.ID ? this.title : trimLength(this.title, 12);

            const url = this.viewconfig.baseUrl + '/' + this.ID;

            this.tabService.addTab({
                name: tabTitle,
                url: url,
                moduleID: this.viewconfig.moduleID,
                active: true
            });
        }
    }

    private save(done): Promise<boolean> {
        this.busy = true;
        this.ensureEditCompleted();
        return new Promise((resolve, reject) => {
            this.workerService
                .saveByID(this.current$.getValue(), this.viewconfig.data.route)
                .finally(() => this.busy = false)
                .map(item => this.mapLocalFieldsToNew(this.current$.getValue(), item))
                .subscribe((item) => {
                    this.current$.next(item);
                    this.ID = item.ID;
                    this.updateTitle();
                    this.flagDirty(false);

                    const details: IAfterSaveInfo = {entity: item, promise: undefined};
                    this.afterSave.emit(details);

                    const postActions = () => {
                        this.itemChanged.emit(this.current$.getValue());
                        if (done) { done(labels.msg_saved); }
                        this.enableAction(IAction.Delete, true);
                        resolve(true);
                        this.flagDirty(false);
                    };

                    if (details.promise) {
                        details.promise.then((result: IResult) => postActions()).catch((result: IResult) => {
                            if (done) { done('Feil ved lagring'); }
                            this.errorService.handle(result);
                            resolve(false);
                        });
                    } else {
                        postActions();
                    }

                }, (err) => {
                    this.errorService.handle(err);
                    if (done) { done(labels.err_save); }
                    resolve(false);
                });
        });
    }

    private mapLocalFieldsToNew(currentModel: any, newModel: any): any {
        const currentItem = this.current$.getValue();
        Object
            .keys(currentModel)
            .filter(key => key.startsWith('_'))
            .forEach(key => newModel[key] = currentItem[key]);
        return newModel;
    }

    private ensureEditCompleted() {
        const el: any = document.activeElement;
        if (el && el.blur) {
            el.blur();
            if (el.focus) {
                el.focus();
            }
        }
    }

    private delete(done?) {
        if (!this.ID) {
            return;
        }

        this.modalService.confirm({
            header: labels.ask_delete_title,
            message: labels.ask_delete,
            buttonLabels: {
                accept: 'Slett',
                cancel: 'Avbryt'
            }
        }).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                this.busy = true;
                this.workerService.deleteByID(this.ID, this.viewconfig.data.route)
                    .finally(() => this.busy = false)
                    .subscribe(
                        res => {
                            if (done) {
                                done(labels.deleted_ok);
                            }

                            this.onCreateNew();
                            this.postDeleteAction();
                        },
                        err => {
                            this.errorService.handle(err);
                            this.toastService.addToast(
                                labels.err_delete,
                                ToastType.warn,
                                6,
                                this.errorService.extractMessage(err) || err.statusText
                            );

                            if (done) {
                                done(labels.err_delete);
                            }
                        }
                    );
            } else if (done) {
                done();
            }
        });
    }

    private postDeleteAction() {
        this.busy = true;
        this.navigate('next').catch((id) => {
            if (id === 0) {
                this.navigate('prev').catch(() => {
                    this.loadCurrent(0);
                });
                return;
            }
            this.loadCurrent(0);
        });
    }
}
