export * from './grant-access-modal';

import {SelectLicenseForBulkAccess} from './1.selectLicense';
import {SelectCompaniesForBulkAccess} from './2.selectCompanies';
import {SelectProductsForBulkAccess} from './4.selectProducts';
import {SelectUsersForBulkAccess} from './3.selectUsers';
import {ExecuteForBulkAccess} from './5.execute';
import {ReceiptForBulkAccess} from './6.receipt';
import {GrantAccessSelectionList} from './selection-list/selection-list';

export const GRANT_ACCESS_VIEWS = [
    SelectLicenseForBulkAccess,
    SelectCompaniesForBulkAccess,
    SelectUsersForBulkAccess,
    SelectProductsForBulkAccess,
    ExecuteForBulkAccess,
    ReceiptForBulkAccess,
    GrantAccessSelectionList,
];
