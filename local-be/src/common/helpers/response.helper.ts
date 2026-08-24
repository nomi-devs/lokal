import { BilingualMessage } from '../constants/messages.constant';

export function wrap<T>(msg: BilingualMessage, data?: T) {
  return {
    message: msg.en,
    messageAr: msg.ar,
    ...(data !== undefined && { data }),
  };
}
