import {Component, ErrorHandler, EventEmitter, SimpleChanges} from '@angular/core';
import {IModalOptions} from '@uni-framework/uni-modal';
import {FieldType} from '@uni-framework/ui/uniform';
import {AssetsService} from '@app/services/common/assetsService';
import {LocalDate} from '@uni-entities';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {take} from 'rxjs/operators';

@Component({
    selector: 'register-depreciation-modal',
    templateUrl: './register-depreciation-modal.html'
})
export class RegisterDepreciationModal {
    options: IModalOptions;
    onClose = new EventEmitter();
    config = { autofocus: true, showLabelAbove: true };
    model = {
        DepreciationDate: new LocalDate(new Date()),
        Description: '',
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
            Property: 'CurrentNetFinancialValue',
            Label: 'Regnskapverdi',
            FieldType: FieldType.NUMERIC,
            Options: {
                decimalLength: 2,
                decimalSeparator: ','
            },
            ReadOnly: true
        },
        {
            Section: 0,
            FieldSet: 0,
            FieldSetColumn: 1,
            Property: 'DepreciationValue',
            Label: 'Nedskrives med (eks MVA)',
            FieldType: FieldType.NUMERIC,
            Options: {
                decimalLength: 2,
                decimalSeparator: ','
            }
        },
        {
            Section: 0,
            FieldSet: 0,
            FieldSetColumn: 1,
            Property: 'NewNetFinancialValue',
            Label: 'Ny Regnskapsverdi',
            FieldType: FieldType.NUMERIC,
            Options: {
                decimalLength: 2,
                decimalSeparator: ','
            }
        },
        {
            Section: 0,
            FieldSet: 0,
            FieldSetColumn: 1,
            Property: 'Description',
            Label: 'Beskrivelse',
            FieldType: FieldType.TEXTAREA,
            Classes: 'full-width'
        }
    ];

    constructor(
        private assetsService: AssetsService,
        private errorHandler: ErrorHandler,
        private toast: ToastService) {}

    ngOnInit() {
        this.model = Object.assign({}, this.model, this.options.data);
    }

    onChangeEvent(changes: SimpleChanges) {
        const model = <any>this.model;
        if (changes.NewNetFinancialValue) {
            model.DepreciationValue = model.CurrentNetFinancialValue - model.NewNetFinancialValue;
        } else if (changes.DepreciationValue) {
            model.NewNetFinancialValue = model.CurrentNetFinancialValue - model.DepreciationValue;
        }
        this.model = {...model};
    }

    reduce() {
        const model = <any> this.model;
        if (!model.Description) {
            this.toast.addToast('Du må skrive en beskrivelse', ToastType.warn, 5);
            return;
        }
        if (!(model.DepreciationValue >= 0)) {
            this.toast.addToast('Du må skrive nedskrives med verdien', ToastType.warn, 5);
            return;
        }
        this.assetsService.depreciateAsset(
            model.AssetID,
            new LocalDate(new Date()),
            model.DepreciationValue,
            model.Description
        ).pipe(take(1)).subscribe(result => {
            this.toast.addToast('Eiendel er nedskrevet', ToastType.good, 5);
            this.onClose.emit(true);
        }, (error) => this.errorHandler.handleError(error));
    }
}
