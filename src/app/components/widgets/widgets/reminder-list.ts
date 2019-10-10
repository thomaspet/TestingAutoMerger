import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {IUniWidget} from '../uniWidget';
import {AuthService} from '../../../authService';
import {ApprovalService} from '@app/services/services';
import PerfectScrollbar from 'perfect-scrollbar';
import {WidgetDataService} from '../widgetDataService';
import {NewTaskModal} from '../../common/new-task-list/new-task-list';
import {UniModalService} from '@uni-framework/uni-modal';
import { Task, ApprovalStatus } from '@uni-entities';
import {Observable} from 'rxjs';

@Component({
    selector: 'uni-reminder-list',
    template: `
        <section class="widget-wrapper">
            <section class="header sr-widget-header">
                <span style="flex: 1"> {{ widget.description }} </span>
                <i class="material-icons" (click)="newTask()" title="Opprett ny oppgave" style="cursor: pointer;"> add </i>
            </section>
            <div class="content reminder-list-widget">
                <ul id="reminder-list" [ngClass]="!items.length && dataLoaded ? 'empty-list' : ''">
                    <li *ngFor="let item of items" (click)="goToTaskView(item)" title="Gå til liste">
                        <i class="material-icons"> {{ item._icon }} </i>
                        <div>
                            <span>{{ item._label }} </span>
                            <span> {{ item._typeText }}  </span>
                        </div>
                    </li>
                </ul>
                <span class="no-items-message">
                    <i class="material-icons"> mood </i>
                    Arbeidslisten er tom, godt jobbet
                </span>
            </div>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ReminderListWidget {
    widget: IUniWidget;
    items: Array<any> = [];
    scrollbar: PerfectScrollbar;
    dataLoaded: boolean = false;
    approvals: any[] = [];

    constructor(
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private widgetDataService: WidgetDataService,
        private modalService: UniModalService,
        private approvalService: ApprovalService
    ) {}

    public ngAfterViewInit() {
        this.getDataAndLoadList();
    }

    getDataAndLoadList() {
        this.widgetDataService.clearCache();
        const filter = `filter=UserID eq ${this.authService.currentUser.ID} and StatusCode eq ${ApprovalStatus.Active}`;

        Observable.forkJoin(
            this.widgetDataService.getData(this.getTaskQuery()),
            this.widgetDataService.getData('/api/kpi/companies'),
            this.approvalService.GetAll(filter, ['Task.Model']),
            this.widgetDataService.getData(`/api/statistics?model=Payment&select=sum(casewhen((Payment.IsCustomerPayment eq 'true' ` +
            `and Payment.StatusCode eq '44018' )\,1\,0)) as payments`)
        )
        .subscribe(([data, comp, approvals, payments]) => {

            // Taskss
            const tasks = (data && data.Data || []).map(item => {
                item._icon = this.getIcon(item.Name || 'pin');
                item._label = item.Title;
                item._typeText = item.Name ? this.getTranslatedTypeText(item.Name) : 'Huskelapp';
                item._url = item.Name ? this.getEntityURL(item) : '/assignments/tasks';
                return item;
            });

            const hasInvoiceAccess = this.authService.canActivateRoute(this.authService.currentUser, 'accounting/bills');
            const myCompany =  comp.find(c => c.ID === this.authService.activeCompany.ID);

            // Company KPI
            const kpi = (myCompany && myCompany.Kpi || [])
                .filter(item => item.Counter && item.Name !== 'Approved')
                .map(item => {
                    item._icon = this.getIcon(item.Name);
                    item._label = item.Name === 'Inbox'
                        ? `Elementer i innboksen (${item.Counter})`
                        : item.Name === 'ToBePayed'
                        ? `Ikke ferdigstilte kjøpsfaktura (${item.Counter})`
                        : `Faktura klar for purring (${item.Counter})`
                    item._typeText = this.getTranslatedTypeText(item.Name);
                    item._url = item.Name === 'Inbox' ? '/accounting/bills?filter=Inbox' : item.Name === 'ToBePayed'
                        ? '/accounting/bills?filter=ForApproval' : '/sales/reminders/ready';
                    return item;
                });

            // APPROVALS
            const apps = (approvals || []).map((approval) => {
                const task = approval.Task;
                const isInvoice = approval.Task.Model.Name === 'SupplierInvoice';
                if (task) {
                    approval._icon = this.getIcon(task.Model.Name);
                    approval._typeText = this.getTranslatedTypeText(task.Model.Name);
                    approval._label = task.Title;
                } else {
                    approval._label = '';
                }
                approval._url = isInvoice && hasInvoiceAccess
                ? `/accounting/bills/${approval.Task.EntityID}`
                : `/assignments/approvals?showCompleted=false&id=${approval.ID}`;

                return approval;
            });

            this.items = kpi.concat(tasks, apps);

            if (payments && payments.Data && payments.Data[0] && !!payments.Data[0].payments) {
               this.items.unshift({
                    _icon: 'account_balance',
                    _label: `Betalinger uten match (${payments.Data[0].payments})`,
                    _typeText: 'Bank',
                    _url: '/bank/ticker?code=bank_list&filter=incomming_without_match'
                });
            }

            if (this.widget && this.items && this.items.length) {
                this.scrollbar = new PerfectScrollbar('#reminder-list', {wheelPropagation: true});
            }

            this.dataLoaded = true;
            this.cdr.markForCheck();
        }, err => {
            this.dataLoaded = true;
            this.cdr.markForCheck();
        });
    }

    ngOnDestroy() {
        if (this.scrollbar) {
            this.scrollbar.destroy();
        }
    }

    newTask() {
        this.modalService.open(NewTaskModal).onClose.subscribe((taskWasAdded: boolean) => {
            if (taskWasAdded) {
                this.getDataAndLoadList();
            }
        });
    }

    getTaskQuery() {
        return '/api/statistics?model=Task&select=ID as ID,Title as Title,ModelID as ModelID,Model.Name as Name,EntityID as EntityID,' +
        `StatusCode as StatusCode,Type as Type,UserID as UserID&filter=UserID eq ${this.authService.currentUser.ID} and ` +
        `StatusCode ne 50030 and Type ne 1&top=50&expand=model&orderby=ID desc`;
    }

    goToTaskView(item: any) {
        this.router.navigateByUrl(item._url);
    }

    getIcon(value: string) {
        switch (value) {
            case 'SupplierInvoice':
            case 'WorkItemGroup':
                return 'arrow_back';
            case 'pin':
                return 'note';
            case 'Customer':
                return 'person_outline';
            case 'Inbox':
                return 'mail_outline';
            case 'ToBePayed':
                return 'assignment_returned';
            case 'ToBeReminded':
                return 'arrow_back';
            case 'CustomerInvoice':
                return 'input';
            default:
                return 'bookmark_border';
        }
    }

    getEntityURL(item: any) {
        switch (item.Name) {
            case 'Customer':
                return `/sales/customer/${item.EntityID}`;
            case 'CustomerInvoice':
                return `/sales/invoices/${item.EntityID}`;
            case 'CustomerOrder':
                return `/sales/orders/${item.EntityID}`;
            case 'CustomerQuote':
                return `/sales/quotes/${item.EntityID}`;
            case 'Supplier':
                return `/accounting/suppliers/${item.EntityID}`;
        }
    }

    getTranslatedTypeText(text: string) {
        switch (text) {
            case 'SupplierInvoice':
            case 'ToBePayed':
            case 'WorkItemGroup':
                return 'Kjøpsfaktura';
            case 'CustomerInvoiceReminder':
            case 'ToBeReminded':
                return 'Purring';
            case 'Customer':
                return 'Kunde';
            case 'CustomerInvoice':
                return 'Faktura';
            case 'CustomerOrder':
                return 'Ordre';
            case 'CustomerQuote':
                return 'Tilbud';
            case 'Supplier':
                return 'Leverandør';
            case 'Inbox':
                return 'Innboks';
            default:
                return '';
        }
    }
}
