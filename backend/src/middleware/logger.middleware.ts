import morgan from 'morgan';
import logger from '../utils/logger';

// Configure morgan stream to pipe HTTP request logs to winston
const stream = {
  write: (message: string) => logger.info(message.trim())
};

// Log only response error codes in production, log all requests in dev
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env !== 'development';
};

const morganMiddleware = morgan(
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

export default morganMiddleware;
