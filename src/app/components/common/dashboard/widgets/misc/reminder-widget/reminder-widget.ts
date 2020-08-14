import {Component, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import {of, Observable, forkJoin} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {DashboardDataService} from '../../../dashboard-data.service';

import PerfectScrollbar from 'perfect-scrollbar';
import * as moment from 'moment';
import {ApprovalService, TaskService} from '@app/services/services';
import {AuthService} from '@app/authService';
import {ApprovalStatus, Task, Approval, FinancialDeadline} from '@uni-entities';
import {FeaturePermissionService} from '@app/featurePermissionService';
import {UniModalService} from '@uni-framework/uni-modal';
import {NewTaskModal} from '@app/components/common/modals/new-task-modal/new-task-modal';
import { Router } from '@angular/router';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';

@Component({
    selector: 'reminder-widget',
    templateUrl: './reminder-widget.html',
    styleUrls: ['./reminder-widget.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReminderWidget {
    options: { showPublicDueDates: boolean };

    scrollbar: PerfectScrollbar;

    tasks: Task[] = [];
    invoiceApprovals: Approval[];
    timesheetApprovals: Approval[];
    publicDueDates: FinancialDeadline[];

    counters: {
        invoicesReadyForPayment?: number,
        invoicesReadyForReminder?: number,
        paymentWithoutMatch?: number,
        inbox?: number
    } = {};

    // visibilitySettings = {
    //     tasks: true,
    //     approvals: true,
    //     publicDueDates: true,
    // };

    constructor(
        private modalService: UniModalService,
        private featurePermissionService: FeaturePermissionService,
        private authService: AuthService,
        private dataService: DashboardDataService,
        private approvalService: ApprovalService,
        private taskService: TaskService,
        private toast: ToastService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) {}

    ngAfterViewInit() {
        this.loadData();
    }

    ngOnDestroy() {
        this.scrollbar?.destroy();
    }

    private loadData() {
        const requests: Observable<any>[] = [
            this.getApprovals(),
            this.getTasks(),
            this.getCounters()
        ];

        if (this.options?.showPublicDueDates) {
            requests.push(this.getPublicDueDates());
        }

        forkJoin(requests).subscribe(
            ([approvals, tasks, counters, publiceDuedates]) => {
                this.invoiceApprovals = approvals.invoices;
                this.timesheetApprovals = approvals.timesheets;

                this.tasks = tasks;
                this.counters = counters;
                this.publicDueDates = publiceDuedates;

                this.cdr.markForCheck();
                setTimeout(() => {
                    this.scrollbar = new PerfectScrollbar('#reminder-list', {
                        wheelPropagation: true,
                        wheelSpeed: .5
                    });
                });
            },
            err => console.error(err)
        );
    }

    private getCounters() {
        return forkJoin(
            this.dataService.get('/api/kpi/companies'),
            this.dataService.get(`/api/statistics?model=Payment&select=sum(casewhen((Payment.IsCustomerPayment eq 'true' ` +
            `and Payment.StatusCode eq '44018' )\,1\,0)) as payments`),
            this.dataService.get(`/api/biz/filetags/IncomingMail|IncomingEHF|IncomingTravel|IncomingExpense|Upload/` +
            `0?action=get-supplierInvoice-inbox`)
        ).pipe(
            map(([kpi, paymentsWithoutMatch, inbox]) => {
                const counters: any = {};

                const companyKpi = (kpi || []).find(c => c.ID === this.authService.activeCompany.ID)?.Kpi || [];
                companyKpi.forEach(kpiItem => {
                    if (kpiItem.Name === 'ToBePayed') {
                        counters.invoicesReadyForPayment = kpiItem.Counter;
                    }

                    if (kpiItem.Name === 'ToBeReminded') {
                        if (this.featurePermissionService.canShowUiFeature('ui.sales.reminders')) {
                            counters.invoicesReadyForReminder = kpiItem.Counter;
                        }
                    }
                });

                if (paymentsWithoutMatch?.Data && paymentsWithoutMatch.Data[0]) {
                    counters.paymentWithoutMatch = paymentsWithoutMatch.Data[0].payments || 0;
                }

                counters.inbox = inbox?.length;
                return counters;
            })
        );
    }

    private getPublicDueDates() {
        return this.dataService.get(
            '/api/biz/deadlines?action=number-of-days-filtered&nrOfDays=30'
        ).pipe(
            catchError(err => {
                console.error(err);
                return of([]);
            }),
            map((duedates: FinancialDeadline[]) => {
                return duedates
                    .sort((a, b) => moment(a.Deadline).isAfter(moment(b.Deadline)) ? 1 : -1)
                    .map(dueDate => {
                        const daysRemaining = moment(dueDate.Deadline).diff(moment(), 'days');
                        let cssClass;
                        let daysLabel;

                        if (daysRemaining <= 1) {
                            cssClass = 'bad';
                        } else if (daysRemaining < 7) {
                            cssClass = 'warn';
                        }

                        if (daysRemaining <= 0) {
                            daysLabel = 'I dag';
                        } else if (daysRemaining === 1) {
                            daysLabel = '1 dag';
                        } else {
                            daysLabel = daysRemaining + ' dager';
                        }

                        dueDate['_class'] = cssClass;
                        dueDate['_daysLabel'] = daysLabel;
                        return dueDate;
                    });
            })
        );
    }

    private getApprovals() {
        const filter = `filter=UserID eq ${this.authService.currentUser.ID} and StatusCode eq ${ApprovalStatus.Active}`;
        return this.approvalService.GetAll(filter, ['Task.Model']).pipe(
            map(approvals => {
                const timesheets = [];
                const invoices = [];

                approvals?.forEach(approval => {
                    const task = approval?.Task;
                    const model = task?.Model?.Name;

                    if (model === 'SupplierInvoice') {
                        const route = this.authService.canActivateRoute(this.authService.currentUser, '/accounting/bills')
                            ? `/accounting/bills/${approval.Task.EntityID}`
                            : `/assignments/approvals?showCompleted=false&id=${approval.ID}`;

                        const textParts = task.Title.split(/-(.+)/);

                        approval['_route'] = route;
                        approval['_label'] = `Godkjenn regning fra ${textParts[0]}`; // TODO: show amount?
                        invoices.push(approval);
                    } else if (model === 'WorkItemGroup') {
                        let text = (task.Title || '').split('(')[0];
                        text = text.charAt(0).toLowerCase() + text.slice(1);
                        approval['_label'] = 'Godkjenn ' + text;
                        timesheets.push(approval);
                    }
                });

                return {
                    invoices: invoices,
                    timesheets: timesheets
                };
            })
        );
    }

    private getTasks(ignoreCache = false) {
        const endpoint = '/api/statistics?model=Task&select=ID as ID,Title as Title,ModelID as ModelID,Model.Name as Name,EntityID as EntityID,' +
            `StatusCode as StatusCode,Type as Type,UserID as UserID&filter=UserID eq <userID> and ` +
            `StatusCode ne 50030 and Type ne 1&top=50&expand=model&orderby=ID desc`;

        return this.dataService.get(endpoint, ignoreCache).pipe(
            map(res => res?.Data || []),
            catchError(err => {
                console.error(err);
                return of([]);
            })
        );
    }

    onTaskClicked() {
        this.router.navigateByUrl('/assignments/tasks');
    }

    quickApproveTask(task: Task, event, index) {
        event.stopPropagation();
        task['_completed'] = true;

        this.taskService.PostAction(task.ID, 'complete').subscribe(res => {
            this.toast.addToast('Oppgave satt som fullført.', ToastType.good, 8, `Oppgave "${task.Title}" ferdigstilt og markert som fullført.`);
            setTimeout(() => {
                this.tasks.splice(index, 1);
                this.cdr.markForCheck();
            }, 1500);
        }, err => {
            this.toast.addToast('Noe gikk galt', ToastType.good, 8, `Kunne ikke markere oppgave som fullført. Prøv igjen senere`);
        });
    }

    createTask() {
        this.modalService.open(NewTaskModal).onClose.subscribe(taskAdded => {
            if (taskAdded) {
                this.getTasks(true).subscribe(tasks => {
                    this.tasks = tasks;
                    this.cdr.markForCheck();
                });
            }
        });
    }
}
