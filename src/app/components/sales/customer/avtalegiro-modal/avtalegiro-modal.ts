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
import {URLSearchParams} from '@angular/http';

@Component({
    selector: 'uni-avtalegiro-modal',
    template: `
        <section role="dialog" class="uni-modal medium">
            <header><h1>Avtalegiro påmeldinger/avmeldinger</h1></header>
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
    
    @ViewChild(UniTable) 
    public unitable: UniTable

    public uniTableConfig: UniTableConfig;
    public lookupFunction: (urlParams: URLSearchParams) => any;

    constructor(
        private statisticsService: StatisticsService,
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        this.uniTableConfig = this.generateUniTableConfig();
        this.lookupFunction = (urlParams: URLSearchParams) =>
            this.getTableData(urlParams).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private getTableData(urlParams: URLSearchParams): Observable<any> {
        urlParams = urlParams || new URLSearchParams();
        urlParams.set('model', 'AuditLog');
        urlParams.set('select', 'AuditLog.NewValue as Subscribed,AuditLog.CreatedAt as CreatedAt,User.DisplayName as DisplayName');
        urlParams.set('join', 'AuditLog.CreatedBy eq User.GlobalIdentity');
        urlParams.set('filter', `AuditLog.EntityType eq \'Customer\' and AuditLog.Field eq \'AvtaleGiro\' and AuditLog.EntityID eq ${this.options.data}`);
        urlParams.set('orderby', 'AuditLog.ID desc');
        return this.statisticsService.GetWrappedDataByUrlSearchParams(urlParams);
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
