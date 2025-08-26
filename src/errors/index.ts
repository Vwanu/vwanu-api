import {createLogger} from "../lib/utils/logger"

const Logger = createLogger('AppError');

export default class AppError extends Error {
  constructor(public message: string, private status: number, private file?: string) {
    super()
    Logger.error(this.message, {status: this.status, file: this.file})
  }
}
