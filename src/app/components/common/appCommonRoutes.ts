import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../authGuard';
import {CanDeactivateGuard} from '../../canDeactivateGuard';
import {UniDimensions} from './dimensions/UniDimensions';
import {routes as DimensionRoutes} from './dimensions/dimensionsRoutes';
import {SupplierDetails} from './supplier/details/supplierDetails';
import {SupplierList} from './supplier/list/supplierList';
import {ContactDetails} from './contact/contactDetails';

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
    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(commonRoutes);
