export default `
.result_container {
    position: relative;
}
.result_container * {
    box-sizing: border-box;
}
.result_item[aria-selected=true] {
    font-weight: 400;
    background: #0f4880;
    color: #f8f9fD;
}
.result_container {
    padding: 0;
    margin-top: calc(1.5rem + 0.75rem);
    position: absolute;
    list-style: none;
    background-color: #fff;
    z-index: 200;
    max-height: 16rem;
    min-width: 15rem;
    overflow-x: hidden; /* hide horizontal scroll-bar */
    border: .0625rem solid #A1ABBF;
    border-radius: 0.1875rem;
    min-width: 100%;
}
.result_container[aria-expanded=false] {
    display: none;
}
.result_container.new_button_padding {
    padding: 1.3rem 0 0;
}
.action_buttons {
    position: absolute;
    top: 0;
    left: 0.3rem;
    cursor: pointer;
    color: #8C97AB;
    font-size: .9rem;
    padding: 1px;
}
.action_button {
    margin-right: 3px;
    text-decoration: underline;
}
.is_number {
    text-align: right;
}
table td {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 10rem;
    cursor: default;
}
table {
    border-collapse: separate;
    border-spacing: 0;
    min-width: 100%;
}
table tr th {
    border-bottom: 1px solid #A1ABBF;
}
table tr th {
    border-left: 1px solid #bbb;
    text-align: left;
    font-weight: 600;
    padding: 2px 6px;
}
table tr td {
    border-left: 1px solid #bbb;
    border-bottom: 1px solid #bbb;
    padding: 2px 6px;
}
table tr th:first-child,
table tr td:first-child {
    border-left: none;
}
table tr:last-child td {
    border-bottom: none;
}
.result_footer {
    color: #8C97AB;
    text-align: end;
    font-size: .9rem;
}
`;
