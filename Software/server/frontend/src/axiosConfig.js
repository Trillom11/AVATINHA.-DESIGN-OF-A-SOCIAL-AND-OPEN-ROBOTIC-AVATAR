import axios from 'axios';

axios.defaults.baseURL = window.location.origin; // Esto usará https si la web fue cargada con https

export default axios;
