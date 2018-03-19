import {Component, Input, Output, ViewChild, EventEmitter, OnChanges, SimpleChanges, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {
    CompanySettings,
    CurrencyCode,
    Project,
    Terms,
    Seller,
    SellerLink,
    StatusCodeCustomerInvoice,
    StatusCodeCustomerQuote
} from '../../../unientities';
import {TofCustomerCard} from './customerCard';
import {TofDetailsForm} from './detailsForm';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import { FieldType, UniForm } from '@uni-framework/ui/uniform';

declare var _;

@Component({
    selector: 'uni-tof-head',
    templateUrl: './tofHead.html'
})
export class TofHead implements OnChanges, OnInit {
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

    public tabs: string[] = ['Detaljer', 'Betingelser og levering', 'Valuta', 'Fritekst', 'Selgere', 'Dokumenter'];
    public activeTabIndex: number = 0;

    private freeTextControl: FormControl = new FormControl('');
    private commentControl: FormControl = new FormControl('');

    public ngOnInit() {
        if (this.entityName === 'CustomerInvoice') {
            this.tabs.push('Purringer');
        }
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (this.data) {
            this.freeTextControl.setValue(this.data.FreeTxt, {emitEvent: false});
            this.commentControl.setValue(this.data.Comment, {emitEvent: false});
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

    public focus() {
        if (this.customerCard) {
            this.customerCard.focus();
        }
    }

    private isReadOnly(): boolean {
        return this.entityName !== 'CustomerInvoice' ? this.readonly : false;
    }
}
