/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 80.0, "KoPercent": 20.0};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "login,queryUserSettleInfo,getUserBindCardNew"], "isController": false}, {"data": [1.0, 500, 1500, "queryUserBindCard"], "isController": false}, {"data": [1.0, 500, 1500, "queryUserSettleInfo"], "isController": false}, {"data": [0.0, 500, 1500, "check"], "isController": false}, {"data": [1.0, 500, 1500, "check,register,login"], "isController": false}, {"data": [1.0, 500, 1500, "login"], "isController": false}, {"data": [1.0, 500, 1500, "login,queryUserBindCard,get_bank_list,get_user_card_info"], "isController": false}, {"data": [1.0, 500, 1500, "get_user_card_info"], "isController": false}, {"data": [1.0, 500, 1500, "getUserBindCardNew"], "isController": false}, {"data": [1.0, 500, 1500, "login,get_bank_list,get_user_card_info"], "isController": false}, {"data": [1.0, 500, 1500, "get_bank_list"], "isController": false}, {"data": [1.0, 500, 1500, "check,register"], "isController": false}, {"data": [0.0, 500, 1500, "register"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20, 4, 20.0, 99.1, 0, 1130, 231.80000000000018, 1085.4999999999993, 1130.0, 7.730962504831852, 1.5431725937379202, 1.9512375579822185], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["login,queryUserSettleInfo,getUserBindCardNew", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": false}, {"data": ["queryUserBindCard", 1, 0, 0.0, 22.0, 22, 22, 22.0, 22.0, 22.0, 45.45454545454545, 12.073863636363637, 13.139204545454547], "isController": false}, {"data": ["queryUserSettleInfo", 1, 0, 0.0, 240.0, 240, 240, 240.0, 240.0, 240.0, 4.166666666666667, 1.1067708333333335, 1.220703125], "isController": false}, {"data": ["check", 2, 2, 100.0, 579.0, 28, 1130, 1130.0, 1130.0, 1130.0, 1.3623978201634876, 0.3738611205722071, 0.4576805177111717], "isController": false}, {"data": ["check,register,login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": false}, {"data": ["login", 4, 0, 0.0, 47.0, 14, 118, 118.0, 118.0, 118.0, 4.926108374384237, 1.3517934113300492, 1.7414562807881773], "isController": false}, {"data": ["login,queryUserBindCard,get_bank_list,get_user_card_info", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": false}, {"data": ["get_user_card_info", 2, 0, 0.0, 37.0, 31, 43, 43.0, 43.0, 43.0, 8.474576271186441, 2.2345074152542375, 3.3683130296610173], "isController": false}, {"data": ["getUserBindCardNew", 1, 0, 0.0, 158.0, 158, 158, 158.0, 158.0, 158.0, 6.329113924050633, 1.607001582278481, 1.872774920886076], "isController": false}, {"data": ["login,get_bank_list,get_user_card_info", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": false}, {"data": ["get_bank_list", 2, 0, 0.0, 31.0, 29, 33, 33.0, 33.0, 33.0, 8.81057268722467, 2.1338105726872247, 2.5123898678414096], "isController": false}, {"data": ["check,register", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": false}, {"data": ["register", 2, 2, 100.0, 40.0, 27, 53, 53.0, 53.0, 53.0, 12.269938650306749, 3.3670437116564416, 4.409509202453988], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["org.apache.jorphan.util.JMeterException: Error invoking bsh method: eval\tIn file: inline evaluation of: ``if (  != false ){ \tFailure=true; \tFailureMessage=&quot;\u7B7E\u540D\u9519\u8BEF&quot;; \t}else{ \tFailureMessage . . . '' Encountered &quot;!=&quot; at line 1, column 7.\r\n", 1, 25.0, 5.0], "isController": false}, {"data": ["org.apache.jorphan.util.JMeterException: Error invoking bsh method: eval\tIn file: inline evaluation of: ``if (  != false ){ \tFailure=true; \tFailureMessage=&quot;\u53C2\u6570\u9519\u8BEF&quot;; \t}else{ \tFailureMessage . . . '' Encountered &quot;!=&quot; at line 1, column 7.\r\n", 1, 25.0, 5.0], "isController": false}, {"data": ["\u7B7E\u540D\u9519\u8BEF", 2, 50.0, 10.0], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20, 4, "\u7B7E\u540D\u9519\u8BEF", 2, "org.apache.jorphan.util.JMeterException: Error invoking bsh method: eval\tIn file: inline evaluation of: ``if (  != false ){ \tFailure=true; \tFailureMessage=&quot;\u7B7E\u540D\u9519\u8BEF&quot;; \t}else{ \tFailureMessage . . . '' Encountered &quot;!=&quot; at line 1, column 7.\r\n", 1, "org.apache.jorphan.util.JMeterException: Error invoking bsh method: eval\tIn file: inline evaluation of: ``if (  != false ){ \tFailure=true; \tFailureMessage=&quot;\u53C2\u6570\u9519\u8BEF&quot;; \t}else{ \tFailureMessage . . . '' Encountered &quot;!=&quot; at line 1, column 7.\r\n", 1, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["check", 2, 2, "org.apache.jorphan.util.JMeterException: Error invoking bsh method: eval\tIn file: inline evaluation of: ``if (  != false ){ \tFailure=true; \tFailureMessage=&quot;\u7B7E\u540D\u9519\u8BEF&quot;; \t}else{ \tFailureMessage . . . '' Encountered &quot;!=&quot; at line 1, column 7.\r\n", 1, "org.apache.jorphan.util.JMeterException: Error invoking bsh method: eval\tIn file: inline evaluation of: ``if (  != false ){ \tFailure=true; \tFailureMessage=&quot;\u53C2\u6570\u9519\u8BEF&quot;; \t}else{ \tFailureMessage . . . '' Encountered &quot;!=&quot; at line 1, column 7.\r\n", 1, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["register", 2, 2, "\u7B7E\u540D\u9519\u8BEF", 2, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
