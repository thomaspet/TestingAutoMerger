import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {WorkerService} from '../../../services/timetracking/workerservice';
import {Router, ActivatedRoute} from '@angular/router';
import {IUniSaveAction} from '../../../../framework/save/save';
import {UniForm} from 'uniform-ng2/main';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {IViewConfig} from './list';
import {getDeepValue, trimLength} from '../utils/utils';
import {ErrorService} from '../../../services/services';
import {UniConfirmModal, ConfirmActions} from '../../../../framework/modals/confirm';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

enum IAction {
    Save = 0,
    Delete = 1
}

var labels = {
    'action_save': 'Lagre',
    'action_delete': 'Slett',
    'deleted_ok': 'Sletting ok',
    'error': 'En feil oppstod',
    'err_loading': 'Feil ved lasting',
    'err_save': 'Feil ved lagring',
    'err_delete': 'Feil ved sletting',
    'ask_delete': 'Ønsker du virkelig å slette aktuell post?',
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
    templateUrl: 'app/components/timetracking/genericview/detail.html'

})
export class GenericDetailview {
    @Input() public viewconfig: IViewConfig;
    @Input() public hiddenform: boolean;
    @Output() public itemChanged: EventEmitter<any> = new EventEmitter();
    @Output() public afterSave: EventEmitter<IAfterSaveInfo> = new EventEmitter<IAfterSaveInfo>();
    @ViewChild(UniForm) public form: UniForm;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;

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
        private errorService: ErrorService
    ) {
        this.route.params.subscribe(params => this.ID = +params['id']);
    }

    public ngOnInit() {
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

    public onReady(event) {
        this.loadCurrent(this.ID);
        // Auto open first secion:
        if (this.form && this.form.section(1)) {
            this.form.section(1).toggle();
        }
    }

    public onDelete() {
        this.delete();
    }

    public onShowList() {
        if (this.viewconfig && this.viewconfig.detail && this.viewconfig.detail.routeBackToList) {
            this.router.navigateByUrl(this.viewconfig.detail.routeBackToList);
        }
    }

    private navigate(direction = 'next'): Promise<any> {

        this.busy = true;

        var params = 'model=' + this.viewconfig.data.model;
        var resultFld = 'minid';

        if (direction === 'next') {
            params += '&select=min(id)&filter=deleted eq \'false\'' + (this.ID ? ' and id gt ' + this.ID : '');
        } else {
            params += '&select=max(id)&filter=deleted eq \'false\'' + (this.ID ? ' and id lt ' + this.ID : '');
            resultFld = 'maxid';
        }

        return new Promise((resolve, reject) => {
            this.workerService.getStatistics(params)
                .finally( () => this.busy = false )
                .subscribe((data) => {
                var items = data.Data;
                if (items && items.length > 0) {
                    var key = items[0][resultFld];
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
            if (this.isDirty) {
                this.confirmModal.confirm(labels.ask_save, labels.ask_save_title, true).then( (x: ConfirmActions) => {
                    switch (x) {
                        case ConfirmActions.ACCEPT:
                            this.save(undefined).then(success => {
                                resolve(true);
                            }).catch( () =>
                                resolve(false) );
                            break;
                        case ConfirmActions.REJECT:
                            resolve(true);
                            break;
                        default: // CANCEL
                            resolve(false);
                    }
                });
            } else {
                resolve(true);
            }
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
            var nameProp = this.viewconfig.detail.nameProperty || 'Name';
            this.title = this.ID && this.current$.getValue() ? getDeepValue(this.current$.getValue(), nameProp) : fallbackTitle || '';
            this.subTitle = this.ID ? ` (nr. ${this.ID})` : this.viewconfig.labels.createNew;
            var tabTitle = trimLength(this.title, 12);
            var url = this.viewconfig.tab.url + '/' + this.ID;
            this.tabService.addTab({ name: tabTitle, url: url, moduleID: this.viewconfig.moduleID, active: true });
        }
    }

    private save(done): Promise<boolean> {
        this.busy = true;
        this.ensureEditCompleted();
        return new Promise( (resolve, reject) => {
            this.workerService.saveByID(this.current$.getValue(), this.viewconfig.data.route)
                .finally(() => this.busy = false)
                .subscribe((item) => {
                    this.current$.next(item);
                    this.ID = item.ID;
                    this.updateTitle();
                    this.flagDirty(false);

                    var details: IAfterSaveInfo = { entity: item, promise: undefined };
                    this.afterSave.emit(details);

                    var postActions = () => {
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

    private ensureEditCompleted() {
        var el: any = document.activeElement;
        if (el && el.blur) {
            el.blur();
            if (el.focus) {
                el.focus();
            }
        }
    }

    private delete(done?) {
        if (this.ID) {
            this.confirmModal.confirm(labels.ask_delete, labels.ask_delete_title).then( (dlgResult: ConfirmActions) => {
                if (dlgResult !== ConfirmActions.ACCEPT) { if (done) { done(); } return; }
                this.workerService.deleteByID(this.ID, this.viewconfig.data.route)
                .finally(() => this.busy = false)
                .subscribe((result) => {
                    if (done) { done(labels.deleted_ok); }
                    this.onCreateNew();
                    this.postDeleteAction();
                }, (err) => {
                    this.toastService.addToast(labels.err_delete, ToastType.warn, 6, this.errorService.extractMessage(err) || err.statusText );
                    if (done) { done(labels.err_delete); }
                });
            } );

        }
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
