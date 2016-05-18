import {PayrollRun, SubEntity} from '../../unientities';

export class Postingsummary {
    public SubEntity: SubEntity;
    public PayrollRun: PayrollRun;
    public PostList: IncomePost[];
    public Debet: number;
    public Credit: number;
}

export class IncomePost {
    public Account: number;
    public Name: string;
    public Sum: number;
}