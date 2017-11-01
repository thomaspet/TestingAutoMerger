import {Pipe, PipeTransform} from '@angular/core';
import {ErrorService, NumberFormat, CompanySettingsService} from '../services/services';
import {CompanySettings} from '../unientities';

@Pipe({name: 'uninumberformat'})
export class UniNumberFormatPipe implements PipeTransform {
    private settings: CompanySettings;

    constructor(
        private numberFormat: NumberFormat,
        private errorService: ErrorService,
        private settingsService: CompanySettingsService
    ) {
        this.settingsService.Get(1).subscribe(
            res => this.settings = res,
            err => this.errorService.handle(err)
        );
    }

    public transform(value: number, format: string): string {
        try {
            if (!value) {
                return '';
            }

            let numberFormatOptions;
            if (this.settings) {
                numberFormatOptions = {
                    decimalLength: this.settings.ShowNumberOfDecimals
                };
            }

            switch (format) {
                case 'percentage':
                    return this.numberFormat.asPercentage(value);
                case 'money':
                    return this.numberFormat.asMoney(value, numberFormatOptions);
                case 'orgno':
                    return this.numberFormat.asOrgNo(value);
                case 'bankacct':
                    return this.numberFormat.asBankAcct(value);
                default:
                    return this.numberFormat.asNumber(value);
            }
        } catch (err) {
            this.errorService.handle(err);
        }
    }
}
