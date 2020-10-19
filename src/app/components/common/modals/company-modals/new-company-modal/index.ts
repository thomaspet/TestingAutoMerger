export * from './newCompanyModal';

import {SelectLicenseComponent} from './select-license/select-license.component';
import {SelectCompanyComponent} from './select-company/select-company.component';
import {SelectProductsComponent} from './select-products/select-products.component';
import {SelectTemplate} from './select-template/select-template';

export const NEW_COMPANY_VIEWS = [
    SelectLicenseComponent,
    SelectCompanyComponent,
    SelectProductsComponent,
    SelectTemplate
];
