import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PayrollRun } from '../../../unientities';
import { PayrollrunService } from '../../../services/services';
import { Observable } from 'rxjs/Observable';
import { TabService, UniModules } from '../../layout/navbar/tabstrip/tabService';
import { ControlModal } from './controlModal';
import { PostingsummaryModal } from './postingsummaryModal';
import { VacationpayModal } from './vacationpay/VacationpayModal';
import { RootRouteParamsService } from '../../../services/rootRouteParams';
import { IUniSaveAction } from '../../../../framework/save/save';
import { UniForm, UniFieldLayout } from '../../../../framework/uniform';
import { IContextMenuItem } from 'unitable-ng2/main';
import { IToolbarConfig } from '../../common/toolbar/toolbar';
import { UniStatusTrack } from '../../common/toolbar/statustrack';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {ErrorService} from '../../../services/common/ErrorService';

declare var _;


@Component({
    selector: 'payrollrun-details',
    templateUrl: 'app/components/salary/payrollrun/payrollrunDetails.html',
})

export class PayrollrunDetails {
    public config: any = {};
    public fields: any[] = [];
    @ViewChild(UniForm) public uniform: UniForm;
    private payrollrun: PayrollRun;
    private payrollrunID: number;
    private payDate: Date = null;
    private payStatus: string;
    @ViewChild(ControlModal) private controlModal: ControlModal;
    @ViewChild(PostingsummaryModal) private postingSummaryModal: PostingsummaryModal;
    @ViewChild(VacationpayModal) private vacationPayModal: VacationpayModal;
    private isEditable: boolean;
    private busy: boolean = false;
    private saveactions: IUniSaveAction[] = [];
    private formIsReady: boolean = false;
    private contextMenuItems: IContextMenuItem[] = [];
    private toolbarconfig: IToolbarConfig;

