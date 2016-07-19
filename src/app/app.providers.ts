
import {AccountService, VatTypeService, CurrencyService, CompanySettingsService} from './services/services';
import {ToastService} from '../framework/uniToast/toastService';
import {GuidService} from './services/services';
import {IntegrationServerCaller} from './services/common/IntegrationServerCaller';
import {UniHttp} from '../framework/core/http/http';
import {UniState} from '../framework/core/UniState';
import {AuthService} from './../framework/core/authService';
import {AuthGuard} from './AuthGuard';
import {REPORT_PROVIDERS} from './services/reports/index';

export const APP_SERVICES = [
    // Services
    AuthGuard,
    AuthService,
    UniState,
    UniHttp,
    GuidService,
    ToastService,
    AccountService,
    VatTypeService,
    CurrencyService,
    CompanySettingsService,
    IntegrationServerCaller,
    REPORT_PROVIDERS
];
