import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PayrollRun, SalaryTransaction, Employee, SalaryTransactionSupplement, WageType } from '../../../unientities';
import { PayrollrunService, UniCacheService, SalaryTransactionService, EmployeeService, WageTypeService, ReportDefinitionService } from '../../../services/services';
import { Observable } from 'rxjs/Observable';
import { TabService, UniModules } from '../../layout/navbar/tabstrip/tabService';
import { ControlModal } from './controlModal';
import { PostingsummaryModal } from './postingsummaryModal';
import { VacationpayModal } from './vacationpay/VacationpayModal';
import { RootRouteParamsService } from '../../../services/rootRouteParams';
import { IUniSaveAction, UniSave } from '../../../../framework/save/save';
import { UniForm, UniFieldLayout } from 'uniform-ng2/main';
import { IContextMenuItem } from 'unitable-ng2/main';
import { IToolbarConfig } from '../../common/toolbar/toolbar';
import { UniStatusTrack } from '../../common/toolbar/statustrack';
import { ToastService, ToastType } from '../../../../framework/uniToast/toastService';
import { ErrorService } from '../../../services/common/ErrorService';
import { SalaryTransactionSelectionList } from '../salarytrans/salarytransactionSelectionList';
import { UniView } from '../../../../framework/core/uniView';
import { PreviewModal } from '../../reports/modals/preview/previewModal';

declare var _;

@Component({
    selector: 'payrollrun-details',
    templateUrl: 'app/components/salary/payrollrun/payrollrunDetails.html',
})

export class PayrollrunDetails extends UniView {
    public config: any = {};
    public fields: any[] = [];
    @ViewChild(UniForm) public uniform: UniForm;
    @ViewChild(UniSave) private saveComponent: UniSave;
    private payrollrun: PayrollRun;
    private payrollrunID: number;
    private payDate: Date = null;
    private payStatus: string;
    @ViewChild(ControlModal) private controlModal: ControlModal;
    @ViewChild(PostingsummaryModal) private postingSummaryModal: PostingsummaryModal;
    @ViewChild(VacationpayModal) private vacationPayModal: VacationpayModal;
    @ViewChild(SalaryTransactionSelectionList) private selectionList: SalaryTransactionSelectionList;
    private isEditable: boolean;
    private busy: boolean = false;
    private url: string = '/salary/payrollrun/';
    private saveactions: IUniSaveAction[] = [];
    private formIsReady: boolean = false;
    private contextMenuItems: IContextMenuItem[] = [];
    private toolbarconfig: IToolbarConfig;
    private filter: string = '';
    private disableFilter: boolean;
    @ViewChild(PreviewModal) public previewModal: PreviewModal;

    private employees: Employee[];
    private salaryTransactions: SalaryTransaction[];
    private wagetypes: WageType[];

