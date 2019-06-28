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

    public transform(value: number, format: string, numberOfDecimals: number): string {
        try {
            if (!value) {
                return '';
            }

            let numberFormatOptions;
            if (numberOfDecimals >= 0) {
                numberFormatOptions = {
                    decimalLength: numberOfDecimals
                };
            } else if (this.settings) {
                numberFormatOptions = {
                    decimalLength: this.settings.ShowNumberOfDecimals
                };
            }

            switch (format) {
                case 'percentage':
                    return this.numberFormat.asPercentage(value);
                case 'percentagewithdecimal':
                    numberFormatOptions = {
                        decimalLength: 1
                    };
                    return this.numberFormat.asPercentage(value, numberFormatOptions);
                case 'money':
                    return this.numberFormat.asMoney(value, numberFormatOptions);
                case 'orgno':
                    return this.numberFormat.asOrgNo(value);
                case 'bankacct':
                    return this.numberFormat.asBankAcct(value);
                case 'rounded':
                    return this.numberFormat.asNumber(value, {decimalLength: 0});
                default:
                    return this.numberFormat.asNumber(value);
            }
        } catch (err) {
            this.errorService.handle(err);
        }
    }
}
