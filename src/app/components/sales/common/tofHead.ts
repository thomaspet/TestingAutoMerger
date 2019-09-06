import {Component, Input, Output, ViewChild, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {FormControl} from '@angular/forms';
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
import {IUniTab} from '@app/components/layout/uni-tabs';
import {ValidationMessage} from '@app/models/validationResult';
import {AccountMandatoryDimensionService} from '@app/services/services';

@Component({
    selector: 'uni-tof-head',
    templateUrl: './tofHead.html'
})
export class TofHead implements OnChanges {
    @ViewChild(TofCustomerCard) private customerCard: TofCustomerCard;
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

    @Output() dataChange: EventEmitter<any> = new EventEmitter();

    tabs: IUniTab[];
    activeTabIndex: number = 0;
    indexes: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    freeTextControl: FormControl = new FormControl('');
    commentControl: FormControl = new FormControl('');
    validationMessage: ValidationMessage;
    accountsWithMandatoryDimensionsIsUsed = true;

    constructor (private accountMandatoryDimensionService: AccountMandatoryDimensionService) {
    }

    ngOnInit() {
        this.tabs = [
            {name: 'Detaljer'},
            {name: 'Betingelser og levering'},
            {name: 'Fritekst'},
            {name: 'Selgere'},
            {name: 'Dokumenter'},
            {name: 'Dimensjoner'},
            {name: 'Distribusjon'}
        ];

        if (this.entityName === 'CustomerInvoice') {
            this.tabs.push({name: 'Purringer'});
        }

        if (this.entityName === 'RecurringInvoice') {
            this.tabs.unshift({name: 'Innstillinger'});
            this.indexes = this.indexes.map(i => ++i);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.data) {
            this.freeTextControl.setValue(this.data.FreeTxt, {emitEvent: false});
            this.commentControl.setValue(this.data.Comment, {emitEvent: false});

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

        updatedEntity.FreeTxt = this.freeTextControl.value;
        updatedEntity.Comment = this.commentControl.value;
        this.data = updatedEntity;
        this.dataChange.emit(this.data);
    }

    focus() {
        if (this.customerCard) {
            this.customerCard.focus();
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
