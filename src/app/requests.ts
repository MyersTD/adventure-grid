import { HttpClientModule, HttpClient, HttpRequest, HttpHandler } from '@angular/common/http';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';

const api_url = 'localhost:3000';

@Injectable()
export class Request {
    constructor(public http: Http) {
        
    }

    public CreateSession(s_id, name, callback) {
        var body = {s_id: s_id, name: name}
        this.http.post('/api/create', body)
            .subscribe((response) => {
                callback(response);
            }
        ), err => {
                callback(null);
            }
    }

    public GetAllSessions(callback) {
        this.http.get('/api/sessions') 
            .subscribe((response) => {
                console.log(response)
                callback(Array<any>(response['_body']));
            }), err => {
                callback(null);
            }
    }
};