    constructor(
        private route: ActivatedRoute,
        private payrollrunService: PayrollrunService,
        private router: Router, private tabSer: TabService,
        private _rootRouteParamsService: RootRouteParamsService,
        private _toastService: ToastService,
        protected cacheService: UniCacheService,
        private _salaryTransactionService: SalaryTransactionService,
        private _employeeService: EmployeeService,
        private _wageTypeService: WageTypeService,
        private errorService: ErrorService,
        private _reportDefinitionService: ReportDefinitionService
    ) {
        super(router.url, cacheService);
        this.getLayout();
        this.config = {
            submitText: ''
        };

        this.saveactions = [];

        this.route.params.subscribe(params => {
            this.payrollrunID = +params['id'];
            super.updateCacheKey(this.router.url);
            this.employees = undefined;
            this.salaryTransactions = undefined;

            super.getStateSubject('payrollRun').subscribe((payrollRun: PayrollRun) => {

                this.payrollrun = payrollRun;
                this.payDate = new Date(this.payrollrun.PayDate.toString());
                this.payStatus = this.payrollrunService.getStatus(this.payrollrun).text;

                this.saveactions = [
                    {
                        label: 'Lagre',
                        action: this.saveAll.bind(this),
                        main: this.payrollrun.StatusCode < 1,
                        disabled: true
                    },
                    {
                        label: 'Kontroller',
                        action: this.openControlModal.bind(this),
                        main: false,
                        disabled: this.payrollrun.StatusCode > 0
                    },
                    {
                        label: 'Avregn',
                        action: this.runSettling.bind(this),
                        main: false,
                        disabled: this.payrollrun.StatusCode > 0
                    },
                    {
                        label: 'Utbetalingsliste',
                        action: this.showPaymentList.bind(this),
                        main: this.payrollrun.StatusCode > 1,
                        disabled: this.payrollrun.StatusCode < 1
                    },
                    {
                        label: 'Bokfør',
                        action: this.openPostingSummaryModal.bind(this),
                        main: this.payrollrun.StatusCode === 1,
                        disabled: this.payrollrun.StatusCode !== 1
                    }
                ];

                if (this.formIsReady) {
                    this.setEditMode();
                }

                this.toolbarconfig = {
                    title: this.payrollrun.Description ? this.payrollrun.Description : 'Lønnsavregning ' + this.payrollrunID,
                    subheads: [{
                        title: this.payrollrun.Description ? 'Lønnsavregning ' + this.payrollrunID : ''
                    },
                    {
                        title: 'Utbetalingsdato ' + this.payDate.toLocaleDateString('no', { day: 'numeric', month: 'short', year: 'numeric' })
                    }],
                    statustrack: this.getStatustrackConfig(),
                    navigation: {
                        prev: this.previousPayrollrun.bind(this),
                        next: this.nextPayrollrun.bind(this),
                        add: this.createNewRun.bind(this)
                    },
                    contextmenu: this.contextMenuItems,
                };

                this.checkDirty();

            });

            super.getStateSubject('employees').subscribe((employees: Employee[]) => {
                this.employees = employees;
            });

            super.getStateSubject('salaryTransactions').subscribe((salaryTransactions: SalaryTransaction[]) => {
                this.salaryTransactions = salaryTransactions;
                this.checkDirty();
            });

            super.getStateSubject('wagetypes').subscribe((wagetypes) => {
                this.wagetypes = wagetypes;
            });

            if (this.payrollrun && this.payrollrun.ID === +params['id']) {
                super.updateState('payrollRun', this.payrollrun, false);
            } else {
                this.payrollrun = undefined;
            }

            this._rootRouteParamsService.params = params;
            this.tabSer.addTab({ name: 'Lønnsavregning ' + this.payrollrunID, url: 'salary/payrollrun/' + this.payrollrunID, moduleID: UniModules.Payrollrun, active: true });
            this.getPayrollRun();
        });

        this.getWageTypes();

        this.router.events.subscribe((event: any) => {
            if (event.constructor.name === 'NavigationEnd') {
                this.getData();
            }
        });

        this.contextMenuItems = [
            {
                label: 'Generer feriepenger',
                action: () => {
                    this.openVacationPayModal();
                }
            },
            {
                label: 'Nullstill lønnsavregning',
                action: () => {
                    if (this.payrollrun.StatusCode < 1) {
                        this._toastService.addToast('Kan ikke nullstille', ToastType.warn, 4, 'Lønnsavregningen må være avregnet før du kan nullstille den');
                    } else {
                        if (this.payrollrun.StatusCode < 2 || confirm('Denne lønnsavregningen er bokført, er du sikker på at du vil nullstille?')) {
                            this.busy = true;
                            this.payrollrunService.resetSettling(this.payrollrunID)
                                .finally(() => this.busy = false)
                                .subscribe((response: boolean) => {
                                    if (response) {
                                        this.getData();
                                    } else {
                                        this.errorService.handleWithMessage(response, 'Fikk ikke nullstilt lønnsavregning');
                                    }
                                }, this.errorService.handle);
                        }
                    }

                },
                disabled: (rowModel) => {
                    return this.payrollrun.StatusCode < 1;
                }
            }
        ];
    }

    private getLayout() {
        this.payrollrunService.layout('payrollrunDetailsForm').subscribe(layout => this.fields = layout.Fields);
    }

    private getData() {

        this.getSalaryTransactions();

        this.getPayrollRun();

        this.getEmployees();
    }

    private getSalaryTransactions() {
        let salaryTransactionFilter = `PayrollRunID eq ${this.payrollrunID}`;
        this._salaryTransactionService.GetAll('filter=' + salaryTransactionFilter + '&orderBy=IsRecurringPost DESC', ['Supplements.WageTypeSupplement']).subscribe((response) => {
            super.updateState('salaryTransactions', response, false);
        }, this.errorService.handle);
    }

    private getPayrollRun() {
        this.payrollrunService.Get(this.payrollrunID)
            .subscribe((payrollRun: PayrollRun) => {
                this.payrollrun = payrollRun;
                payrollRun.StatusCode < 1 ? this.disableFilter = false : this.disableFilter = true;
                this.updateState('payrollRun', payrollRun, false);
            }, this.errorService.handle);
    }

    private getEmployees() {
        this._employeeService.GetAll('filter=' + this.filter, ['Employments', 'BusinessRelationInfo', 'SubEntity.BusinessRelationInfo', 'BankAccounts']).subscribe(response => {
            this.updateState('employees', response, false);
        }, this.errorService.handle);
    }

    private getWageTypes() {
        this._wageTypeService.GetAll('', ['SupplementaryInformations']).subscribe((wagetypes: WageType[]) => {
            this.updateState('wagetypes', wagetypes, false);
        });
    }

