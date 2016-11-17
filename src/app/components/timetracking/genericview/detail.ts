import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {WorkerService} from '../../../services/timetracking/workerservice';
import {Router, ActivatedRoute} from '@angular/router';
import {IUniSaveAction} from '../../../../framework/save/save';
import {UniForm} from '../../../../framework/uniform';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {IViewConfig} from './list';
import {getDeepValue, trimLength} from '../utils/utils';
import {ErrorService} from '../../../services/common/ErrorService';

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
    'msg_saved': 'Lagret'
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
    @Output() public itemChanged: EventEmitter<any> = new EventEmitter();
    @Output() public afterSave: EventEmitter<IAfterSaveInfo> = new EventEmitter<IAfterSaveInfo>();
    @ViewChild(UniForm) public form: UniForm;
    public busy: boolean = true;
    public isDirty: boolean = false;
    public title: any;
    public subTitle: any;
    public ID: number;
    public current: any;
    public fields: Array<any>;
    public config: any = {autofocus: true};

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
            this.fields = this.viewconfig.formFields;
        }
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

    public onNavigate(direction = 'next') {
        this.busy = true;
        this.navigate(direction).then(() => this.busy = false, () => this.busy = false);
    }

    private navigate(direction = 'next'): Promise<any> {

        var params = 'model=' + this.viewconfig.data.model;
        var resultFld = 'minid';

        if (direction === 'next') {
            params += '&select=min(id)&filter=deleted eq \'false\'' + (this.ID ? ' and id gt ' + this.ID : '');
        } else {
            params += '&select=max(id)&filter=deleted eq \'false\'' + (this.ID ? ' and id lt ' + this.ID : '');
            resultFld = 'maxid';
        }

        return new Promise((resolve, reject) => {
            this.workerService.getStatistics(params).subscribe((data) => {
                var items = data.Data;
                if (items && items.length > 0) {
                    var key = items[0][resultFld];
                    if (key) {
                        this.loadCurrent(key);
                        resolve(true);
                        return;
                    }
                }
                reject(0); // not found
            }, (err) => {
                reject(-1); // error
            });
        });
    }

    public onChange() {
        this.flagDirty();
    }

    public onCreateNew() {
        this.loadCurrent(0);
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
                    this.current = item;
                    this.enableAction(IAction.Delete);
                    this.itemChanged.emit(this.current);
                }
                if (updateTitle) {
                    this.updateTitle();
                }
                this.flagDirty(false);
                this.busy = false;
            },
                this.errorService.handle
            );
        } else {
            this.ID = 0;
            if (this.viewconfig.data && this.viewconfig.data.factory) {
                this.current = this.viewconfig.data.factory();
                this.current.ID = this.ID;
            }
            this.enableAction(IAction.Delete, false);
            this.busy = false;
            this.flagDirty(false);
            if (updateTitle) {
                this.updateTitle(this.viewconfig.labels.createNew);
            }
            this.itemChanged.emit(this.current);
        }
    }

    private enableAction(actionID: IAction, enable = true) {
        this.actions[actionID].disabled = !enable;
    }

    private updateTitle(fallbackTitle?: string) {
        if (this.viewconfig) {
            var nameProp = this.viewconfig.detail.nameProperty || 'Name';
            this.title = this.ID && this.current ? getDeepValue(this.current, nameProp) : fallbackTitle || '';
            this.subTitle = this.ID ? this.viewconfig.tab.label + ' ' + this.ID : this.viewconfig.labels.createNew;
            var tabTitle = trimLength(this.title, 12);
            var url = this.viewconfig.tab.url + '/' + this.ID;
            this.tabService.addTab({ name: tabTitle, url: url, moduleID: this.viewconfig.moduleID, active: true });
        }
    }

    private save(done) {
        this.busy = true;
        this.ensureEditCompleted();
        this.workerService.saveByID(this.current, this.viewconfig.data.route)
            .finally(() => this.busy = false)
            .subscribe((item) => {
            this.current = item;
            this.ID = item.ID;
            this.updateTitle();

            var details: IAfterSaveInfo = { entity: item, promise: undefined };
            this.afterSave.emit(details);

            var postActions = () => {
                this.itemChanged.emit(this.current);
                done(labels.msg_saved);
                this.enableAction(IAction.Delete, true);
            };

            if (details.promise) {
                details.promise.then((result: IResult) => postActions()).catch((result: IResult) => {
                    done('Feil ved lagring');
                    this.errorService.handle(result);
                });
            } else {
                postActions();
            }

        }, (err) => {
            this.errorService.handle(err);
            if (done) { done(labels.err_save); }
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
            if (!confirm(labels.ask_delete)) { if (done) { done(); } return; }
            this.workerService.deleteByID(this.ID, this.viewconfig.data.route)
            .finally(() => this.busy = false)
            .subscribe((result) => {
                if (done) { done(labels.deleted_ok); }
                this.postDeleteAction();
            }, (err) => {
                this.errorService.handle(err);
                if (done) { done(labels.err_delete); }
            });
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
