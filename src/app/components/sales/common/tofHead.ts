import {Component, Input, Output, ViewChild, EventEmitter, OnChanges} from '@angular/core';
import {FormControl} from '@angular/forms';
import {
    CompanySettings,
    CurrencyCode,
    Project,
    Terms,
    Seller,
    SellerLink,
    User,
} from '../../../unientities';
import {TofCustomerCard} from './customerCard';
import {TofDetailsForm} from './detailsForm';
import {IUniTab} from '@app/components/layout/uniTabs/uniTabs';

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
    @Input() paymentTerms: Terms[];
    @Input() deliveryTerms: Terms[];
    @Input() sellers: Seller[];
    @Input() companySettings: CompanySettings;
    @Input() dimensionTypes: any[];
    @Input() reports: any[];
    @Input() distributionPlans: any[];
    @Input() paymentInfoTypes: any[];
    @Input() currentUser: User;

    @Output() dataChange: EventEmitter<any> = new EventEmitter();
    @Output() sellerDelete: EventEmitter<SellerLink> = new EventEmitter<SellerLink>();

    tabs: IUniTab[];
    activeTabIndex: number = 0;

    freeTextControl: FormControl = new FormControl('');
    commentControl: FormControl = new FormControl('');

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
    }

    ngOnChanges() {
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
        }
    }

    onDataChange(data?: any) {
        const updatedEntity = data || this.data;

        updatedEntity.FreeTxt = this.freeTextControl.value;
        updatedEntity.Comment = this.commentControl.value;
        this.data = updatedEntity;
        this.dataChange.emit(this.data);
    }

    onSellerLinkDeleted(sellerLink: SellerLink) {
        if (this.data.DefaultSeller && sellerLink.SellerID === this.data.DefaultSeller.SellerID) {
            this.data.DefaultSeller = new Seller();
        }
        this.sellerDelete.emit(sellerLink);
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
}