    private checkDirty() {
        if (this.saveactions && this.saveactions.length) {
            if (super.isDirty()) {
                this.saveactions[0].disabled = false;
            } else {
                this.saveactions[0].disabled = true;
            }
        }
    }

    private getStatustrackConfig() {
        let statuses: string[] = ['Opprettet', 'Avregnet', 'Bokført'];
        let statustrack: UniStatusTrack.IStatus[] = [];
        let activeIndex = statuses.indexOf(this.payStatus);

        statuses.forEach((status, i) => {
            let _state: UniStatusTrack.States;

            if (i > activeIndex) {
                _state = UniStatusTrack.States.Future;
            } else if (i < activeIndex) {
                _state = UniStatusTrack.States.Completed;
            } else if (i === activeIndex) {
                _state = UniStatusTrack.States.Active;
            }

            statustrack[i] = {
                title: status,
                state: _state
            };
        });
        return statustrack;
    }

    // REVISIT: Remove this when pure dates (no timestamp) are implemented on backend!
    private fixTimezone(date): Date {
        if (typeof date === 'string') {
            return new Date(date);
        }

        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    }

    public openPostingSummaryModal(done) {
        this.postingSummaryModal.openModal();
        done('');
    }

    public openControlModal(done) {
        this.controlModal.openModal();
        done('');
    }

    public openVacationPayModal() {
        this.vacationPayModal.openModal();
    }

    public canPost(): boolean {
        if (this.payrollrun) {
            if (this.payrollrun.StatusCode === 1) {
                return true;
            }
        }
        return false;
    }

    public previousPayrollrun() {

        if (!super.canDeactivate()) {
            return;
        }

        this.payrollrunService.getPrevious(this.payrollrunID)
            .subscribe((previous) => {
                if (previous) {
                    this.payrollrun = previous;
                    this.setSection();
                    this.router.navigateByUrl(this.url + previous.ID);
                }
            }, this.errorService.handle);
    }

    public nextPayrollrun() {

        if (!super.canDeactivate()) {
            return;
        }

        this.payrollrunService.getNext(this.payrollrunID)
            .subscribe((next) => {
                if (next) {
                    this.payrollrun = next;
                    this.setSection();
                    this.router.navigateByUrl(this.url + next.ID);
                }
            }, this.errorService.handle);
    }

    public runSettling(done?: (message: string) => void) {
        this.saveactions[0].disabled = true;
        this.saveactions[0].main = false;
        this.saveactions[2].main = true;
        this.saveactions[2].disabled = true;
        this.saveactions = _.cloneDeep(this.saveactions);
        this.payrollrunService.runSettling(this.payrollrunID)
            .finally(() => this.busy = false)
            .subscribe((bResponse: boolean) => {
                if (bResponse === true) {
                    this.getPayrollRun();
                    this.getSalaryTransactions();
                    if (done) {
                        done('Avregnet');
                    } else {
                        this.saveComponent.manualSaveComplete('Avregnet');
                    }
                }
            },
            (err) => {
                if (done) {
                    done('Feil ved avregning');
                } else {
                    this.saveComponent.manualSaveComplete('Feil ved avregning');
                }
                this.errorService.handle(err);
                this.saveactions[2].main = false;
                this.saveactions[2].disabled = false;
                this.saveactions[0].main = true;
                this.checkDirty();
                this.saveactions = _.cloneDeep(this.saveactions);
            });
    }

    public showPaymentList(done) {
        this._reportDefinitionService.getReportByName('Utbetalingsliste').subscribe((report) => {
            this.previewModal.openWithId(report, this.payrollrun.ID, 'RunID');
            done('');
        });
    }

    public resetSettling() {
        this.payrollrunService.resetSettling(this.payrollrunID)
            .subscribe((bResponse: boolean) => {
                if (bResponse === true) {
                    this.getPayrollRun();
                    this.getSalaryTransactions();
                }
            },
            this.errorService.handle);
    }

    private findByProperty(fields, name) {
        var field = fields.find((fld) => fld.Property === name);
        return field;
    }

    private setEditMode() {
        if (this.payrollrun.StatusCode > 0) {
            this.isEditable = false;
            this.uniform.readMode();
        } else {
            this.isEditable = true;
            this.uniform.editMode();
            var idField: UniFieldLayout = this.findByProperty(this.fields, 'ID');
            idField.ReadOnly = true;
        }
        var recurringTransCheck: UniFieldLayout = this.findByProperty(this.fields, 'ExcludeRecurringPosts');
        var noNegativePayCheck: UniFieldLayout = this.findByProperty(this.fields, '1');
        if (this.isEditable) {
            recurringTransCheck.ReadOnly = false;
            noNegativePayCheck.ReadOnly = false;
        } else {
            recurringTransCheck.ReadOnly = true;
            noNegativePayCheck.ReadOnly = true;
        }
        this.fields = _.cloneDeep(this.fields);
    }

