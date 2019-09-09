import {Component, Input, Output, EventEmitter} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {IUniModal, IModalOptions} from '../../../../framework/uni-modal';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '../../../../framework/ui/unitable/index';
import {ErrorService} from '../../../services/services';

@Component({
    selector: 'uni-select-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign" style="width: 80vw;">
            <header>Ny basert på</header>
            <article>
                <ag-grid-wrapper
                    [resource]="lookupFunction"
                    [config]="tableData"
                    (rowSelect)="onRowSelected($event)">
                </ag-grid-wrapper>
            </article>
        </section>
    `
})

export class UniTofSelectModal implements IUniModal {

    @Input()
    public options: IModalOptions;

    @Output()
    public onClose: EventEmitter<number> = new EventEmitter();

    public lookupFunction: any;
    public tableData: UniTableConfig;

    constructor(
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        if (!this.options) {
            return;
        }

        this.lookupFunction = (urlParams: any) => {
            const params = (urlParams || new HttpParams()).set(
                'expand',
                'Customer,Customer.Info,DefaultDimensions,DefaultDimensions.Department,DefaultDimensions.Project'
            );

            return this.options.data.service.GetAllByHttpParams(params)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        const numberCol = new UniTableColumn(
            this.options.data.moduleName + 'Number', this.options.data.label,  UniTableColumnType.Text)
            .setWidth('8%')
            .setFilterOperator('contains');

        const customerNumberCol = new UniTableColumn('Customer.CustomerNumber', 'Kundenr',  UniTableColumnType.Text)
            .setFilterOperator('contains')
            .setWidth('8%');

        const nameCol = new UniTableColumn('CustomerName', 'Kundenavn',  UniTableColumnType.Text)
            .setFilterOperator('contains');

        const priceIncVatCol = new UniTableColumn('TaxInclusiveAmount', 'Sum inkl mva',  UniTableColumnType.Number)
            .setFilterOperator('eq')
            .setWidth('10%')
            .setFormat('{0:n}')
            .setIsSumColumn(true)
            .setCls('column-align-right');

        const dateCol = new UniTableColumn(
            this.options.data.moduleName + 'Date', 'Dato',  UniTableColumnType.LocalDate);

        const departmentCol = new UniTableColumn(
            'DefaultDimensions.Department.DepartmentNumber', 'Avdeling', UniTableColumnType.Text)
            .setWidth('15%')
            .setFilterOperator('contains')
            .setTemplate((data: any) => {
                return data.DefaultDimensions && data.DefaultDimensions.Department
                    ? data.DefaultDimensions.Department.DepartmentNumber
                    + ': ' + data.DefaultDimensions.Department.Name
                    : '';
            });

        const projectCol = new UniTableColumn(
            'DefaultDimensions.Project.ProjectNumber', 'Prosjekt', UniTableColumnType.Text)
            .setWidth('15%')
            .setFilterOperator('contains')
            .setTemplate((data: any) => {
                return data.DefaultDimensions && data.DefaultDimensions.Project
                    ? data.DefaultDimensions.Project.ProjectNumber
                    + ': ' + data.DefaultDimensions.Project.Name
                    : '';
            });

        const statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
            .setWidth('15%')
            .setTemplate((data: any) => {
                return this.statusCodeToText(data.StatusCode);
            });

        let pageSize = window.innerHeight - 450;
        pageSize = pageSize <= 33 ? 10 : Math.floor(pageSize / 34); // 34 = heigth of a single row

        this.tableData = new UniTableConfig('common.newbasedon', false, true, pageSize)
            .setSearchable(true)
            .setEntityType(this.options.data.moduleName)
            .setSearchListVisible(true)
            .setColumns([
                numberCol,
                nameCol,
                customerNumberCol,
                dateCol,
                departmentCol,
                projectCol,
                priceIncVatCol,
                statusCol
            ]);
    }

    public close(id: number = 0) {
        this.onClose.emit(id);
    }

    public onRowSelected(event) {
        this.close(event.ID);
    }

    public statusCodeToText(value) {
        if (!value && value !== 0) {
            return '';
        }

        let statusText: string = value;
        switch (value.toString()) {
            case '30101':
            case '40101':
            case '41001':
            case '42001':
                statusText = 'Kladd';
                break;
            case '40102':
            case '41002':
                statusText = 'Registrert';
                break;
            case '40103':
                statusText = 'Sendt til kunde';
                break;
            case '40104':
                statusText = 'Godkjent';
                break;
            case '41003':
                statusText = 'Delvis overført';
                break;
            case '40105':
                statusText = 'Overført til ordre';
                break;
            case '40106':
            case '41004':
                statusText = 'Overført til faktura';
                break;
            case '40107':
                statusText = 'Ferdigstilt';
                break;
            case '42002':
                statusText = 'Fakturert';
                break;
            case '42003':
                statusText = 'Delbetalt';
                break;
            case '42004':
                statusText = 'Betalt';
                break;
            case '42501':
                statusText = 'Purret';
                break;
            case '42502':
                statusText = 'Inkasso';
                break;
        }
        return statusText;
    }
}
