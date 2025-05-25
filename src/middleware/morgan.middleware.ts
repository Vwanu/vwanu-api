


const morganMiddleware = () => process.env.NODE_ENV === 'test' ? false : true;

export default morganMiddleware;