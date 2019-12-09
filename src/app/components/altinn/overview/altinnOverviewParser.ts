import {Injectable} from '@angular/core';
import {LocalDate, AltinnReceipt} from '@uni-entities';

@Injectable()
export class AltinnOverviewParser {

    constructor() { }

    public parseReceipt(receipt: AltinnReceipt): IAltinnResponseDto {
        if (!receipt.XmlReceipt && !receipt.AltinnResponseData) {
            return null;
        }
        if (receipt.AltinnResponseData || !receipt.XmlReceipt.includes('<?xml')) {
            return JSON.parse(receipt.AltinnResponseData || receipt.XmlReceipt);
        }
        return this.parseDocumentToResponse(new DOMParser().parseFromString(receipt.XmlReceipt, 'text/xml'));
    }

    private parseDocumentToResponse(doc: Document | Element): IAltinnResponseDto {
        return {
            receipt: this.parseDocumentToResponseReceipt(
                this.getNode(doc.getElementsByTagName('ReceiptExternal')) ||
                this.getNode(doc.getElementsByTagName('ReceiptExternalBE'))
            ),
            ErrorMessage: this.getNodeValue(doc.getElementsByTagName('ErrorMessage')),
        };
    }

    private parseDocumentToResponseReceipt(doc: Element): IAltinnResponseReceiptDto {
        if (!doc) {
            return null;
        }
        const subReceipts = doc.getElementsByTagName('SubReceipts');
        const refs = doc.getElementsByTagName('References');
        let receipts = [];
        let references = [];
        for (let i = 0; i < subReceipts.length; i++) {
            receipts.push(
                this.getNode(subReceipts[i].getElementsByTagName('ReceiptExternal')) ||
                this.getNode(subReceipts[i].getElementsByTagName('ReceiptExternalBE'))
            );
        }
        for (let i = 0; i < refs.length; i++) {
            references.push(
                this.getNode(refs[i].getElementsByTagName('Reference')) ||
                this.getNode(refs[i].getElementsByTagName('ReferenceExternalBE'))
            );
        }

        receipts = receipts.filter(receipt => !!receipt);
        references = references.filter(ref => !!ref);

        const lastChanged = this.getNodeValue(doc.getElementsByTagName('LastChanged'));
        return {
            ReceiptId: +this.getNodeValue(doc.getElementsByTagName('ReceiptId')),
            ReceiptText: this.getNodeValue(doc.getElementsByTagName('ReceiptText')),
            ReceiptHistory: this.getNodeValue(doc.getElementsByTagName('ReceiptHistory')),
            LastChanged: lastChanged && new LocalDate(lastChanged),
            ReceiptTypeName: this.getNodeValue(doc.getElementsByTagName('ReceipttypeName')),
            ReceiptStatusCode: this.getNodeValue(doc.getElementsByTagName('ReceiptStatusCode')),
            ParentReceiptId: +this.getNodeValue(doc.getElementsByTagName('ParentReceiptId')),
            SubReceipts: receipts.map(receipt => this.parseDocumentToResponseReceipt(receipt)),
            References: references.map(ref => this.parseDocumentToReference(ref)),
        };
    }

    private parseDocumentToReference(doc: Element): IAltinnReferenceDto {
        return {
            ReferenceValue: this.getNodeValue(doc.getElementsByTagName('ReferenceValue')),
            ReferenceTypeName: this.getNodeValue(doc.getElementsByTagName('ReferenceTypeName')),
            ReporteeID: this.getNodeValue(doc.getElementsByTagName('ReporteeID')),
        };
    }

    private getNodeValue(doc): any {
        return this.getNode(doc) && doc[0].firstChild && doc[0].firstChild.nodeValue;
    }

    private getNode(doc): Element {
        return doc && doc[0];
    }

}

export interface IAltinnResponseDto {
    receipt: IAltinnResponseReceiptDto;
    ErrorMessage: string;
}

export interface IAltinnResponseReceiptDto {
    ReceiptId: number;
    ReceiptText: string;
    ReceiptHistory: string;
    LastChanged: LocalDate;
    ReceiptTypeName: number | string;
    ReceiptStatusCode: number | string;
    ParentReceiptId: number;
    References: IAltinnReferenceDto[];
    SubReceipts: IAltinnResponseReceiptDto[];
}

export interface IAltinnReferenceDto {
    ReferenceValue: string;
    ReferenceTypeName: number | string;
    ReporteeID: number |string;
}
