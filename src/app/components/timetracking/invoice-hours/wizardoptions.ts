export interface IWizardOptions {
    currentUserID: number;
    filterByUserID: number;
    sourceType: 'CustomerHours' | 'OrderHours' | 'ProjectHours';
    selectedCustomers: Array<any>;
    selectedProducts: Array<any>;
}
