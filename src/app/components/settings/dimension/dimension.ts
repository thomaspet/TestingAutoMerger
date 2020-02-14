import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UniTableConfig, UniTableColumn, UniTableColumnType, IContextMenuItem} from '../../../../framework/ui/unitable/index';
import {DimensionSettingsService} from '../../../services/common/dimensionSettingsService';
import {UniModalService} from '../../../../framework/uni-modal';
import {UniDimensionModal} from './dimensionModal';
import {NavbarLinkService} from '../../layout/navbar/navbar-link-service';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';

@Component({
    selector: 'uni-dimension-settings',
    templateUrl: './dimension.html'
})

export class UniDimensionSettings implements OnInit {
    data: any;
    tableConfig: UniTableConfig;
    saveActions = [];

    constructor (
        private service: DimensionSettingsService,
        private modalService: UniModalService,
        private router: Router,
        private navbarService: NavbarLinkService,
        private tabService: TabService,
    ) {}

    public ngOnInit() {
        this.tabService.addTab({
            name: 'Dimensjonsinnstillinger',
            url: '/settings/dimension',
            moduleID: UniModules.Settings,
            active: true
       });

        this.service.GetAll(null).subscribe((res) => {
            this.data = res;
            this.setUpData();
            this.updateSaveActions();
        });
    }

    public setUpData() {

        const contextMenuItem: IContextMenuItem[] = [
            {
                action: (item) => this.editDimension(item),
                label: 'Rediger'
            },
            {
                action: (item) => {
                    this.router.navigateByUrl('dimensions/overview/' + item.Dimension);
                },
                label: 'Gå til liste'
            }
        ];

        this.tableConfig = new UniTableConfig('settings.dimensions', false, false)
            .setSearchable(false)
            .setAutoAddNewRow(false)
            .setColumns([
                new UniTableColumn('Dimension', 'Nummer', UniTableColumnType.Text).setWidth('2rem')
                .setLinkResolver(row => `/dimensions/overview/${row.Dimension}`).setAlignment('center'),
                new UniTableColumn('Label', 'Tekst', UniTableColumnType.Text),
                new UniTableColumn('IsActive', 'Aktiv', UniTableColumnType.Text)
                    .setTemplate(
                        (item) => {
                            return item.IsActive ? 'Ja' : 'Nei';
                        })
                    .setWidth('4rem')
                    .setAlignment('center')
                ])
            .setDeleteButton(false)
            .setContextMenu(contextMenuItem);
    }

    public updateSaveActions() {
        this.saveActions = [{
            label: 'Ny dimensjon',
            action: (done) => this.addNewDimension(done),
            main: true,
            disabled: this.data.length >= 6
        }];
    }

    public addNewDimension(done) {
        this.modalService.open(UniDimensionModal, { header: 'Ny dimensjon' }).onClose.subscribe((result: boolean) => {
            if (result) {
                this.service.GetAll(null).subscribe((res) => {
                    this.data = [...res];
                    this.navbarService.resetNavbar();
                    done('Ny dimensjon opprettet');
                    this.updateSaveActions();
                });
            } else {
                done('Ingen endringer');
            }
        }, err => done('') );
    }

    public editDimension(dim) {
        this.modalService.open(UniDimensionModal,
            {
                header: 'Rediger dimensjon: ' + dim.Label.toUpperCase(),
                data: {
                    dim: dim
                }
            }
        ).onClose.subscribe((result: boolean) => {
            if (result) {
                this.service.GetAll(null).subscribe((res) => {
                    this.data = [...res];
                    this.navbarService.resetNavbar();
                });
            }
        });
    }
}
