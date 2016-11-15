export var PrintStatus = [
    {ID: 100, Title: 'Sendt på epost'},
    {ID: 200, Title: 'Sendt på fakturaprint'},
    {ID: 300, Title: 'Sendt til aksesspunkt'}
];

export function GetPrintStatusText(id: number): string {
    let p = PrintStatus.find(x => x.ID == id);
    return p ? p.Title : '';
}