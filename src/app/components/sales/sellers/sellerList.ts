import {Component, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {URLSearchParams} from '@angular/http';
import {
    UniTable, UniTableColumn, UniTableColumnType, UniTableConfig
} from '../../../../framework/ui/unitable/index';
import {ToastService} from '../../../../framework/uniToast/toastService';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {
    ErrorService,
    ProjectService,
    DepartmentService,
    SellerService,
    UserService
} from '../../../services/services';
import { Seller } from '../../../unientities';

declare const _;

@Component({
    selector: 'seller-list',
    templateUrl: './sellerList.html',
})
export class SellerList {
    @ViewChild(UniTable) public table: UniTable;

    private sellerTableConfig: UniTableConfig;
    private sellers: Seller[] = [];
    private expandString = 'DefaultDimensions,DefaultDimensions.Project,'
        + 'DefaultDimensions.Department,User,Team,Employee,Employee.BusinessRelationInfo';

    constructor(
        private router: Router,
        private errorService: ErrorService,
        private toastService: ToastService,
        private tabService: TabService,
        private projectService: ProjectService,
        private departmentService: DepartmentService,
        private sellerService: SellerService,
        private userService: UserService
    ) {
        this.getData();
        this.tabService.addTab({
            name: 'Selgere',
            url: '/sales/sellers',
            active: true, moduleID: UniModules.Sellers
        });
    }

    private getData() {
        this.sellerService.GetAll('', [this.expandString]).subscribe((sellerResult) => {
            this.sellers = sellerResult;
            this.setupTable();
        });
    }

    public createSeller() {
        this.router.navigateByUrl('/sales/sellers/0');
    }

    public onRowSelected(event) {
        this.router.navigateByUrl('/sales/sellers/' + event.rowModel.ID);
    }

    private setupTable() {
        // Define columns to use in the table
        const nameCol = new UniTableColumn('Name', 'Navn',  UniTableColumnType.Text).setWidth('200px');

        const userCol = new UniTableColumn('User', 'Bruker', UniTableColumnType.Text)
            .setTemplate((row) => {
                return row.UserID ? row.User.DisplayName : '';
            });

        const employeeCol = new UniTableColumn('Employee', 'Ansatt', UniTableColumnType.Text)
            .setTemplate((row) => {
                return row.EmployeeID
                    ? `${row.Employee.EmployeeNumber} - ${row.Employee.BusinessRelationInfo.Name}`
                    : '';
            });

        const teamCol = new UniTableColumn('Team', 'Team', UniTableColumnType.Text)
            .setTemplate((row) => {
                return row.TeamID ? row.Team.Name : '';
            });

        const projectCol = new UniTableColumn('DefaultDimenions.Project', 'Prosjekt', UniTableColumnType.Text)
            .setTemplate((row) => {
                return row.DefaultDimensionsID && row.DefaultDimensions.ProjectID
                    ? row.DefaultDimensions.Project.Name
                    : '';
            });

        const departmentCol = new UniTableColumn('DefaultDimensions.Department', 'Avdeling', UniTableColumnType.Text)
            .setTemplate((row) => {
                return row.DefaultDimensionsID && row.DefaultDimensions.DepartmentID
                    ? row.DefaultDimensions.Department.Name
                    : '';
            });

        // Setup table
        this.sellerTableConfig = new UniTableConfig('common.seller.sellerList', false, true, 15)
            .setSearchable(true)
            .setDeleteButton(true)
            .setSortable(false)
            .setColumns([nameCol, userCol, employeeCol, teamCol, projectCol, departmentCol]);
    }

    public deleteSeller(event) {
        this.sellerService.Remove(event.ID).subscribe(() => {
            this.getData();
        }, (err) => { this.errorService.handle(err); });
    }
}
