import { IModalOptions, IUniModal } from '@uni-framework/uni-modal';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { StatisticsService } from '@app/services/common/statisticsService';
import {
    UniTable,
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType
} from '../../../../../framework/ui/unitable/index';
import {
    ErrorService
} from '../../../../services/services';
import {Observable} from 'rxjs';
import {HttpParams} from '@angular/common/http';

@Component({
    selector: 'uni-avtalegiro-modal',
    template: `
        <section role="dialog" class="uni-modal medium">
            <header>Avtalegiro påmeldinger/avmeldinger</header>
            <article class="image-modal-body">
                <ag-grid-wrapper
                    [resource]="lookupFunction"
                    [config]="uniTableConfig">
                </ag-grid-wrapper>
            </article>
            <footer>
                <button (click)="close()" class="bad">Avbryt</button>
            </footer>
        </section>
    `
})
export class AvtaleGiroModal implements IUniModal {
    @Input() options: IModalOptions;
    @Output() onClose: EventEmitter<any> = new EventEmitter<any>(true);

    @ViewChild(UniTable, { static: false })
    public unitable: UniTable

    public uniTableConfig: UniTableConfig;
    public lookupFunction: (urlParams: HttpParams) => any;

    constructor(
        private statisticsService: StatisticsService,
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        this.uniTableConfig = this.generateUniTableConfig();
        this.lookupFunction = (urlParams: HttpParams) =>
            this.getTableData(urlParams).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private getTableData(urlParams: HttpParams): Observable<any> {
        urlParams = (urlParams || new HttpParams())
            .set('model', 'AuditLog')
            .set('select', 'AuditLog.NewValue as Subscribed,AuditLog.CreatedAt as CreatedAt,User.DisplayName as DisplayName')
            .set('join', 'AuditLog.CreatedBy eq User.GlobalIdentity')
            .set('filter', `AuditLog.EntityType eq \'Customer\' and AuditLog.Field eq \'AvtaleGiro\' and AuditLog.EntityID eq ${this.options.data}`)
            .set('orderby', 'AuditLog.ID desc');
        return this.statisticsService.GetWrappedDataByHttpParams(urlParams);
    }

    private generateUniTableConfig(): UniTableConfig {
        return new UniTableConfig('sales.customer.avtalegiro', false, false)
            .setPageable(true)
            .setPageSize(10)
            .setSearchable(false)
            .setColumns([
                new UniTableColumn('CreatedAt', 'Dato', UniTableColumnType.LocalDate)
                    .setFormat('DD.MM.YYYY HH:mm')
                    .setWidth('10rem'),
                new UniTableColumn('Subscribed', 'Påmeldt AvtaleGiro', UniTableColumnType.Text)
                    .setTemplate((row) => {
                        const subscribed = JSON.parse(row.Subscribed.toLowerCase());
                        return subscribed ? 'Ja' : 'Nei';
                    }),
                new UniTableColumn('DisplayName', 'Endret av', UniTableColumnType.Text)
            ]);
    }

    close() {
        this.onClose.emit(false);
    }
}
