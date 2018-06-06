import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../framework/uni-modal';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '../../../../framework/ui/unitable/index';
import {ErrorService} from '../../../services/services';

@Component({
    selector: 'uni-select-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 80vw;">
            <header><h1>Ny basert på</h1></header>
            <article>
                <uni-table
                    [resource]="lookupFunction"
                    [config]="tableData"
                    (rowSelected)="onRowSelected($event)">
                </uni-table>
            </article>
            <footer>
                <button class="bad" (click)="close()">Lukk</button>
            </footer>
        </section>
    `
})

export class UniTofSelectModal implements IUniModal {

    @Input()
    public options: IModalOptions;

    @Output()
    public onClose: EventEmitter<number> = new EventEmitter();

    public lookupFunction: any;
    private tableData: UniTableConfig;

    constructor(
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        if (!this.options) {
            return;
        }

        this.lookupFunction = (urlParams: any) => {
            let params = urlParams;

            if (params === null) {
                params = new URLSearchParams();
            }

            params.set('expand',
                'Customer,Customer.Info,DefaultDimensions,DefaultDimensions.Department,DefaultDimensions.Project');

            return this.options.data.service.GetAllByUrlSearchParams(params)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        let numberCol = new UniTableColumn(
            this.options.data.moduleName + 'Number', this.options.data.label,  UniTableColumnType.Text)
            .setWidth('8%')
            .setFilterOperator('contains');

        let customerNumberCol = new UniTableColumn('Customer.CustomerNumber', 'Kundenr',  UniTableColumnType.Text)
            .setFilterOperator('contains')
            .setWidth('8%');

        let nameCol = new UniTableColumn('CustomerName', 'Kundenavn',  UniTableColumnType.Text)
            .setFilterOperator('contains');

        let priceIncVatCol = new UniTableColumn('TaxInclusiveAmount', 'Sum inkl mva',  UniTableColumnType.Number)
            .setFilterOperator('eq')
            .setWidth('10%')
            .setFormat('{0:n}')
            .setIsSumColumn(true)
            .setCls('column-align-right');

        let dateCol = new UniTableColumn(
            this.options.data.moduleName + 'Date', 'Dato',  UniTableColumnType.LocalDate);

        let departmentCol = new UniTableColumn(
            'DefaultDimensions.Department.DepartmentNumber', 'Avdeling', UniTableColumnType.Text)
            .setWidth('15%')
            .setFilterOperator('contains')
            .setTemplate((data: any) => {
                return data.DefaultDimensions && data.DefaultDimensions.Department
                    ? data.DefaultDimensions.Department.DepartmentNumber
                    + ': ' + data.DefaultDimensions.Department.Name
                    : '';
            });

        let projectCol = new UniTableColumn(
            'DefaultDimensions.Project.ProjectNumber', 'Prosjekt', UniTableColumnType.Text)
            .setWidth('15%')
            .setFilterOperator('contains')
            .setTemplate((data: any) => {
                return data.DefaultDimensions && data.DefaultDimensions.Project
                    ? data.DefaultDimensions.Project.ProjectNumber
                    + ': ' + data.DefaultDimensions.Project.Name
                    : '';
            });

        let statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
            .setWidth('15%')
            .setTemplate((data: any) => {
                return this.statusCodeToText(data.StatusCode);
            })

        this.tableData = new UniTableConfig('common.newbasedon', false, true, 25)
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
        this.close(event.rowModel.ID);
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
