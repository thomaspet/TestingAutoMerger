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
                'ui.bank_account_manual_setup',

                'ui.sales.customer.ehf_setup',
                'ui.sales.customer.tof_report_setup',
                'ui.sales.customer.avtalegiro',
                'ui.sales.customer.sub_company',

                'ui.sales.invoice.accrual',
                'ui.sales.products.product_categories',

                'ui.accounting.supplier.cost_allocation',
                'ui.accounting.supplier.ehf_setup',
                'ui.accounting.supplier.self_employed',

                'ui.accounting.bill.delivery_date',
                'ui.accounting.vat-deduction-settings',

                'ui.bank.journaling-rules',
            ]
        },
        {
            label: 'Pluss',
            blacklist: [
                'ui.distribution',
                'ui.bank_account_manual_setup',

                'ui.sales.customer.ehf_setup',
                'ui.sales.customer.sub_company',

                'ui.accounting.supplier.cost_allocation',
                'ui.accounting.supplier.ehf_setup',
                'ui.accounting.supplier.self_employed',

                'ui.accounting.bill.delivery_date',
                'ui.accounting.vat-deduction-settings',

                'ui.bank.journaling-rules',
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

        if (column.featurePermission) {
            return !this.featureBlacklist.includes(column.featurePermission);
        }

        const field = column.field || '';

        if (this.featureBlacklist.includes('ui.dimensions')) {
            if (field.includes('Dimension')
                || field.includes('Project')
                || field.includes('Department')
            ) {
                return false;
            }
        }

        if (this.featureBlacklist.includes('ui.sellers')) {
            if (field.includes('DefaultSeller')) {
                return false;
            }
        }

        return true;
    }
}
