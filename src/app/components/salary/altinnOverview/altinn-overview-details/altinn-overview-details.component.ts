import {Component, OnInit, Input, OnChanges, ChangeDetectionStrategy} from '@angular/core';
import {AltinnReceipt, LocalDate} from '@uni-entities';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {ErrorService} from '@app/services/services';

@Component({
    selector: 'uni-altinn-overview-details',
    templateUrl: './altinn-overview-details.component.html',
    styleUrls: ['./altinn-overview-details.component.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AltinnOverviewDetailsComponent implements OnInit, OnChanges {
    @Input() public receipt: AltinnReceipt;

    public tableConfig$: BehaviorSubject<UniTableConfig> = new BehaviorSubject(null);
    public altinnReceipts$: BehaviorSubject<IAltinnResponseReceiptDto[]> = new BehaviorSubject([]);
    public errorMessage$: BehaviorSubject<string> = new BehaviorSubject('');
    public dataOpen: boolean;

    constructor(private errorService: ErrorService) {}

    public ngOnInit() {
        this.tableConfig$.next(this.getConfig());
    }

    public ngOnChanges() {
        this.handleReceipt(this.receipt);
    }



    private handleReceipt(receipt: AltinnReceipt) {
        if (!receipt) { return; }
        if (!(receipt.AltinnResponseData || receipt.XmlReceipt)) { return; }

        try {
            const receipts: IAltinnResponseDto = JSON.parse(this.receipt.AltinnResponseData || this.receipt.XmlReceipt);
            this.errorMessage$.next(this.getError(receipts));
            this.altinnReceipts$.next(this.getFlattenedResponseReceipts(receipts));
        } catch (err) {
            this.errorService.handle(err);
        }
    }

    private getFlattenedResponseReceipts(response: IAltinnResponseDto): IAltinnResponseReceiptDto[] {
        if (!response || !response.receipt) {
            return [];
        }
        return this.flattenResponseReceipts(response.receipt);
    }

    private flattenResponseReceipts(receipt: IAltinnResponseReceiptDto): IAltinnResponseReceiptDto[] {
        if (!receipt.SubReceipts || !receipt.SubReceipts.length) {
            return [receipt];
        }

        return [
            receipt,
            ...receipt.SubReceipts
                .map(rcpt => this.flattenResponseReceipts(rcpt))
                .reduce((acc: IAltinnResponseReceiptDto[], curr) => [...acc, ...curr], []),
        ];
    }

    private getError(receipt: IAltinnResponseDto): string {
        if (!receipt) { return ''; }
        return receipt.ErrorMessage;
    }

    private getConfig(): UniTableConfig {
        const textCol = new UniTableColumn('ReceiptText', 'Tekst', UniTableColumnType.Text);
        const LastChanged = new UniTableColumn('LastChanged', 'Sist endret', UniTableColumnType.LocalDate, false)
            .setFormat('DD.MM.YYYY HH:mm:ss');
        const receiptID = new UniTableColumn('ReceiptId', 'KvitteringsID', UniTableColumnType.Number, false);
        const receiptHistory = new UniTableColumn('ReceiptHistory', 'Log', UniTableColumnType.Text);
        return new UniTableConfig('salary.altinn-overview-details')
            .setColumns([textCol, LastChanged, receiptID, receiptHistory]);
    }

}

interface IAltinnResponseDto {
    receipt: IAltinnResponseReceiptDto;
    ErrorMessage: string;
}

interface IAltinnResponseReceiptDto {
    ReceiptId: number;
    ReceiptText: string;
    ReceiptHistory: string;
    LastChanged: LocalDate;
    ReceiptTypeName: number;
    ReceiptStatusCode: number;
    ParentReceiptId: number;
    References: IAltinnReferenceDto[];
    SubReceipts: IAltinnResponseReceiptDto[];
}

interface IAltinnReferenceDto {
    ReferenceValue: string;
    ReferenceTypeName: number;
    ReporteeID: number;
}
