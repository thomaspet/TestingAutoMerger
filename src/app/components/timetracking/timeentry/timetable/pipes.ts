import {Pipe, PipeTransform} from '@angular/core';
import {ReportFlow} from './model';
@Pipe({
    name: 'ReportWorkflow'
  })
  export class ReportWorkflow implements PipeTransform {
      public transform(value: ReportFlow, format?: string) {
          switch (value) {
            case ReportFlow.Draft:
                return 'Kladd';
            case ReportFlow.AwaitingApproval:
                return 'Tildelt';
            case ReportFlow.PartialAssign:
                return 'Delvis tildelt';
            case ReportFlow.PartialReject:
                return 'Delvis avvist';
            case ReportFlow.PartialApproval:
                return 'Delvis godkjent';
            case ReportFlow.Approved:
                return 'Godkjent';
            case ReportFlow.Rejected:
                return 'Avvist';
            default:
                return '';
          }
      }
  }
