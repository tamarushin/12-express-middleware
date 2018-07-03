'use strict';
/** import third party modules */
import app from '../../../src/app';
import superagent from 'superagent';
import uuid from 'uuid/v4';
import fs from 'fs';
import path from 'path';

/** import application modules */

import storage from '../../../src/lib/storage/memory';

describe('Simple Web Server', () => {

  var server;

  beforeAll(() => {
    server = app.start(8080);
  });

  afterAll(() => {

    /* clear data directory after test execution */

    const dataDirectory = `${__dirname}/../../../src/lib/storage/data`;
    fs.readdir(dataDirectory, (err, files) => {
      if (err) return;
      for (const file of files) {
        fs.unlink(path.join(dataDirectory, file), err => {
          if (err) return;
        });
      }
    });

    /* delete database if storage type is memory after the tests are completed */

    storage.database = {};

    /** close server port connection */
    server.close();
  });
  it('handles status code 200 for a post request to create tweet with unique ID by sending JSON object', () => {
    let id = uuid();
    let obj = { 'id': `${id}`, 'user_id': `${uuid()}`, 'text': 'Here is the tweet message', 'category': 'social' };
    return superagent.post(`http://localhost:8080/api/v1/tweets/`)
      .send(obj)
      .then(response => {
        expect(response.status).toEqual(200);
        expect(response.text).toEqual(expect.stringContaining('social'));
      });

  });
  it('handles status code 200 for a post request to create tweet with custom_ID by sending JSON object', () => {
    let obj = { 'id': 32, 'user_id': `${uuid()}`, 'text': 'Here is the tweet message', 'category': 'social' };
    return superagent.post(`http://localhost:8080/api/v1/tweets`)
      .send(obj)
      .then(response => {
        expect(response.status).toEqual(200);
        expect(response.text).toEqual(expect.stringContaining('32'));
      });
  });
  it('handles status code 200 for a put request to create tweet with custom_ID by sending JSON object', () => {
    let obj = { 'id': 32, 'user_id': `${uuid()}`, 'text': 'Here is the updated tweet message', 'category': 'politics' };
    return superagent.put(`http://localhost:8080/api/v1/tweets/32`)
      .send(obj)
      .then(response => {
        expect(response.status).toEqual(200);
        expect(response.text).toEqual(expect.stringContaining('politics'));
      });
  });
  it('handles status code 200 for a get request for getting valid tweet', () => {
    let value = 32;
    return superagent.get(`http://localhost:8080/api/v1/tweets/${value}`)
      .then(response => {
        expect(response.status).toEqual(200);
        expect(response.text).toEqual(expect.stringContaining('politics'));
      })
      .catch(err => {
        expect(err).toBeNull;
      });
  });
  it('handles status code 400 for a bad get request for tweets api with an empty id as query string', () => {
    return superagent.get(`http://localhost:8080/api/v1/tweets/`)
      .catch(response => {
        expect(response.status).toEqual(400);
        expect(response.toString()).toEqual('Error: Bad Request');
      });
  });
  it('handles status code 404 for a get request for tweets api with a query string with id that was not found', () => {
    let id = 2222;
    return superagent.get(`http://localhost:8080/api/v1/tweets/${id}`)
      .catch(response => {
        expect(response.status).toEqual(404);
        expect(response.toString()).toEqual(expect.stringContaining('Not Found'));
      });
  });

  it('handles status code 400 for a bad post request with empty object passed', () => {
    return superagent.post(`http://localhost:8080/api/v1/tweets/`)
      .catch(response => {
        expect(response.status).toEqual(400);
        expect(response.toString()).toEqual('Error: Bad Request');
      });
  });
  it('handles status code 200 for a delete request for tweet that has valid id', () => {
    let id = 32;
    return superagent.delete(`http://localhost:8080/api/v1/tweets/${id}`)
      .then(response => {
        expect(response.status).toEqual(200);
        expect(response.text).toEqual(expect.stringContaining('deleted'));
      });
  });
  it('handles status code 404 for a bad delete request for tweet that has invalid id', () => {
    return superagent.delete(`http://localhost:8080/api/v1/tweets/1111`)
      .catch(response => {
        expect(response.status).toEqual(404);
        expect(response.toString()).toEqual('Error: Not Found');
      });
  });
  it('handles status code 400 for a bad delete request when no id passed in', () => {
    return superagent.delete(`http://localhost:8080/api/v1/tweets/`)
      .catch(response => {
        expect(response.status).toEqual(400);
        expect(response.toString()).toEqual('Error: Bad Request');
      });
  });
  it('handles a 404 error for every unhandled route', () => {
    return superagent.delete(`http://localhost:8080/api/v1/`)
      .catch(response => {
        expect(response.status).toEqual(404);
        expect(response.toString()).toEqual('Error: Not Found');
      });
  });
});
