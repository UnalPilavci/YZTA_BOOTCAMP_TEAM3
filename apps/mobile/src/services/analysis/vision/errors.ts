export type VisionErrorKind = 'config' | 'network' | 'unreadable' | 'parse';

export class VisionError extends Error {
  readonly kind: VisionErrorKind;
  readonly messageKey: string;

  constructor(kind: VisionErrorKind, messageKey: string, message?: string) {
    super(message ?? messageKey);
    this.name = 'VisionError';
    this.kind = kind;
    this.messageKey = messageKey;
  }
}
