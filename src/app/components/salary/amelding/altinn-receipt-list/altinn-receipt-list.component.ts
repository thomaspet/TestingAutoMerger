import {Component, OnChanges, Input, SimpleChanges} from '@angular/core';
import {AltinnReceiptService, ErrorService} from '../../../../services/services';
import {AltinnReceipt} from '@uni-entities';
import {BehaviorSubject} from 'rxjs';
import {Observable} from 'rxjs';
import {UniTableColumn, UniTableConfig, UniTableColumnType} from '../../../../../framework/ui/unitable';

export interface IAltinnReceiptListOptions {
    form: string;
    action: (receipt: AltinnReceipt) => Observable<any>;
    actionText: string;
    title: string;
}

@Component({
    selector: 'uni-altinn-receipt-list',
    templateUrl: './altinn-receipt-list.component.html',
    styleUrls: ['./altinn-receipt-list.component.sass']
})
export class AltinnReceiptListComponent implements OnChanges {
    @Input()
    public options: IAltinnReceiptListOptions;

    model$: BehaviorSubject<AltinnReceipt[]> = new BehaviorSubject([]);
    receiptTable: UniTableConfig;
    busy: boolean;

    constructor (
        private altinnReceiptService: AltinnReceiptService,
        private errorService: ErrorService
    ) { }

    public ngOnChanges(changes: SimpleChanges) {
        if (!changes['options']) {
            return;
        }
        const options = changes['options'].currentValue;
        this.populateModel(options);
        this.createConfig(options);
    }

    private createConfig(options: IAltinnReceiptListOptions) {
        const dateSendtColumn = new UniTableColumn('TimeStamp', 'Dato sendt', UniTableColumnType.LocalDate).setFormat('DD.MM.YYYY HH:mm');
        const receiptIDColumn = new UniTableColumn('ReceiptID', 'ID', UniTableColumnType.Number);
        const signatureColumn = new UniTableColumn('UserSign', 'Signatur', UniTableColumnType.Text);
        const isReadColumn = new UniTableColumn('HasBeenRegistered', 'Innlest', UniTableColumnType.Boolean);

        const contextMenuItem = {
            label: options.actionText,
            action: (rowModel) => {
                this.busy = true;
                options.action(rowModel)
                    .finally(() => this.busy = false)
                    .subscribe();
            }
        };

        this.receiptTable = new UniTableConfig('salary.altinnReceiptList.altinn-receipt-list.altinn-receipt-list.component', false)
            .setColumns([ dateSendtColumn, receiptIDColumn, signatureColumn, isReadColumn ])
            .setContextMenu([contextMenuItem])
            .setPageSize(10);
    }

    private populateModel(options: IAltinnReceiptListOptions) {
        this.busy = true;
        this.altinnReceiptService.invalidateCache();
        this.altinnReceiptService
            .GetAll(`filter=Form eq '${options.form}'&orderby=TimeStamp desc`)
            .finally(() => this.busy = false)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe(receipts => this.model$.next(receipts));
    }

    public refreshList() {
        this.populateModel(this.options);
    }
}
