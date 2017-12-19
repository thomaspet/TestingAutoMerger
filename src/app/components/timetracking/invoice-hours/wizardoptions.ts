import { WorkOrder } from './workorder';
import { User } from '@uni-entities';

export interface IWizardOptions {
    currentUserID: number;
    currentUser: User;
    filterByUserID: number;
    sourceType: 'CustomerHours' | 'OrderHours' | 'ProjectHours';
    selectedCustomers: Array<any>;
    selectedProducts: Array<any>;
    orders: Array<WorkOrder>;
}
