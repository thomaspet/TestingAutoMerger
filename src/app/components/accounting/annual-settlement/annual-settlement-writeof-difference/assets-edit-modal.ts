import {Component, Input, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {ErrorService} from '@app/services/services';
import { UniTableConfig } from '@uni-framework/ui/unitable/config/unitableConfig';

@Component({
    selector: 'assets-edit-modal',
    templateUrl: './assets-edit-modal.html',
    styleUrls: ['./assets-edit-modal.sass']
})
export class AssetsEditModal implements IUniModal {

    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    busy: boolean = true;
    tableConfig: UniTableConfig;

    constructor(
        private errorService: ErrorService,
    ) {}

    ngOnInit() {
        this.busy = false;
    }

    close() {
        this.onClose.emit();
    }
}
