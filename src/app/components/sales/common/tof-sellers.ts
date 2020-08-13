import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Seller, FieldType} from '@uni-entities';
import {cloneDeep} from 'lodash';
import {GuidService} from '@app/services/services';

@Component({
    selector: 'tof-sellers',
    template: `
        <label class="uni-label" style="width: 20rem">
            <span>Hovedselger</span>
            <uni-select-input
                *ngIf="sellerField"
                [field]="sellerField"
                [model]="data"
                (changeEvent)="onSellerSelected()">
            </uni-select-input>
        </label>

        <seller-links
            [readonly]="readonly"
            [(entity)]="data"
            (entityChange)="onSellerLinksChange()">
        </seller-links>
    `
})
export class TofSellers {
    @Input() readonly: boolean;
    @Input() sellers: Seller[];
    @Input() data;
    @Output() dataChange = new EventEmitter();

    sellerField;

    constructor(private guidService: GuidService) {}

    ngOnChanges(changes) {
        if (changes['sellers']) {
            this.sellerField = {
                FieldSet: 1,
                FieldSetColumn: 2,
                FeaturePermission: 'ui.sellers',
                Property: 'DefaultSellerID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Hovedselger',
                Section: 0,
                Options: {
                    source: this.sellers,
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                    debounceTime: 200,
                    addEmptyValue: true,
                }
            };
        }
    }

    onSellerSelected() {
        if (!this.data.DefaultSellerID) {
            this.data.DefaultSeller = null;
        }

        if (this.data.DefaultSellerID && !this.data.Sellers?.length) {
            const seller = (this.sellers || []).find(s => s.ID === this.data.DefaultSellerID);
            if (seller) {
                this.data.Sellers = [{
                    SellerID: seller.ID,
                    Seller: seller,
                    Percent: 100,
                    _createguid: this.guidService.guid()
                }];

                this.data = cloneDeep(this.data);
            }
        }

        this.dataChange.emit(this.data);
    }

    onSellerLinksChange() {
        if (!this.data.DefaultSellerID) {
            const sellerLinks = (this.data.Sellers || []).filter(link => !link.Deleted);
            if (sellerLinks.length === 1 && sellerLinks[0]?.SellerID) {
                this.data.DefaultSellerID = sellerLinks[0].SellerID;
                this.data = cloneDeep(this.data);
            }
        }

        this.dataChange.emit(this.data);
    }
}
