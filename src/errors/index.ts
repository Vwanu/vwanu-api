import {createLogger} from "../lib/utils/logger"

const Logger = createLogger('AppError');

export default class AppError extends Error {
  status: number
  
  constructor(message: string, status: number) {
    super()
    this.message = message
    this.status = status
    Logger.error(message, {status})
  }
}
