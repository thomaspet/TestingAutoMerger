import {Component, OnInit, Input, OnChanges, ChangeDetectionStrategy} from '@angular/core';
import {AltinnReceipt, LocalDate} from '@uni-entities';
import {BehaviorSubject} from 'rxjs';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {ErrorService} from '@app/services/services';
import {
    AltinnOverviewParser,
    IAltinnResponseReceiptDto,
    IAltinnResponseDto,
} from '@app/components/altinn/overview/altinnOverviewParser';

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

    constructor(
        private errorService: ErrorService,
        private parser: AltinnOverviewParser,
    ) {}

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
            this.useAltinnResponse(this.parser.parseReceipt(receipt));
        } catch (err) {
            this.errorService.handle(err);
        }
    }

    private useAltinnResponse(response: IAltinnResponseDto) {
        this.errorMessage$.next(this.getError(response));
        this.altinnReceipts$.next(this.getFlattenedResponseReceipts(response));
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
            .setAutoAddNewRow(false)
            .setColumns([textCol, LastChanged, receiptID, receiptHistory]);
    }

}
