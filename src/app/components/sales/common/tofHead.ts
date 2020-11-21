import {Component, Input, Output, ViewChild, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {
    CompanySettings,
    CurrencyCode,
    Project,
    Seller,
    User,
    ValidationLevel,
    Dimensions,
    Department,
} from '../../../unientities';
import {TofCustomerCard} from './customerCard';
import {TofDetailsForm} from './detailsForm';
import {IUniTab} from '@uni-framework/uni-tabs';
import {ValidationMessage} from '@app/models/validationResult';
import {AccountMandatoryDimensionService} from '@app/services/services';
import {THEMES, theme} from 'src/themes/theme';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {AuthService} from '@app/authService';

const MAXFILESIZEEMAIL: number = 1024 * 1024 * 30;

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
    @Input() currencyCodes: CurrencyCode[];
    @Input() projects: Project[];
    @Input() departments: Department[];
    @Input() sellers: Seller[];
    @Input() contacts: any[];
    @Input() companySettings: CompanySettings;
    @Input() dimensionTypes: any[];
    @Input() reports: any[];
    @Input() distributionPlans: any[];
    @Input() paymentInfoTypes: any[];
    @Input() currentUser: User;
    @Input() canSendEHF: boolean = false;
    @Input() distributions: any[] = [];

    @Output() dataChange = new EventEmitter();
    @Output() dimensionChange = new EventEmitter();
    @Output() errorEvent = new EventEmitter();

    tabs: IUniTab[];
    activeTab = 'details';

    validationMessage: ValidationMessage;
    accountsWithMandatoryDimensionsIsUsed = true;

    constructor (
        private accountMandatoryDimensionService: AccountMandatoryDimensionService,
        private toastService: ToastService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.tabs = [
            {name: 'Detaljer', value: 'details'},
            {name: 'Betingelser og levering', value: 'delivery'},
            {name: 'Kommentar', value: 'comment'},
            {name: 'Selgere', value: 'sellers', featurePermission: 'ui.sellers'},
            {name: 'Dokumenter', value: 'attachments'},

            // Dimension tab is shown/hidden in ngOnChanges
            {name: 'Dimensjoner', value: 'dimensions', featurePermission: 'ui.dimensions', hidden: true},
            {name: 'Utsendelse', value: 'distribution', featurePermission: 'ui.distribution'}
        ];

        // Remove "Betingelser og levering" in the bruno version, keep in Complete contracttype
        const user = this.authService.currentUser;
        const contractType = user.License?.ContractType?.TypeName;
        if (theme.theme === THEMES.EXT02 && contractType?.toLowerCase() !== 'complete') {
            this.tabs.splice(1, 1);
        }

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
                ['CustomerOrder', 'CustomerInvoice', 'RecurringInvoice'].includes(this.entityName)) {
                this.data.PaymentInfoTypeID = this.paymentInfoTypes[0].ID;
            }

        }

        if (changes['dimensionTypes']) {
            const dimensionTab = (this.tabs || []).find(tab => tab.value === 'dimensions');
            if (dimensionTab) {
                dimensionTab.hidden = !this.dimensionTypes?.length;
            }
        }
    }

    onSelectedFileSize(fileSize: number) {
        if (fileSize > 0 && fileSize > MAXFILESIZEEMAIL) {
            this.toastService.addToast('Størrelse vedlegg', ToastType.warn, 10, 'Du har nådd grensen på totalt 30MB for e-post, ved sending av EHF kan du ha inntil 50MB');
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
