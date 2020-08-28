import {Component, EventEmitter, SimpleChanges} from '@angular/core';
import {IModalOptions} from '@uni-framework/uni-modal';
import {FieldType} from '@uni-framework/ui/uniform';
import {of} from 'rxjs';
import * as moment from 'moment';
import {LocalDate} from '@uni-entities';

const months = [
    { month: 1, name: 'Januar'},
    { month: 2, name: 'Februar'},
    { month: 3, name: 'Mars'},
    { month: 4, name: 'April'},
    { month: 5, name: 'Mai'},
    { month: 6, name: 'Juni'},
    { month: 7, name: 'Juli'},
    { month: 8, name: 'August'},
    { month: 9, name: 'September'},
    { month: 10, name: 'Oktober'},
    { month: 11, name: 'November'},
    { month: 12, name: 'Desember'},
];

@Component({
    selector: 'manual-depreciation-modal',
    templateUrl: './manual-depreciation-modal.html'
})
export class ManualDepreciationModal {
    options: IModalOptions;
    onClose = new EventEmitter();
    config = { autofocus: true, showLabelAbove: true };
    model = {
        DepreciationMonth: 1
    };


    mainForm = [
        {
            Section: 0,
            FieldSet: 0,
            FieldSetColumn: 1,
            Property: 'DepreciationMonth',
            Label: 'Avskrivning Periode',
            FieldType: FieldType.DROPDOWN,
            Options: {
                hideDeleteButton: true,
                source: months,
                valueProperty: 'month',
                debounceTime: 200,
                template: item => `${item.month} - ${item.name}`,
                search: (query) => {
                    return of(months.filter((month) => {
                        return month.name.toLowerCase().includes(query)
                            || query.startsWith(month.month + '');
                    }));
                }
            }
        }
    ];

    constructor() {}

    emit() {
        const currentYear = new Date().getFullYear();
        const month = this.model.DepreciationMonth;
        const day = 1;
        const date = moment(`${month}-${day}-${currentYear}`).endOf('month');

        this.onClose.emit(new LocalDate(date.toDate()));
    }
}
