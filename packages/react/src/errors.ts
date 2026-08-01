/**
 * Thrown by `SignaturePadHandle.submit()` when nothing has been drawn.
 *
 * Exists so consumers can tell "the user drew nothing" apart from a network
 * or API failure without matching on the message string.
 */
export class SignatureEmptyError extends Error {
  override readonly name = 'SignatureEmptyError';

  constructor(message = 'Signature is empty') {
    super(message);
    // Required for `instanceof` to work when the package is compiled down to
    // ES5 by a consumer's bundler — Error subclassing breaks the prototype
    // chain under those transforms.
    Object.setPrototypeOf(this, SignatureEmptyError.prototype);
  }
}
