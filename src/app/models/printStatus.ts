// File should be names custom-statuses.. Good place to drop random status-code-text

export const PrintStatus = [
    { ID: 100, Title: 'Sendt på e-post' },
    { ID: 200, Title: 'Sendt til utskrift' },
    { ID: 300, Title: 'Sendt til aksesspunkt' }
];

export function GetPrintStatusText(id: number): string {
    const p = PrintStatus.find(x => x.ID === id);
    return p ? p.Title : '';
}

export const PaymentStatus = [
    { Code: 30109, Text: 'Ubetalt'},
    { Code: 30110, Text: 'Overført til bank'},
    { Code: 30111, Text: 'Delbetalt'},
    { Code: 30112, Text: 'Betalt'},
    { Code: 30113, Text: 'I betalingsliste'}
];

export function GetPaymentStatusText(code: number): string {
    const p = PaymentStatus.find(x => x.Code === code);
    return p ? p.Text : '';
}
