import { HttpClientModule, HttpClient, HttpRequest, HttpHandler } from '@angular/common/http';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { stringify } from 'querystring';

const api_url = 'localhost:3000';

@Injectable()
export class Request {
    constructor(public http: Http) {
        
    }

    public SaveHistory(s_id, history, callback) {
        var body = {id: s_id, history: history}
        this.http.post(api_url + '/api/save', body)
            .subscribe((response) => {
                callback(response)
            }
        ), err => {
                callback(null)
            }
    }
    public GetHistory(s_id, callback) {
        var header = new Headers();
        header.append('s_id', s_id);
        header.append('Access-Control-Allow-Origin', '*');
        var requestOpts = new RequestOptions({ headers: header });
        this.http.get(api_url + '/api/history', requestOpts)
        .subscribe((response) => {
            callback(response)
        }, err => {
            callback(null);
        })
    }
    public CreateSession(s_id, history, callback) {
        var body = {id: s_id, history: history}
        this.http.post(api_url + '/api/create', body)
            .subscribe((response) => {
                callback(response);
            }
        ), err => {
                callback(null);
            }
    }
};