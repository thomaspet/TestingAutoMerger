import {Component, ViewChild, Input, Output, EventEmitter, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';
import {URLSearchParams} from '@angular/http';
import {Project, Department} from '../../../unientities';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from '../../../../framework/ui/unitable/index';
import {ToastService, ToastTime, ToastType} from '../../../../framework/uniToast/toastService';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IUniSaveAction} from '../../../../framework/save/save';
import {
    ErrorService,
    ProjectService,
    DepartmentService,
    TeamService,
    SellerService,
    UserService
} from '../../../services/services';

declare const _;

@Component({
    selector: 'seller-list',
    templateUrl: './sellerList.html',
})
export class SellerList {
    @ViewChild(UniTable) private table: UniTable;

    private sellerTableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;

    constructor(private router: Router,
                private errorService: ErrorService,
                private toastService: ToastService,
                private tabService: TabService,
                private projectService: ProjectService,
                private departmentService: DepartmentService,
                private teamService: TeamService,
                private sellerService: SellerService,
                private userService: UserService) {
        this.setupTable();
        this.tabService.addTab({ name: "Selgere", url: "/sellers", active: true, moduleID: UniModules.Sellers });
    }

    private createSeller() {
        this.router.navigateByUrl('/sellers/0');
    }

    private onRowSelected(event) {
        this.router.navigateByUrl('/sellers/' + event.rowModel.ID);
    }

    private setupTable() {
        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams;

            if (params === null) {
                params = new URLSearchParams();
            }

            params.set('expand', 'DefaultDimensions,DefaultDimensions.Project,DefaultDimensions.Department,User,Team,Employee,Employee.BusinessRelationInfo');

            return this.sellerService.GetAllByUrlSearchParams(params).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        // Define columns to use in the table
        let nameCol = new UniTableColumn('Name', 'Navn',  UniTableColumnType.Text).setWidth('200px');

        let userCol = new UniTableColumn('User', 'Bruker', UniTableColumnType.Text)
            .setTemplate((row) => {
                return row.UserID ? row.User.DisplayName : '';
            });

        let employeeCol = new UniTableColumn('Employee', 'Ansatt', UniTableColumnType.Text)
            .setTemplate((row) => {
                return row.EmployeeID ? `${row.Employee.EmployeeNumber} - ${row.Employee.BusinessRelationInfo.Name}` : '';
            });

        let teamCol = new UniTableColumn('Team', 'Team', UniTableColumnType.Text)
            .setTemplate((row) => {
                return row.TeamID ? row.Team.Name : '';
            });

        let projectCol = new UniTableColumn('DefaultDimenions.Project', 'Prosjekt', UniTableColumnType.Text)
            .setTemplate((row) => {
                return row.DefaultDimensionsID && row.DefaultDimensions.ProjectID ? row.DefaultDimensions.Project.Name : '';
            });

        let departmentCol = new UniTableColumn('DefaultDimensions.Department', 'Avdeling', UniTableColumnType.Text)
            .setTemplate((row) => {
                return row.DefaultDimensionsID && row.DefaultDimensions.DepartmentID ? row.DefaultDimensions.Department.Name : '';
            });

        // Setup table
        this.sellerTableConfig = new UniTableConfig(false, true, 15)
            .setSearchable(true)
            .setSortable(false)
            .setColumns([nameCol, userCol, employeeCol, teamCol, projectCol, departmentCol]);
    }
}
