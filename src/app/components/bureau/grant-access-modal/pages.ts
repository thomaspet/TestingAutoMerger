import {SelectLicenseForBulkAccess} from '@app/components/bureau/grant-access-modal/1.selectLicense';
import {SelectCompaniesForBulkAccess} from '@app/components/bureau/grant-access-modal/2.selectCompanies';
import {SelectProductsForBulkAccess} from '@app/components/bureau/grant-access-modal/4.selectProducts';
import {SelectUsersForBulkAccess} from '@app/components/bureau/grant-access-modal/3.selectUsers';
import {ExecuteForBulkAccess} from '@app/components/bureau/grant-access-modal/5.execute';
import {ReceiptForBulkAccess} from '@app/components/bureau/grant-access-modal/6.receipt';


export const PAGES = [
    SelectLicenseForBulkAccess,
    SelectCompaniesForBulkAccess,
    SelectUsersForBulkAccess,
    SelectProductsForBulkAccess,
    ExecuteForBulkAccess,
    ReceiptForBulkAccess,
];
