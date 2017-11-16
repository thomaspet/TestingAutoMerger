import {Component, ViewChild, Input, Output, EventEmitter, AfterViewInit, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';
import {SellerLink} from '../../../unientities';
import {
    UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem
} from '../../../../framework/ui/unitable/index';
import {ToastService, ToastTime, ToastType} from '../../../../framework/uniToast/toastService';
import {
    ErrorService,
    SellerService,
    SellerLinkService
} from '../../../services/services';

declare const _;

@Component({
    selector: 'seller-links',
    templateUrl: './sellerLinks.html',
})
export class SellerLinks implements AfterViewInit {
    @ViewChild(UniTable) private table: UniTable;

    @Input() public parent: any;
    @Output() public sellerChanged: EventEmitter<SellerLink> = new EventEmitter<SellerLink>();
    @Output() public selected: EventEmitter<SellerLink> = new EventEmitter<SellerLink>();
    @Output() public deleted: EventEmitter<SellerLink> = new EventEmitter<SellerLink>();
    @Output() public mainSellerSet: EventEmitter<SellerLink> = new EventEmitter<SellerLink>();

    private sellerTableConfig: UniTableConfig;
    private selectedSeller: SellerLink;
    private sellers: Array<SellerLink>;

    constructor(private router: Router,
                private errorService: ErrorService,
                private toastService: ToastService,
                private sellerService: SellerService,
                private sellerLinkService: SellerLinkService) {
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['parent'] && changes['parent'].currentValue) {
            this.sellers = this.parent.Sellers;
            this.setupTable();
        }
    }

    public onRowDelete(event) {
        let seller = event.rowModel;
        if (!seller) { return; }

        seller.Deleted = true;
        this.sellers.splice(seller._originalIndex, 1);

        this.deleted.emit(seller);
    }

    public onRowChanged(event) {
        let seller = event.rowModel;
        if (!seller.ID) {
            seller['_createGuid'] = this.sellerLinkService.getNewGuid();
        }
        this.sellers[seller._originalIndex] = seller;

        this.sellerChanged.emit(seller);
    }

    public onRowSelected(event) {
        this.selectedSeller = event.rowModel;
        this.selected.emit(this.selectedSeller);
    }

    public ngAfterViewInit() {
        this.focusRow(0);
    }

    public focusRow(index = undefined) {
        if (this.table && index) {
            this.table.focusRow(index);
        }
    }

    private changeCallback(event) {
        let rowModel = event.rowModel;

        if (event.field === 'Seller') {
            rowModel.SellerID = rowModel.Seller.ID;
        }

        return rowModel;
    }

    private setupTable() {
        // Define columns to use in the table
        let sellerCol = new UniTableColumn('Seller', 'Selger',  UniTableColumnType.Lookup)
            .setTemplate((row) => {
                return row.Seller ? row.Seller.Name : '';
            })
            .setDisplayField('Seller.Name')
            .setEditorOptions({
                itemTemplate: (item) => {
                    return `${item.ID}: ${item.Name}`;
                },
                searchPlaceholder: 'Velg selger',
                lookupFunction: (query) => {
                    return this.sellerService.GetAll(
                        `filter=startswith(ID,'${query}') or contains(Name,'${query}')&top=30`
                    ).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                }
            });

        let isMainSellerCol = new UniTableColumn('ID', 'Hovedselger',  UniTableColumnType.Text)
            .setTemplate((sellerLink) => {
                if (sellerLink.ID && sellerLink.ID === this.parent.DefaultSellerLinkID
                    || (this.parent.DefaultSeller && sellerLink.SellerID === this.parent.DefaultSeller.SellerID)) {
                    return 'Ja';
                }
                return '';
            })
            .setEditable(false);

        let percentCol = new UniTableColumn('Percent', 'Prosent', UniTableColumnType.Number);
        let amountCol = new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Number)
            .setEditable(false);

        let defaultRowModel = {
            SellerID: 0
        };

        let contextMenuItems: IContextMenuItem[] = [];
        contextMenuItems.push({
            label: 'Vis selgerdetaljer',
            action: (rowModel) => {
                this.router.navigateByUrl('/sales/sellers/' + rowModel.Seller.ID);
            },
            disabled: (rowModel) => !rowModel.SellerID
        },
        {
            label: 'Vis selger sine salg',
            action: (rowModel) => {
                this.router.navigateByUrl('/sales/sellers/' + rowModel.Seller.ID + '/sales');
            },
            disabled: (rowModel) => !rowModel.SellerID
        },
        {
            label: 'Sett som hovedselger',
            action: (rowModel) => {
                if (!rowModel.ID || rowModel.ID === 0) {
                    this.toastService.addToast(
                        'Lagre endringene dine først',
                        ToastType.warn,
                        ToastTime.medium,
                        'Du må lagre endringene før du setter hovedselger'
                    );
                } else {
                    // set main seller on parent model
                    this.parent.DefaultSellerLinkID = rowModel.ID;
                    this.sellers.forEach(sellerLink => {
                        this.table.updateRow(sellerLink['_originalIndex'], sellerLink);
                    });
                    this.mainSellerSet.emit(rowModel);
                }
            },
            disabled: (rowModel) => {
                return false;
            }
        });

        // Setup table
        this.sellerTableConfig = new UniTableConfig('common.seller.sellerlinks', true, true, 15)
            .setSearchable(false)
            .setSortable(false)
            .setDefaultRowData(defaultRowModel)
            .setDeleteButton(true)
            .setContextMenu(contextMenuItems)
            .setChangeCallback(event => this.changeCallback(event))
            .setColumns([sellerCol, isMainSellerCol, percentCol, amountCol]);
    }
}
