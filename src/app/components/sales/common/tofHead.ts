import {Component, Input, Output, ViewChild, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {FormControl} from '@angular/forms';
import {
    CompanySettings,
    CurrencyCode,
    Project,
    Terms,
    Seller,
    SellerLink,
    StatusCodeCustomerInvoice,
    StatusCodeCustomerQuote,
    User,
} from '../../../unientities';
import {TofCustomerCard} from './customerCard';
import {TofDetailsForm} from './detailsForm';
import {UniDimensionTOFView} from './dimensionForm';

declare var _;

@Component({
    selector: 'uni-tof-head',
    templateUrl: './tofHead.html'
})
export class TofHead implements OnChanges {
    @ViewChild(TofCustomerCard) private customerCard: TofCustomerCard;
    @ViewChild(TofDetailsForm) public detailsForm: TofDetailsForm;

    @Input() public entityName: string;
    @Input() public readonly: boolean;
    @Input() private data: any;
    @Input() public currencyCodes: Array<CurrencyCode>;
    @Input() public projects: Project;
    @Input() public paymentTerms: Terms[];
    @Input() public deliveryTerms: Terms[];
    @Input() public sellers: Seller[];
    @Input() public companySettings: CompanySettings;
    @Input() public dimensionTypes: any[];
    @Input() public paymentInfoTypes: any[];
    @Input() public currentUser: User;

    @Output() public dataChange: EventEmitter<any> = new EventEmitter();
    @Output() public sellerDelete: EventEmitter<SellerLink> = new EventEmitter<SellerLink>();

    public tabs: string[] = ['Detaljer', 'Betingelser og levering', 'Fritekst', 'Selgere', 'Dokumenter', 'Dimensjoner'];
    public activeTabIndex: number = 0;

    private freeTextControl: FormControl = new FormControl('');
    private commentControl: FormControl = new FormControl('');

    public ngOnChanges(changes: SimpleChanges) {
        if (this.data) {
            this.freeTextControl.setValue(this.data.FreeTxt, {emitEvent: false});
            this.commentControl.setValue(this.data.Comment, {emitEvent: false});

            if (this.sellers && this.data.ID === 0 && this.currentUser) {
                const userIsSeller = this.sellers.find(seller => seller.UserID === this.currentUser.ID);
                if (userIsSeller) {
                    this.data.DefaultSeller = userIsSeller;
                }
            }
        }
    }

    public onDataChange(data?: any) {
        const updatedEntity = data || this.data;

        updatedEntity.FreeTxt = this.freeTextControl.value;
        updatedEntity.Comment = this.commentControl.value;

        this.dataChange.emit(updatedEntity);
        this.data = _.cloneDeep(updatedEntity);
    }

    public onSellerLinkDeleted(sellerLink: SellerLink) {
        if (this.data.DefaultSeller && sellerLink.SellerID === this.data.DefaultSeller.SellerID) {
            this.data.DefaultSeller = new Seller();
        }
        this.sellerDelete.emit(sellerLink);
        this.dataChange.emit(this.data);
    }

    public ngOnInit() {
        if (this.entityName === 'CustomerInvoice') {
            this.tabs.push('Purringer');
        }
    }

    public focus() {
        if (this.customerCard) {
            this.customerCard.focus();
        }
    }

    private isReadOnly(): boolean {
        return this.entityName !== 'CustomerInvoice' ? this.readonly : false;
    }
}
