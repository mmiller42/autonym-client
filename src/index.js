import axios from 'axios';
import { stringify } from 'qs';

/**
 * A class that provides a thin wrapper around axios for making HTTP requests against an Autonym API.
 */
export default class Autonym {
	/**
	 * @param {string} uri The URI to your Autonym server.
	 * @param {object} [config]
	 * @param {function(attributes)} [config.serialize] A function to transform resource attributes before sending it.
	 * @param {function(attributes)} [config.unserialize} A function to transform resource attributes received.
	 * @param {object} [config.axiosConfig] Additional configuration to pass to the axios instance.
	 */
	constructor(uri, { serialize = identity, unserialize = identity, axiosConfig = {} } = {}) {
		this.uri = uri;

		this.axios = axios.create({
			paramsSerializer: params => stringify(params, { arrayFormat: 'brackets' }),
			...axiosConfig,
			transformRequest: getTransformArray(axiosConfig, 'transformRequest', serialize),
			transformResponse: getTransformArray(axiosConfig, 'transformResponse', unserializeOneOrMany)
		});

		function unserializeOneOrMany(data) {
			return Array.isArray(data) ? data.map(unserialize) : unserialize(data);
		}
	}

	/**
	 * Serializes the given attributes and sends a request to create a new resource.
	 * @param {string} route The route for the resource.
	 * @param {object} attributes The attributes of the resource.
	 * @returns {Promise} A promise that resolves with the unserialized server response.
	 */
	create(route, attributes) {
		return this.axios.post(`${this.uri}/${route}`, attributes);
	}

	/**
	 * Sends a request to fetch resources, optionally passing a query string to filter the result set.
	 * @param {string} route The route for the resource.
	 * @param {object} [query] An object that will be converted to a query string via qs.stringify() and appended.
	 * @returns {Promise} A promise that resolves with the unserialized server response.
	 */
	find(route, query) {
		return this.axios.get(`${this.uri}/${route}`, { params: query });
	}

	/**
	 * Sends a request to fetch a resource.
	 * @param {string} route The route for the resource.
	 * @param {string} id The id that uniquely identifies the resource to get.
	 * @returns {Promise} A promise that resolves with the unserialized server response.
	 */
	findOne(route, id) {
		return this.axios.get(`${this.uri}/${route}/${id}`);
	}

	/**
	 * Serializes the given attributes and sends a request to update an existing resource.
	 * @param {string} route The route for the resource.
	 * @param {string} id The id that uniquely identifies the resource to update.
	 * @param {object} attributes The attributes to update.
	 * @returns {Promise} A promise that resolves with the unserialized server response.
	 */
	findOneAndUpdate(route, id, attributes) {
		return this.axios.patch(`${this.uri}/${route}/${id}`, attributes);
	}

	/**
	 * Sends a request to delete a resource.
	 * @param {string} route The route for the resource.
	 * @param {string} id The id that uniquely identifies the resource to delete.
	 * @returns {Promise} A promise that resolves with the unserialized server response.
	 */
	findOneAndDelete(route, id) {
		return this.axios.delete(`${this.uri}/${route}/${id}`);
	}

	/**
	 * A convenience method that returns the methods on this class bound to the given route.
	 * @param {string} route The route to bind the methods to.
	 * @returns {object} An object with the methods bound to the given route.
	 * @example
	 * const autonym = new Autonym('https://api.myservice.com/');
	 * const peopleApi = autonym.bindToRoute('people');
	 * peopleApi.findOne('42').then(response => console.log(response));
	 */
	bindToRoute(route) {
		return {
			create: this.create.bind(this, route),
			find: this.find.bind(this, route),
			findOne: this.findOne.bind(this, route),
			findOneAndUpdate: this.findOneAndUpdate.bind(this, route),
			findOneAndDelete: this.findOneAndDelete.bind(this, route)
		};
	}
}

function identity(value) {
	return value;
}

function getTransformArray(config, methodName, defaultTransform) {
	const transform = config[methodName];
	if (Array.isArray(transform)) {
		return [...axios.defaults[methodName], defaultTransform, ...transform];
	} else if (transform) {
		return [...axios.defaults[methodName], defaultTransform, transform];
	} else {
		return [...axios.defaults[methodName], defaultTransform];
	}
}
