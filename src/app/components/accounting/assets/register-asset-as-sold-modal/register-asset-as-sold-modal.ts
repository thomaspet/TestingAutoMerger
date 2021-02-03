import {Component, ErrorHandler, EventEmitter} from '@angular/core';
import {IModalOptions, UniModalService} from '@uni-framework/uni-modal';
import {Customer, LocalDate, VatType} from '@uni-entities';
import {VatTypeService} from '@app/services/accounting/vatTypeService';
import {buildAssetSoldForm} from '@app/components/accounting/assets/register-asset-as-sold-modal/buildAssetSoldForm';
import {AssetsService} from '@app/services/common/assetsService';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {take} from 'rxjs/operators';
import {CustomerEditModal} from '@app/components/common/modals/customer-edit-modal/customer-edit-modal';
import {StatisticsService} from '@app/services/common/statisticsService';

@Component({
    selector: 'register-asset-as-sold-modal',
    templateUrl: './register-asset-as-sold-modal.html'
})
export class RegisterAssetAsSoldModal {
    options: IModalOptions;
    onClose = new EventEmitter();
    vatTypes: VatType[];
    config = { autofocus: true, showLabelAbove: true };
    model: any = {
        _createInvoice: true
    };
    form = [];
    customer: Customer = null;
    customerAutocompleteOptions = {
        canClearValue: false,
        lookup: query => this.customerLookup(query),
        displayFunction: item => {
            if (item) {
                const name = item.Info ? item.Info.Name : item.Name;
                return item.CustomerNumber ? `${item.CustomerNumber} - ${name}` : name;
            }

            return '';
        },
        resultTableColumns: [
            { header: 'Kundenr', field: 'CustomerNumber' },
            { header: 'Navn', field: 'Name' },
            { header: 'Adresse', field: 'AddressLine1' },
            {
                header: 'Poststed',
                template: item => {
                    if (item.PostalCode || item.City) {
                        return `${item.PostalCode} - ${item.City}`;
                    }
                }
            },
            { header: 'Orgnummer', field: 'OrgNumber' },
        ],
        createLabel: 'Opprett ny kunde',
        createHandler: () => this.modalService.open(CustomerEditModal).onClose
    };

    constructor(
        private assetsService: AssetsService,
        private vatTypeService: VatTypeService,
        private errorHandler: ErrorHandler,
        private statisticsService: StatisticsService,
        private modalService: UniModalService,
        private toast: ToastService) {
            this.vatTypeService.GetVatTypesWithDefaultVatPercent(
                'filter=OutputVat eq true and (VatCode eq 3 or VatCode eq 5 or VatCode eq 52)'
            ).pipe(take(1)).subscribe(vatTypes => {
                this.form = buildAssetSoldForm(vatTypes);
            });
    }

    ngOnInit() {
        this.model = Object.assign({}, this.model, this.options.data);
        this.assetsService.getAsset(this.model.AssetID).subscribe(x => {
            this.model = Object.assign({}, this.model, {CurrentNetFinancialValue: x.CurrentNetFinancialValue});
        });
    }

    onCustomerChange(customer: Customer) {
        if (customer) {
            this.model['CustomerID'] = customer.ID;
        }
    }

    save() {
        const model = <any>this.model;
        if (!model.SoldAmount) {
            this.toast.addToast('Du må skrive salgsbeløp for salget', ToastType.warn, 5);
            return;
        }
        if (!model.VatTypeID) {
            this.toast.addToast('Du må velge mva kode for salget', ToastType.warn, 5);
            return;
        }
        this.assetsService.sellAsset(
            model.AssetID,
            model.CustomerID,
            model.VatTypeID,
            model.SoldDate,
            model.SoldAmount,
            model._createInvoice
        ).pipe(take(1)).subscribe(result => {
                this.toast.addToast('Eiendel er solgt', ToastType.good, 5);
                this.onClose.emit(true);
            }, (error) => this.errorHandler.handleError(error));
    }

    customerLookup(query: string) {
        const expand = 'Info.DefaultPhone,Info.InvoiceAddress';
        const select = [
            'Customer.ID as ID',
            'Info.Name as Name',
            'Customer.OrgNumber as OrgNumber',
            'InvoiceAddress.AddressLine1 as AddressLine1',
            'InvoiceAddress.PostalCode as PostalCode',
            'InvoiceAddress.City as City',
            'Customer.CustomerNumber as CustomerNumber',
            'Customer.StatusCode as StatusCode',
        ].join(',');

        let filter = `(Customer.Statuscode ne 50001 and Customer.Statuscode ne 90001)`;

        if (query && query.length) {
            const queryFilter = ['Customer.OrgNumber', 'Customer.CustomerNumber', 'Info.Name']
                .map(field => `contains(${field},'${query}')`)
                .join(' or ');

            filter += ` and ( ${queryFilter} )`;
        }

        const odata = `model=Customer`
            + `&expand=${expand}`
            + `&select=${select}`
            + `&filter=${filter}`
            + `&orderby=Info.Name&top=50&distinct=true`;

        return this.statisticsService.GetAllUnwrapped(odata);
    }
}
