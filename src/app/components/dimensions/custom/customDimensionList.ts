import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {CustomDimensionService} from '../../../services/common/customDimensionService';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTableConfig, UniTableColumnType, UniTableColumn, IUniTableConfig} from '../../../../framework/ui/unitable/index';
import { TabellType } from '@uni-entities';

@Component({
    selector: 'uni-custom-dimension-list',
    template: `
        <uni-toolbar [config]="toolbarconfig"></uni-toolbar>
        <section class="application" *ngIf="data.length > 0">
            <button class="new-button" (click)="routeToDetails()">Ny dimensjon</button>
            <uni-table [resource]="data" [config]="tableConfig" (rowSelected)="onRowSelected($event)"></uni-table>
        </section>
        <section class="application" *ngIf="data.length === 0">
            <h3>Ingen dimensjoner av denne typen er opprettet enda.</h3>
            <button class="good" (click)="routeToDetails()">
                Opprett ny
            </button>
        </section>
    `
})

export class UniCustomDimensionList {

    private tableConfig: IUniTableConfig;
    private newButtonText: string;
    private currentDimtype: number;
    private currentDimension;
    private data: any[] = [];

    private toolbarconfig: IToolbarConfig = {
        title: '',
        navigation: {
            add: () => this.routeToDetails()
        }
    };

    constructor (
        private router: Router,
        private route: ActivatedRoute,
        private customDimensionService: CustomDimensionService,
        private tabService: TabService
    ) {
        this.route.params.subscribe((param) => {
            if (param && param.id) {
                this.currentDimtype = +param['id'];
                this.getData(this.currentDimtype);
                this.getCustomDimensionMetadata(this.currentDimtype);
            }
        });
    }

    public getData(param: number) {
        this.customDimensionService.getCustomDimensionList(param).subscribe((dims) => {
            this.data = dims;
            this.setUpTable();
        });
    }

    public getCustomDimensionMetadata(id: number) {
        this.customDimensionService.getMetadata().subscribe((dims) => {
            this.currentDimension = dims.find((dim) => {
                return dim.Dimension === id;
            });

            if (this.currentDimension) {
                this.toolbarconfig.title = this.currentDimension.Label;
                this.tabService.addTab({
                    url: '/dimensions/customdimensionlist/' + this.currentDimtype,
                    name: this.currentDimension.Label,
                    active: true,
                    moduleID: UniModules.Dimensions
                });
            }

        });
    }

    public setUpTable() {
        const idCol = new UniTableColumn('Number', 'Nr').setWidth('8%');

        const nameCol = new UniTableColumn('Name', 'Navn', UniTableColumnType.Text)
            .setWidth(300);

        const descCol = new UniTableColumn('Description', 'Description', UniTableColumnType.Text);

        this.tableConfig = new UniTableConfig('dimension.custom', false)
            .setColumns([idCol, nameCol, descCol])
            .setSearchable(true);
    }

    public onRowSelected(event) {
        this.routeToDetails(event.rowModel.ID);
    }

    public routeToDetails(id: number = 0) {
        this.router.navigateByUrl('dimensions/customdimension/' + this.currentDimtype + '?dimensionID=' + id);
    }
}
