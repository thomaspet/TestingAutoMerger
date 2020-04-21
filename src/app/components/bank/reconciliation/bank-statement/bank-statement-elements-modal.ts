/*tslint:disable*/
import {Component, Input, Output, EventEmitter} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {StatisticsService} from '@app/services/services';
import {IUniTableConfig, UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import * as moment from 'moment';

@Component({
    selector: 'bank-statement-elements-modal',
    templateUrl: './bank-statement-elements-modal.html'
})

export class BankStatmentElementsModal implements IUniModal {
    @Input() options: IModalOptions = {};
	@Output() onClose = new EventEmitter();

	lookupFunction: (urlParams: HttpParams) => any;

	busy: boolean = true;
	uniTableConfig: IUniTableConfig;
	statements: any[] = [];

    constructor(private statisticsService: StatisticsService) {}

    ngOnInit() {
        if (!this.options.data.ID) {
			this.onClose.emit();
			return;
		}

		this.uniTableConfig = this.generateUniTableConfig();
		this.setUpLookupfunction();
	}

	private setUpLookupfunction() {
        this.lookupFunction = (urlParams) => {
			this.busy = true;
			const filter = urlParams.get('filter');
            urlParams = urlParams.set('model', 'BankStatementEntry');
            urlParams = urlParams.set('select', 'AmountCurrency as AmountCurrency,BookingDate as BookingDate,' +
            'CurrencyCode as CurrencyCode,Description as Description,ID as ID,OpenAmountCurrency as OpenAmountCurrency,' +
            'StatusCode as StatusCode');
			urlParams = urlParams.set('filter', `BankStatementID eq ${this.options.data.ID}` + (filter ? ` and ${filter}` : ''));

			return this.statisticsService.GetAllByHttpParams(urlParams)
				.finally(() => this.busy = false);
        };
    }

	private generateUniTableConfig(): UniTableConfig {

		let pageSize = window.innerHeight - 500; // Form height
		pageSize = pageSize <= 49 ? 10 : Math.floor(pageSize / 49);

        return new UniTableConfig('bankstatement.elements.details', false, false, pageSize <= 8 ? 8 : pageSize)
			.setEntityType('BankStatementEntry')
			.setSearchable(true)
            .setColumns([
				new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text),
				new UniTableColumn('BookingDate', 'Dato', UniTableColumnType.Text)
					.setTemplate(row => moment(row.BookingDate).format('DD. MMM YYYY')),
				new UniTableColumn('OpenAmountCurrency', 'Sum åpne', UniTableColumnType.Money),
				new UniTableColumn('CurrencyCode', 'Valuta', UniTableColumnType.Text).setWidth('85px'),
				new UniTableColumn('AmountCurrency', 'Sum total', UniTableColumnType.Money),
			]);
    }
}
