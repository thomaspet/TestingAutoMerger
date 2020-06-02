import {Injectable} from '@angular/core';
import {UniFieldLayout} from '@uni-framework/ui/uniform';
import {UniTableColumn} from '@uni-framework/ui/unitable';
import {theme} from 'src/themes/theme';

@Injectable()
export class FeaturePermissionService {
    viewFeatureBlacklist: string[];
    uiPermissionBlacklist: string[];

    setFeatureBlacklist(contractTypeName: string) {
        const blacklists = theme.featureBlacklists;
        if (blacklists && blacklists[contractTypeName]) {
            this.viewFeatureBlacklist = blacklists[contractTypeName].view_features;
            this.uiPermissionBlacklist = blacklists[contractTypeName].ui_permissions;
        } else {
            this.viewFeatureBlacklist = [];
            this.uiPermissionBlacklist = [];
        }
    }

    hasUIPermission(uiPermission: string) {
        return !this.uiPermissionBlacklist || !this.uiPermissionBlacklist.includes(uiPermission);
    }

    canShowUiFeature(featureName: string) {
        return !this.viewFeatureBlacklist || !this.viewFeatureBlacklist.includes(featureName);
    }

    canShowFormField(field: UniFieldLayout) {
        if (!this.viewFeatureBlacklist?.length) {
            return true;
        }

        if (field.FeaturePermission) {
            return !this.viewFeatureBlacklist.includes(field.FeaturePermission);
        }


        const fieldProp = field.Property || '';

        if (field.EntityType === 'Project'
            || field.EntityType === 'Department'
            || fieldProp.includes('Dimensions.')
            || fieldProp.includes('ProjectID')
            || fieldProp.includes('DepartmentID')
        ) {
            return !this.viewFeatureBlacklist.includes('ui.dimensions');
        }

        if (field.EntityType === 'Seller' || fieldProp.includes('DefaultSeller')) {
            return !this.viewFeatureBlacklist.includes('ui.sellers');
        }

        return true;
    }

    canShowTableColumn(column: UniTableColumn) {
        if (!this.viewFeatureBlacklist?.length) {
            return true;
        }

        if (column.featurePermission) {
            return !this.viewFeatureBlacklist.includes(column.featurePermission);
        }

        const field = column.field || '';

        if (this.viewFeatureBlacklist.includes('ui.dimensions')) {
            if (field.includes('Dimension')
                || field.includes('Project')
                || field.includes('Department')
            ) {
                return false;
            }
        }

        if (this.viewFeatureBlacklist.includes('ui.sellers')) {
            if (field.includes('DefaultSeller')) {
                return false;
            }
        }

        return true;
    }
}
