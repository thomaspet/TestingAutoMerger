import {
    Component, Input, Output, EventEmitter, OnInit
} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal/interfaces';
import { ErrorService } from '@app/services/services';
import { CompanyAccountingSettingsService } from '@app/services/accounting/companyAccountingSettingsService';
import { FieldType } from '@uni-framework/ui/uniform';
import { CompanyAccountingSettings, Product } from '@app/unientities';
import { ProductService } from '@app/services/common/productService';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'uni-company-accounting-settings-modal',
    templateUrl: './companyAccountingSettingsModal.html'
})
export class UniCompanyAccountingSettingsModal implements OnInit, IUniModal {

    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter();

    layout;
    model;

    constructor(
        private companyAccountSettingsService: CompanyAccountingSettingsService,
        private productService: ProductService,
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        this.model = this.options.data.model;
        this.layout = this.formLayout();
    }

    close() {
        this.onClose.emit(null);
    }

    save() {
        const returnedValue: CompanyAccountingSettings = new CompanyAccountingSettings();
        forkJoin([
            this.productService.Get(this.model.ReInvoicingCostsharingProductID, ['Account', 'VatType', 'VatType.VatTypePercentages']),
            this.productService.Get(this.model.ReInvoicingTurnoverProductID, ['Account', 'VatType', 'VatType.VatTypePercentages'])]
        ).subscribe(([ReInvoicingCostsharingProduct, ReInvoicingTurnoverProduct]) => {
            returnedValue.ReInvoicingCostsharingProduct = <Product>ReInvoicingCostsharingProduct;
            returnedValue.ReInvoicingTurnoverProduct = <Product>ReInvoicingTurnoverProduct;
            this.companyAccountSettingsService.Put(this.model.ID, <CompanyAccountingSettings>{
                ID: this.model.ID,
                ReInvoicingCostsharingProductID: this.model.ReInvoicingCostsharingProductID,
                ReInvoicingTurnoverProductID: this.model.ReInvoicingTurnoverProductID,
                ReInvoicingMethod: this.model.ReInvoicingMethod
            }).subscribe(result => {
                this.onClose.emit(Object.assign(result, returnedValue));
            });
        });
    }

    formLayout() {
        return [
            {
                Property: 'ReInvoicingCostsharingProductID',
                FieldType: FieldType.AUTOCOMPLETE,
                Label: 'Standard varenr kostnadsdeling',
                Options: {
                    source: [],
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                    debounceTime: 200,
                    template: (obj: Product) => obj ? `${obj.PartName} - ${obj.Name}` : '',
                    search: (query) => {
                        return this.productService.GetAll(`filter=startswith(ID,'${query}') or contains(Name,'${query}')&top=50`);
                    },
                    getDefaultData: () => {
                        return this.companyAccountSettingsService.GetAll('', ['ReInvoicingCostsharingProduct'])
                            .map(result => {
                                if (result.length > 0) {
                                    return [result[0].ReInvoicingCostsharingProduct];
                                } else {
                                    return [];
                                }
                            });
                    }

                }
            },
            {
                Property: 'ReInvoicingTurnoverProductID',
                FieldType: FieldType.AUTOCOMPLETE,
                Label: 'Standard varenr viderefakturering, omsetning',
                Options: {
                    source: [],
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                    debounceTime: 200,
                    template: (obj: Product) => obj ? `${obj.PartName} - ${obj.Name}` : '',
                    search: (query) => {
                        return this.productService.GetAll(`filter=startswith(PartName,'${query}') or contains(Name,'${query}')&top=50`);
                    },
                    getDefaultData: () => {
                        return this.companyAccountSettingsService.GetAll('', ['ReInvoicingTurnoverProduct'])
                            .map(result => {
                                if (result.length > 0) {
                                    return [result[0].ReInvoicingTurnoverProduct];
                                } else {
                                    return [];
                                }
                            });
                    }

                }
            },
            {
                Property: 'ReInvoicingMethod',
                FieldType: FieldType.DROPDOWN,
                Label: 'Viderefakturere som',
                Options: {
                    source: [
                        { ID: 0, Name: 'Faktura (Kladd)' },
                        { ID: 1, Name: 'Faktura (Fakturert)' },
                        { ID: 2, Name: 'Ordre (Registrert)' }
                    ],
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                    addEmptyValue: false,
                    searchable: false,
                    hideDeleteButton: true
                }
            }
        ];
    }
}
