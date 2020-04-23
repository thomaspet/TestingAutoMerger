import {Component, Input, Output, ViewChild, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {
    CompanySettings,
    CurrencyCode,
    Project,
    Seller,
    User,
    ValidationLevel,
    Dimensions,
} from '../../../unientities';
import {TofCustomerCard} from './customerCard';
import {TofDetailsForm} from './detailsForm';
import {IUniTab} from '@uni-framework/uni-tabs';
import {ValidationMessage} from '@app/models/validationResult';
import {AccountMandatoryDimensionService} from '@app/services/services';

@Component({
    selector: 'uni-tof-head',
    templateUrl: './tofHead.html'
})
export class TofHead implements OnChanges {
    @ViewChild(TofCustomerCard, { static: true }) private customerCard: TofCustomerCard;
    @ViewChild(TofDetailsForm) detailsForm: TofDetailsForm;

    @Input() entityName: string;
    @Input() readonly: boolean;
    @Input() data: any;
    @Input() currencyCodes: Array<CurrencyCode>;
    @Input() projects: Project;
    @Input() sellers: Seller[];
    @Input() contacts: any[];
    @Input() companySettings: CompanySettings;
    @Input() dimensionTypes: any[];
    @Input() reports: any[];
    @Input() distributionPlans: any[];
    @Input() paymentInfoTypes: any[];
    @Input() currentUser: User;
    @Input() canSendEHF: boolean = false;

    @Output() dataChange: EventEmitter<any> = new EventEmitter();

    tabs: IUniTab[];
    activeTab = 'details';

    validationMessage: ValidationMessage;
    accountsWithMandatoryDimensionsIsUsed = true;

    constructor (private accountMandatoryDimensionService: AccountMandatoryDimensionService) {}

    ngOnInit() {
        this.tabs = [
            {name: 'Detaljer', value: 'details'},
            {name: 'Betingelser og levering', value: 'delivery'},
            {name: 'Kommentar', value: 'comment'},
            {name: 'Selgere', value: 'sellers', featurePermission: 'ui.sellers'},
            {name: 'Dokumenter', value: 'attachments'},
            {name: 'Dimensjoner', value: 'dimensions', featurePermission: 'ui.dimensions'},
            {name: 'Utsendelse', value: 'distribution', featurePermission: 'ui.distribution'}
        ];

        if (this.entityName === 'CustomerInvoice') {
            this.tabs.push({name: 'Purringer', value: 'reminders', featurePermission: 'ui.debt-collection'});
        }

        if (this.entityName === 'RecurringInvoice') {
            this.activeTab = 'settings';
            this.tabs.unshift({name: 'Innstillinger', value: 'settings'});
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.data) {
            if (this.sellers && this.data.ID === 0 && this.currentUser) {
                const userSeller = this.sellers.find(seller => seller.UserID === this.currentUser.ID);
                if (userSeller) {
                    this.data.DefaultSeller = userSeller;
                    this.data.DefaultSellerID = userSeller.ID;
                }
            }

            if (this.data.PaymentInfoTypeID === null && this.data.ID === 0 &&
                ["CustomerOrder", "CustomerInvoice", "RecurringInvoice"].includes(this.entityName)) {
                this.data.PaymentInfoTypeID = this.paymentInfoTypes[0].ID;
            }
        }
    }

    onSellersChange($event) {
        this.dataChange.emit(this.data);
    }

    onDataChange(data?: any) {
        const updatedEntity = data || this.data;
        this.data = updatedEntity;
        this.dataChange.emit(this.data);
    }

    focus() {
        if (this.customerCard) {
            this.customerCard.focus();
        }
    }

    focusDetailsForm(event?: KeyboardEvent) {
        event.preventDefault();
        if (this.detailsForm && this.detailsForm.form) {
            this.detailsForm.form.focus();
        }
    }

    isReadOnly(): boolean {
        return this.entityName !== 'CustomerInvoice' ? this.readonly : false;
    }

    public getValidationMessage(customerID: number, dimensionsID: number = null, dimensions: Dimensions = null) {
        if (!this.accountsWithMandatoryDimensionsIsUsed) {
            return;
        }

        if (dimensionsID || dimensions) {
            this.accountMandatoryDimensionService.getCustomerMandatoryDimensionsReport(
                customerID, dimensionsID, dimensions
            ).subscribe((report) => {
                this.validationMessage = new ValidationMessage();
                if (report && report.MissingRequiredDimensionsMessage) {
                    this.validationMessage.Level = ValidationLevel.Error;
                    this.validationMessage.Message = report.MissingRequiredDimensionsMessage;
                } else {
                    this.validationMessage.Level = 0;
                }
            });
        }
    }

    public clearValidationMessage() {
        this.validationMessage = new ValidationMessage();
        this.validationMessage.Level = 0;
    }
}
