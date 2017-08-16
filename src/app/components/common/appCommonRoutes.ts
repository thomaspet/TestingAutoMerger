import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../authGuard';
import {CanDeactivateGuard} from '../../canDeactivateGuard';
import {UniDimensions} from './dimensions/UniDimensions';
import {routes as DimensionRoutes} from './dimensions/dimensionsRoutes';
import {SupplierDetails} from './supplier/details/supplierDetails';
import {SupplierList} from './supplier/list/supplierList';
import {ContactDetails} from './contact/contactDetails';
import {PredefinedDescriptionList} from './predefinedDescriptions/predefinedDescriptionList';
import {SellerList} from './seller/sellerList';
import {SellerDetails} from './seller/sellerDetails';

const commonRoutes: Routes = [
    {
        path: 'dimensions',
        component: UniDimensions,
        canActivate: [AuthGuard],
        children: [{
            path: '',
            canActivateChild: [AuthGuard],
            children: DimensionRoutes
        }],
    },
    {
        path: 'suppliers',
        component: SupplierList
    },
    {
        path: 'suppliers/:id',
        component: SupplierDetails,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'contacts/:id',
        component: ContactDetails,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'predefined-descriptions',
        component: PredefinedDescriptionList,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'sellers',
        component: SellerList,
    },
    {
        path: 'sellers/:id',
        component: SellerDetails,
        canDeactivate: [CanDeactivateGuard]
    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(commonRoutes);