    private setSection() {
        if (!this.payrollrun.Description && !this.uniform.section(1).isOpen) {
            this.uniform.section(1).toggle();
        } else if (this.payrollrun.Description && this.uniform.section(1).isOpen) {
            this.uniform.section(1).toggle();
        }
    }

    public toggle(section) {
        if (!section.isOpen) {
            if (section.sectionId === 1 && (!this.payrollrun.Description || this.payrollrun.Description === '')) {
                this.uniform.section(1).toggle();
                this._toastService.addToast('Beskrivelse mangler', ToastType.bad, 3, 'Vi må ha en beskrivelse før vi kan vise lønnspostene');
                this.uniform.field('Description').focus();
            } else {
                this.selectionList.focusRow();
            }
        }
    }

    public ready(value) {
        this.setEditMode();
        this.setSection();
        this.formIsReady = true;
    }

    private saveAll(done?: (message: string) => void) {
        this.setEditableOnChildren(false);
        this.savePayrollrun().finally(() => this.setEditableOnChildren(true)).subscribe((payrollRun: PayrollRun) => {

            this.payrollrun = payrollRun;
            this.setSection();
            super.updateState('payrollRun', this.payrollrun, false);

            if (!this.payrollrunID) {
                this.router.navigateByUrl(this.url + this.payrollrun.ID);
                return;
            }

            let newTranses = this.payrollrun.transactions.filter(x => !x.Deleted);

            this.salaryTransactions = this.salaryTransactions
                .filter(x => !x.Deleted && x.ID);

            newTranses.map(trans => {
                let index = this.salaryTransactions.findIndex(x => x.ID === trans.ID);
                if (index > 0) {
                    this.salaryTransactions[index] = trans;
                } else {
                    this.salaryTransactions.push(trans);
                }
            });

            this.updateState('salaryTransactions', this.salaryTransactions, false);

            if (done) {
                done('Lagret');
            } else {
                this.saveComponent.manualSaveComplete('Lagret');
            }

        },
            (err) => {
                if (done) {
                    done('Feil ved lagring');
                } else {
                    this.saveComponent.manualSaveComplete('Feil ved lagring');
                }
                this.errorService.handle(err);
            });
    }

    private change(value) {
        super.updateState('payrollRun', this.payrollrun, true);
    }

    private setEditableOnChildren(isEditable: boolean) {
        this.selectionList.setEditable(isEditable);
    }

    public changeFilter(filter: string) {
        this.filter = filter;
        this.getEmployees();
    }

    public savePayrollrun(): Observable<PayrollRun> {
        let retObs = null;

        this.payrollrun.PayDate = this.fixTimezone(this.payrollrun.PayDate);
        this.payrollrun.FromDate = this.fixTimezone(this.payrollrun.FromDate);
        this.payrollrun.ToDate = this.fixTimezone(this.payrollrun.ToDate);

        if (this.payrollrun.ID > 0) {
            this.payrollrun.transactions = this.salaryTransactions
                .filter(x => x['_isDirty'] || x.Deleted)
                .map((trans: SalaryTransaction) => {
                    if (!trans.Deleted) {
                        if (!trans.ID) {
                            trans['_createguid'] = this._salaryTransactionService.getNewGuid();
                        }
                        if (trans.Supplements) {
                            trans.Supplements
                                .filter(x => !x.ID)
                                .forEach((supplement: SalaryTransactionSupplement) => {
                                    supplement['_createguid'] = this._salaryTransactionService.getNewGuid();
                                });
                        }
                    }
                    trans.Wagetype = null;
                    trans.Employee = null;
                    return trans;
                });
            retObs = this.payrollrunService.Put(this.payrollrun.ID, this.payrollrun);
        } else {
            retObs = this.payrollrunService.Post(this.payrollrun);
        }

        return retObs;
    }

    public createNewRun() {
        this.busy = true;
        var createdPayrollrun = new PayrollRun();
        var dates: Date[] = this.payrollrunService.getEmptyPayrollrunDates();

        createdPayrollrun.FromDate = this.fixTimezone(dates[0]);
        createdPayrollrun.ToDate = this.fixTimezone(dates[1]);
        createdPayrollrun.PayDate = this.fixTimezone(dates[2]);

        this.payrollrunService.Post(createdPayrollrun)
            .finally(() => this.busy = false)
            .subscribe((response) => {
                this.payrollrun = response;
                this.router.navigateByUrl(this.url + response.ID);
            },
            this.errorService.handle);
    }

    public updatePayrollRun() {
        this.getPayrollRun();
    }
}
