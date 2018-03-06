const cuid = require('cuid');
const { send } = require('micro');
const queryString = require('query-string');
const fetch = require('node-fetch');

const { NEST_ACCESS_TOKEN, NEST_STRUCTURE_ID } = process.env;
const NEST_API_URI = `https://developer-api.nest.com/structures/${NEST_STRUCTURE_ID}`;

module.exports = async (request, response) => {
  const id = cuid();
  if (NEST_ACCESS_TOKEN && NEST_STRUCTURE_ID) {
    const url_parts = queryString.parseUrl(request.url);
    const query = url_parts.query;
    const is_away = query.away === 'true';
    const is_home = query.home === 'true';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${NEST_ACCESS_TOKEN}`,
    };
    console.log(`${id} - New request`, request.url);
    if (is_away === false && is_home === false) {
      // READ
      console.log(`${id} - Sending request to Nest to read "away" value`);
      const request = await fetch(`${NEST_API_URI}/away`, {
        method: 'GET',
        headers,
      });
      const data = {
        away: await request.json(),
      };
      console.log(`${id} - Response from Nest`, data);
      return data;
    } else {
      // WRITE
      const body_value = is_away ? 'away' : 'home';
      console.log(`${id} - Sending request to Nest to write "away" value with "${body_value}"`);
      const request = await fetch(NEST_API_URI, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          away: body_value,
        }),
      });
      const data = await request.json();
      console.log(`${id} - Response from Nest`, data);
      return data;
    }
  } else {
    console.log(`${id} - Missing environment variables.`);
    send(response, 500, 'Missing environment variables');
  }
};
