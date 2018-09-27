import {Component, ViewChild} from '@angular/core';
import {WorkerService} from '@app/services/timetracking/workerService';
import {LocalDate, WorkRelation, FlexDetail} from '@uni-entities';
import {UniModalService} from '@uni-framework/uni-modal/modalService';
import {TimeApproveModal} from './popupapprove';

// tslint:disable:max-line-length
@Component({
    selector: 'teamwork-report',
    template: `
    <article>
        <mat-form-field>
            <mat-select [value]="currentTeam" (valueChange)="onTeamSelected($event)" placeholder="Team">
                <mat-option *ngFor="let team of teams" [value]="team">
                    {{ team.Name }}
                </mat-option>
            </mat-select>
        </mat-form-field>

        <section [attr.aria-busy]="busy">

            <header class="warn" [hidden]="memberCount">Ingen team-medlemmer med aktiv timeføring</header>

            <section *ngIf="report" [hidden]="!memberCount">

                <table class="teamreport">
                    <thead>
                        <tr>
                            <th colspan="3"></th>
                            <th class="groupheader">Totalt</th>
                            <th class="groupheader left-border" colspan="3">{{report?.FromDate | isotime}} - {{report?.ToDate | isotime}}</th>
                            <th class="groupheader left-border" colspan="2">Fravær</th>
                        </tr>
                        <tr>
                            <th class="left">Resurs</th>
                            <th class="left">Beskrivelse</th>
                            <th>Stilling%</th>

                            <th class="left-border">Saldo</th>

                            <th class="left-border">Forventet</th>
                            <th>Timetall</th>
                            <th class="left-border">Saldo</th>

                            <th class="left-border">Fri/ferie</th>
                            <th>Fravær</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="clickable" (click)="onRowClick(member)" *ngFor="let member of report?.Members">
                            <td>{{member.Name}}</td>
                            <td>{{member.WorkRelation?.Description}}</td>
                            <td class="center">{{member.WorkRelation?.WorkPercentage}}%</td>

                            <td class="center" [class.bad]="member?.TotalBalance < 0">{{member.TotalBalance | min2hours:'decimal0'}}</td>

                            <td class="center" >{{member.ExpectedMinutes | min2hours:'decimal0'}}</td>
                            <td class="center" >{{member.MinutesWorked | min2hours:'decimal0'}}</td>
                            <td class="center"  [class.bad]="member?.ReportBalance < 0">{{member.ReportBalance | min2hours:'decimal0'}}</td>

                            <td>{{member.TimeOff.length }} dager</td>
                            <td>{{member.MissingDays.length }} dager</td>

                        </tr>
                    </tbody>
                </table>
            </section>

        </section>
    </article>`
})
export class TeamworkReport {
    public teams: Team[];
    public currentTeam: Team;

    public report: TeamReport;
    public memberCount: number = 0;
    public busy: boolean = true;
    private currentRelation: WorkRelation;

    constructor(
        private workerService: WorkerService,
        private modalService: UniModalService
    ) {}

    public get isInitialized() {
        return this.teams !== undefined;
    }

    public initialize(teams: Array<Team>) {
        this.teams = teams;
        if (teams && teams.length > 0) {
            this.onTeamSelected(teams[0]);
        }
    }

    public onTeamSelected(team: Team) {
        this.currentTeam = team;
        this.busy = true;

        this.workerService.get<TeamReport>(`teams/${team.ID}/?action=work-report`)
            .finally(() => this.busy = false)
            .subscribe(report => {
                this.report = report;
                this.memberCount = (report && report.Members && report.Members.length) || 0;
            });
    }

    public onRowClick(member: MemberDetails) {
        this.currentRelation = member.WorkRelation;
        this.modalService.open(TimeApproveModal, {data: this.currentRelation});
    }

}

export interface Team {
    Name: string;
    ID: number;
    Positions: Array<any>;
}

interface TeamReport {
    Team: Team;
    FromDate: LocalDate;
    ToDate: LocalDate;
    Members: MemberDetails[];
}

interface MemberDetails  {
    Name: string;
    ExpectedMinutes: number;
    MinutesWorked: number;
    ReportBalance: number;
    TotalBalance: number;
    WorkRelation: WorkRelation;
    TimeOff: Array<FlexDetail>;
    MissingDays: Array<FlexDetail>;
}

