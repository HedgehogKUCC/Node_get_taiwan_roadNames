const http = require('http');
const https = require('https');
const exportFromJSON = require('export-from-json');

const API_URL = 'https://od.moi.gov.tw/api/v1/rest/datastore/301000000A-000917-031?limit=50000';
let jsonData = '';
let objData = {};
const FILE_NAME = 'download.json';
const EXPORT_TYPE = 'json';

http.createServer(function (request, response) {
    https.get(API_URL, (res) => {
        res.setEncoding('utf-8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            try {
                objData = JSON.parse(rawData);
                jsonData = JSON.stringify(objData.result.records);
            } catch (e) {
                console.error(e.message);
            } finally {
                let result = exportFromJSON({
                    data: jsonData,
                    fileName: FILE_NAME,
                    exportType: EXPORT_TYPE,
                    processor(content, type, fileName) {
                        switch(type) {
                            case 'txt':
                                response.setHeader('Content-Type', 'text/plain');
                                break;
                            case 'json':
                                response.setHeader('Content-Type', 'application/json');
                                break;
                            case 'csv':
                                response.setHeader('Content-Type', 'text/csv');
                                break;
                            case 'xls':
                                response.setHeader('Content-Type', 'application/vnd.ms-excel');
                                break;
                        }
                        response.setHeader('Content-disposition', 'attachment;filename=' + FILE_NAME);
                        return content;
                    }
                })

                response.write(result);
                response.end();
            }
        });
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
}).listen(8080, '127.0.0.1');


