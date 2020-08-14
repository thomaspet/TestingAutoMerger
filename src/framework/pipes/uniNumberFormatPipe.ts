import {Pipe, PipeTransform} from '@angular/core';
import {ErrorService, NumberFormat, CompanySettingsService} from '@app/services/services';
import {CompanySettings} from '@uni-entities';
import {AuthService} from '@app/authService';

@Pipe({name: 'uninumberformat'})
export class UniNumberFormatPipe implements PipeTransform {
    private settings: CompanySettings;

    constructor(
        private authService: AuthService,
        private numberFormat: NumberFormat,
        private errorService: ErrorService,
        private settingsService: CompanySettingsService
    ) {
        this.authService.authentication$.subscribe(auth => {
            if (auth && auth.user) {
                this.settingsService.Get(1).subscribe(
                    res => this.settings = res,
                    () => {}
                );
            }
        });
    }

    public transform(value: number, format: string, showNullAsZero = true): string {
        try {
            if (!value && value !== 0 && !showNullAsZero) {
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
                case 'percentagewithdecimal':
                    numberFormatOptions = {
                        decimalLength: 1
                    };
                    return this.numberFormat.asPercentage(value, numberFormatOptions);
                case 'money':
                    return this.numberFormat.asMoney(value, numberFormatOptions, showNullAsZero);
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
