import {Component, Input, Output, ViewChild, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {FormControl} from '@angular/forms';
import {CompanySettings, CurrencyCode, Project, Terms, Seller, SellerLink} from '../../../unientities';
import {TofCustomerCard} from './customerCard';
import {TofDetailsForm} from './detailsForm';

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

    @Output() public dataChange: EventEmitter<any> = new EventEmitter();
    @Output() public sellerDelete: EventEmitter<SellerLink> = new EventEmitter<SellerLink>();

    public tabs: string[] = ['Detaljer', 'Betingelser og levering', 'Fritekst', 'Selgere', 'Dokumenter'];
    public activeTabIndex: number = 0;

    private freeTextControl: FormControl = new FormControl('');
    private commentControl: FormControl = new FormControl('');

    public ngOnChanges(changes: SimpleChanges) {
        if (this.data) {
            this.freeTextControl.setValue(this.data.FreeTxt, {emitEvent: false});
            this.commentControl.setValue(this.data.Comment, {emitEvent: false});
        }
    }

    public onDataChange(data?: any) {
        let updatedEntity = data || this.data;

        updatedEntity.FreeTxt = this.freeTextControl.value;
        updatedEntity.Comment = this.commentControl.value;

        this.dataChange.emit(updatedEntity);
        this.data = _.cloneDeep(updatedEntity);
    }

    public onMainSellerSet(sellerLink: SellerLink) {
        this.data.DefaultSellerLinkID = sellerLink.ID;
        this.data.DefaultSeller = sellerLink;
        this.dataChange.emit(this.data);
    }

    public onSellerLinkDeleted(sellerLink: SellerLink) {
        if (this.data.DefaultSeller && sellerLink.SellerID === this.data.DefaultSeller.SellerID) {
            this.data.DefaultSeller = new SellerLink();
            this.data.DefaultSellerLinkID = null;
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
}
