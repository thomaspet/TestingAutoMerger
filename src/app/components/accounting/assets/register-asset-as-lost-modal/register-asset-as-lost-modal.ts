import {Component, ErrorHandler, EventEmitter} from '@angular/core';
import {IModalOptions} from '@uni-framework/uni-modal';
import {FieldType} from '@uni-framework/ui/uniform';
import {AssetsService} from '@app/services/common/assetsService';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {take} from 'rxjs/operators';

@Component({
    selector: 'register-asset-as-lost-modal',
    templateUrl: './register-asset-as-lost-modal.html'
})
export class RegisterAssetAsLostModal {
    options: IModalOptions;
    onClose = new EventEmitter();
    config = { autofocus: true, showLabelAbove: true };
    model = {
        Description: ''
    };
    mainForm = [
        {
            Section: 0,
            FieldSet: 0,
            FieldSetColumn: 1,
            Property: 'DepreciationDate',
            Label: 'Dato',
            FieldType: FieldType.LOCAL_DATE_PICKER,
        },
        {
            Section: 0,
            FieldSet: 0,
            FieldSetColumn: 1,
            Property: 'NetFinancialValue',
            Label: 'Regnskapverdi',
            FieldType: FieldType.NUMERIC,
            Options: {
                decimalLength: 2,
                decimalSeparator: ','
            },
            ReadOnly: true
        }
    ];
    descriptionForm = [
        {
            Section: 0,
            FieldSet: 0,
            FieldSetColumn: 1,
            Property: 'Description',
            Label: 'Beskrivelse',
            FieldType: FieldType.TEXT
        }
    ];
    constructor(
        private assetsService: AssetsService,
        private errorHandler: ErrorHandler,
        private toast: ToastService
        ) {}

    ngOnInit() {
        this.model = Object.assign({}, this.model, this.options.data);
    }

    save() {
        const model = <any>this.model;
        if (!model.Description) {
            this.toast.addToast('Du må skrive en beskrivelse', ToastType.warn, 5);
            return;
        }
        this.assetsService.setAssetAsLost(
            model.AssetID,
            model.DepreciationDate,
            model.Description
        ).pipe(take(1)).subscribe(result => {
            this.toast.addToast('Eiendel markert som tapt', ToastType.good, 5);
            this.onClose.emit(true);
        }, (error) => this.errorHandler.handleError(error));
    }
}
