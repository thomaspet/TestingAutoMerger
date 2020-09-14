import {Component, EventEmitter, SimpleChanges} from '@angular/core';
import {IModalOptions} from '@uni-framework/uni-modal';
import {FieldType} from '@uni-framework/ui/uniform';
import {of} from 'rxjs';
import * as moment from 'moment';
import {LocalDate} from '@uni-entities';

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

    constructor() {}

    emit() {
        this.onClose.emit();
    }
}
