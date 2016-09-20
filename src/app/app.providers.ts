
import {AccountService, VatTypeService, CurrencyService, CompanySettingsService} from './services/services';
import {ToastService} from '../framework/uniToast/toastService';
import {GuidService} from './services/services';
import {IntegrationServerCaller} from './services/common/IntegrationServerCaller';
import {UniHttp} from '../framework/core/http/http';
import {UniCacheService} from './services/cacheService';
import {AuthService} from './../framework/core/authService';
import {AuthGuard} from './AuthGuard';
import {CanDeactivateGuard} from './canDeactivateGuard';
import {REPORT_PROVIDERS} from './services/reports/index';
export const APP_SERVICES = [
    // Services
    AuthGuard,
    CanDeactivateGuard,
    AuthService,
    UniCacheService,
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
