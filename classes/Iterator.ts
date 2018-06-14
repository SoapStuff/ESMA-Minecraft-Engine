/**
 * Iterator interface.
 */
export interface Iterator<T> {
    hasNext(): boolean;

    next(): T;

    peek(): T;
}