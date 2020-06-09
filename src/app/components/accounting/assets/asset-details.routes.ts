import {AssetsDetailComponent} from '@app/components/accounting/assets/asset-detail/asset-detail';
import {AssetsHistoryComponent} from '@app/components/accounting/assets/assets-history/assets-history';
import {AssetDocumentsComponent} from '@app/components/accounting/assets/asset-documents/asset-documents';

export const routes = [
    {
        path: '',
        redirectTo: 'details',
        pathMatch: 'full',
    },
    {
        path: 'details',
        component: AssetsDetailComponent
    },
    {
        path: 'history',
        component: AssetsHistoryComponent
    },
    {
        path: 'documents',
        component: AssetDocumentsComponent
    }
];
