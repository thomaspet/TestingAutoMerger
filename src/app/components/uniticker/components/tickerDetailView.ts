import {
    Component,
    Input,
    ChangeDetectionStrategy
} from '@angular/core';
import {
    Ticker,
    TickerColumn,
    ITickerColumnOverride
} from '../../../services/common/uniTickerService';
import {UniTickerService} from '../../../services/services';
import * as moment from 'moment';
declare var _;

@Component({
    selector: 'uni-ticker-detail-view',
    templateUrl: './tickerDetailView.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTickerDetailView {
    @Input() public ticker: Ticker;
    @Input() public model: any;
    @Input() public columnOverrides: Array<ITickerColumnOverride> = [];

    public fieldGroups: TickerColumn[][];

    constructor(private tickerService: UniTickerService) {}

    public ngOnChanges(changes) {
        if (this.ticker && this.model) {
            let fields = this.ticker.Columns.filter(c => c.Type !== 'dontdisplay');
            fields = this.setValuesOnFields(fields);

            this.fieldGroups = this.groupFields(fields);
        }
    }

    private setValuesOnFields(fields: TickerColumn[]): TickerColumn[] {
        return fields.map(field => {
            let value: string = this.tickerService.getFieldValue(
                field,
                this.model,
                this.ticker,
                this.columnOverrides
            );

            if (field.Type === 'address' && value) {
                let valueParts = value.split(' - ');
                value = valueParts.shift() + '<br>' + valueParts.join(' ');
            }

            if (field.Format === 'DatePassed') {
                let date = _.get(this.model, (field.Alias || field.Field));
                field['_class'] = moment(date).isAfter(moment())
                    ? 'date-good'
                    : 'date-bad';
            }

            field['_value'] = value || '&nbsp;';
            return field;
        });
    }

    private groupFields(fields: TickerColumn[]) {
        return fields.reduce((groups, field) => {
            // -1 because we want the fieldsetColumns in config to start at 1,
            // but obviously arrays are zero-based
            let fieldsetCol = (+field.FieldSetColumn || 1) - 1;
            if (!groups[fieldsetCol]) {
                groups[fieldsetCol] = [];
            }

            groups[fieldsetCol].push(field);
            return groups;
        }, []);
    }

    public getVisibleColumns() {
        return this.ticker.Columns.filter(x => x.Type !== 'dontdisplay');
    }

    public getFieldValue(column: TickerColumn, model: any) {
        return this.tickerService.getFieldValue(column, model, this.ticker, this.columnOverrides);
    }
}