    constructor(
        private route: ActivatedRoute, 
        private payrollrunService: PayrollrunService, 
        private router: Router, private tabSer: TabService, 
        private _rootRouteParamsService: RootRouteParamsService,
        private _toastService: ToastService,
        private errorService: ErrorService
    ) {
        this.route.params.subscribe(params => {
            this.payrollrunID = +params['id'];
            this._rootRouteParamsService.params = params;
            this.tabSer.addTab({ name: 'Lønnsavregning ' + this.payrollrunID, url: 'salary/payrollrun/' + this.payrollrunID, moduleID: UniModules.Payrollrun, active: true });
            this.getPayrollRun();
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
                                    this.payrollrunService.Get(this.payrollrunID).subscribe((payrollRun: PayrollRun) => {
                                        this.payrollrunService.refreshPayrun(payrollRun);
                                    }, this.errorService.handle);
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

        this.payrollrunService.refreshPayrollRun$.subscribe((payrollrun: PayrollRun) => {
            this.busy = true;
            this.payrollrun = payrollrun;
            this.payrollrunID = payrollrun.ID;
            this.payDate = new Date(this.payrollrun.PayDate.toString());
            this.payStatus = this.payrollrunService.getStatus(this.payrollrun).text;
            this.refreshSaveActions();
            if (this.formIsReady) {
                this.setEditMode();
            }
            this.busy = false;

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
        }, this.errorService.handle);
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

    private getPayrollRun() {
        this.busy = true;
        if (this.payrollrunID) {
            Observable.forkJoin(
                this.payrollrunService.Get<PayrollRun>(this.payrollrunID),
                this.payrollrunService.layout('payrollrunDetailsForm')
            ).finally(() => this.busy = false).subscribe((response: any) => {
                var [payrollrun, layout] = response;
                this.payrollrunService.refreshPayrun(payrollrun);
                this.payrollrun = payrollrun;
                this.payDate = new Date(this.payrollrun.PayDate.toString());
                this.fields = layout.Fields;
                this.config = {
                    submitText: ''
                };
            },
            this.errorService.handle);
        }
    }

    private refreshSaveActions() {
        this.saveactions = [
            {
                label: 'Lagre lønnsavregning',
                action: this.savePayrollrun.bind(this),
                main: true,
                disabled: this.payrollrun.StatusCode > 0
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
                main: false,
                disabled: this.payrollrun.StatusCode < 1
            },
            {
                label: 'Bokfør',
                action: this.openPostingSummaryModal.bind(this),
                main: false,
                disabled: this.payrollrun.StatusCode !== 1
            }
        ];
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
        this.payrollrunService.getPrevious(this.payrollrunID)
            .subscribe((response) => {
                if (response) {
                    this.payrollrunService.refreshPayrun(response);
                    this.router.navigateByUrl('/salary/payrollrun/' + this.payrollrunID);
                }
            }, this.errorService.handle);
    }

    public nextPayrollrun() {
        this.payrollrunService.getNext(this.payrollrunID)
            .subscribe((response) => {
                if (response) {
                    this.payrollrunService.refreshPayrun(response);
                    this.router.navigateByUrl('/salary/payrollrun/' + this.payrollrunID);
                }
            }, this.errorService.handle);
    }

    public runSettling() {
        this.busy = true;
        this.saveactions[0].disabled = true;
        this.saveactions = _.cloneDeep(this.saveactions);
        this.payrollrunService.runSettling(this.payrollrunID)
            .finally(() => this.busy = false)
            .subscribe((bResponse: boolean) => {
                if (bResponse === true) {
                    this.payrollrunService.Get<PayrollRun>(this.payrollrunID)
                        .finally(() => this.busy = false)
                        .subscribe((response) => {
                            this.payrollrunService.refreshPayrun(response);
                            this.setEditMode();
                            this.showPaymentList();
                        },
                        (err) => {
                            this.errorService.handle(err);
                            this.saveactions[0].disabled = false;
                            this.saveactions = _.cloneDeep(this.saveactions);
                        });
                }
            },
            (err) => {
                this.errorService.handle(err);
                this.saveactions[0].disabled = false;
                this.saveactions = _.cloneDeep(this.saveactions);
            });
    }

    public showPaymentList() {
        this.router.navigateByUrl('/salary/paymentlist/' + this.payrollrun.ID);
    }

    public resetSettling() {
        this.payrollrunService.resetSettling(this.payrollrunID)
            .subscribe((bResponse: boolean) => {
                if (bResponse === true) {
                    this.payrollrunService.Get<PayrollRun>(this.payrollrunID)
                        .subscribe((response) => {
                            this.payrollrunService.refreshPayrun(response);
                        },
                        this.errorService.handle);
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

        if (!this.payrollrun.Description) {
            this.uniform.section(1).toggle();
        }
    }

    public toggle(section) {
        if (section.isOpen && section.sectionId === 1 && this.payrollrun.Description === '') {
            this._toastService.addToast('Beskrivelse mangler', ToastType.bad, 3, 'Vi må ha en beskrivelse før vi kan vise lønnspostene');
            this.uniform.field('Description').focus();
        }
    }


    public salarytransReady(value) {
        if (this.payrollrun) {
            this.payrollrunService.refreshPayrun(_.cloneDeep(this.payrollrun));
        }
    }

    public ready(value) {
        this.setEditMode();
        this.formIsReady = true;
    }

    public savePayrollrun(done) {
        this.busy = true;

        this.payrollrun.PayDate = this.fixTimezone(this.payrollrun.PayDate);
        this.payrollrun.FromDate = this.fixTimezone(this.payrollrun.FromDate);
        this.payrollrun.ToDate = this.fixTimezone(this.payrollrun.ToDate);

        if (this.payrollrun.ID > 0) {
            this.payrollrunService.Put(this.payrollrun.ID, this.payrollrun)
                .finally(() => this.busy = false)
                .subscribe((response: PayrollRun) => {
                    this.payrollrunService.refreshPayrun(response);
                    done('Sist lagret: ');
                },
                (err) => {
                    this.errorService.handle(err);
                    this.refreshSaveActions();
                });
        } else {
            this.payrollrunService.Post(this.payrollrun)
                .finally(() => this.busy = false)
                .subscribe((response: PayrollRun) => {
                    this.payrollrunService.refreshPayrun(response);
                    done('Sist lagret: ');
                    this.router.navigateByUrl('/salary/payrollrun/' + this.payrollrun.ID);
                },
                (err) => {
                    this.errorService.handle(err);
                    this.refreshSaveActions();
                });
        }
    }

    public createNewRun() {
        this.busy = true;
        var createdPayrollrun = new PayrollRun();
        var dates: Date[] = this.payrollrunService.getEmptyPayrollrunDates();

        createdPayrollrun.FromDate = this.fixTimezone(dates[0]);
        createdPayrollrun.ToDate = this.fixTimezone(dates[1]);
        createdPayrollrun.PayDate = this.fixTimezone(dates[2]);

        this.payrollrunService.Post(createdPayrollrun)
            .subscribe((response) => {
                this.router.navigateByUrl('/salary/payrollrun/' + response.ID);
            },
            this.errorService.handle);
    }

}
