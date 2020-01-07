import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {CompanySettings} from '../../../../unientities';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {UniTickerWrapper} from '../../../uniticker/tickerWrapper/tickerWrapper';
import {ITickerActionOverride, ITickerColumnOverride} from '../../../../services/common/uniTickerService';
import {
    CustomerQuoteService,
    ErrorService,
    CompanySettingsService,
} from '../../../../services/services';
import {IUniSaveAction} from '@uni-framework/save/save';

@Component({
    selector: 'quote-list',
    templateUrl: './quoteList.html'
})
export class QuoteList implements OnInit {

    @ViewChild(UniTickerWrapper, { static: true }) private tickerWrapper: UniTickerWrapper;

    public actionOverrides: ITickerActionOverride[] = this.customerQuoteService.actionOverrides;

    public columnOverrides: ITickerColumnOverride[] = [{
        Field: 'StatusCode',
        Template: (dataItem) => {
            const statusText: string = this.customerQuoteService.getStatusText(dataItem.CustomerQuoteStatusCode);
            return statusText;
        }
    }];

    public tickercode: string = 'quote_list';

    private companySettings: CompanySettings;
    private baseCurrencyCode: string;

    public createNewAction: IUniSaveAction = {
        label: 'Nytt tilbud',
        action: () => this.createQuote()
    };

    constructor(
        private uniHttpService: UniHttp,
        private router: Router,
        private customerQuoteService: CustomerQuoteService,
        private tabService: TabService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
    ) {}

    public ngOnInit() {
        this.companySettingsService.Get(1)
            .subscribe(settings => {
                this.companySettings = settings;

                if (this.companySettings && this.companySettings.BaseCurrencyCode) {
                    this.baseCurrencyCode = this.companySettings.BaseCurrencyCode.Code;
                }
            }, err => this.errorService.handle(err));

        this.tabService.addTab({
            url: '/sales/quotes',
            name: 'Tilbud',
            active: true,
            moduleID: UniModules.Quotes
        });
    }

    public createQuote() {
        this.router.navigateByUrl('/sales/quotes/0');
    }
}
