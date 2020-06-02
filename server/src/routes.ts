import express from 'express';

const routes = express.Router();

routes.get('/', (request, response) => {
	return response.json({msg: 'Hello'});
});

export default routes;
