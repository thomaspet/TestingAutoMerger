export default `.uni_search {
    position: relative;
}
.uni_search * {
    box-sizing: border-box;
}
.uni_search input:focus {
    outline: 0;
    border-color: #0f4880;
}
.uni_search input {
    display: inline-block;
    padding: .1875rem .5rem;
    background-color: #fff;
    background-image: none;
    border: .0625rem solid #A1ABBF;
    transition: box-shadow .3s ease;
    overflow: hidden;
    text-overflow: ellipsis;
    width: calc(100% - 1.7rem);
    height: 1.6667rem;
    float: left;
    border-radius: .1875rem;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}
.uni_search input[disabled=true] {
    background-color: #FCFCFC;
}
.uni_search .searchBtn {
    width: 1.7rem;
    margin: 0;
    padding: 0;
    float: right;
    font-size: 0;
    background: #f8f9fD url("data:image/svg+xml,%3Csvg%20style%3D%22%22%20width%3D%2260.000000%22%20height%3D%2260.000000%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M43.750000%2036.562500%20L43.125000%2037.656250%20L60.000000%2054.687500%20L54.687500%2060.000000%20L37.812500%2042.968750%20L36.718750%2043.750000%20C32.552062%2046.354180%2028.229189%2047.656250%2023.750000%2047.656250%20C17.187467%2047.656250%2011.588565%2045.312523%206.953125%2040.625000%20C2.317685%2035.937477%200.000000%2030.312533%200.000000%2023.750000%20C0.000000%2017.187467%202.317685%2011.588565%206.953125%206.953125%20C11.588565%202.317685%2017.187467%20-0.000000%2023.750000%20-0.000000%20C30.312533%20-0.000000%2035.911435%202.317685%2040.546875%206.953125%20C45.182315%2011.588565%2047.500000%2017.187467%2047.500000%2023.750000%20C47.500000%2028.333356%2046.250012%2032.604147%2043.750000%2036.562500%20Z%20M37.031250%2010.468750%20C33.385398%206.822898%2028.958359%205.000000%2023.750000%205.000000%20C18.541641%205.000000%2014.114602%206.822898%2010.468750%2010.468750%20C6.822898%2014.114602%205.000000%2018.541641%205.000000%2023.750000%20C5.000000%2028.958359%206.822898%2033.385398%2010.468750%2037.031250%20C14.114602%2040.677102%2018.541641%2042.500000%2023.750000%2042.500000%20C28.958359%2042.500000%2033.385398%2040.677102%2037.031250%2037.031250%20C40.781269%2033.281231%2042.656250%2028.854192%2042.656250%2023.750000%20C42.656250%2018.645808%2040.781269%2014.218769%2037.031250%2010.468750%20Z%20M60.000000%2060.000000%22%20style%3D%22fill%3Argba(89%2C104%2C121%2C1)%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E") no-repeat center center;
    background-size: .8rem;
    min-height: 1.666666667rem;
    box-shadow: none;
    border: .0625rem solid #A1ABBF;
    border-left: none;
    border-radius: .2rem;
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
}
.uni_search .searchBtn[aria-busy=true] {
    background: #f8f9fD url("data:image/svg+xml,%3Csvg%20width%3D%2720px%27%20height%3D%2720px%27%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20preserveAspectRatio%3D%22xMidYMid%22%20class%3D%22uil-default%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22none%22%20class%3D%22bk%22%3E%3C%2Frect%3E%3Crect%20%20x%3D%2746.5%27%20y%3D%2740%27%20width%3D%277%27%20height%3D%2720%27%20rx%3D%275%27%20ry%3D%275%27%20fill%3D%27%23000000%27%20transform%3D%27rotate%280%2050%2050%29%20translate%280%20-30%29%27%3E%20%20%3Canimate%20attributeName%3D%27opacity%27%20from%3D%271%27%20to%3D%270%27%20dur%3D%271s%27%20begin%3D%270s%27%20repeatCount%3D%27indefinite%27%2F%3E%3C%2Frect%3E%3Crect%20%20x%3D%2746.5%27%20y%3D%2740%27%20width%3D%277%27%20height%3D%2720%27%20rx%3D%275%27%20ry%3D%275%27%20fill%3D%27%23000000%27%20transform%3D%27rotate%2830%2050%2050%29%20translate%280%20-30%29%27%3E%20%20%3Canimate%20attributeName%3D%27opacity%27%20from%3D%271%27%20to%3D%270%27%20dur%3D%271s%27%20begin%3D%270.08333333333333333s%27%20repeatCount%3D%27indefinite%27%2F%3E%3C%2Frect%3E%3Crect%20%20x%3D%2746.5%27%20y%3D%2740%27%20width%3D%277%27%20height%3D%2720%27%20rx%3D%275%27%20ry%3D%275%27%20fill%3D%27%23000000%27%20transform%3D%27rotate%2860%2050%2050%29%20translate%280%20-30%29%27%3E%20%20%3Canimate%20attributeName%3D%27opacity%27%20from%3D%271%27%20to%3D%270%27%20dur%3D%271s%27%20begin%3D%270.16666666666666666s%27%20repeatCount%3D%27indefinite%27%2F%3E%3C%2Frect%3E%3Crect%20%20x%3D%2746.5%27%20y%3D%2740%27%20width%3D%277%27%20height%3D%2720%27%20rx%3D%275%27%20ry%3D%275%27%20fill%3D%27%23000000%27%20transform%3D%27rotate%2890%2050%2050%29%20translate%280%20-30%29%27%3E%20%20%3Canimate%20attributeName%3D%27opacity%27%20from%3D%271%27%20to%3D%270%27%20dur%3D%271s%27%20begin%3D%270.25s%27%20repeatCount%3D%27indefinite%27%2F%3E%3C%2Frect%3E%3Crect%20%20x%3D%2746.5%27%20y%3D%2740%27%20width%3D%277%27%20height%3D%2720%27%20rx%3D%275%27%20ry%3D%275%27%20fill%3D%27%23000000%27%20transform%3D%27rotate%28120%2050%2050%29%20translate%280%20-30%29%27%3E%20%20%3Canimate%20attributeName%3D%27opacity%27%20from%3D%271%27%20to%3D%270%27%20dur%3D%271s%27%20begin%3D%270.3333333333333333s%27%20repeatCount%3D%27indefinite%27%2F%3E%3C%2Frect%3E%3Crect%20%20x%3D%2746.5%27%20y%3D%2740%27%20width%3D%277%27%20height%3D%2720%27%20rx%3D%275%27%20ry%3D%275%27%20fill%3D%27%23000000%27%20transform%3D%27rotate%28150%2050%2050%29%20translate%280%20-30%29%27%3E%20%20%3Canimate%20attributeName%3D%27opacity%27%20from%3D%271%27%20to%3D%270%27%20dur%3D%271s%27%20begin%3D%270.4166666666666667s%27%20repeatCount%3D%27indefinite%27%2F%3E%3C%2Frect%3E%3Crect%20%20x%3D%2746.5%27%20y%3D%2740%27%20width%3D%277%27%20height%3D%2720%27%20rx%3D%275%27%20ry%3D%275%27%20fill%3D%27%23000000%27%20transform%3D%27rotate%28180%2050%2050%29%20translate%280%20-30%29%27%3E%20%20%3Canimate%20attributeName%3D%27opacity%27%20from%3D%271%27%20to%3D%270%27%20dur%3D%271s%27%20begin%3D%270.5s%27%20repeatCount%3D%27indefinite%27%2F%3E%3C%2Frect%3E%3Crect%20%20x%3D%2746.5%27%20y%3D%2740%27%20width%3D%277%27%20height%3D%2720%27%20rx%3D%275%27%20ry%3D%275%27%20fill%3D%27%23000000%27%20transform%3D%27rotate%28210%2050%2050%29%20translate%280%20-30%29%27%3E%20%20%3Canimate%20attributeName%3D%27opacity%27%20from%3D%271%27%20to%3D%270%27%20dur%3D%271s%27%20begin%3D%270.5833333333333334s%27%20repeatCount%3D%27indefinite%27%2F%3E%3C%2Frect%3E%3Crect%20%20x%3D%2746.5%27%20y%3D%2740%27%20width%3D%277%27%20height%3D%2720%27%20rx%3D%275%27%20ry%3D%275%27%20fill%3D%27%23000000%27%20transform%3D%27rotate%28240%2050%2050%29%20translate%280%20-30%29%27%3E%20%20%3Canimate%20attributeName%3D%27opacity%27%20from%3D%271%27%20to%3D%270%27%20dur%3D%271s%27%20begin%3D%270.6666666666666666s%27%20repeatCount%3D%27indefinite%27%2F%3E%3C%2Frect%3E%3Crect%20%20x%3D%2746.5%27%20y%3D%2740%27%20width%3D%277%27%20height%3D%2720%27%20rx%3D%275%27%20ry%3D%275%27%20fill%3D%27%23000000%27%20transform%3D%27rotate%28270%2050%2050%29%20translate%280%20-30%29%27%3E%20%20%3Canimate%20attributeName%3D%27opacity%27%20from%3D%271%27%20to%3D%270%27%20dur%3D%271s%27%20begin%3D%270.75s%27%20repeatCount%3D%27indefinite%27%2F%3E%3C%2Frect%3E%3Crect%20%20x%3D%2746.5%27%20y%3D%2740%27%20width%3D%277%27%20height%3D%2720%27%20rx%3D%275%27%20ry%3D%275%27%20fill%3D%27%23000000%27%20transform%3D%27rotate%28300%2050%2050%29%20translate%280%20-30%29%27%3E%20%20%3Canimate%20attributeName%3D%27opacity%27%20from%3D%271%27%20to%3D%270%27%20dur%3D%271s%27%20begin%3D%270.8333333333333334s%27%20repeatCount%3D%27indefinite%27%2F%3E%3C%2Frect%3E%3Crect%20%20x%3D%2746.5%27%20y%3D%2740%27%20width%3D%277%27%20height%3D%2720%27%20rx%3D%275%27%20ry%3D%275%27%20fill%3D%27%23000000%27%20transform%3D%27rotate%28330%2050%2050%29%20translate%280%20-30%29%27%3E%20%20%3Canimate%20attributeName%3D%27opacity%27%20from%3D%271%27%20to%3D%270%27%20dur%3D%271s%27%20begin%3D%270.9166666666666666s%27%20repeatCount%3D%27indefinite%27%2F%3E%3C%2Frect%3E%3C%2Fsvg%3E") no-repeat center center;
}
.uni_search .searchBtn[disabled=true] {
    cursor: not-allowed
}
.uni_search .searchBtn[aria-busy=true]::before {
    content: none;
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
    font-weight: bold;
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
}`;
