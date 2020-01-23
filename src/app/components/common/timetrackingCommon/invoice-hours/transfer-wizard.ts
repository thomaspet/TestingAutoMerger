import {Component, Input, Output, EventEmitter, ViewChild, OnInit, AfterViewInit} from '@angular/core';
import { ErrorService } from '@app/services/common/errorService';
import { WorkitemTransferWizardFilter } from './transfer-wizard-filter';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import { IWizardOptions, WizardSource, MergeByEnum } from './wizardoptions';
import { WorkitemTransferWizardProducts } from './transfer-wizard-products';
import { WorkitemTransferWizardPreview } from './transfer-wizard-preview';
import { ConfirmActions, IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';
import { BehaviorSubject } from 'rxjs';
import { FieldType } from '@uni-framework/ui/uniform';
import { roundTo } from '@app/components/common/utils/utils';
import { LocalDate } from '@uni-entities';
import {
    UserService,
    CustomerOrderService,
    CustomerService,
    InvoiceHourService,
    ISumHours
} from '@app/services/services';


@Component({
    selector: 'workitem-transfer-wizard',
    templateUrl: './transfer-wizard.html',
})
export class WorkitemTransferWizard implements IUniModal, OnInit, AfterViewInit {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();
    @ViewChild(WorkitemTransferWizardFilter, { static: true }) private wizardFilter: WorkitemTransferWizardFilter;
    @ViewChild(WorkitemTransferWizardProducts, { static: true }) private wizardProducts: WorkitemTransferWizardProducts;
    @ViewChild(WorkitemTransferWizardPreview, { static: true }) private wizardPreview: WorkitemTransferWizardPreview;

    public workerTypeCombo = '0';

    public step = 0;
    public steps: Array<{label: string}> = [
        { label: 'Utvalg' },
        { label: 'Utvalg' },
        { label: 'Pris/produkt på timeart' },
        { label: 'Forhåndsvisning' },
        { label: 'Overføring' }
    ];
    public workInProgress = false;
    public workIndex = -1;
    public finalOrderList = [];
    public sumHours: ISumHours[];
    public busy: boolean = false;
    public transferBusy = false;
    public choices: Array<{ type: WizardSource, label: string, labelType: string, checked?: boolean, hours?: number }> = [
        { type: WizardSource.CustomerHours, label: 'Kunder', labelType: 'Kunder', checked: true, hours: 0},
        { type: WizardSource.OrderHours, label: 'Ordrer', labelType: 'Ordre', hours: 0},
        { type: WizardSource.ProjectHours, label: 'Prosjekt', labelType: 'Prosjekt', hours: 0}
    ];

    // Uniform
    public model$: BehaviorSubject<any> = new BehaviorSubject({});
    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private formFields = [];
    private formOptions = {
        workerSelection: 'FilterByUser',
        sourceType: WizardSource.CustomerHours,
        periodFrom: new LocalDate('2017-01-01'),
        periodTo: new LocalDate('2018-12-31')
    };

    private sourceOptions = [
        { name: 'FilterByUser', label: 'Mine timer', counter: undefined },
        { name: 'All', label: 'Alle medarbeidere', counter: undefined }
    ];

    public wizardOptions: IWizardOptions = {
        currentUser: undefined,
        filterByUserID: 0,
        source: WizardSource.CustomerHours,
        selectedCustomers: [],
        selectedProducts: [],
        orders: [],
        mergeBy: MergeByEnum.mergeByWorktype,
        addComment: true,
        periodFrom: new LocalDate(),
        periodTo: new LocalDate()
    };

    constructor(
        private errorService: ErrorService,
        private userService: UserService,
        private toastService: ToastService,
        private orderService: CustomerOrderService,
        private customerService: CustomerService,
        private invoiceHourService: InvoiceHourService,
    ) {
        const yr = new Date().getFullYear();
        this.formOptions.periodFrom = new LocalDate(`${yr - 1}-01-01`);
        this.formOptions.periodTo = new LocalDate(`${yr}-12-31`);
        this.userService.getCurrentUser().subscribe( user => {
            this.wizardOptions.currentUser = user;
            this.fetchSums();
        });
    }

    public ngOnInit() {

        this.formFields = [
            {
                Property: 'periodFrom',
                Label: 'Periode',
                Classes: 'small',
                FieldType: FieldType.LOCAL_DATE_PICKER
            },
            {
                Property: 'periodTo',
                Label: '',
                Classes: 'nolabel',
                FieldType: FieldType.LOCAL_DATE_PICKER
            },
            { Property: 'workerSelection',
                FieldType: FieldType.DROPDOWN,
                Label: 'Medarbeidere',
                Options: {
                    source: this.sourceOptions,
                    valueProperty: 'name',
                    searchable: false,
                    hideDeleteButton: true,
                    template: (item) => {
                        const hourInfo = item && (item.counter || item.counter === 0) ?
                            ` (${roundTo(item.counter, 2)} timer)` : '';
                        return item !== null ? `${item.label}${hourInfo}` : '';
                    }
                }
            },
            {
                Property: 'sourceType',
                Label: 'Type',
                FieldType: FieldType.RADIOGROUP,
                Options: {
                    source: this.choices,
                    valueProperty: 'type',
                    labelProperty: 'label'
                },
                LineBreak: false
            }
        ];
        this.model$.next(this.formOptions);
        this.fields$.next(this.formFields);
    }

    public ngAfterViewInit() {
        setTimeout(function() {
            document.getElementById('good_button_ok').focus();
        });
    }

    public onFormChange(event) {
        const reload = event.periodFrom || event.periodTo;
        this.fetchSums(reload);
    }

    private fetchSums(forceReload = false) {
        this.wizardOptions.periodFrom = this.formOptions.periodFrom;
        this.wizardOptions.periodTo = this.formOptions.periodTo;
        this.wizardOptions.filterByUserID = this.formOptions.workerSelection === 'FilterByUser' ? this.wizardOptions.currentUser.ID : 0;
        this.wizardOptions.source = this.choices.find( x => x.checked).type;
        if (this.sumHours && (!forceReload)) {
            this.showSums(this.sumHours);
            return;
        }
        this.invoiceHourService.getHourTotals(this.wizardOptions)
            .subscribe( result => {
                this.showSums(result);
            });
    }

    private showSums(result) {
        this.sumHours = result;
        const index = this.wizardOptions.filterByUserID > 0 ? 1 : 0;
        this.choices[0].hours = result[index].customerHours;
        this.choices[1].hours = result[index].orderHours;
        this.choices[2].hours = result[index].projectHours;
        this.choices.forEach( x => x.label = `${x.labelType} (${x.hours} timer)`);
        this.sourceOptions[0].counter = result[1].total;
        this.sourceOptions[1].counter = result[0].total;
        this.fields$.next(this.formFields);
    }

    public goBack() {
        if (this.step > 0) {
            this.step--;
        }
    }

    public accept() {
        if (this.step === this.steps.length - 1) {
            this.startTransfer();
            return;
        }

       switch (this.step) {
            case 0:
                this.wizardOptions.source = this.formOptions.sourceType;
                this.wizardOptions.selectedCustomers.length = 0;
                this.wizardFilter.refresh();
                break;
            case 1:
                const status = this.wizardFilter.canProceed();
                if (status.ok) {
                    this.wizardOptions.selectedCustomers = this.wizardFilter.selectedItems;
                    this.wizardProducts.refresh();
                } else {
                    this.toastService.addToast('Kan ikke gå videre', ToastType.warn, 3, status.msg);
                    return;
                }
            break;
        case 2:
            const prodStatus = this.wizardProducts.canProceed();
            if (prodStatus.ok) {
                setTimeout(() => {
                    this.wizardOptions.selectedProducts = this.wizardProducts.selectedItems;
                    this.wizardPreview.refresh();
                    this.step++;
                }, 20);
            } else {
                this.toastService.addToast('Kan ikke gå videre', ToastType.warn, 3, prodStatus.msg);
            }
            return;
        case 3:
            if (this.wizardPreview.orderList && this.wizardPreview.orderList.length > 0) {
                this.wizardOptions.orders = this.wizardPreview.orderList;
            } else {
                this.toastService.addToast('Ingenting er valgt ut', ToastType.warn, 3, 'Ingenting å overføre');
                return;
            }
            break;
        }

        this.step++;

    }

    public reject() {
        this.onClose.emit(ConfirmActions.REJECT);
    }

    public cancel() {
        this.onClose.emit(ConfirmActions.CANCEL);
    }

    private startTransfer() {
        this.workInProgress = true;
        this.transferNext(0, this.wizardOptions);
    }

    private transferNext(index: number, options: IWizardOptions) {

        // Done?
        if (index >= options.orders.length) {
            this.toastService.addToast(`Fullført`, ToastType.good, 5, `${this.finalOrderList.length} ordrer ble opprettet.`);
            this.onClose.emit(ConfirmActions.ACCEPT);
            return;
        }

        this.transferBusy = true;

        const order = options.orders[index];
        this.workIndex = index;

        // Fetch updated customer-details and set to each order:
        this.customerService.Get(order.CustomerID, ['info.InvoiceAddress,info.DefaultEmail'])
            .subscribe( customer => {
            if (order && order.CustomerID > 0) {
                // set customer email
                order.EmailAddress = customer.Info.DefaultEmail && customer.Info.DefaultEmail.EmailAddress
                    ? customer.Info.DefaultEmail.EmailAddress
                    : customer.EmailAddress;

                // set customer on order (with address etc.)
                if (!order.ID) {
                    order.setCustomer(customer);
                }
                const obs = order.ID ? this.orderService.Put(order.ID, order) : this.orderService.Post(order);
                obs.finally( () => this.transferBusy = false)
                    .subscribe( result => {
                        // add to list of produced orders
                        this.finalOrderList.push(result);
                        setTimeout(() => {
                            // take next
                            this.transferNext(index + 1, options);
                        }, 10);
                    }, err => {
                        this.errorService.handle(err);
                        this.workInProgress = false;
                    }
                );
            }
        });
    }

}
