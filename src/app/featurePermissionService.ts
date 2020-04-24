import {Injectable} from '@angular/core';
import {UniFieldLayout} from '@uni-framework/ui/uniform';
import {UniTableColumn} from '@uni-framework/ui/unitable';
// import {AuthService} from './authService';
import {Router} from '@angular/router';

@Injectable()
export class FeaturePermissionService {
    featureBlacklist: string[];

    mockFeatureBundles = [
        {
            label: 'Mini',
            blacklist: [
                'ui.sellers',
                'ui.dimensions',
                'ui.distribution',
                'ui.debt-collection',

                'ui.sales.customer.ehf_setup',
                'ui.sales.customer.tof_report_setup',
                'ui.sales.customer.avtalegiro',
                'ui.sales.customer.sub_company',

                'ui.sales.invoice.accrual',
                'ui.sales.products.product_categories',

                'ui.accounting.supplier.cost_allocation',
                'ui.accounting.bill.delivery_date',
                'ui.bank_account_manual_setup',
            ]
        },
        {
            label: 'Pluss',
            blacklist: [
                'ui.distribution',

                'ui.sales.customer.ehf_setup',
                'ui.sales.customer.sub_company',

                'ui.accounting.supplier.cost_allocation',
                'ui.accounting.bill.delivery_date',
                'ui.bank_account_manual_setup',
            ]
        },
        {
            label: 'Komplett',
            blacklist: undefined
        }
    ];

    mockActiveBundle = this.mockFeatureBundles[2];

    constructor(
        // private authService: AuthService,
        private router: Router
    ) {
        // this.authService.authentication$.subscribe(auth => {
        //     if (auth && auth.user) {
        //         // set correct blacklist from theme file based on license package
        //     }
        // });
    }

    mockSetActiveBundle(bundle) {
        this.mockActiveBundle = bundle;
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/reload', { skipLocationChange: true }).then(() => {
            this.featureBlacklist = bundle.blacklist;
            this.router.navigateByUrl(currentUrl, { skipLocationChange: true });
        });
    }

    canShowUiFeature(featureName: string) {
        return !this.featureBlacklist || !this.featureBlacklist.includes(featureName);
    }

    canShowFormField(field: UniFieldLayout) {
        if (!this.featureBlacklist?.length) {
            return true;
        }

        if (field.FeaturePermission) {
            return !this.featureBlacklist.includes(field.FeaturePermission);
        }

        const fieldProp = field.Property || '';

        if (field.EntityType === 'Project'
            || field.EntityType === 'Department'
            || fieldProp.includes('Dimensions.')
            || fieldProp.includes('ProjectID')
            || fieldProp.includes('DepartmentID')
        ) {
            return !this.featureBlacklist.includes('ui.dimensions');
        }

        if (field.EntityType === 'Seller' || fieldProp.includes('DefaultSeller')) {
            return !this.featureBlacklist.includes('ui.sellers');
        }

        return true;
    }

    canShowTableColumn(column: UniTableColumn) {
        if (!this.featureBlacklist?.length) {
            return true;
        }

        // REVISIT: might have to also check alias? (ticker uses alias pretty extensively)

        const field = column.field || '';

        if (this.featureBlacklist.includes('ui.dimensions')) {
            return !field.includes('Dimensions.');
        }

        if (this.featureBlacklist.includes('ui.sellers')) {
            return !field.includes('DefaultSeller');
        }

        return true;
    }
}
