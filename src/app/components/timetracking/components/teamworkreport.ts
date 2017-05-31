import {Component, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core'; 
import {WorkerService} from '../../../services/timetracking/workerService';
import {LocalDate, WorkRelation, FlexDetail} from '../../../unientities';
import {TimeApproveModal} from './popupapprove';

// tslint:disable:max-line-length
@Component({
    selector: 'teamwork-report',
    template: `<article>
        <aside class="regtime_filters no-print">
            <ul>
                <li *ngFor="let team of teams">
                    <a (click)="onTeamSelect(team)" [ngClass]="{'router-link-active': team.isSelected}">
                        {{team.Name}}
                        <span class='tab_counter' *ngIf="team.counter">{{team.counter}}</span>
                    </a>
                </li>
            </ul>
        </aside>        

        <section [attr.aria-busy]="busy">
            
            <header class="warn" [hidden]="memberCount">Ingen team-medlemmer med aktiv timeføring</header>
            
            <section *ngIf="report" [hidden]="!memberCount">

                <table class="teamreport">
                    <thead>
                        <tr>
                            <th></th>
                            <th class="groupheader">Totalt</th>                            
                            <th class="groupheader left-border" colspan="3">{{report?.FromDate | isotime}} - {{report?.ToDate | isotime}}</th>
                            <th class="groupheader left-border" colspan="2">Fravær</th>
                        </tr>
                        <tr>
                            <th>Resurs</th>
                            
                            <th class="left-border">Saldo</th>

                            <th class="left-border">Forventet</th>
                            <th>Timetall</th>                            
                            <th class="left-border">Saldo</th>

                            <th class="left-border">Fri/ferie</th>
                            <th>Fravær</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let member of report?.Members">                            
                            <td class="clickablecell" (click)="onRowClick(member)">{{member.Name}} <span class="subtitle">{{member.WorkRelation?.WorkPercentage}}% - {{member.WorkRelation?.Description}}</span></td>
                            
                            <td class="clickablecell" (click)="onRowClick(member)" [class.bad]="member?.TotalBalance < 0">{{member.TotalBalance | min2hours:'decimal0'}}</td>
                            
                            <td>{{member.ExpectedMinutes | min2hours:'decimal0'}}</td>
                            <td>{{member.MinutesWorked | min2hours:'decimal0'}}</td>
                            <td [class.bad]="member?.ReportBalance < 0">{{member.ReportBalance | min2hours:'decimal0'}}</td>

                            <td>{{member.TimeOff.length }} dager</td>
                            <td>{{member.MissingDays.length }} dager</td>

                        </tr>
                    </tbody>
                </table>
            </section>

        </section>

        <time-approve-modal></time-approve-modal>

    </article>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamworkReport {
    @ViewChild(TimeApproveModal) private approveModal: TimeApproveModal;
    private teams: Array<Team>;
    private report: TeamReport;
    private memberCount: number = 0;
    private busy: boolean = true;
    private currentRelation: WorkRelation;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private workerService: WorkerService) {

    }

    public get isInitialized() {
        return this.teams !== undefined;
    }

    public initialize(teams: Array<Team>) {        
        this.teams = teams;        
        if (teams && teams.length > 0) {
            this.onTeamSelect(teams[0]);
        }
        this.refresh();
    }

    private refresh() {
        this.changeDetectorRef.markForCheck();
    }

    private goBusy(value: boolean) {
        this.busy = value;
        this.refresh();
    }

    public onTeamSelect(team: Team) {
        this.goBusy(true);
        this.teams.forEach( x => x.isSelected = false );
        team.isSelected = true;
        this.workerService.get<TeamReport>(`teams/${team.ID}/?action=work-report`).finally(
            () => this.goBusy(false)
        ).subscribe(
            x => {
                this.report = x;
                this.memberCount = (x && x.Members) ? x.Members.length : 0;
                this.refresh();
            }
        );
    }

    public onRowClick(member: MemberDetails) {
        this.currentRelation = member.WorkRelation;
        this.approveModal.open(this.currentRelation);                        
    }

}

// tslint:disable:variable-name

export class Team {
    public Name: string;
    public ID: number;
    public Positions: Array<any>;
    // local properties:
    public counter: number;
    public isSelected: boolean;
}

class TeamReport {    
    public Team: Team;
    public FromDate: LocalDate;
    public ToDate: LocalDate;
    public Members: Array<MemberDetails>;
}

class MemberDetails  {
    public Name: string;
    public ExpectedMinutes: number;
    public MinutesWorked: number;
    public ReportBalance: number;
    public TotalBalance: number;
    public WorkRelation: WorkRelation;
    public TimeOff: Array<FlexDetail>;
    public MissingDays: Array<FlexDetail>;
}

