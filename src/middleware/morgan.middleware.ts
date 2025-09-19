

const shouldNotSkip = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development' 
const morganMiddleware = () => !shouldNotSkip;

export default morganMiddleware;